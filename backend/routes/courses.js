const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { paginate } = require('../utils/pagination');
const auth = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all courses (paginated, with filters)
// @access  Private (any role)
router.get('/', auth, async (req, res, next) => {
  try {
    const { department, semester, search, page, limit } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await paginate(Course, filter, { page, limit, sort: { name: 1 } }, [
      { path: 'department', select: 'name code' }
    ]);

    res.json({
      data: result.data,
      pagination: { total: result.pagination.totalItems, ...result.pagination }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
