import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  HiUsers, HiBookOpen, HiClipboardDocumentList, HiAcademicCap,
  HiBuildingLibrary, HiBuildingOffice2, HiChartBar, HiTrophy
} from 'react-icons/hi2';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reportsRes] = await Promise.all([adminAPI.getStats(), adminAPI.getReports()]);
        setStats(statsRes.data.stats);
        setReports(reportsRes.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner h-10 w-10"></div></div>;

  const statCards = stats ? [
    { icon: HiUsers, label: 'Total Users', value: stats.totalUsers, sub: `${stats.totalStudents} students, ${stats.totalProfessors} professors`, color: 'blue' },
    { icon: HiBuildingLibrary, label: 'Institutions', value: stats.totalInstitutions, color: 'green' },
    { icon: HiBuildingOffice2, label: 'Departments', value: stats.totalDepartments, color: 'purple' },
    { icon: HiAcademicCap, label: 'Courses', value: stats.totalCourses, color: 'amber' },
    { icon: HiBookOpen, label: 'Lectures', value: stats.totalLectures, color: 'red' },
    { icon: HiClipboardDocumentList, label: 'Quizzes', value: stats.totalQuizzes, sub: `${stats.totalQuizResults} submissions`, color: 'blue' },
  ] : [];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600', amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">System overview and analytics</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {statCards.map((card) => (
            <div key={card.label} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
                </div>
                <div className={`p-2.5 rounded-lg ${colorMap[card.color]}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link to="/admin/users" className="card p-5 hover:shadow-md transition-shadow">
          <div className="bg-blue-50 p-2.5 rounded-lg w-fit mb-2.5">
            <HiUsers className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Manage Users</h3>
          <p className="text-sm text-gray-500 mt-0.5">Add, edit, or remove users</p>
        </Link>
        <Link to="/admin/courses" className="card p-5 hover:shadow-md transition-shadow">
          <div className="bg-green-50 p-2.5 rounded-lg w-fit mb-2.5">
            <HiAcademicCap className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Manage Courses</h3>
          <p className="text-sm text-gray-500 mt-0.5">Institutions, departments & courses</p>
        </Link>
        <Link to="/quizzes" className="card p-5 hover:shadow-md transition-shadow">
          <div className="bg-purple-50 p-2.5 rounded-lg w-fit mb-2.5">
            <HiClipboardDocumentList className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">View Quizzes</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage quizzes and view results</p>
        </Link>
      </div>

      {/* Top Students */}
      {reports?.topStudents && reports.topStudents.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2">
            <HiTrophy className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Top Performing Students</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Quizzes</th>
                  <th>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {reports.topStudents.map((s, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-600' :
                        i === 1 ? 'bg-gray-100 text-gray-500' :
                        i === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-50 text-gray-400'
                      }`}>{i + 1}</span>
                    </td>
                    <td>
                      <p className="font-medium text-gray-900">{s._id?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{s._id?.email}</p>
                    </td>
                    <td>{s.totalQuizzes}</td>
                    <td>
                      <span className={`badge text-xs ${
                        s.avgScore >= 70 ? 'bg-green-50 text-green-600' :
                        s.avgScore >= 40 ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-500'
                      }`}>{Math.round(s.avgScore)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Results */}
      {reports?.recentResults && reports.recentResults.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <HiChartBar className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Recent Quiz Submissions</h2>
          </div>
          <div className="space-y-1">
            {reports.recentResults.slice(0, 10).map((r) => (
              <div key={r._id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.student?.name}</p>
                  <p className="text-xs text-gray-400">{r.quiz?.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{r.totalScore}/{r.maxScore}</p>
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
