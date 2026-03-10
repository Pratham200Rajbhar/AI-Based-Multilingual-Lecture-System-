import { useState, useEffect } from 'react';
import { assignmentsAPI, coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course: '', dueDate: '', totalMarks: 100 });
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [aRes, cRes] = await Promise.allSettled([
        assignmentsAPI.getAll(),
        coursesAPI.getAll()
      ]);
      if (aRes.status === 'fulfilled') setAssignments(aRes.value.data.data || []);
      if (cRes.status === 'fulfilled') setCourses(cRes.value.data.data || []);
    } catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('course', form.course);
      formData.append('dueDate', form.dueDate);
      formData.append('maxMarks', form.totalMarks);
      await assignmentsAPI.create(formData);
      toast.success('Assignment created');
      setForm({ title: '', description: '', course: '', dueDate: '', totalMarks: 100 });
      setShowForm(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await assignmentsAPI.delete(id);
      toast.success('Assignment deleted');
      fetchData();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const filtered = assignments.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-heading">Assignments</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 rounded-btn text-sm">
          {showForm ? 'Cancel' : '+ New Assignment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-card shadow-card border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-heading">New Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="form-input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course *</label>
              <select value={form.course} onChange={e => setForm({...form, course: e.target.value})} className="form-input w-full" required>
                <option value="">Select course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date *</label>
              <input type="datetime-local" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="form-input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Marks</label>
              <input type="number" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: parseInt(e.target.value)})} className="form-input w-full" min={1} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="form-input w-full" rows={3} />
            </div>
          </div>
          <button type="submit" className="btn-primary px-4 py-2 rounded-btn text-sm">Create Assignment</button>
        </form>
      )}

      <input type="text" placeholder="Search assignments..." value={search} onChange={e => setSearch(e.target.value)} className="form-input w-full max-w-md" />

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-surface rounded-card shadow-card border border-border p-12 text-center text-muted">No assignments</div>
        ) : (
          filtered.map(a => (
            <div key={a._id} className="bg-surface rounded-card shadow-card border border-border p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-heading">{a.title}</h3>
                  <p className="text-sm text-muted mt-1">{a.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                    <span>Course: {a.course?.name || 'N/A'}</span>
                    <span>Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}</span>
                    <span>Marks: {a.totalMarks}</span>
                    <span>Submissions: {a.submissions?.length || 0}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(a._id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
