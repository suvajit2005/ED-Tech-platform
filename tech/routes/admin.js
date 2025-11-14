const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Test = require('../models/Test');
const Attendance = require('../models/Attendance');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const verifiedTeachers = await User.countDocuments({ 
      role: 'teacher', 
      isVerified: true 
    });
    const activeTeachers = await User.countDocuments({ 
      role: 'teacher', 
      subscriptionStatus: 'active' 
    });

    // Course statistics
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ 
      isPublished: true, 
      isApproved: true 
    });
    const pendingCourses = await Course.countDocuments({ 
      isApproved: false 
    });

    // Revenue statistics
    const revenueData = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          platformRevenue: { $sum: '$platformFee' },
          instructorRevenue: { $sum: '$instructorFee' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    // Enrollment statistics
    const totalEnrollments = await Enrollment.countDocuments({ status: 'active' });
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });

    // Recent activity
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCourses = await Course.find()
      .populate('instructor', 'name email')
      .select('title instructor createdAt isApproved')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find({ status: 'completed' })
      .populate('user', 'name email')
      .populate('course', 'title')
      .select('user course amount type createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          teachers: totalTeachers,
          verifiedTeachers,
          activeTeachers,
          pendingTeachers: totalTeachers - verifiedTeachers
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          pending: pendingCourses
        },
        revenue: revenueData[0] || {
          totalRevenue: 0,
          platformRevenue: 0,
          instructorRevenue: 0,
          totalTransactions: 0
        },
        enrollments: {
          total: totalEnrollments,
          completed: completedEnrollments
        },
        recentActivity: {
          users: recentUsers,
          courses: recentCourses,
          payments: recentPayments
        }
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting admin dashboard'
    });
  }
});

// @route   GET /api/admin/courses/pending
// @desc    Get pending course approvals
// @access  Private (Admin)
router.get('/courses/pending', [auth, adminAuth], async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: false })
      .populate('instructor', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get pending courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting pending courses'
    });
  }
});

// @route   PUT /api/admin/courses/:id/approve
// @desc    Approve or reject course
// @access  Private (Admin)
router.put('/courses/:id/approve', [auth, adminAuth], [
  body('isApproved').isBoolean().withMessage('isApproved must be boolean'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot be more than 500 characters')
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

    const { isApproved, reason } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.isApproved = isApproved;
    if (reason) {
      course.adminNotes = reason;
    }

    await course.save();

    res.json({
      success: true,
      message: `Course ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: { course }
    });
  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving course'
    });
  }
});

// @route   GET /api/admin/teachers/pending
// @desc    Get pending teacher verifications
// @access  Private (Admin)
router.get('/teachers/pending', [auth, adminAuth], async (req, res) => {
  try {
    const teachers = await User.find({
      role: 'teacher',
      isVerified: false
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { teachers }
    });
  } catch (error) {
    console.error('Get pending teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting pending teachers'
    });
  }
});

// @route   PUT /api/admin/teachers/:id/verify
// @desc    Verify teacher account
// @access  Private (Admin)
router.put('/teachers/:id/verify', [auth, adminAuth], [
  body('isVerified').isBoolean().withMessage('isVerified must be boolean'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot be more than 500 characters')
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

    const { isVerified, reason } = req.body;

    const teacher = await User.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'User is not a teacher'
      });
    }

    teacher.isVerified = isVerified;
    if (reason) {
      teacher.adminNotes = reason;
    }

    await teacher.save();

    res.json({
      success: true,
      message: `Teacher account ${isVerified ? 'verified' : 'rejected'} successfully`,
      data: { teacher }
    });
  } catch (error) {
    console.error('Verify teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying teacher'
    });
  }
});

// @route   GET /api/admin/revenue
// @desc    Get revenue analytics
// @access  Private (Admin)
router.get('/revenue', [auth, adminAuth], async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30); // Default to last 30 days
    
    const end = endDate ? new Date(endDate) : new Date();

    // Revenue by date
    const dateGroupFormat = groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';
    const revenueByDate = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateGroupFormat,
              date: '$createdAt'
            }
          },
          totalRevenue: { $sum: '$amount' },
          platformRevenue: { $sum: '$platformFee' },
          instructorRevenue: { $sum: '$instructorFee' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by type
    const revenueByType = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$type',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Top earning instructors
    const topInstructors = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          type: 'course_purchase',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      { $unwind: '$courseData' },
      {
        $group: {
          _id: '$courseData.instructor',
          totalRevenue: { $sum: '$instructorFee' },
          courseCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'instructorData'
        }
      },
      { $unwind: '$instructorData' },
      {
        $project: {
          instructorName: '$instructorData.name',
          instructorEmail: '$instructorData.email',
          totalRevenue: 1,
          courseCount: 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        revenueByDate,
        revenueByType,
        topInstructors,
        period: {
          startDate: start,
          endDate: end,
          groupBy
        }
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting revenue analytics'
    });
  }
});

// @route   GET /api/admin/analytics/overview
// @desc    Get platform analytics overview
// @access  Private (Admin)
router.get('/analytics/overview', [auth, adminAuth], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30); // Default to last 30 days
    
    const end = endDate ? new Date(endDate) : new Date();

    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          newUsers: { $sum: 1 },
          newStudents: {
            $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
          },
          newTeachers: {
            $sum: { $cond: [{ $eq: ['$role', 'teacher'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Course performance
    const coursePerformance = await Course.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments'
        }
      },
      {
        $project: {
          title: 1,
          instructor: 1,
          price: 1,
          enrollmentCount: { $size: '$enrollments' },
          totalRevenue: { $multiply: ['$price', { $size: '$enrollments' }] },
          rating: 1,
          createdAt: 1
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 10 }
    ]);

    // Test statistics
    const testStats = await Test.aggregate([
      {
        $lookup: {
          from: 'testattempts',
          localField: '_id',
          foreignField: 'test',
          as: 'attempts'
        }
      },
      {
        $project: {
          title: 1,
          course: 1,
          totalAttempts: { $size: '$attempts' },
          averageScore: { $avg: '$attempts.score' },
          passRate: {
            $multiply: [
              {
                $divide: [
                  { $size: { $filter: { input: '$attempts', cond: { $gte: ['$$this.score', 60] } } } },
                  { $size: '$attempts' }
                ]
              },
              100
            ]
          }
        }
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        userGrowth,
        coursePerformance,
        testStats,
        period: {
          startDate: start,
          endDate: end
        }
      }
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting analytics overview'
    });
  }
});

// @route   GET /api/admin/reports/content
// @desc    Get reported content
// @access  Private (Admin)
router.get('/reports/content', [auth, adminAuth], async (req, res) => {
  try {
    // This would typically come from a ContentReport model
    // For now, returning empty array as placeholder
    const reportedContent = [];

    res.json({
      success: true,
      data: { reportedContent }
    });
  } catch (error) {
    console.error('Get reported content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting reported content'
    });
  }
});

// @route   PUT /api/admin/reports/:id/resolve
// @desc    Resolve content report
// @access  Private (Admin)
router.put('/reports/:id/resolve', [auth, adminAuth], [
  body('action').isIn(['ignore', 'warn', 'remove', 'suspend']).withMessage('Invalid action'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot be more than 500 characters')
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

    const { action, reason } = req.body;

    // This would typically update a ContentReport model
    // For now, returning success as placeholder

    res.json({
      success: true,
      message: 'Content report resolved successfully',
      data: { action, reason }
    });
  } catch (error) {
    console.error('Resolve content report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resolving content report'
    });
  }
});

module.exports = router;
