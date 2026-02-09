import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Lectures from './pages/Lectures';
import LectureDetail from './pages/LectureDetail';
import Quizzes from './pages/Quizzes';
import QuizAttempt from './pages/QuizAttempt';
import QuizResults from './pages/QuizResults';
import CreateQuiz from './pages/CreateQuiz';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';
import Timetable from './pages/Timetable';
import Notifications from './pages/Notifications';
import Announcements from './pages/Announcements';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Gradebook from './pages/Gradebook';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import BulkOperations from './pages/admin/BulkOperations';
import AuditLogs from './pages/admin/AuditLogs';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="spinner h-10 w-10"></div></div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="spinner h-10 w-10"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin()) return <Navigate to="/dashboard" />;
  return children;
}

function ProfessorRoute({ children }) {
  const { user, canManageContent, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="spinner h-10 w-10"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (!canManageContent()) return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="lectures" element={<Lectures />} />
        <Route path="lectures/:id" element={<LectureDetail />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="quizzes/create" element={<ProfessorRoute><CreateQuiz /></ProfessorRoute>} />
        <Route path="quizzes/:id/attempt" element={<QuizAttempt />} />
        <Route path="quizzes/:id/results" element={<QuizResults />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="assignments/:id" element={<AssignmentDetail />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="gradebook" element={<Gradebook />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="forum" element={<Forum />} />
        <Route path="forum/:id" element={<ForumPost />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="analytics" element={<ProfessorRoute><Analytics /></ProfessorRoute>} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="admin/courses" element={<AdminRoute><CourseManagement /></AdminRoute>} />
        <Route path="admin/bulk" element={<AdminRoute><BulkOperations /></AdminRoute>} />
        <Route path="admin/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
