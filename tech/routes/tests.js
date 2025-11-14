const express = require('express');
const { body, validationResult } = require('express-validator');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const Course = require('../models/Course');
const { auth, verifiedTeacherAuth, studentAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/tests
// @desc    Create a new test
// @access  Private (Teacher)
router.post('/', [auth, verifiedTeacherAuth], [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('settings.duration').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('settings.passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { course, questions, ...testData } = req.body;

    // Verify course belongs to teacher
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courseDoc.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create tests for this course'
      });
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || question.question.trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} text is required`
        });
      }

      if (question.type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have at least 2 options`
        });
      }

      if (question.type === 'multiple_choice') {
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (correctOptions.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} must have at least one correct option`
          });
        }
      }
    }

    const test = new Test({
      ...testData,
      course,
      instructor: req.user.id,
      questions
    });

    await test.save();

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: { test }
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating test'
    });
  }
});

// @route   GET /api/tests/course/:courseId
// @desc    Get tests for a course
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { published } = req.query;

    const query = { course: courseId };
    
    // If user is not the course instructor, only show published tests
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      query.isPublished = true;
    } else if (published !== undefined) {
      query.isPublished = published === 'true';
    }

    const tests = await Test.find(query)
      .populate('course', 'title instructor')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tests }
    });
  } catch (error) {
    console.error('Get course tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting course tests'
    });
  }
});

// @route   GET /api/tests/:id
// @desc    Get test by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('course', 'title instructor')
      .populate('instructor', 'name email');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user can access this test
    const course = await Course.findById(test.course._id);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is enrolled in the course
      const Enrollment = require('../models/Enrollment');
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: test.course._id,
        status: 'active'
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in the course to access this test'
        });
      }
    }

    // Return appropriate data based on user role
    if (req.user.role === 'student') {
      res.json({
        success: true,
        data: {
          test: test.getStudentSummary()
        }
      });
    } else {
      res.json({
        success: true,
        data: { test }
      });
    }
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting test'
    });
  }
});

// @route   PUT /api/tests/:id
// @desc    Update test
// @access  Private (Test instructor)
router.put('/:id', [auth, verifiedTeacherAuth], async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user is the test instructor
    if (test.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this test'
      });
    }

    const updatedTest = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Test updated successfully',
      data: { test: updatedTest }
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating test'
    });
  }
});

// @route   DELETE /api/tests/:id
// @desc    Delete test
// @access  Private (Test instructor)
router.delete('/:id', [auth, verifiedTeacherAuth], async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user is the test instructor
    if (test.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this test'
      });
    }

    await Test.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting test'
    });
  }
});

// @route   POST /api/tests/:id/start
// @desc    Start test attempt
// @access  Private (Student)
router.post('/:id/start', [auth, studentAuth], async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if test is available for student
    if (!test.isAvailableForStudent(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Test is not available'
      });
    }

    // Check if student is enrolled in the course
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: test.course,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to take this test'
      });
    }

    // Check if student has remaining attempts
    const existingAttempts = await TestAttempt.find({
      student: req.user.id,
      test: test._id
    });

    if (existingAttempts.length >= test.settings.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached for this test'
      });
    }

    // Check if there's an in-progress attempt
    const inProgressAttempt = await TestAttempt.findOne({
      student: req.user.id,
      test: test._id,
      status: 'in_progress'
    });

    if (inProgressAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You already have an in-progress attempt for this test'
      });
    }

    // Create new test attempt
    const attempt = new TestAttempt({
      student: req.user.id,
      test: test._id,
      course: test.course,
      attemptNumber: existingAttempts.length + 1
    });

    await attempt.save();

    res.json({
      success: true,
      message: 'Test attempt started successfully',
      data: {
        attemptId: attempt._id,
        test: test.getStudentSummary(),
        attempt: attempt.getSummary()
      }
    });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting test'
    });
  }
});

// @route   POST /api/tests/:id/submit-answer
// @desc    Submit answer for a question
// @access  Private (Student)
router.post('/:id/submit-answer', [auth, studentAuth], [
  body('attemptId').isMongoId().withMessage('Valid attempt ID is required'),
  body('questionId').isMongoId().withMessage('Valid question ID is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { attemptId, questionId, answer, timeSpent = 0 } = req.body;

    // Get test attempt
    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    // Check if attempt belongs to user
    if (attempt.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit answer for this attempt'
      });
    }

    // Check if attempt is in progress
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Test attempt is not in progress'
      });
    }

    // Get test to validate question
    const test = await Test.findById(attempt.test);
    const question = test.questions.id(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Validate and grade answer
    let isCorrect = false;
    let points = 0;

    if (question.type === 'multiple_choice') {
      const selectedOption = question.options.find(opt => opt.text === answer);
      isCorrect = selectedOption ? selectedOption.isCorrect : false;
    } else if (question.type === 'true_false') {
      isCorrect = answer.toLowerCase() === 'true' || answer.toLowerCase() === 'false';
      if (isCorrect) {
        const correctAnswer = question.options.find(opt => opt.isCorrect);
        isCorrect = correctAnswer && correctAnswer.text.toLowerCase() === answer.toLowerCase();
      }
    } else if (question.type === 'fill_blank' || question.type === 'short_answer') {
      isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    }

    points = isCorrect ? question.points : 0;

    // Submit answer
    attempt.submitAnswer(questionId, answer, timeSpent);
    await attempt.save();

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        isCorrect,
        points,
        totalScore: attempt.score
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting answer'
    });
  }
});

// @route   POST /api/tests/:id/finish
// @desc    Finish test attempt
// @access  Private (Student)
router.post('/:id/finish', [auth, studentAuth], [
  body('attemptId').isMongoId().withMessage('Valid attempt ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { attemptId } = req.body;

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    // Check if attempt belongs to user
    if (attempt.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to finish this attempt'
      });
    }

    // Check if attempt is in progress
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Test attempt is not in progress'
      });
    }

    // Finish the attempt
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    await attempt.save();

    // Update test statistics
    const test = await Test.findById(attempt.test);
    await test.calculateStatistics();

    res.json({
      success: true,
      message: 'Test completed successfully',
      data: {
        attempt: attempt.getSummary(),
        isPassed: attempt.score >= test.settings.passingScore
      }
    });
  } catch (error) {
    console.error('Finish test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error finishing test'
    });
  }
});

// @route   GET /api/tests/:id/attempts
// @desc    Get test attempts for a student
// @access  Private
router.get('/:id/attempts', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user can view attempts
    if (test.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      // Check if user is enrolled in the course
      const Enrollment = require('../models/Enrollment');
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: test.course,
        status: 'active'
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view test attempts'
        });
      }
    }

    const attempts = await TestAttempt.find({
      test: test._id,
      ...(test.instructor.toString() !== req.user.id && req.user.role !== 'admin' 
        ? { student: req.user.id } 
        : {})
    })
    .populate('student', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { attempts: attempts.map(attempt => attempt.getSummary()) }
    });
  } catch (error) {
    console.error('Get test attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting test attempts'
    });
  }
});

module.exports = router;
