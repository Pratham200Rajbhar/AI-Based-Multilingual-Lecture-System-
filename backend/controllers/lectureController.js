const Lecture = require('../models/Lecture');
const path = require('path');
const fs = require('fs');
const { paginate } = require('../utils/pagination');

// @desc    Get all lectures (with filters & pagination)
// @route   GET /api/lectures?page=1&limit=20&course=id&semester=3&search=keyword&fileType=pdf&uploadedAfter=date&uploadedBy=id
exports.getAllLectures = async (req, res, next) => {
  try {
    const { course, semester, search, fileType, uploadedAfter, uploadedBy, page, limit } = req.query;
    const filter = {};

    if (course) filter.course = course;
    if (semester) filter.semester = parseInt(semester);
    if (fileType) filter.fileType = fileType;
    if (uploadedBy) filter.uploadedBy = uploadedBy;
    if (uploadedAfter) filter.createdAt = { $gte: new Date(uploadedAfter) };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await paginate(Lecture, filter, { page, limit }, [
      { path: 'course', select: 'name code' },
      { path: 'uploadedBy', select: 'name email' }
    ]);

    res.json({
      data: result.data,
      pagination: { total: result.pagination.totalItems, ...result.pagination }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lecture by ID
// @route   GET /api/lectures/:id
exports.getLectureById = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate('course', 'name code')
      .populate('uploadedBy', 'name email');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    res.json({ lecture });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lecture
// @route   POST /api/lectures
exports.createLecture = async (req, res, next) => {
  try {
    const { title, description, course, semester } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Determine file type
    const ext = path.extname(req.file.originalname).toLowerCase();
    let fileType = 'document';
    if (ext === '.pdf') fileType = 'pdf';
    else if (['.mp4', '.webm', '.mov'].includes(ext)) fileType = 'video';

    const lecture = await Lecture.create({
      title,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType,
      fileName: req.file.originalname,
      course,
      uploadedBy: req.user._id,
      semester: semester ? parseInt(semester) : undefined
    });

    await lecture.populate('course', 'name code');
    await lecture.populate('uploadedBy', 'name email');

    res.status(201).json({ lecture, message: 'Lecture uploaded successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lecture
// @route   PUT /api/lectures/:id
exports.updateLecture = async (req, res, next) => {
  try {
    let lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Only the uploader or admin can update
    if (lecture.uploadedBy.toString() !== req.user._id.toString() &&
        !['dept_admin', 'inst_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this lecture' });
    }

    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.course) updates.course = req.body.course;
    if (req.body.semester) updates.semester = parseInt(req.body.semester);

    // If new file uploaded
    if (req.file) {
      // Delete old file
      const oldFilePath = path.join(__dirname, '..', lecture.fileUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      updates.fileUrl = `/uploads/${req.file.filename}`;
      updates.fileName = req.file.originalname;

      const ext = path.extname(req.file.originalname).toLowerCase();
      updates.fileType = ext === '.pdf' ? 'pdf' :
        ['.mp4', '.webm', '.mov'].includes(ext) ? 'video' : 'document';
    }

    lecture = await Lecture.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
      .populate('course', 'name code')
      .populate('uploadedBy', 'name email');

    res.json({ lecture, message: 'Lecture updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lecture
// @route   DELETE /api/lectures/:id
exports.deleteLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Only the uploader or admin can delete
    if (lecture.uploadedBy.toString() !== req.user._id.toString() &&
        !['dept_admin', 'inst_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to delete this lecture' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', lecture.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Lecture.findByIdAndDelete(req.params.id);

    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    next(error);
  }
};
