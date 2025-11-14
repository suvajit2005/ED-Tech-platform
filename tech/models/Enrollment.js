const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    }
  }],
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  // Course rating and review
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  reviewedAt: {
    type: Date
  },
  // Certificate
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: {
    type: String
  },
  certificateIssuedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure one enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Update progress when lessons are completed
enrollmentSchema.methods.updateProgress = function() {
  if (this.completedLessons.length === 0) {
    this.progress = 0;
  } else {
    // Get total lessons from course
    const totalLessons = this.course.lessons ? this.course.lessons.length : 1;
    this.progress = Math.round((this.completedLessons.length / totalLessons) * 100);
    
    if (this.progress === 100) {
      this.status = 'completed';
      this.completedAt = new Date();
    }
  }
};

// Mark lesson as completed
enrollmentSchema.methods.markLessonCompleted = function(lessonId, timeSpent = 0) {
  const existingCompletion = this.completedLessons.find(
    completion => completion.lesson.toString() === lessonId.toString()
  );
  
  if (!existingCompletion) {
    this.completedLessons.push({
      lesson: lessonId,
      completedAt: new Date(),
      timeSpent: timeSpent
    });
    
    this.totalTimeSpent += timeSpent;
    this.updateProgress();
  }
};

// Get completion statistics
enrollmentSchema.methods.getCompletionStats = function() {
  const totalLessons = this.course.lessons ? this.course.lessons.length : 0;
  const completedLessons = this.completedLessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  return {
    totalLessons,
    completedLessons,
    remainingLessons: totalLessons - completedLessons,
    progressPercentage,
    totalTimeSpent: this.totalTimeSpent,
    averageTimePerLesson: completedLessons > 0 ? Math.round(this.totalTimeSpent / completedLessons) : 0
  };
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
