const User = require('../models/User');
const { paginate } = require('../utils/pagination');

// @desc    Get all users (admin only, paginated)
// @route   GET /api/users?page=1&limit=20&role=student&search=keyword
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, department, institution, page, limit } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (institution) filter.institution = institution;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await paginate(User, filter, { page, limit }, [
      { path: 'institution', select: 'name code' },
      { path: 'department', select: 'name code' }
    ]);

    res.json({ users: result.data, ...result.pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('institution', 'name code')
      .populate('department', 'name code');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (admin only)
// @route   POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, name, role, institution, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      email,
      password,
      name,
      role,
      institution,
      department
    });

    res.status(201).json({ user, message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, institution, department } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (role) updates.role = role;
    if (institution) updates.institution = institution;
    if (department) updates.department = department;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
      .populate('institution', 'name code')
      .populate('department', 'name code');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
