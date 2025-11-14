const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['course_purchase', 'teacher_subscription', 'platform_fee'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'bank_transfer'],
    required: true
  },
  // Payment gateway specific fields
  gatewayPaymentId: {
    type: String,
    required: true
  },
  gatewayOrderId: {
    type: String
  },
  gatewaySignature: {
    type: String
  },
  // Course purchase specific
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  // Teacher subscription specific
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise']
  },
  subscriptionDuration: {
    type: Number, // in months
    default: 1
  },
  // Platform fee breakdown
  platformFee: {
    type: Number,
    default: 0
  },
  instructorFee: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  // Payment details
  paymentDetails: {
    cardLast4: String,
    cardBrand: String,
    bankName: String,
    upiId: String,
    walletName: String
  },
  // Refund information
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    gatewayRefundId: String
  },
  // Transaction metadata
  metadata: {
    type: Map,
    of: String
  },
  // Payment timeline
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  // Webhook data
  webhookData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Calculate platform and instructor fees
paymentSchema.pre('save', function(next) {
  if (this.type === 'course_purchase' && this.course) {
    // Platform takes 20% commission
    this.platformFee = Math.round(this.amount * 0.2);
    this.instructorFee = this.amount - this.platformFee;
  }
  next();
});

// Update payment status
paymentSchema.methods.updateStatus = function(status, additionalData = {}) {
  this.status = status;
  
  if (status === 'completed') {
    this.completedAt = new Date();
  } else if (status === 'failed') {
    this.failedAt = new Date();
  }
  
  // Update additional data
  Object.assign(this, additionalData);
  
  return this.save();
};

// Process refund
paymentSchema.methods.processRefund = async function(amount, reason) {
  if (this.status !== 'completed') {
    throw new Error('Only completed payments can be refunded');
  }
  
  if (amount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }
  
  this.refund = {
    amount,
    reason,
    processedAt: new Date()
  };
  
  this.status = 'refunded';
  
  return this.save();
};

// Get payment summary
paymentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    paymentMethod: this.paymentMethod,
    createdAt: this.createdAt,
    completedAt: this.completedAt,
    platformFee: this.platformFee,
    instructorFee: this.instructorFee
  };
};

// Static method to get revenue analytics
paymentSchema.statics.getRevenueAnalytics = async function(startDate, endDate) {
  const matchStage = {
    status: 'completed',
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  const analytics = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        totalPlatformFee: { $sum: '$platformFee' },
        totalInstructorFee: { $sum: '$instructorFee' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return analytics;
};

module.exports = mongoose.model('Payment', paymentSchema);
