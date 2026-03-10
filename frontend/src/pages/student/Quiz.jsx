import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizzesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchQuizzes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      const res = await quizzesAPI.getAll(params);
      setQuizzes(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Quizzes</h1>
        <p className="text-muted mt-1">Take quizzes to test your knowledge</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search quizzes..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="form-input flex-1"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border">
          <p className="text-muted text-lg">No quizzes available</p>
          <p className="text-muted text-sm mt-1">Check back later</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map(quiz => (
              <Link
                to={`/student/quiz/${quiz._id}`}
                key={quiz._id}
                className="bg-surface rounded-card shadow-card border border-border p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-lg">
                    📝
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${quiz.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {quiz.isActive !== false ? 'Active' : 'Closed'}
                  </span>
                </div>
                <h3 className="font-semibold text-heading mt-3">{quiz.title}</h3>
                <p className="text-sm text-muted mt-1 line-clamp-2">{quiz.description || 'No description'}</p>
                <div className="flex items-center gap-3 mt-4 text-xs text-muted">
                  <span>{quiz.questions?.length || 0} questions</span>
                  <span>•</span>
                  <span>{quiz.duration || 30} min</span>
                  {quiz.course?.name && (
                    <>
                      <span>•</span>
                      <span>{quiz.course.name}</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-primary px-3 py-1 text-sm disabled:opacity-50">Previous</button>
              <span className="px-3 py-1 text-sm text-muted">Page {page} of {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} className="btn-primary px-3 py-1 text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
