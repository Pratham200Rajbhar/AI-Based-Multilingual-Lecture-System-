import { useState, useEffect } from 'react';
import { forumAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function DeptStudentIssues() {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await forumAPI.getPosts({ limit: 50 });
      setPosts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await forumAPI.reply(selected._id, { content: reply });
      toast.success('Reply sent');
      setReply('');
      fetchPosts();
      // Refresh selected
      const res = await forumAPI.getPost(selected._id);
      setSelected(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await forumAPI.toggleResolve(id);
      toast.success('Status updated');
      fetchPosts();
      if (selected?._id === id) {
        const res = await forumAPI.getPost(id);
        setSelected(res.data.data || res.data);
      }
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Student Issues</h1>
        <p className="text-muted mt-1">View and respond to student forum posts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue List */}
        <div className="lg:col-span-1 space-y-2">
          {posts.length === 0 ? (
            <div className="text-center py-8 bg-surface rounded-card border border-border"><p className="text-muted">No issues</p></div>
          ) : posts.map(p => (
            <button
              key={p._id}
              onClick={() => setSelected(p)}
              className={`w-full text-left p-4 rounded-card border transition-colors ${selected?._id === p._id ? 'border-blue-500 bg-blue-50' : 'border-border bg-surface hover:bg-gray-50'}`}
            >
              <div className="flex justify-between items-start">
                <p className="font-medium text-heading text-sm truncate">{p.title}</p>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${p.isResolved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.isResolved ? 'Resolved' : 'Open'}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">By {p.author?.name || 'Unknown'} • {new Date(p.createdAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>

        {/* Issue Detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="text-center py-12 bg-surface rounded-card border border-border"><p className="text-muted">Select an issue to view details</p></div>
          ) : (
            <div className="bg-surface rounded-card shadow-card border border-border">
              <div className="p-4 border-b border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-heading">{selected.title}</h2>
                    <p className="text-sm text-muted mt-1">By {selected.author?.name} • {new Date(selected.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleResolve(selected._id)} className={`px-3 py-1 text-sm rounded-full ${selected.isResolved ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {selected.isResolved ? 'Re-open' : 'Resolve'}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-body whitespace-pre-wrap">{selected.content}</p>
              </div>

              {/* Replies */}
              {selected.replies && selected.replies.length > 0 && (
                <div className="px-4 pb-4 space-y-3">
                  <h3 className="text-sm font-semibold text-heading">Replies ({selected.replies.length})</h3>
                  {selected.replies.map((r, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{r.content}</p>
                      <p className="text-xs text-muted mt-1">{r.author?.name || 'Admin'} • {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type a reply..."
                    className="form-input flex-1"
                    onKeyDown={e => e.key === 'Enter' && handleReply()}
                  />
                  <button onClick={handleReply} disabled={sending || !reply.trim()} className="btn-primary disabled:opacity-50">
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
