const express = require('express');
const router = express.Router();
const {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  submitQuiz,
  getQuizResults,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/quizzes
router.get('/', auth, getAllQuizzes);

// @route   GET /api/quizzes/:id
router.get('/:id', auth, getQuizById);

// @route   POST /api/quizzes (professor & admins only)
router.post('/',
  auth,
  roleCheck('professor', 'dept_admin', 'inst_admin', 'super_admin'),
  createQuiz
);

// @route   PUT /api/quizzes/:id (professor & admins only)
router.put('/:id',
  auth,
  roleCheck('professor', 'dept_admin', 'inst_admin', 'super_admin'),
  updateQuiz
);

// @route   DELETE /api/quizzes/:id (professor & admins only)
router.delete('/:id',
  auth,
  roleCheck('professor', 'dept_admin', 'inst_admin', 'super_admin'),
  deleteQuiz
);

// @route   POST /api/quizzes/:id/submit (students)
router.post('/:id/submit', auth, submitQuiz);

// @route   GET /api/quizzes/:id/results
router.get('/:id/results', auth, getQuizResults);

module.exports = router;
