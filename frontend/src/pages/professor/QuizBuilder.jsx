import { useState, useEffect } from 'react';
import { quizzesAPI, coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfessorQuizBuilder() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', course: '', duration: 30, isActive: true });
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  const [saving, setSaving] = useState(false);
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    fetchCourses();
    fetchQuizzes();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll({ limit: 50 });
      setCourses(res.data.data || []);
    } catch (err) { /* ignore */ }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await quizzesAPI.getAll({ limit: 50 });
      setExistingQuizzes(res.data.data || []);
    } catch (err) { /* ignore */ }
  };

  const addQuestion = () => {
    setQuestions(q => [...q, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(q => q.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions(q => q.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const updateOption = (qIdx, oIdx, value) => {
    setQuestions(q => q.map((item, i) => {
      if (i !== qIdx) return item;
      const newOptions = [...item.options];
      newOptions[oIdx] = value;
      return { ...item, options: newOptions };
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.course) return toast.error('Title and course are required');
    if (questions.some(q => !q.question || q.options.some(o => !o))) {
      return toast.error('Fill in all questions and options');
    }

    setSaving(true);
    try {
      await quizzesAPI.create({ ...form, questions });
      toast.success('Quiz created!');
      setShowList(true);
      fetchQuizzes();
      // Reset form
      setForm({ title: '', description: '', course: '', duration: 30, isActive: true });
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await quizzesAPI.delete(id);
      toast.success('Quiz deleted');
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (showList) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-heading">Quiz Builder</h1>
            <p className="text-muted mt-1">Create and manage quizzes</p>
          </div>
          <button onClick={() => setShowList(false)} className="btn-primary">Create New Quiz</button>
        </div>

        {existingQuizzes.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-card border border-border">
            <p className="text-muted text-lg">No quizzes yet</p>
            <button onClick={() => setShowList(false)} className="text-blue-600 hover:underline mt-2">Create your first quiz</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingQuizzes.map(q => (
              <div key={q._id} className="bg-surface rounded-card shadow-card border border-border p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-heading">{q.title}</h3>
                    <p className="text-sm text-muted mt-1">{q.course?.name || 'No course'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${q.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {q.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-3 mt-3 text-sm text-muted">
                  <span>{q.questions?.length || 0} questions</span>
                  <span>•</span>
                  <span>{q.duration || 30} min</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleDelete(q._id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setShowList(true)} className="text-muted hover:text-heading">← Back</button>
        <div>
          <h1 className="text-2xl font-bold text-heading">Create Quiz</h1>
          <p className="text-muted mt-1">Build a new quiz for your students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-card shadow-card border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-heading mb-1">Quiz Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="form-input w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1">Course *</label>
            <select value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} className="form-input w-full" required>
              <option value="">Select course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-heading mb-1">Duration (minutes)</label>
              <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))} className="form-input w-full" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-heading mb-1">Status</label>
              <select value={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))} className="form-input w-full">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input w-full" rows={2} />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-surface rounded-card shadow-card border border-border p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-heading">Question {qIdx + 1}</h3>
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qIdx)} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                )}
              </div>
              <input
                type="text"
                value={q.question}
                onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                className="form-input w-full mb-3"
                placeholder="Enter question text"
              />
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIdx}`}
                      checked={q.correctAnswer === oIdx}
                      onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                      className="text-blue-600"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                      className="form-input flex-1"
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">Select the radio button for the correct answer</p>
            </div>
          ))}
        </div>

        <button type="button" onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-border rounded-card text-muted hover:text-heading hover:border-blue-400 transition-colors">
          + Add Question
        </button>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
            {saving ? 'Saving...' : 'Create Quiz'}
          </button>
          <button type="button" onClick={() => setShowList(true)} className="px-4 py-2 border border-border rounded-btn hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
