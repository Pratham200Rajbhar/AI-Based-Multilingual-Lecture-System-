import { useState, useEffect } from 'react';
import { attendanceAPI, coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [attRes, cRes] = await Promise.allSettled([
        attendanceAPI.getStudentAttendance(),
        coursesAPI.getAll()
      ]);
      if (attRes.status === 'fulfilled') setAttendance(attRes.value.data.data || attRes.value.data || []);
      if (cRes.status === 'fulfilled') setCourses(cRes.value.data.data || []);
    } catch (err) { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  const filtered = selectedCourse ? attendance.filter(a => a.course?._id === selectedCourse || a.course === selectedCourse) : attendance;

  const stats = {
    total: filtered.length,
    present: filtered.filter(a => a.status === 'present').length,
    absent: filtered.filter(a => a.status === 'absent').length,
    late: filtered.filter(a => a.status === 'late').length
  };
  const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading">My Attendance</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-card shadow-card border border-border p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{pct}%</p>
          <p className="text-sm text-muted mt-1">Overall</p>
        </div>
        <div className="bg-surface rounded-card shadow-card border border-border p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{stats.present}</p>
          <p className="text-sm text-muted mt-1">Present</p>
        </div>
        <div className="bg-surface rounded-card shadow-card border border-border p-5 text-center">
          <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-sm text-muted mt-1">Absent</p>
        </div>
        <div className="bg-surface rounded-card shadow-card border border-border p-5 text-center">
          <p className="text-3xl font-bold text-amber-600">{stats.late}</p>
          <p className="text-sm text-muted mt-1">Late</p>
        </div>
      </div>

      <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="form-input w-full max-w-md">
        <option value="">All Courses</option>
        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted">Course</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-muted">No attendance records</td></tr>
            ) : (
              filtered.map((a, i) => (
                <tr key={a._id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{new Date(a.date || a.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">{a.course?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'present' ? 'bg-green-100 text-green-700' : a.status === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
