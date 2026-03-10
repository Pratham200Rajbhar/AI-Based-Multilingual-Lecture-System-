import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lecturesAPI, coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentLectures() {
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchLectures();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, courseFilter, search]);

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll({ limit: 50 });
      setCourses(res.data.data || []);
    } catch (err) { /* ignore */ }
  };

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Lectures</h1>
        <p className="text-muted mt-1">Browse and watch lecture recordings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search lectures..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="form-input flex-1"
        />
        <select
          value={courseFilter}
          onChange={e => { setCourseFilter(e.target.value); setPage(1); }}
          className="form-input sm:w-48"
        >
          <option value="">All Courses</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : lectures.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border">
          <p className="text-muted text-lg">No lectures found</p>
          <p className="text-muted text-sm mt-1">Check back later for new content</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lectures.map(lecture => (
              <Link
                to={`/student/lectures/${lecture._id}`}
                key={lecture._id}
                className="bg-surface rounded-card shadow-card border border-border hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="h-36 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <span className="text-white text-4xl">🎬</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-heading truncate">{lecture.title}</h3>
                  <p className="text-sm text-muted mt-1 line-clamp-2">{lecture.description || 'No description'}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted">{lecture.course?.name || 'General'}</span>
                    <span className="text-xs text-muted">{new Date(lecture.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-primary px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-muted">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="btn-primary px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
