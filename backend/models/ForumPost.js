const mongoose = require('mongoose');

const forumReplySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const forumPostSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  replies: [forumReplySchema]
}, {
  timestamps: true
});

// Indexes
forumPostSchema.index({ course: 1, createdAt: -1 });
forumPostSchema.index({ author: 1 });
forumPostSchema.index({ isResolved: 1 });
forumPostSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('ForumPost', forumPostSchema);
