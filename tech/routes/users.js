const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      isVerified,
      subscriptionStatus
    } = req.query;

    const query = {};

    // Apply filters
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (subscriptionStatus) query.subscriptionStatus = subscriptionStatus;

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can view this profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user'
    });
  }
});

// @route   PUT /api/users/:id/verify
// @desc    Verify teacher account
// @access  Private (Admin)
router.put('/:id/verify', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Only teachers can be verified'
      });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Teacher account verified successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying user'
    });
  }
});

// @route   PUT /api/users/:id/subscription
// @desc    Update teacher subscription
// @access  Private (Admin)
router.put('/:id/subscription', [auth, adminAuth], [
  body('status').isIn(['active', 'inactive', 'expired', 'cancelled']).withMessage('Invalid subscription status'),
  body('monthlyRent').optional().isNumeric().isFloat({ min: 0 }).withMessage('Monthly rent must be a positive number'),
  body('subscriptionStartDate').optional().isISO8601().withMessage('Invalid start date'),
  body('subscriptionEndDate').optional().isISO8601().withMessage('Invalid end date')
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

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Only teachers have subscriptions'
      });
    }

    const { status, monthlyRent, subscriptionStartDate, subscriptionEndDate } = req.body;

    user.subscriptionStatus = status;
    if (monthlyRent !== undefined) user.monthlyRent = monthlyRent;
    if (subscriptionStartDate) user.subscriptionStartDate = new Date(subscriptionStartDate);
    if (subscriptionEndDate) user.subscriptionEndDate = new Date(subscriptionEndDate);

    await user.save();

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating subscription'
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Update user status
// @access  Private (Admin)
router.put('/:id/status', [auth, adminAuth], [
  body('isActive').isBoolean().withMessage('isActive must be boolean')
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

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
});

// @route   GET /api/users/teachers/pending
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

// @route   GET /api/users/teachers/active
// @desc    Get active teachers
// @access  Public
router.get('/teachers/active', async (req, res) => {
  try {
    const teachers = await User.find({
      role: 'teacher',
      isVerified: true,
      isActive: true,
      subscriptionStatus: 'active'
    })
    .select('name email avatar bio')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { teachers }
    });
  } catch (error) {
    console.error('Get active teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting active teachers'
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview
// @access  Private (Admin)
router.get('/stats/overview', [auth, adminAuth], async (req, res) => {
  try {
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

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentStudents = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const recentTeachers = await User.countDocuments({
      role: 'teacher',
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalTeachers,
        verifiedTeachers,
        activeTeachers,
        pendingTeachers: totalTeachers - verifiedTeachers,
        recentStudents,
        recentTeachers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user statistics'
    });
  }
});

module.exports = router;
