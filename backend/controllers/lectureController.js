const Lecture = require('../models/Lecture');
const path = require('path');
const fs = require('fs');
const { paginate } = require('../utils/pagination');
const { isTranscribable, transcribeLectureAsync } = require('../services/transcription');

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
    const { title, description, course, semester, language } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Determine file type
    const ext = path.extname(req.file.originalname).toLowerCase();
    let fileType = 'document';
    if (ext === '.pdf') fileType = 'pdf';
    else if (['.mp4', '.webm', '.mov'].includes(ext)) fileType = 'video';
    else if (['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.mpeg', '.mpga'].includes(ext)) fileType = 'audio';

    // Check if file is transcribable
    const canTranscribe = isTranscribable(req.file.originalname);

    const lecture = await Lecture.create({
      title,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType,
      fileName: req.file.originalname,
      course,
      uploadedBy: req.user._id,
      semester: semester ? parseInt(semester) : undefined,
      language: language || 'en',
      transcription: {
        status: canTranscribe ? 'processing' : 'none'
      }
    });

    await lecture.populate('course', 'name code');
    await lecture.populate('uploadedBy', 'name email');

    // Trigger transcription asynchronously (don't block the response)
    if (canTranscribe) {
      const absolutePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      transcribeLectureAsync(lecture._id, absolutePath, language || 'en')
        .catch(err => console.error('Background transcription error:', err.message));
    }

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
        ['.mp4', '.webm', '.mov'].includes(ext) ? 'video' :
        ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.mpeg', '.mpga'].includes(ext) ? 'audio' : 'document';

      // Re-trigger transcription if the new file is transcribable
      if (isTranscribable(req.file.originalname)) {
        updates.transcription = { status: 'processing', text: '', segments: [], error: null };
      } else {
        updates.transcription = { status: 'none', text: '', segments: [] };
      }
    }

    lecture = await Lecture.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
      .populate('course', 'name code')
      .populate('uploadedBy', 'name email');

    // Re-trigger transcription if new file is transcribable
    if (req.file && isTranscribable(req.file.originalname)) {
      const absolutePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      const lang = req.body.language || lecture.language || 'en';
      transcribeLectureAsync(lecture._id, absolutePath, lang)
        .catch(err => console.error('Background transcription error:', err.message));
    }

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

// @desc    Get transcription for a lecture
// @route   GET /api/lectures/:id/transcription
exports.getTranscription = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id).select('title transcription fileType');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    res.json({
      lectureId: lecture._id,
      title: lecture.title,
      fileType: lecture.fileType,
      transcription: lecture.transcription || { status: 'none' }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retry transcription for a lecture
// @route   POST /api/lectures/:id/transcription/retry
exports.retryTranscription = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Only the uploader or admin can retry
    if (lecture.uploadedBy.toString() !== req.user._id.toString() &&
        !['dept_admin', 'inst_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!isTranscribable(lecture.fileName)) {
      return res.status(400).json({ message: 'This file type does not support transcription' });
    }

    if (lecture.transcription?.status === 'processing') {
      return res.status(400).json({ message: 'Transcription is already in progress' });
    }

    // Mark as processing
    await Lecture.findByIdAndUpdate(lecture._id, {
      'transcription.status': 'processing',
      'transcription.error': null
    });

    const absolutePath = path.join(__dirname, '..', lecture.fileUrl);
    const lang = req.body.language || lecture.language || 'en';
    transcribeLectureAsync(lecture._id, absolutePath, lang)
      .catch(err => console.error('Background transcription retry error:', err.message));

    res.json({ message: 'Transcription retry started' });
  } catch (error) {
    next(error);
  }
};
