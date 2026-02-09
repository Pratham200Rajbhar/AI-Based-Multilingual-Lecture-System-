import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lecturesAPI, quizzesAPI, adminAPI } from '../services/api';
import {
  HiBookOpen, HiClipboardDocumentList, HiUsers, HiAcademicCap,
  HiClock, HiChevronRight, HiArrowTrendingUp
} from 'react-icons/hi2';

export default function Dashboard() {
  const { user, isAdmin, canManageContent } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLectures, setRecentLectures] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lecturesRes, quizzesRes] = await Promise.all([
          lecturesAPI.getAll(),
          quizzesAPI.getAll()
        ]);
        setRecentLectures(lecturesRes.data.lectures.slice(0, 5));
        setRecentQuizzes(quizzesRes.data.quizzes.slice(0, 5));
        if (isAdmin()) {
          const statsRes = await adminAPI.getStats();
          setStats(statsRes.data.stats);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="spinner h-10 w-10"></div></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome */}
      <div className="bg-blue-600 rounded-lg p-6 text-white">
        <p className="text-sm text-blue-200 mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold">{user?.name}</h1>
        <p className="text-blue-200 text-sm mt-1">
          {isAdmin() ? 'Manage your institution and track performance.' :
           canManageContent() ? 'Create content and track student progress.' :
           'Explore lectures and take quizzes.'}
        </p>
      </div>

      {/* Stats */}
      {isAdmin() && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={HiUsers} label="Users" value={stats.totalUsers} color="blue" />
          <StatCard icon={HiBookOpen} label="Lectures" value={stats.totalLectures} color="green" />
          <StatCard icon={HiClipboardDocumentList} label="Quizzes" value={stats.totalQuizzes} color="purple" />
          <StatCard icon={HiAcademicCap} label="Courses" value={stats.totalCourses} color="amber" />
        </div>
      )}

      {!isAdmin() && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={HiBookOpen} label="Lectures" value={recentLectures.length} color="green" />
          <StatCard icon={HiClipboardDocumentList} label="Quizzes" value={recentQuizzes.length} color="purple" />
          <StatCard icon={HiArrowTrendingUp} label="Completed" value={recentQuizzes.filter(q => q.attempted).length} color="blue" />
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lectures */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Lectures</h2>
            <Link to="/lectures" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              View All <HiChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-2">
            {recentLectures.length === 0 ? (
              <div className="text-center py-8">
                <HiBookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No lectures yet</p>
              </div>
            ) : (
              recentLectures.map((lecture) => (
                <Link key={lecture._id} to={`/lectures/${lecture._id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      lecture.fileType === 'pdf' ? 'bg-red-50 text-red-500' :
                      lecture.fileType === 'video' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <HiBookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{lecture.title}</p>
                      <p className="text-xs text-gray-400">{lecture.course?.name}</p>
                    </div>
                  </div>
                  <span className="badge bg-gray-100 text-gray-500 text-[10px] uppercase">{lecture.fileType}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quizzes */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Quizzes</h2>
            <Link to="/quizzes" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              View All <HiChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-2">
            {recentQuizzes.length === 0 ? (
              <div className="text-center py-8">
                <HiClipboardDocumentList className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No quizzes yet</p>
              </div>
            ) : (
              recentQuizzes.map((quiz) => (
                <div key={quiz._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      quiz.attempted ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <HiClipboardDocumentList className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{quiz.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{quiz.course?.name}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><HiClock className="h-3 w-3" /> {quiz.timeLimit}m</span>
                      </div>
                    </div>
                  </div>
                  {quiz.attempted ? (
                    <Link to={`/quizzes/${quiz._id}/results`} className="badge bg-green-50 text-green-700 text-xs">
                      {quiz.score}/{quiz.maxScore}
                    </Link>
                  ) : (
                    <Link to={`/quizzes/${quiz._id}/attempt`} className="btn-primary text-xs px-3 py-1.5">Start</Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const styles = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber:  'bg-amber-50 text-amber-600',
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${styles[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
