import { useState, useEffect } from 'react';
import { gradebookAPI, coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfGradebook() {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student: '', course: '', type: 'assignment', title: '', score: '', maxScore: 100 });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll();
      setCourses(res.data.data || []);
    } catch (err) { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedCourse) {
      gradebookAPI.getAll({ course: selectedCourse }).then(res => {
        setGrades(res.data.data || []);
      }).catch(() => toast.error('Failed to load grades'));
    }
  }, [selectedCourse]);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      await gradebookAPI.addEntry({ ...form, course: selectedCourse });
      toast.success('Grade entry added');
      setForm({ student: '', course: '', type: 'assignment', title: '', score: '', maxScore: 100 });
      setShowForm(false);
      gradebookAPI.getAll({ course: selectedCourse }).then(res => setGrades(res.data.data || []));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add entry'); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-heading">Gradebook</h1>
        {selectedCourse && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 rounded-btn text-sm">
            {showForm ? 'Cancel' : '+ Add Entry'}
          </button>
        )}
      </div>

      <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="form-input w-full max-w-md">
        <option value="">Select Course</option>
        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      {showForm && (
        <form onSubmit={handleAddEntry} className="bg-surface rounded-card shadow-card border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-heading">New Grade Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="form-input w-full" required placeholder="e.g., Midterm Exam" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="form-input w-full">
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Score *</label>
              <input type="number" value={form.score} onChange={e => setForm({...form, score: e.target.value})} className="form-input w-full" required min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Score</label>
              <input type="number" value={form.maxScore} onChange={e => setForm({...form, maxScore: parseInt(e.target.value)})} className="form-input w-full" min={1} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Student ID</label>
              <input type="text" value={form.student} onChange={e => setForm({...form, student: e.target.value})} className="form-input w-full" placeholder="Student ID (optional for bulk)" />
            </div>
          </div>
          <button type="submit" className="btn-primary px-4 py-2 rounded-btn text-sm">Add Entry</button>
        </form>
      )}

      {!selectedCourse ? (
        <div className="bg-surface rounded-card shadow-card border border-border p-12 text-center text-muted">Select a course to view gradebook</div>
      ) : (
        <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted">Student</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted">Title</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted">Type</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted">Score</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {grades.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted">No grade entries</td></tr>
              ) : (
                grades.map((g, i) => (
                  <tr key={g._id || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{g.student?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{g.title || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{g.type}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{g.score}/{g.maxScore}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium">
                      {g.maxScore > 0 ? Math.round((g.score / g.maxScore) * 100) : 0}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
