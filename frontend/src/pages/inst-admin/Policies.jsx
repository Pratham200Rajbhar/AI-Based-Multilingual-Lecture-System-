import { useState, useEffect } from 'react';
import { announcementsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function InstPolicies() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'medium', type: 'general' });

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementsAPI.getAll();
      setAnnouncements(res.data.data || []);
    } catch (err) { toast.error('Failed to load policies'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await announcementsAPI.create(form);
      toast.success('Policy published');
      setForm({ title: '', message: '', priority: 'medium', type: 'general' });
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to publish'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this policy?')) return;
    try {
      await announcementsAPI.delete(id);
      toast.success('Policy deleted');
      fetchAnnouncements();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const priorityColors = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700' };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-heading">Policies & Announcements</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 rounded-btn text-sm">
          {showForm ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-card shadow-card border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-heading">New Announcement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="form-input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="form-input w-full">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="form-input w-full">
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="policy">Policy</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Message *</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="form-input w-full" rows={4} required />
            </div>
          </div>
          <button type="submit" className="btn-primary px-4 py-2 rounded-btn text-sm">Publish</button>
        </form>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-surface rounded-card shadow-card border border-border p-12 text-center text-muted">No announcements yet</div>
        ) : (
          announcements.map(a => (
            <div key={a._id} className="bg-surface rounded-card shadow-card border border-border p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-heading">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[a.priority] || 'bg-gray-100 text-gray-700'}`}>{a.priority}</span>
                    {a.type && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{a.type}</span>}
                  </div>
                  <p className="text-sm text-body mt-2 whitespace-pre-wrap">{a.message}</p>
                  <p className="text-xs text-muted mt-3">Published {new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleDelete(a._id)} className="text-red-600 hover:text-red-800 text-sm ml-4">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
