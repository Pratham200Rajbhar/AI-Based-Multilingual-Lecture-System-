const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'descriptive'],
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: String
  },
  points: {
    type: Number,
    default: 1
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  deadline: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Database indexes
quizSchema.index({ title: 'text' });
quizSchema.index({ course: 1, createdAt: -1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ deadline: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
