import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forumAPI, coursesAPI } from '../services/api';
import { HiPlus, HiChatBubbleLeftRight, HiCheckCircle, HiChatBubbleLeft } from 'react-icons/hi2';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', course: '' });

  useEffect(() => {
    coursesAPI.getAll({ limit: 100 }).then(res => setCourses(res.data.data || res.data.courses || [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [page, search, courseFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (courseFilter) params.course = courseFilter;
      const res = await forumAPI.getPosts(params);
      setPosts(res.data.posts || res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await forumAPI.createPost(form);
      toast.success('Post created');
      setShowForm(false);
      setForm({ title: '', content: '', course: '' });
      navigate(`/forum/${res.data.post?._id || res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Discussion Forum</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <HiPlus className="h-4 w-4" /> New Post
        </button>
      </div>

      {showForm && (
        <div className="card p-4 mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <input placeholder="Post Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
            <textarea placeholder="Describe your question or topic..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="input-field" rows={4} required />
            <select value={form.course} onChange={e => setForm({...form, course: e.target.value})} className="input-field">
              <option value="">Select Course (optional)</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Post</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search discussions..." />
        </div>
        <select value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card p-4 animate-pulse"><div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div><div className="h-3 bg-gray-200 rounded w-1/4"></div></div>)}</div>
      ) : posts.length === 0 ? (
        <EmptyState icon={HiChatBubbleLeftRight} title="No discussions" description="Start a conversation by creating a new post" />
      ) : (
        <div className="space-y-2">
          {posts.map(post => (
            <div key={post._id}
              onClick={() => navigate(`/forum/${post._id}`)}
              className="card p-4 cursor-pointer hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.isResolved && <HiCheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                    <h3 className="font-medium truncate">{post.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{post.author?.name}</span>
                    {post.course && <span className="badge bg-gray-100 text-gray-600">{post.course.name}</span>}
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                  <HiChatBubbleLeft className="h-4 w-4" />
                  <span className="text-sm">{post.replies?.length || 0}</span>
                </div>
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
