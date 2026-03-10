import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lecturesAPI, coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfessorMyLectures() {
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchCourses(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLectures(); }, [page, courseFilter, search]);

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll({ limit: 50 });
      setCourses(res.data.data || []);
    } catch (err) { /* ignore */ }
  };

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (courseFilter) params.course = courseFilter;
      if (search) params.search = search;
      const res = await lecturesAPI.getAll(params);
      setLectures(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      toast.error('Failed to load lectures');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lecture?')) return;
    try {
      await lecturesAPI.delete(id);
      toast.success('Lecture deleted');
      fetchLectures();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading">My Lectures</h1>
          <p className="text-muted mt-1">Manage your uploaded lectures</p>
        </div>
        <Link to="/professor/upload" className="btn-primary text-center">Upload New</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input flex-1" />
        <select value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setPage(1); }} className="form-input sm:w-48">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : lectures.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border">
          <p className="text-muted text-lg">No lectures found</p>
          <Link to="/professor/upload" className="text-blue-600 hover:underline mt-2 inline-block">Upload your first lecture</Link>
        </div>
      ) : (
        <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted">Course</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted">Date</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lectures.map(l => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-heading">{l.title}</p>
                      <p className="text-xs text-muted truncate max-w-xs">{l.description || 'No description'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{l.course?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted">{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(l._id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-border">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-primary px-3 py-1 text-sm disabled:opacity-50">Previous</button>
              <span className="px-3 py-1 text-sm text-muted">Page {page} of {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p+1))} disabled={page>=pagination.pages} className="btn-primary px-3 py-1 text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
