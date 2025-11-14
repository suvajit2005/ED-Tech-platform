const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/create-order
// @desc    Create payment order for course purchase
// @access  Private (Student)
router.post('/create-order', auth, [
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('paymentMethod').isIn(['razorpay', 'stripe']).withMessage('Invalid payment method')
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

    const { courseId, paymentMethod } = req.body;

    // Check if user is student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can purchase courses'
      });
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is published and approved
    if (!course.isPublished || !course.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for purchase'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
      status: 'active'
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      type: 'course_purchase',
      amount: course.price,
      currency: 'INR',
      paymentMethod,
      course: courseId,
      gatewayPaymentId: `temp_${Date.now()}` // Will be updated with actual gateway ID
    });

    await payment.save();

    // Generate payment order based on method
    let orderData = {};
    
    if (paymentMethod === 'razorpay') {
      // Razorpay order creation logic would go here
      orderData = {
        amount: course.price * 100, // Convert to paise
        currency: 'INR',
        receipt: `course_${courseId}_${req.user.id}`,
        notes: {
          courseId: courseId,
          userId: req.user.id,
          paymentId: payment._id
        }
      };
    } else if (paymentMethod === 'stripe') {
      // Stripe payment intent creation logic would go here
      orderData = {
        amount: course.price * 100, // Convert to cents
        currency: 'inr',
        metadata: {
          courseId: courseId,
          userId: req.user.id,
          paymentId: payment._id
        }
      };
    }

    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        paymentId: payment._id,
        orderData,
        course: {
          id: course._id,
          title: course.title,
          price: course.price,
          instructor: course.instructor
        }
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment order'
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment and complete enrollment
// @access  Private (Student)
router.post('/verify', auth, [
  body('paymentId').isMongoId().withMessage('Valid payment ID is required'),
  body('gatewayPaymentId').notEmpty().withMessage('Gateway payment ID is required'),
  body('gatewayOrderId').optional().notEmpty().withMessage('Gateway order ID is required'),
  body('gatewaySignature').optional().notEmpty().withMessage('Gateway signature is required')
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

    const { paymentId, gatewayPaymentId, gatewayOrderId, gatewaySignature } = req.body;

    // Get payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment belongs to user
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this payment'
      });
    }

    // Check if payment is already completed
    if (payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    // Verify payment with gateway (implementation depends on gateway)
    // For now, we'll assume verification is successful
    const isVerified = true; // This should be replaced with actual gateway verification

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment status
    payment.status = 'completed';
    payment.gatewayPaymentId = gatewayPaymentId;
    payment.gatewayOrderId = gatewayOrderId;
    payment.gatewaySignature = gatewaySignature;
    payment.completedAt = new Date();
    await payment.save();

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user.id,
      course: payment.course,
      payment: payment._id,
      status: 'active'
    });

    await enrollment.save();

    // Update course enrollment count
    const course = await Course.findById(payment.course);
    if (course) {
      course.enrollmentCount += 1;
      course.totalRevenue += payment.amount;
      await course.save();
    }

    // Update user's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        enrolledCourses: {
          course: payment.course,
          enrolledAt: new Date()
        }
      }
    });

    res.json({
      success: true,
      message: 'Payment verified and enrollment completed successfully',
      data: {
        payment: payment.getSummary(),
        enrollment: {
          id: enrollment._id,
          course: enrollment.course,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status
        }
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment'
    });
  }
});

// @route   POST /api/payments/teacher-subscription
// @desc    Create payment for teacher subscription
// @access  Private (Teacher)
router.post('/teacher-subscription', auth, [
  body('subscriptionPlan').isIn(['basic', 'premium', 'enterprise']).withMessage('Invalid subscription plan'),
  body('subscriptionDuration').isInt({ min: 1, max: 12 }).withMessage('Subscription duration must be between 1 and 12 months'),
  body('paymentMethod').isIn(['razorpay', 'stripe']).withMessage('Invalid payment method')
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

    // Check if user is teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create subscription payments'
      });
    }

    const { subscriptionPlan, subscriptionDuration, paymentMethod } = req.body;

    // Calculate subscription amount based on plan
    const planPricing = {
      basic: 999, // INR per month
      premium: 1999,
      enterprise: 3999
    };

    const monthlyAmount = planPricing[subscriptionPlan];
    const totalAmount = monthlyAmount * subscriptionDuration;

    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      type: 'teacher_subscription',
      amount: totalAmount,
      currency: 'INR',
      paymentMethod,
      subscriptionPlan,
      subscriptionDuration,
      gatewayPaymentId: `temp_${Date.now()}`
    });

    await payment.save();

    // Generate payment order
    let orderData = {};
    
    if (paymentMethod === 'razorpay') {
      orderData = {
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: `subscription_${subscriptionPlan}_${req.user.id}`,
        notes: {
          subscriptionPlan,
          subscriptionDuration,
          userId: req.user.id,
          paymentId: payment._id
        }
      };
    } else if (paymentMethod === 'stripe') {
      orderData = {
        amount: totalAmount * 100,
        currency: 'inr',
        metadata: {
          subscriptionPlan,
          subscriptionDuration,
          userId: req.user.id,
          paymentId: payment._id
        }
      };
    }

    res.json({
      success: true,
      message: 'Subscription payment order created successfully',
      data: {
        paymentId: payment._id,
        orderData,
        subscription: {
          plan: subscriptionPlan,
          duration: subscriptionDuration,
          monthlyAmount,
          totalAmount
        }
      }
    });
  } catch (error) {
    console.error('Create subscription payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating subscription payment'
    });
  }
});

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;

    const query = { user: req.user.id };
    if (type) query.type = type;

    const payments = await Payment.find(query)
      .populate('course', 'title instructor')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: {
        payments: payments.map(payment => payment.getSummary()),
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting payment history'
    });
  }
});

// @route   GET /api/payments/revenue
// @desc    Get revenue analytics (Admin only)
// @access  Private (Admin)
router.get('/revenue', [auth, adminAuth], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30); // Default to last 30 days
    
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await Payment.getRevenueAnalytics(start, end);

    // Get total revenue
    const totalRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPlatformFee: { $sum: '$platformFee' },
          totalInstructorFee: { $sum: '$instructorFee' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        analytics,
        summary: totalRevenue[0] || {
          totalAmount: 0,
          totalPlatformFee: 0,
          totalInstructorFee: 0,
          count: 0
        },
        period: {
          startDate: start,
          endDate: end
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

// @route   POST /api/payments/refund
// @desc    Process refund (Admin only)
// @access  Private (Admin)
router.post('/refund', [auth, adminAuth], [
  body('paymentId').isMongoId().withMessage('Valid payment ID is required'),
  body('amount').isNumeric().isFloat({ min: 0 }).withMessage('Refund amount must be a positive number'),
  body('reason').notEmpty().withMessage('Refund reason is required')
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

    const { paymentId, amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Process refund
    await payment.processRefund(amount, reason);

    // If it's a course purchase, handle enrollment cancellation
    if (payment.type === 'course_purchase') {
      const enrollment = await Enrollment.findOne({
        payment: paymentId,
        status: 'active'
      });

      if (enrollment) {
        enrollment.status = 'cancelled';
        await enrollment.save();

        // Update course enrollment count
        const course = await Course.findById(payment.course);
        if (course) {
          course.enrollmentCount = Math.max(0, course.enrollmentCount - 1);
          course.totalRevenue = Math.max(0, course.totalRevenue - amount);
          await course.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        payment: payment.getSummary()
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing refund'
    });
  }
});

module.exports = router;
