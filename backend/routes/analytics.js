const express = require('express');
const router = express.Router();
const {
  getStudentAnalytics,
  getCourseAnalytics,
  getDepartmentAnalytics
} = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.use(auth);

// Student performance analytics
router.get('/student/:id', getStudentAnalytics);

// Course analytics
router.get('/course/:id', getCourseAnalytics);

// Department analytics
router.get('/department/:id', getDepartmentAnalytics);

module.exports = router;
