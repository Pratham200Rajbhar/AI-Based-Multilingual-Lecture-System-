const express = require('express');
const router = express.Router();
const {
  getAllLectures,
  getLectureById,
  createLecture,
  updateLecture,
  deleteLecture,
  getTranscription,
  retryTranscription
} = require('../controllers/lectureController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// @route   GET /api/lectures
router.get('/', auth, getAllLectures);

// @route   GET /api/lectures/:id
router.get('/:id', auth, getLectureById);

// @route   GET /api/lectures/:id/transcription
router.get('/:id/transcription', auth, getTranscription);

// @route   POST /api/lectures (professor & admins only)
router.post('/',
  auth,
  roleCheck('professor', 'dept_admin', 'inst_admin', 'super_admin'),
  upload.single('file'),
  createLecture
);

// @route   PUT /api/lectures/:id (professor & admins only)
router.put('/:id',
  auth,
  roleCheck('professor', 'dept_admin', 'inst_admin', 'super_admin'),
  upload.single('file'),
  updateLecture
);

// @route   POST /api/lectures/:id/transcription/retry (professor & admins only)
router.post('/:id/transcription/retry',
  auth,
  roleCheck('professor', 'dept_admin', 'inst_admin', 'super_admin'),
  retryTranscription
);

// @route   DELETE /api/lectures/:id (professor & admins only)
router.delete('/:id',
  auth,
  roleCheck('professor', 'dept_admin', 'inst_admin', 'super_admin'),
  deleteLecture
);

module.exports = router;
