const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'fill_blank', 'short_answer'],
    default: 'multiple_choice'
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: String,
    required: function() {
      return this.type === 'fill_blank' || this.type === 'short_answer';
    }
  },
  explanation: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    default: 1,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: {
    type: Number, // in seconds
    default: 60
  },
  media: {
    image: String,
    video: String,
    audio: String
  }
}, {
  timestamps: true
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  settings: {
    duration: {
      type: Number, // in minutes
      default: 60
    },
    passingScore: {
      type: Number,
      default: 60, // percentage
      min: 0,
      max: 100
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    shuffleOptions: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    showExplanations: {
      type: Boolean,
      default: true
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    timeLimit: {
      type: Number, // in minutes
      default: 0 // 0 means no time limit
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Test statistics
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  passRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Test availability
  availableFrom: {
    type: Date
  },
  availableUntil: {
    type: Date
  },
  // Grading settings
  gradingMethod: {
    type: String,
    enum: ['automatic', 'manual', 'hybrid'],
    default: 'automatic'
  },
  // Question categories/tags
  categories: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Calculate test statistics
testSchema.methods.calculateStatistics = async function() {
  const TestAttempt = mongoose.model('TestAttempt');
  
  const attempts = await TestAttempt.find({ test: this._id });
  
  if (attempts.length === 0) {
    this.totalAttempts = 0;
    this.averageScore = 0;
    this.passRate = 0;
  } else {
    this.totalAttempts = attempts.length;
    
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    this.averageScore = Math.round(totalScore / attempts.length);
    
    const passedAttempts = attempts.filter(attempt => 
      attempt.score >= this.settings.passingScore
    ).length;
    this.passRate = Math.round((passedAttempts / attempts.length) * 100);
  }
  
  await this.save();
};

// Get test summary for students
testSchema.methods.getStudentSummary = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    duration: this.settings.duration,
    passingScore: this.settings.passingScore,
    maxAttempts: this.settings.maxAttempts,
    totalQuestions: this.questions.length,
    totalPoints: this.questions.reduce((sum, q) => sum + q.points, 0),
    isPublished: this.isPublished,
    isActive: this.isActive,
    availableFrom: this.availableFrom,
    availableUntil: this.availableUntil
  };
};

// Check if test is available for student
testSchema.methods.isAvailableForStudent = function(studentId) {
  if (!this.isPublished || !this.isActive) {
    return false;
  }
  
  const now = new Date();
  
  if (this.availableFrom && now < this.availableFrom) {
    return false;
  }
  
  if (this.availableUntil && now > this.availableUntil) {
    return false;
  }
  
  return true;
};

module.exports = mongoose.model('Test', testSchema);
