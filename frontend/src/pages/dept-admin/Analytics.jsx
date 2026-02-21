import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function DeptAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.allSettled([
        adminAPI.getStats(),
        user.department ? analyticsAPI.getDepartment(typeof user.department === 'object' ? user.department._id || user.department.id : user.department) : Promise.resolve({ data: {} })
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data || statsRes.value.data);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data || analyticsRes.value.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Department Analytics</h1>
        <p className="text-muted mt-1">Performance metrics for your department</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Students', value: stats?.totalStudents || analytics?.totalStudents || 0 },
          { label: 'Professors', value: stats?.totalProfessors || analytics?.totalProfessors || 0 },
          { label: 'Courses', value: stats?.totalCourses || analytics?.totalCourses || 0 },
          { label: 'Lectures', value: stats?.totalLectures || analytics?.totalLectures || 0 }
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-card shadow-card border border-border p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {analytics?.coursePerformance && analytics.coursePerformance.length > 0 && (
        <div className="bg-surface rounded-card shadow-card border border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-heading">Course Performance</h2>
          </div>
          <div className="p-4 space-y-3">
            {analytics.coursePerformance.map((cp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-heading">{cp.courseName || cp.course?.name}</p>
                  <p className="text-xs text-muted">{cp.students || 0} students enrolled</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{Math.round(cp.avgScore || cp.avgAttendance || 0)}%</p>
                  <p className="text-xs text-muted">avg performance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.recentActivity && (
        <div className="bg-surface rounded-card shadow-card border border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-heading">Recent Activity</h2>
          </div>
          <div className="p-4">
            <p className="text-muted text-center py-4">Analytics data will populate as more activities are recorded.</p>
          </div>
        </div>
      )}
    </div>
  );
}
