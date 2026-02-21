import { useState, useEffect } from 'react';
import { adminAPI, analyticsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function SuperAnalytics() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.data || res.data);
    } catch (err) { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const total = (stats.totalUsers || stats.users || 0);
  const roleCounts = [
    { role: 'Students', count: stats.totalStudents || stats.students || 0, color: 'bg-blue-500' },
    { role: 'Professors', count: stats.totalProfessors || stats.professors || 0, color: 'bg-green-500' },
    { role: 'Dept Admins', count: stats.totalDeptAdmins || 0, color: 'bg-purple-500' },
    { role: 'Inst Admins', count: stats.totalInstAdmins || 0, color: 'bg-amber-500' },
    { role: 'Super Admins', count: stats.totalSuperAdmins || 0, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading">Platform Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Institutions', value: stats.totalInstitutions || stats.institutions || 0 },
          { label: 'Departments', value: stats.totalDepartments || stats.departments || 0 },
          { label: 'Courses', value: stats.totalCourses || stats.courses || 0 },
          { label: 'Lectures', value: stats.totalLectures || stats.lectures || 0 },
          { label: 'Users', value: total }
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-card shadow-card border border-border p-5 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-card shadow-card border border-border">
          <div className="p-4 border-b border-border"><h2 className="text-lg font-semibold text-heading">User Breakdown</h2></div>
          <div className="p-4 space-y-4">
            {roleCounts.map(r => {
              const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
              return (
                <div key={r.role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{r.role}</span>
                    <span className="text-muted">{r.count} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface rounded-card shadow-card border border-border">
          <div className="p-4 border-b border-border"><h2 className="text-lg font-semibold text-heading">Content Metrics</h2></div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Quizzes', value: stats.totalQuizzes || stats.quizzes || 0, icon: '📝' },
                { label: 'Assignments', value: stats.totalAssignments || stats.assignments || 0, icon: '📋' },
                { label: 'Forum Posts', value: stats.totalForumPosts || stats.forumPosts || 0, icon: '💬' },
                { label: 'Events', value: stats.totalEvents || stats.events || 0, icon: '📅' },
                { label: 'Announcements', value: stats.totalAnnouncements || stats.announcements || 0, icon: '📢' },
                { label: 'Timetables', value: stats.totalTimetables || stats.timetables || 0, icon: '🗓️' }
              ].map(c => (
                <div key={c.label} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <p className="text-lg font-bold">{c.value}</p>
                    <p className="text-xs text-muted">{c.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-border">
        <div className="p-4 border-b border-border"><h2 className="text-lg font-semibold text-heading">Growth Summary</h2></div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{stats.totalCourses || stats.courses || 0}</p>
              <p className="text-muted mt-1">Active Courses</p>
              <p className="text-sm text-green-600 mt-1">Platform-wide</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{stats.totalLectures || stats.lectures || 0}</p>
              <p className="text-muted mt-1">Lectures Published</p>
              <p className="text-sm text-green-600 mt-1">All institutions</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">{total}</p>
              <p className="text-muted mt-1">Registered Users</p>
              <p className="text-sm text-green-600 mt-1">All roles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
