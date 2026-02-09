import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizzesAPI } from '../services/api';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import {
  HiClipboardDocumentList, HiPlus, HiClock, HiTrash,
  HiCheckBadge, HiArrowTopRightOnSquare, HiQuestionMarkCircle,
  HiUser, HiExclamationTriangle
} from 'react-icons/hi2';

export default function Quizzes() {
  const { canManageContent } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchQuizzes(); }, [page]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await quizzesAPI.getAll({ page, limit: 12 });
      setQuizzes(res.data.quizzes || res.data.data || []);
      setPagination(res.data.pagination || {});
    }
    catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz and all its results?')) return;
    try { await quizzesAPI.delete(id); toast.success('Quiz deleted'); fetchQuizzes(); }
    catch { toast.error('Delete failed'); }
  };

  const isDeadlinePassed = (deadline) => deadline && new Date(deadline) < new Date();

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner h-10 w-10"></div></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-sm text-gray-500">{quizzes.length} available</p>
        </div>
        {canManageContent() && (
          <Link to="/quizzes/create" className="btn-primary">
            <HiPlus className="h-4 w-4" /> Create Quiz
          </Link>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <HiClipboardDocumentList className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No quizzes available yet</p>
          {canManageContent() && (
            <Link to="/quizzes/create" className="text-blue-600 text-sm font-medium mt-2 inline-block">Create your first quiz →</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <HiClipboardDocumentList className="h-5 w-5 text-blue-600" />
                </div>
                {quiz.attempted ? (
                  <span className="badge bg-green-50 text-green-600 text-xs"><HiCheckBadge className="h-3.5 w-3.5" /> Done</span>
                ) : isDeadlinePassed(quiz.deadline) ? (
                  <span className="badge bg-red-50 text-red-500 text-xs"><HiExclamationTriangle className="h-3.5 w-3.5" /> Expired</span>
                ) : (
                  <span className="badge bg-blue-50 text-blue-600 text-xs">Open</span>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{quiz.title}</h3>

              <div className="space-y-1 mb-3 text-sm text-gray-500">
                <p className="flex items-center gap-1.5"><HiClipboardDocumentList className="h-3.5 w-3.5 text-gray-400" />{quiz.course?.name}</p>
                <p className="flex items-center gap-1.5"><HiQuestionMarkCircle className="h-3.5 w-3.5 text-gray-400" />{quiz.questions?.length} questions</p>
                <p className="flex items-center gap-1.5"><HiClock className="h-3.5 w-3.5 text-gray-400" />{quiz.timeLimit} minutes</p>
                {quiz.deadline && (
                  <p className={`flex items-center gap-1.5 ${isDeadlinePassed(quiz.deadline) ? 'text-red-500' : ''}`}>
                    <HiExclamationTriangle className="h-3.5 w-3.5" />{new Date(quiz.deadline).toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                <HiUser className="h-3.5 w-3.5" /> By {quiz.createdBy?.name}
              </p>

              <div className="pt-3 border-t border-gray-100">
                {quiz.attempted ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Score: <span className="text-blue-600">{quiz.score}/{quiz.maxScore}</span>
                    </span>
                    <Link to={`/quizzes/${quiz._id}/results`} className="btn-secondary text-xs py-1.5 px-3">
                      <HiArrowTopRightOnSquare className="h-3.5 w-3.5" /> Results
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    {!isDeadlinePassed(quiz.deadline) ? (
                      <Link to={`/quizzes/${quiz._id}/attempt`} className="btn-primary flex-1 text-center text-sm">Take Quiz</Link>
                    ) : (
                      <span className="text-sm text-red-500 font-medium">Deadline passed</span>
                    )}
                    {canManageContent() && (
                      <button onClick={() => handleDelete(quiz._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md" title="Delete">
                        <HiTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
