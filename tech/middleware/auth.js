const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in admin authentication.' 
    });
  }
};

// Check if user is teacher
const teacherAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Teacher privileges required.' 
      });
    }
    next();
  } catch (error) {
    console.error('Teacher auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in teacher authentication.' 
    });
  }
};

// Check if user is student
const studentAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Student privileges required.' 
      });
    }
    next();
  } catch (error) {
    console.error('Student auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in student authentication.' 
    });
  }
};

// Check if teacher is verified
const verifiedTeacherAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Teacher privileges required.' 
      });
    }

    if (req.user.role === 'teacher' && !req.user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Teacher account not verified.' 
      });
    }

    next();
  } catch (error) {
    console.error('Verified teacher auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in verified teacher authentication.' 
    });
  }
};

// Check if teacher has active subscription
const activeSubscriptionAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Teacher privileges required.' 
      });
    }

    if (req.user.role === 'teacher') {
      if (!req.user.isVerified) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Teacher account not verified.' 
        });
      }

      if (req.user.subscriptionStatus !== 'active') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Active subscription required.' 
        });
      }

      // Check if subscription is not expired
      if (req.user.subscriptionEndDate && new Date() > req.user.subscriptionEndDate) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Subscription has expired.' 
        });
      }
    }

    next();
  } catch (error) {
    console.error('Active subscription auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in subscription authentication.' 
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = {
  auth,
  adminAuth,
  teacherAuth,
  studentAuth,
  verifiedTeacherAuth,
  activeSubscriptionAuth,
  optionalAuth
};
