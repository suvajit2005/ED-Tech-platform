const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  lessonType: {
    type: String,
    enum: ['live', 'video', 'note', 'test'],
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  // For live classes
  liveClassData: {
    meetingId: String,
    meetingUrl: String,
    platform: {
      type: String,
      enum: ['zoom', 'google_meet', 'teams', 'custom']
    },
    // Zoom specific data
    zoomData: {
      participantId: String,
      joinTime: Date,
      leaveTime: Date,
      duration: Number
    },
    // Google Meet specific data
    meetData: {
      participantId: String,
      joinTime: Date,
      leaveTime: Date,
      duration: Number
    }
  },
  // Attendance verification
  verification: {
    method: {
      type: String,
      enum: ['automatic', 'manual', 'qr_code', 'biometric'],
      default: 'automatic'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  // Device and location data
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    browser: String,
    os: String
  },
  // Location data (if enabled)
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
    country: String
  },
  // Additional metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  // Notes and comments
  notes: {
    student: String,
    instructor: String,
    admin: String
  }
}, {
  timestamps: true
});

// Calculate duration when leftAt is set
attendanceSchema.pre('save', function(next) {
  if (this.leftAt && this.joinedAt) {
    const durationMs = this.leftAt - this.joinedAt;
    this.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Mark attendance as present
attendanceSchema.methods.markPresent = function(additionalData = {}) {
  this.status = 'present';
  this.joinedAt = new Date();
  Object.assign(this, additionalData);
  return this.save();
};

// Mark attendance as absent
attendanceSchema.methods.markAbsent = function(reason = '') {
  this.status = 'absent';
  this.notes.student = reason;
  return this.save();
};

// Mark as late
attendanceSchema.methods.markLate = function(minutesLate, reason = '') {
  this.status = 'late';
  this.notes.student = `Late by ${minutesLate} minutes. ${reason}`;
  return this.save();
};

// End attendance session
attendanceSchema.methods.endSession = function() {
  this.leftAt = new Date();
  return this.save();
};

// Get attendance summary
attendanceSchema.methods.getSummary = function() {
  return {
    id: this._id,
    student: this.student,
    course: this.course,
    lesson: this.lesson,
    lessonType: this.lessonType,
    status: this.status,
    joinedAt: this.joinedAt,
    leftAt: this.leftAt,
    duration: this.duration,
    verification: this.verification
  };
};

// Static method to get attendance statistics
attendanceSchema.statics.getAttendanceStats = async function(studentId, courseId, startDate, endDate) {
  const matchStage = {
    student: studentId,
    course: courseId
  };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' }
      }
    }
  ]);
  
  const totalSessions = stats.reduce((sum, stat) => sum + stat.count, 0);
  const presentSessions = stats.find(stat => stat._id === 'present')?.count || 0;
  const absentSessions = stats.find(stat => stat._id === 'absent')?.count || 0;
  const lateSessions = stats.find(stat => stat._id === 'late')?.count || 0;
  
  return {
    totalSessions,
    presentSessions,
    absentSessions,
    lateSessions,
    attendanceRate: totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0,
    punctualityRate: totalSessions > 0 ? Math.round(((presentSessions + lateSessions) / totalSessions) * 100) : 0,
    totalDuration: stats.reduce((sum, stat) => sum + stat.totalDuration, 0)
  };
};

// Static method to get course attendance overview
attendanceSchema.statics.getCourseAttendanceOverview = async function(courseId, startDate, endDate) {
  const matchStage = { course: courseId };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const overview = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          student: '$student',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.student',
        attendance: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $unwind: '$student'
    },
    {
      $project: {
        student: {
          _id: '$student._id',
          name: '$student.name',
          email: '$student.email'
        },
        attendance: 1
      }
    }
  ]);
  
  return overview;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
