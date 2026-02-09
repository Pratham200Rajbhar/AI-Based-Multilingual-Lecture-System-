const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { initRedis } = require('./services/cache');

// Import routes
const authRoutes = require('./routes/auth');
const lectureRoutes = require('./routes/lectures');
const quizRoutes = require('./routes/quizzes');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courses');
const attendanceRoutes = require('./routes/attendance');
const assignmentRoutes = require('./routes/assignments');
const gradebookRoutes = require('./routes/gradebook');
const timetableRoutes = require('./routes/timetable');
const notificationRoutes = require('./routes/notifications');
const announcementRoutes = require('./routes/announcements');
const forumRoutes = require('./routes/forum');
const eventRoutes = require('./routes/events');
const analyticsRoutes = require('./routes/analytics');
const bulkRoutes = require('./routes/bulk');
const exportRoutes = require('./routes/export');
const auditLogRoutes = require('./routes/auditLogs');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { performanceMonitor, getMetrics } = require('./middleware/performanceMonitor');
const userRateLimit = require('./middleware/userRateLimit');

const app = express();

// Connect to MongoDB
connectDB();

// Try to connect to Redis (non-blocking, graceful fallback)
initRedis().catch(() => console.log('Running without Redis cache'));

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// Performance monitoring
app.use(performanceMonitor);

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Performance metrics endpoint (admin)
app.get('/api/metrics/performance', getMetrics);

// API Routes - Core
app.use('/api/auth', authRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);

// API Routes - Phase 2: Institute Features
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/gradebook', gradebookRoutes);
app.use('/api/timetable', timetableRoutes);

// API Routes - Phase 3: Communication
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventRoutes);

// API Routes - Phase 4: Admin & Operations
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Error handler
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
