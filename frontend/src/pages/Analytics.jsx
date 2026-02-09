import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, coursesAPI } from '../services/api';
import { HiChartBar, HiAcademicCap, HiUsers, HiBookOpen } from 'react-icons/hi2';
import { StatSkeleton } from '../components/Skeletons';
import toast from 'react-hot-toast';

export default function Analytics() {
  const { user, isAdmin, isStudent } = useAuth();
  const [view, setView] = useState(isStudent() ? 'student' : 'course');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    coursesAPI.getAll({ limit: 100 }).then(res => {
      const c = res.data.data || res.data.courses || [];
      setCourses(c);
      if (c.length > 0 && !isStudent()) setSelectedCourse(c[0]._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (view === 'student') loadStudentAnalytics();
    else if (view === 'course' && selectedCourse) loadCourseAnalytics();
    else if (view === 'department' && user?.department) loadDepartmentAnalytics();
  }, [view, selectedCourse]);

  const loadStudentAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getStudent(user._id);
      setData(res.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  const loadCourseAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getCourse(selectedCourse);
      setData(res.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  const loadDepartmentAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getDepartment(user.department);
      setData(res.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }) => (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max = 100, color = 'blue' }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium">{typeof value === 'number' ? value.toFixed(1) : value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`bg-${color}-500 rounded-full h-2 transition-all`} style={{ width: `${Math.min(value || 0, max)}%` }}></div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <div className="flex gap-2">
          {isStudent() && (
            <button onClick={() => setView('student')} className={view === 'student' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>My Analytics</button>
          )}
          <button onClick={() => setView('course')} className={view === 'course' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>Course</button>
          {isAdmin() && (
            <button onClick={() => setView('department')} className={view === 'department' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>Department</button>
          )}
        </div>
      </div>

      {view === 'course' && (
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input-field w-auto mb-6">
          <option value="">Select Course</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : !data ? (
        <div className="text-center py-12 text-gray-500">
          <HiChartBar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Select options to view analytics</p>
        </div>
      ) : view === 'student' ? (
        /* Student Analytics */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={HiAcademicCap} label="Avg Quiz Score" value={`${(data.analytics?.averageQuizScore || 0).toFixed(1)}%`} color="blue" />
            <StatCard icon={HiBookOpen} label="Quizzes Taken" value={data.analytics?.totalQuizzes || 0} color="green" />
            <StatCard icon={HiUsers} label="Attendance" value={`${(data.analytics?.attendancePercentage || 0).toFixed(1)}%`} color="purple" />
            <StatCard icon={HiChartBar} label="Rank" value={data.analytics?.rank ? `#${data.analytics.rank}` : 'N/A'} color="yellow" />
          </div>
          {data.analytics?.courseWise?.length > 0 && (
            <div className="card p-4">
              <h3 className="font-medium mb-4">Course-wise Performance</h3>
              {data.analytics.courseWise.map((c, i) => (
                <ProgressBar key={i} label={c.courseName || `Course ${i + 1}`} value={c.averageScore || 0} color={c.averageScore >= 70 ? 'green' : c.averageScore >= 50 ? 'yellow' : 'red'} />
              ))}
            </div>
          )}
        </div>
      ) : view === 'course' ? (
        /* Course Analytics */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={HiUsers} label="Total Students" value={data.analytics?.totalStudents || 0} color="blue" />
            <StatCard icon={HiAcademicCap} label="Avg Score" value={`${(data.analytics?.averageScore || 0).toFixed(1)}%`} color="green" />
            <StatCard icon={HiBookOpen} label="Completion Rate" value={`${(data.analytics?.completionRate || 0).toFixed(1)}%`} color="purple" />
            <StatCard icon={HiChartBar} label="Total Quizzes" value={data.analytics?.quizBreakdown?.length || 0} color="yellow" />
          </div>
          {data.analytics?.quizBreakdown?.length > 0 && (
            <div className="card p-4">
              <h3 className="font-medium mb-4">Quiz Performance</h3>
              <table className="table-clean">
                <thead>
                  <tr><th>Quiz</th><th>Avg Score</th><th>Highest</th><th>Lowest</th><th>Attempts</th></tr>
                </thead>
                <tbody>
                  {data.analytics.quizBreakdown.map((q, i) => (
                    <tr key={i}>
                      <td className="font-medium">{q.quizTitle}</td>
                      <td>{(q.averageScore || 0).toFixed(1)}%</td>
                      <td className="text-green-600">{(q.highestScore || 0).toFixed(1)}%</td>
                      <td className="text-red-600">{(q.lowestScore || 0).toFixed(1)}%</td>
                      <td>{q.totalAttempts || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Department Analytics */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={HiUsers} label="Total Students" value={data.analytics?.totalStudents || 0} color="blue" />
            <StatCard icon={HiBookOpen} label="Total Courses" value={data.analytics?.totalCourses || 0} color="green" />
            <StatCard icon={HiAcademicCap} label="Avg Score" value={`${(data.analytics?.averageScore || 0).toFixed(1)}%`} color="purple" />
            <StatCard icon={HiChartBar} label="Avg Attendance" value={`${(data.analytics?.averageAttendance || 0).toFixed(1)}%`} color="yellow" />
          </div>
          {data.analytics?.topStudents?.length > 0 && (
            <div className="card p-4 mb-6">
              <h3 className="font-medium mb-3">Top Students</h3>
              <div className="space-y-2">
                {data.analytics.topStudents.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                    <p className="text-sm font-medium flex-1">{s.name}</p>
                    <span className="text-sm text-gray-500">{(s.averageScore || 0).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
