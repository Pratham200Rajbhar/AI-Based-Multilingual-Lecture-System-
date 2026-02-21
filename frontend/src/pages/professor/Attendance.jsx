import { useState, useEffect } from 'react';
import { attendanceAPI, coursesAPI, usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfAttendance() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('mark');

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll();
      setCourses(res.data.data || []);
    } catch (err) { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedCourse) {
      usersAPI.getAll({ role: 'student', limit: 100 }).then(res => {
        const studentList = res.data.data || [];
        setStudents(studentList);
        const initialRecords = {};
        studentList.forEach(s => { initialRecords[s._id] = 'present'; });
        setRecords(initialRecords);
      }).catch(() => {});
      attendanceAPI.getCourseAttendance(selectedCourse).then(res => {
        setHistory(res.data.data || []);
      }).catch(() => {});
    }
  }, [selectedCourse]);

  const toggleStatus = (studentId) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : prev[studentId] === 'absent' ? 'late' : 'present'
    }));
  };

  const handleSubmit = async () => {
    if (!selectedCourse) return toast.error('Select a course');
    setSaving(true);
    try {
      const attendanceRecords = Object.entries(records).map(([student, status]) => ({ student, status }));
      await attendanceAPI.mark({ course: selectedCourse, date: attendanceDate, records: attendanceRecords });
      toast.success('Attendance saved');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const statusColors = { present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700', late: 'bg-amber-100 text-amber-700' };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading">Attendance</h1>

      <div className="flex gap-2">
        <button onClick={() => setView('mark')} className={`px-4 py-2 rounded-btn text-sm ${view === 'mark' ? 'btn-primary' : 'border border-border hover:bg-gray-50'}`}>Mark Attendance</button>
        <button onClick={() => setView('history')} className={`px-4 py-2 rounded-btn text-sm ${view === 'history' ? 'btn-primary' : 'border border-border hover:bg-gray-50'}`}>History</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="form-input w-full sm:w-auto">
          <option value="">Select Course</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {view === 'mark' && <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="form-input w-full sm:w-auto" />}
      </div>

      {view === 'mark' ? (
        selectedCourse ? (
          <div className="bg-surface rounded-card shadow-card border border-border">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="font-semibold text-heading">Mark Attendance - {attendanceDate}</h2>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary px-4 py-2 rounded-btn text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted">#</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted">Student</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-muted">No students found</td></tr>
                ) : (
                  students.map((s, i) => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-muted">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-sm">{s.name}</span>
                        <p className="text-xs text-muted">{s.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleStatus(s._id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[records[s._id]] || 'bg-gray-100'}`}>
                          {records[s._id] || 'present'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-surface rounded-card shadow-card border border-border p-12 text-center text-muted">Select a course to mark attendance</div>
        )
      ) : (
        <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted">Student</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-muted">No history found</td></tr>
              ) : (
                history.map((h, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{new Date(h.date || h.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">{h.student?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[h.status] || 'bg-gray-100'}`}>{h.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
