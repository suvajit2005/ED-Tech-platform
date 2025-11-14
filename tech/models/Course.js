const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'live', 'note', 'test'],
    required: true
  },
  content: {
    videoUrl: String,
    videoDuration: Number, // in minutes
    liveUrl: String,
    liveDateTime: Date,
    noteUrl: String,
    noteFileName: String,
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: [
      'programming',
      'mathematics',
      'science',
      'language',
      'business',
      'design',
      'music',
      'other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  lessons: [lessonSchema],
  duration: {
    type: Number, // total duration in minutes
    default: 0
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    default: 'English'
  },
  tags: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Course statistics
  totalViews: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  // Course settings
  allowDownload: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  // Live class settings
  liveClassSettings: {
    maxParticipants: {
      type: Number,
      default: 100
    },
    recordingEnabled: {
      type: Boolean,
      default: true
    },
    chatEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Calculate total duration before saving
courseSchema.pre('save', function(next) {
  if (this.lessons && this.lessons.length > 0) {
    this.duration = this.lessons.reduce((total, lesson) => {
      return total + (lesson.content.videoDuration || 0);
    }, 0);
  }
  next();
});

// Update enrollment count when students enroll
courseSchema.methods.updateEnrollmentCount = async function() {
  const enrollmentCount = await mongoose.model('Enrollment').countDocuments({
    course: this._id,
    status: 'active'
  });
  this.enrollmentCount = enrollmentCount;
  await this.save();
};

// Calculate completion rate
courseSchema.methods.calculateCompletionRate = async function() {
  const enrollments = await mongoose.model('Enrollment').find({
    course: this._id,
    status: 'active'
  });
  
  if (enrollments.length === 0) {
    this.completionRate = 0;
  } else {
    const completedCount = enrollments.filter(enrollment => 
      enrollment.progress === 100
    ).length;
    this.completionRate = (completedCount / enrollments.length) * 100;
  }
  
  await this.save();
};

module.exports = mongoose.model('Course', courseSchema);
