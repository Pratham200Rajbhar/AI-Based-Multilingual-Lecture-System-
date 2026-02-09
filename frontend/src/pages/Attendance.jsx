import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, coursesAPI, usersAPI } from '../services/api';
import { HiCheckCircle, HiXCircle, HiClock } from 'react-icons/hi2';
import { CardSkeleton } from '../components/Skeletons';
import toast from 'react-hot-toast';

export default function Attendance() {
  const { user, canManageContent } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (user?.role === 'student') {
      loadStudentAttendance();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse && canManageContent()) {
      loadStudentsForCourse();
      loadCourseAttendance();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const res = await coursesAPI.getAll({ limit: 100 });
      setCourses(res.data.courses);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsForCourse = async () => {
    try {
      const res = await usersAPI.getAll({ role: 'student', limit: 200 });
      setStudents(res.data.users.map(s => ({
        student: s._id,
        name: s.name,
        email: s.email,
        status: 'present'
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadCourseAttendance = async () => {
    try {
      const res = await attendanceAPI.getCourseAttendance(selectedCourse, { limit: 30 });
      setAttendanceRecords(res.data.attendance || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStudentAttendance = async () => {
    try {
      const res = await attendanceAPI.getStudentAttendance(user.id);
      setMyStats(res.data.stats);
      setAttendanceRecords(res.data.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (index) => {
    const statuses = ['present', 'absent', 'late'];
    setStudents(prev => prev.map((s, i) => {
      if (i !== index) return s;
      const currentIdx = statuses.indexOf(s.status);
      return { ...s, status: statuses[(currentIdx + 1) % statuses.length] };
    }));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  const saveAttendance = async () => {
    if (!selectedCourse) return toast.error('Select a course');
    setSaving(true);
    try {
      await attendanceAPI.mark({
        course: selectedCourse,
        date,
        students: students.map(s => ({ student: s.student, status: s.status }))
      });
      toast.success('Attendance saved');
      loadCourseAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CardSkeleton count={4} />;

  // Student view
  if (user?.role === 'student') {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-6">My Attendance</h1>
        {myStats && (
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="card p-4">
              <p className="text-sm text-gray-500">Total Classes</p>
              <p className="text-2xl font-bold">{myStats.totalClasses}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500">Present</p>
              <p className="text-2xl font-bold text-green-600">{myStats.present}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500">Absent</p>
              <p className="text-2xl font-bold text-red-600">{myStats.absent}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500">Percentage</p>
              <p className={`text-2xl font-bold ${myStats.percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                {myStats.percentage}%
              </p>
              {myStats.percentage < 75 && (
                <p className="text-xs text-red-500 mt-1">Below 75% minimum requirement</p>
              )}
            </div>
          </div>
        )}
        <div className="card">
          <div className="p-4 border-b"><h2 className="font-medium">Recent Attendance</h2></div>
          <div className="divide-y">
            {attendanceRecords.map((r, i) => {
              const entry = r.students?.find(s => s.student?.toString() === user.id || s.student?._id === user.id);
              return (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.course?.name}</p>
                    <p className="text-sm text-gray-500">{new Date(r.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge ${
                    entry?.status === 'present' ? 'bg-green-100 text-green-700' :
                    entry?.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {entry?.status || 'N/A'}
                  </span>
                </div>
              );
            })}
            {attendanceRecords.length === 0 && (
              <p className="p-4 text-sm text-gray-500 text-center">No attendance records yet</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Professor/Admin view
  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Attendance Management</h1>

      <div className="card p-5 mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input-field">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={markAllPresent} className="btn-secondary">Mark All Present</button>
            <button onClick={saveAttendance} disabled={saving || !selectedCourse} className="btn-primary">
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </div>

      {selectedCourse && students.length > 0 && (
        <div className="card overflow-hidden">
          <table className="table-clean">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.student}>
                  <td>{i + 1}</td>
                  <td className="font-medium">{s.name}</td>
                  <td className="text-gray-500">{s.email}</td>
                  <td>
                    <button
                      onClick={() => toggleStatus(i)}
                      className={`badge cursor-pointer ${
                        s.status === 'present' ? 'bg-green-100 text-green-700' :
                        s.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      {s.status === 'present' && <HiCheckCircle className="h-3.5 w-3.5" />}
                      {s.status === 'absent' && <HiXCircle className="h-3.5 w-3.5" />}
                      {s.status === 'late' && <HiClock className="h-3.5 w-3.5" />}
                      {s.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
