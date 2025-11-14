const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  answeredAt: {
    type: Date,
    default: Date.now
  }
});

const testAttemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  earnedPoints: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned', 'timeout'],
    default: 'in_progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  // Detailed results
  results: {
    correctAnswers: {
      type: Number,
      default: 0
    },
    incorrectAnswers: {
      type: Number,
      default: 0
    },
    unansweredQuestions: {
      type: Number,
      default: 0
    },
    questionsByDifficulty: {
      easy: {
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      },
      medium: {
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      },
      hard: {
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      }
    }
  },
  // Feedback and review
  feedback: {
    overall: String,
    strengths: [String],
    weaknesses: [String],
    recommendations: [String]
  },
  // Proctoring data (if enabled)
  proctoring: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    violations: [{
      type: String,
      timestamp: Date,
      description: String
    }],
    screenshots: [String],
    audioRecordings: [String]
  }
}, {
  timestamps: true
});

// Ensure one attempt per student per test per attempt number
testAttemptSchema.index({ student: 1, test: 1, attemptNumber: 1 }, { unique: true });

// Calculate score before saving
testAttemptSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    this.calculateScore();
  }
  next();
});

// Calculate test score
testAttemptSchema.methods.calculateScore = function() {
  let totalPoints = 0;
  let earnedPoints = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unansweredQuestions = 0;
  
  const difficultyStats = {
    easy: { total: 0, correct: 0 },
    medium: { total: 0, correct: 0 },
    hard: { total: 0, correct: 0 }
  };
  
  this.answers.forEach(answer => {
    totalPoints += answer.points;
    
    if (answer.isCorrect) {
      earnedPoints += answer.points;
      correctAnswers++;
    } else if (answer.answer && answer.answer.trim() !== '') {
      incorrectAnswers++;
    } else {
      unansweredQuestions++;
    }
    
    // Update difficulty stats (would need question data)
    // This would require populating the test with questions
  });
  
  this.totalPoints = totalPoints;
  this.earnedPoints = earnedPoints;
  this.score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  
  this.results = {
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    questionsByDifficulty: difficultyStats
  };
  
  // Mark as completed
  if (this.status === 'in_progress') {
    this.status = 'completed';
    this.completedAt = new Date();
    
    // Calculate time spent
    const timeDiff = this.completedAt - this.startedAt;
    this.timeSpent = Math.round(timeDiff / (1000 * 60)); // Convert to minutes
  }
};

// Submit answer for a question
testAttemptSchema.methods.submitAnswer = function(questionId, answer, timeSpent = 0) {
  const existingAnswer = this.answers.find(
    ans => ans.question.toString() === questionId.toString()
  );
  
  if (existingAnswer) {
    // Update existing answer
    existingAnswer.answer = answer;
    existingAnswer.timeSpent = timeSpent;
    existingAnswer.answeredAt = new Date();
  } else {
    // Add new answer
    this.answers.push({
      question: questionId,
      answer: answer,
      timeSpent: timeSpent,
      answeredAt: new Date()
    });
  }
  
  // Recalculate score
  this.calculateScore();
};

// Get attempt summary
testAttemptSchema.methods.getSummary = function() {
  return {
    id: this._id,
    test: this.test,
    attemptNumber: this.attemptNumber,
    score: this.score,
    status: this.status,
    startedAt: this.startedAt,
    completedAt: this.completedAt,
    timeSpent: this.timeSpent,
    results: this.results,
    isPassed: this.score >= 60 // Assuming 60% is passing
  };
};

// Get detailed results for review
testAttemptSchema.methods.getDetailedResults = function() {
  return {
    summary: this.getSummary(),
    answers: this.answers,
    feedback: this.feedback,
    proctoring: this.proctoring
  };
};

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
