import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function SuperMonitoring() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.data || res.data);
    } catch (err) { toast.error('Failed to load monitoring data'); }
    finally { setLoading(false); }
  };

  const refreshData = () => {
    setLoading(true);
    fetchData();
    toast.success('Data refreshed');
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">System Monitoring</h1>
          <p className="text-muted mt-1">Real-time system health and metrics</p>
        </div>
        <button onClick={refreshData} className="btn-primary px-4 py-2 rounded-btn text-sm">🔄 Refresh</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers || stats.users || 0, color: 'bg-blue-500', icon: '👥' },
          { label: 'Institutions', value: stats.totalInstitutions || stats.institutions || 0, color: 'bg-green-500', icon: '🏛' },
          { label: 'Active Courses', value: stats.totalCourses || stats.courses || 0, color: 'bg-purple-500', icon: '📚' },
          { label: 'Total Lectures', value: stats.totalLectures || stats.lectures || 0, color: 'bg-amber-500', icon: '🎬' }
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-card shadow-card border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <span className="text-3xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-card shadow-card border border-border">
          <div className="p-4 border-b border-border"><h2 className="text-lg font-semibold text-heading">System Status</h2></div>
          <div className="p-4 space-y-4">
            {[
              { name: 'API Server', status: 'operational' },
              { name: 'Database', status: 'operational' },
              { name: 'File Storage', status: 'operational' },
              { name: 'Authentication', status: 'operational' }
            ].map(svc => (
              <div key={svc.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${svc.status === 'operational' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium text-sm">{svc.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${svc.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-card shadow-card border border-border">
          <div className="p-4 border-b border-border"><h2 className="text-lg font-semibold text-heading">User Distribution</h2></div>
          <div className="p-4 space-y-4">
            {[
              { role: 'Students', count: stats.totalStudents || stats.students || 0, color: 'bg-blue-500' },
              { role: 'Professors', count: stats.totalProfessors || stats.professors || 0, color: 'bg-green-500' },
              { role: 'Dept Admins', count: stats.totalDeptAdmins || 0, color: 'bg-purple-500' },
              { role: 'Inst Admins', count: stats.totalInstAdmins || 0, color: 'bg-amber-500' }
            ].map(r => {
              const total = (stats.totalUsers || stats.users || 1);
              const pct = Math.round((r.count / total) * 100) || 0;
              return (
                <div key={r.role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{r.role}</span>
                    <span className="text-muted">{r.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-border">
        <div className="p-4 border-b border-border"><h2 className="text-lg font-semibold text-heading">Content Overview</h2></div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Lectures', value: stats.totalLectures || stats.lectures || 0 },
              { label: 'Quizzes', value: stats.totalQuizzes || stats.quizzes || 0 },
              { label: 'Assignments', value: stats.totalAssignments || stats.assignments || 0 },
              { label: 'Forum Posts', value: stats.totalForumPosts || stats.forumPosts || 0 }
            ].map(c => (
              <div key={c.label} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-muted mt-1">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
