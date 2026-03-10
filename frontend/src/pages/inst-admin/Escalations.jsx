import { useState, useEffect } from 'react';
import { forumAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function InstEscalations() {
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchIssues(); }, []);

  const fetchIssues = async () => {
    try {
      const res = await forumAPI.getPosts({ limit: 50 });
      setIssues(res.data.posts || res.data.data || []);
    } catch (err) { toast.error('Failed to load escalations'); }
    finally { setLoading(false); }
  };

  const fetchDetail = async (id) => {
    try {
      const res = await forumAPI.getPost(id);
      setSelected(res.data.post || res.data.data || res.data);
    } catch (err) { toast.error('Failed to load details'); }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    try {
      await forumAPI.reply(selected._id, { content: replyText });
      toast.success('Reply posted');
      setReplyText('');
      fetchDetail(selected._id);
    } catch (err) { toast.error('Failed to reply'); }
  };

  const handleResolve = async (id) => {
    try {
      await forumAPI.toggleResolve(id);
      toast.success('Status updated');
      fetchIssues();
      if (selected?._id === id) fetchDetail(id);
    } catch (err) { toast.error('Failed to resolve'); }
  };

  const filtered = filter === 'all' ? issues :
    filter === 'open' ? issues.filter(i => !i.isResolved) :
    issues.filter(i => i.isResolved);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Escalations</h1>
        <p className="text-muted mt-1">Issues escalated from departments</p>
      </div>

      <div className="flex gap-2">
        {['all', 'open', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-btn text-sm capitalize ${filter === f ? 'btn-primary' : 'border border-border hover:bg-gray-50'}`}>
            {f} ({f === 'all' ? issues.length : f === 'open' ? issues.filter(i => !i.isResolved).length : issues.filter(i => i.isResolved).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="bg-surface rounded-card shadow-card border border-border p-8 text-center text-muted">No escalations</div>
          ) : (
            filtered.map(issue => (
              <div key={issue._id}
                onClick={() => fetchDetail(issue._id)}
                className={`bg-surface rounded-card border p-4 cursor-pointer transition-colors ${selected?._id === issue._id ? 'border-blue-500 bg-blue-50' : 'border-border hover:border-blue-300'}`}>
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">{issue.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${issue.isResolved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {issue.isResolved ? 'resolved' : 'open'}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1 line-clamp-2">{issue.content || issue.message}</p>
                <p className="text-xs text-muted mt-2">By {issue.author?.name || 'Unknown'} • {new Date(issue.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-surface rounded-card shadow-card border border-border p-12 text-center text-muted">
              Select an escalation to view details
            </div>
          ) : (
            <div className="bg-surface rounded-card shadow-card border border-border">
              <div className="p-5 border-b border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-heading">{selected.title}</h2>
                    <p className="text-sm text-muted mt-1">By {selected.author?.name || 'Unknown'} • {new Date(selected.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleResolve(selected._id)} className={`${selected.isResolved ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1.5 rounded-btn text-sm`}>
                    {selected.isResolved ? 'Reopen' : 'Resolve'}
                  </button>
                </div>
              </div>
              <div className="p-5">
                <p className="text-body whitespace-pre-wrap">{selected.content || selected.message}</p>
              </div>
              {selected.replies?.length > 0 && (
                <div className="px-5 pb-3 space-y-3">
                  <h4 className="text-sm font-medium text-heading">Replies ({selected.replies.length})</h4>
                  {selected.replies.map((r, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm">{r.content}</p>
                      <p className="text-xs text-muted mt-1">{r.author?.name || 'Admin'} • {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
              {!selected.isResolved && (
                <div className="p-5 border-t border-border">
                  <div className="flex gap-2">
                    <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} className="form-input flex-1" placeholder="Type your response..." onKeyDown={e => e.key === 'Enter' && handleReply()} />
                    <button onClick={handleReply} className="btn-primary px-4 py-2 rounded-btn text-sm">Reply</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
