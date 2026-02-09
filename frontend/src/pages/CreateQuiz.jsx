import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { quizzesAPI, coursesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiArrowLeft, HiCheckCircle } from 'react-icons/hi2';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', course: '', timeLimit: 30, deadline: '',
    questions: [{ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', points: 1 }]
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try { const res = await coursesAPI.getAll(); setCourses(res.data.courses); }
      catch (error) { console.error(error); }
    };
    fetchCourses();
  }, []);

  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, { question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', points: 1 }] });
  };

  const removeQuestion = (index) => {
    if (form.questions.length <= 1) return toast.error('Need at least one question');
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== index) });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...form.questions]; updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, questions: updated });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...form.questions]; updated[qIndex].options[oIndex] = value;
    setForm({ ...form, questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required');
    if (!form.course) return toast.error('Course required');
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.question.trim()) return toast.error(`Question ${i + 1} text required`);
      if (q.type === 'mcq') {
        if (q.options.some(o => !o.trim())) return toast.error(`All options for Q${i + 1} required`);
        if (!q.correctAnswer.trim()) return toast.error(`Correct answer for Q${i + 1} required`);
      }
    }
    setLoading(true);
    try { await quizzesAPI.create(form); toast.success('Quiz created!'); navigate('/quizzes'); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-3xl space-y-5">
      <Link to="/quizzes" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 text-sm">
        <HiArrowLeft className="h-4 w-4" /> Back to Quizzes
      </Link>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Create Quiz</h1>
        <p className="text-sm text-gray-500">{form.questions.length} question{form.questions.length > 1 ? 's' : ''}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Details */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Quiz Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required className="input-field" placeholder="Quiz Title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}
                required className="input-field">
                <option value="">Select Course</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (min)</label>
              <input type="number" min="1" value={form.timeLimit}
                onChange={(e) => setForm({ ...form, timeLimit: parseInt(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="datetime-local" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        {/* Questions */}
        {form.questions.map((q, qIndex) => (
          <div key={qIndex} className="card p-5 mb-3 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center text-sm font-bold">{qIndex + 1}</span>
                <h3 className="font-semibold text-gray-900">Question {qIndex + 1}</h3>
              </div>
              <button type="button" onClick={() => removeQuestion(qIndex)}
                className="p-1 text-red-500 hover:bg-red-50 rounded-md"><HiTrash className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input type="text" value={q.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    required className="input-field" placeholder="Enter question" />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={q.type} onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)} className="input-field">
                    <option value="mcq">MCQ</option>
                    <option value="descriptive">Descriptive</option>
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input type="number" min="1" value={q.points}
                    onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))} className="input-field" />
                </div>
              </div>

              {q.type === 'mcq' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex}>
                        <label className="block text-xs text-gray-400 mb-0.5">Option {oIndex + 1}</label>
                        <input type="text" value={opt}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          className="input-field text-sm" placeholder={`Option ${oIndex + 1}`} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <HiCheckCircle className="h-4 w-4 text-green-500" /> Correct Answer
                    </label>
                    <select value={q.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)} className="input-field">
                      <option value="">Select correct answer</option>
                      {q.options.filter(o => o.trim()).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={addQuestion} className="btn-secondary">
            <HiPlus className="h-4 w-4" /> Add Question
          </button>
          <button type="submit" disabled={loading} className="btn-primary px-6">
            {loading ? <><span className="spinner h-4 w-4"></span> Creating...</> : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
