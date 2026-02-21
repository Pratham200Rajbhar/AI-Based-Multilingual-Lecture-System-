import { useState, useEffect } from 'react';
import { announcementsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function DeptPolicies() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'department', priority: 'normal' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPolicies(); }, []);

  const fetchPolicies = async () => {
    try {
      const res = await announcementsAPI.getAll({ limit: 50 });
      setAnnouncements(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.message) return toast.error('Title and message required');
    setSaving(true);
    try {
      await announcementsAPI.create(form);
      toast.success('Policy announcement created');
      setShowForm(false);
      setForm({ title: '', message: '', type: 'department', priority: 'normal' });
      fetchPolicies();
    } catch (err) {
      toast.error('Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementsAPI.delete(id);
      toast.success('Deleted');
      fetchPolicies();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading">Policies & Announcements</h1>
          <p className="text-muted mt-1">Manage department policies and announcements</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">New Announcement</button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-card shadow-card border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-heading">New Announcement</h2>
          <input type="text" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="form-input w-full" />
          <textarea placeholder="Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="form-input w-full" rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="form-input">
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="form-input">
              <option value="department">Department</option>
              <option value="course">Course</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Publish'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-btn hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border"><p className="text-muted">No announcements yet</p></div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a._id} className="bg-surface rounded-card shadow-card border border-border p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-heading">{a.title}</h3>
                  <p className="text-sm text-body mt-1">{a.message}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs text-muted">{new Date(a.createdAt).toLocaleDateString()}</span>
                    {a.priority && a.priority !== 'normal' && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${a.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{a.priority}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(a._id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
