import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lecturesAPI, coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfessorUpload() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', course: '', language: 'en' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const isTranscribableFile = (f) => {
    if (!f) return false;
    const ext = f.name.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg', 'm4a', 'flac', 'mpeg', 'mpga'].includes(ext);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll({ limit: 50 });
      setCourses(res.data.data || []);
    } catch (err) { /* ignore */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    if (!form.course) return toast.error('Please select a course');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('course', form.course);
      formData.append('language', form.language);
      if (file) formData.append('file', file);

      await lecturesAPI.create(formData);
      toast.success('Lecture uploaded successfully!');
      navigate('/professor/my-lectures');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Upload Lecture</h1>
        <p className="text-muted mt-1">Upload a new lecture recording or material</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-card shadow-card border border-border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-heading mb-1">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="form-input w-full"
            placeholder="Enter lecture title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-heading mb-1">Course *</label>
          <select
            value={form.course}
            onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
            className="form-input w-full"
            required
          >
            <option value="">Select course</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-heading mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="form-input w-full"
            rows={4}
            placeholder="Enter lecture description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-heading mb-1">Language</label>
          <select
            value={form.language}
            onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
            className="form-input w-full"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-heading mb-1">File (Video, PDF, Audio)</label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              className="hidden"
              id="file-upload"
              accept="video/*,audio/*,.pdf,.ppt,.pptx,.doc,.docx"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div>
                  <p className="text-heading font-medium">{file.name}</p>
                  <p className="text-sm text-muted mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <p className="text-sm text-blue-600 mt-2">Click to change</p>
                </div>
              ) : (
                <div>
                  <span className="text-4xl">📁</span>
                  <p className="text-heading font-medium mt-2">Click to upload a file</p>
                  <p className="text-sm text-muted mt-1">Max 100MB • Video, PDF, Audio, Documents</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {file && isTranscribableFile(file) && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-xl mt-0.5">🎙️</span>
            <div>
              <p className="text-sm font-medium text-blue-800">Auto-Transcription Enabled</p>
              <p className="text-xs text-blue-600 mt-0.5">
                This audio/video file will be automatically transcribed using AI (Groq Whisper).
                The transcription will be available to students once processing is complete.
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Lecture'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/professor/my-lectures')}
            className="px-4 py-2 border border-border rounded-btn hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
