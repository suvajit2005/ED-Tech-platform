const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const { auth, verifiedTeacherAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/attendance/mark
// @desc    Mark attendance for a lesson
// @access  Private
router.post('/mark', auth, [
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('lessonId').isMongoId().withMessage('Valid lesson ID is required'),
  body('lessonType').isIn(['live', 'video', 'note', 'test']).withMessage('Invalid lesson type'),
  body('status').optional().isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid attendance status')
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

    const { courseId, lessonId, lessonType, status = 'present', liveClassData, deviceInfo } = req.body;

    // Check if user is enrolled in the course
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to mark attendance'
      });
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      student: req.user.id,
      course: courseId,
      lesson: lessonId
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this lesson'
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      student: req.user.id,
      course: courseId,
      lesson: lessonId,
      lessonType,
      status,
      liveClassData,
      deviceInfo: {
        ...deviceInfo,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: { attendance: attendance.getSummary() }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking attendance'
    });
  }
});

// @route   POST /api/attendance/end-session
// @desc    End attendance session
// @access  Private
router.post('/end-session', auth, [
  body('attendanceId').isMongoId().withMessage('Valid attendance ID is required')
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

    const { attendanceId } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Check if attendance belongs to user
    if (attendance.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this attendance session'
      });
    }

    // End the session
    await attendance.endSession();

    res.json({
      success: true,
      message: 'Attendance session ended successfully',
      data: { attendance: attendance.getSummary() }
    });
  } catch (error) {
    console.error('End attendance session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error ending attendance session'
    });
  }
});

// @route   GET /api/attendance/student/:studentId
// @desc    Get student's attendance records
// @access  Private (Student or Teacher/Admin)
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, startDate, endDate } = req.query;

    // Check if user can view this student's attendance
    if (req.user.id !== studentId && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this attendance data'
      });
    }

    // If user is teacher, check if they teach the course
    if (req.user.role === 'teacher' && courseId) {
      const course = await Course.findById(courseId);
      if (!course || course.instructor.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view attendance for this course'
        });
      }
    }

    const query = { student: studentId };
    if (courseId) query.course = courseId;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('course', 'title instructor')
      .populate('lesson', 'title type')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { attendance: attendance.map(record => record.getSummary()) }
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting student attendance'
    });
  }
});

// @route   GET /api/attendance/course/:courseId
// @desc    Get course attendance overview
// @access  Private (Teacher/Admin)
router.get('/course/:courseId', [auth, verifiedTeacherAuth], async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if user teaches this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view attendance for this course'
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30); // Default to last 30 days
    
    const end = endDate ? new Date(endDate) : new Date();

    const overview = await Attendance.getCourseAttendanceOverview(courseId, start, end);

    res.json({
      success: true,
      data: { overview }
    });
  } catch (error) {
    console.error('Get course attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting course attendance'
    });
  }
});

// @route   GET /api/attendance/stats/:studentId
// @desc    Get student attendance statistics
// @access  Private
router.get('/stats/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, startDate, endDate } = req.query;

    // Check if user can view this student's stats
    if (req.user.id !== studentId && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this attendance data'
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30); // Default to last 30 days
    
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await Attendance.getAttendanceStats(studentId, courseId, start, end);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting attendance statistics'
    });
  }
});

// @route   PUT /api/attendance/:id/status
// @desc    Update attendance status (Teacher/Admin only)
// @access  Private (Teacher/Admin)
router.put('/:id/status', [auth, verifiedTeacherAuth], [
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid attendance status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot be more than 500 characters')
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

    const { status, notes } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Check if user can modify this attendance
    const course = await Course.findById(attendance.course);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this attendance record'
      });
    }

    attendance.status = status;
    if (notes) attendance.notes.instructor = notes;
    attendance.verification = {
      method: 'manual',
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    };

    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance status updated successfully',
      data: { attendance: attendance.getSummary() }
    });
  } catch (error) {
    console.error('Update attendance status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating attendance status'
    });
  }
});

// @route   GET /api/attendance/live-class/:meetingId
// @desc    Get live class attendance
// @access  Private (Teacher/Admin)
router.get('/live-class/:meetingId', [auth, verifiedTeacherAuth], async (req, res) => {
  try {
    const { meetingId } = req.params;

    const attendance = await Attendance.find({
      'liveClassData.meetingId': meetingId
    })
    .populate('student', 'name email')
    .populate('course', 'title')
    .sort({ joinedAt: 1 });

    res.json({
      success: true,
      data: { attendance: attendance.map(record => record.getSummary()) }
    });
  } catch (error) {
    console.error('Get live class attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting live class attendance'
    });
  }
});

module.exports = router;
