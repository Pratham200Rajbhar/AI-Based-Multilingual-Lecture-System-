import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forumAPI } from '../services/api';
import { HiArrowLeft, HiCheckCircle, HiHandThumbUp, HiTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function ForumPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canManageContent } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      const res = await forumAPI.getPost(id);
      setPost(res.data.post || res.data);
    } catch { toast.error('Post not found'); navigate('/forum'); }
    finally { setLoading(false); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await forumAPI.reply(id, { content: reply });
      setReply('');
      toast.success('Reply posted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  const toggleResolved = async () => {
    try {
      await forumAPI.toggleResolve(id);
      setPost(p => ({...p, isResolved: !p.isResolved}));
      toast.success(post.isResolved ? 'Marked unresolved' : 'Marked resolved');
    } catch { toast.error('Failed'); }
  };

  const upvoteReply = async (replyId) => {
    try {
      await forumAPI.upvoteReply(id, replyId);
      load();
    } catch {}
  };

  const deletePost = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await forumAPI.deletePost(id);
      toast.success('Deleted');
      navigate('/forum');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="spinner h-8 w-8"></div></div>;
  if (!post) return null;

  const isAuthor = user?._id === (post.author?._id || post.author);
  const canModify = isAuthor || canManageContent();

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/forum')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <HiArrowLeft className="h-4 w-4" /> Back to Forum
      </button>

      {/* Post */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-lg font-semibold">{post.title}</h1>
              {post.isResolved && <span className="badge bg-green-100 text-green-700 flex items-center gap-1"><HiCheckCircle className="h-3.5 w-3.5" /> Resolved</span>}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium">{post.author?.name}</span>
              {post.course && <span className="badge bg-gray-100 text-gray-600 text-xs">{post.course.name}</span>}
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>
          {canModify && (
            <div className="flex items-center gap-2">
              <button onClick={toggleResolved}
                className={`text-xs px-2 py-1 rounded ${post.isResolved ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                {post.isResolved ? 'Unresolve' : 'Mark Resolved'}
              </button>
              <button onClick={deletePost} className="text-gray-400 hover:text-red-600"><HiTrash className="h-4 w-4" /></button>
            </div>
          )}
        </div>
        <div className="text-gray-700 whitespace-pre-wrap">{post.content}</div>
      </div>

      {/* Replies */}
      <h2 className="font-medium mb-3">Replies ({post.replies?.length || 0})</h2>

      {post.replies?.length === 0 && (
        <p className="text-sm text-gray-500 mb-4">No replies yet. Be the first to respond!</p>
      )}

      <div className="space-y-3 mb-6">
        {post.replies?.map((r, i) => (
          <div key={r._id || i} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{r.author?.name || 'User'}</span>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.content}</p>
              </div>
              <button
                onClick={() => upvoteReply(r._id)}
                className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition ${
                  r.upvotes?.includes(user?._id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <HiHandThumbUp className="h-3.5 w-3.5" />
                <span>{r.upvotes?.length || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply form */}
      <div className="card p-4">
        <form onSubmit={handleReply}>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Write your reply..."
            className="input-field mb-3"
            rows={3}
            required
          />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Posting...' : 'Post Reply'}
          </button>
        </form>
      </div>
    </div>
  );
}
