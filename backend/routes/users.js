const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require admin access
router.use(auth);
router.use(roleCheck('dept_admin', 'inst_admin', 'super_admin'));

// @route   GET /api/users
router.get('/', getAllUsers);

// @route   GET /api/users/:id
router.get('/:id', getUserById);

// @route   POST /api/users
router.post('/', createUser);

// @route   PUT /api/users/:id
router.put('/:id', updateUser);

// @route   DELETE /api/users/:id
router.delete('/:id', deleteUser);

module.exports = router;
