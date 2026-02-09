import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';
import { HiBell, HiCheck, HiTrash, HiCheckCircle } from 'react-icons/hi2';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter === 'unread') params.unread = true;
      const res = await notificationsAPI.getMy(params);
      setNotifications(res.data.notifications || res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? {...n, isRead: true} : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Deleted');
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const typeColors = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    assignment: 'bg-purple-100 text-purple-700',
    quiz: 'bg-indigo-100 text-indigo-700',
    attendance: 'bg-teal-100 text-teal-700',
    announcement: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Notifications</h1>
          {unreadCount > 0 && <span className="badge bg-red-100 text-red-700">{unreadCount} unread</span>}
        </div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
            <option value="all">All</option>
            <option value="unread">Unread Only</option>
          </select>
          <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-1">
            <HiCheckCircle className="h-4 w-4" /> Mark All Read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card p-4 animate-pulse"><div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div><div className="h-3 bg-gray-200 rounded w-1/3"></div></div>)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={HiBell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n._id}
              className={`card p-4 flex items-start gap-3 transition cursor-pointer ${!n.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
              onClick={() => !n.isRead && markRead(n._id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge text-xs ${typeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>{n.type}</span>
                  {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                </div>
                <p className={`text-sm ${!n.isRead ? 'font-medium' : 'text-gray-700'}`}>{n.title || n.message}</p>
                {n.title && n.message && <p className="text-xs text-gray-500 mt-1">{n.message}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                {!n.isRead && (
                  <button onClick={e => { e.stopPropagation(); markRead(n._id); }} className="p-1 text-gray-400 hover:text-green-600" title="Mark read">
                    <HiCheck className="h-4 w-4" />
                  </button>
                )}
                <button onClick={e => { e.stopPropagation(); handleDelete(n._id); }} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                  <HiTrash className="h-4 w-4" />
                </button>
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
