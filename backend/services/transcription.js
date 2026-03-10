const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

/**
 * Transcription service using Groq Whisper Large V3 Turbo
 * Docs: https://console.groq.com/docs/model/whisper-large-v3-turbo
 */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Supported audio/video extensions for transcription
const TRANSCRIBABLE_EXTENSIONS = ['.mp4', '.webm', '.mov', '.mp3', '.wav', '.ogg', '.m4a', '.flac', '.mpeg', '.mpga'];

/**
 * Check if a file is transcribable (audio or video)
 * @param {string} filename 
 * @returns {boolean}
 */
const isTranscribable = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return TRANSCRIBABLE_EXTENSIONS.includes(ext);
};

/**
 * Transcribe an audio/video file using Groq Whisper Large V3 Turbo
 * @param {string} filePath - Absolute path to the audio/video file
 * @param {string} language - Language code (e.g., 'en', 'hi', 'es')
 * @returns {Promise<{text: string, segments: Array, language: string, duration: number}>}
 */
const transcribeFile = async (filePath, language = 'en') => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. Add it to your .env file.');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileStream = fs.createReadStream(filePath);

  try {
    // Use Groq's Whisper Large V3 Turbo for transcription
    const transcription = await groq.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-large-v3-turbo',
      language: language,
      response_format: 'verbose_json',
      temperature: 0.0
    });

    return {
      text: transcription.text || '',
      segments: (transcription.segments || []).map(seg => ({
        start: seg.start,
        end: seg.end,
        text: seg.text
      })),
      language: transcription.language || language,
      duration: transcription.duration || 0
    };
  } catch (error) {
    console.error('Groq transcription error:', error.message);
    throw new Error(`Transcription failed: ${error.message}`);
  }
};

/**
 * Transcribe a lecture file and update the lecture document in DB
 * Runs asynchronously — caller should not await unless they need the result immediately
 * @param {string} lectureId - Lecture MongoDB document ID
 * @param {string} fileAbsolutePath - Absolute path to the uploaded file
 * @param {string} language - Language code
 */
const transcribeLectureAsync = async (lectureId, fileAbsolutePath, language = 'en') => {
  const Lecture = require('../models/Lecture');

  try {
    // Mark as processing
    await Lecture.findByIdAndUpdate(lectureId, {
      'transcription.status': 'processing',
      'transcription.error': null
    });

    const result = await transcribeFile(fileAbsolutePath, language);

    // Save transcription to the lecture document
    await Lecture.findByIdAndUpdate(lectureId, {
      'transcription.status': 'completed',
      'transcription.text': result.text,
      'transcription.segments': result.segments,
      'transcription.language': result.language,
      'transcription.duration': result.duration,
      'transcription.completedAt': new Date(),
      'transcription.error': null
    });

    console.log(`Transcription completed for lecture ${lectureId}`);
    return result;
  } catch (error) {
    console.error(`Transcription failed for lecture ${lectureId}:`, error.message);

    await Lecture.findByIdAndUpdate(lectureId, {
      'transcription.status': 'failed',
      'transcription.error': error.message
    });

    throw error;
  }
};

module.exports = {
  isTranscribable,
  transcribeFile,
  transcribeLectureAsync,
  TRANSCRIBABLE_EXTENSIONS
};
