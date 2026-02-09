import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { announcementsAPI } from '../services/api';
import { HiPlus, HiMegaphone, HiTrash, HiMapPin } from 'react-icons/hi2';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function Announcements() {
  const { canManageContent } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'institute', priority: 'normal' });

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await announcementsAPI.getMy({ page, limit: 10 });
      setAnnouncements(res.data.announcements || res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load announcements'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await announcementsAPI.create(form);
      toast.success('Announcement created');
      setShowForm(false);
      setForm({ title: '', content: '', type: 'institute', priority: 'normal' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await announcementsAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const priorityColors = {
    urgent: 'bg-red-100 text-red-700 border-red-300',
    important: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    normal: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  const priorityBorder = {
    urgent: 'border-l-red-500',
    important: 'border-l-yellow-500',
    normal: 'border-l-blue-500',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Announcements</h1>
        {canManageContent() && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <HiPlus className="h-4 w-4" /> New Announcement
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-4 mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
            <textarea placeholder="Content" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="input-field" rows={4} required />
            <div className="grid grid-cols-2 gap-4">
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                <option value="institute">Institute-wide</option>
                <option value="department">Department</option>
                <option value="course">Course</option>
              </select>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Publish</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card p-4 animate-pulse"><div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div><div className="h-3 bg-gray-200 rounded w-full mb-2"></div><div className="h-3 bg-gray-200 rounded w-3/4"></div></div>)}</div>
      ) : announcements.length === 0 ? (
        <EmptyState icon={HiMegaphone} title="No announcements" description="No announcements to display" />
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a._id} className={`card p-4 border-l-4 ${priorityBorder[a.priority] || 'border-l-blue-500'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {a.isPinned && <HiMapPin className="h-4 w-4 text-blue-500" />}
                    <h3 className="font-medium">{a.title}</h3>
                    <span className={`badge text-xs ${priorityColors[a.priority]}`}>{a.priority}</span>
                    <span className="badge text-xs bg-gray-100 text-gray-600">{a.type}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>By {a.createdBy?.name || 'Admin'}</span>
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {canManageContent() && (
                  <button onClick={() => handleDelete(a._id)} className="text-gray-400 hover:text-red-600 p-1">
                    <HiTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
