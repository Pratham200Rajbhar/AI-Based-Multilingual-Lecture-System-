import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome, HiBookOpen, HiClipboardDocumentList, HiUsers,
  HiAcademicCap, HiPlusCircle, HiChartBarSquare, HiUserCircle,
  HiClipboardDocumentCheck, HiDocumentText, HiCalendarDays,
  HiBell, HiMegaphone, HiChatBubbleLeftRight, HiCalendar,
  HiChartBar, HiClock, HiArrowUpTray, HiShieldCheck,
  HiTableCells
} from 'react-icons/hi2';

export default function Sidebar() {
  const { isAdmin, canManageContent } = useAuth();

  const link = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <aside className="w-60 bg-white border-r border-gray-200 fixed inset-y-0 left-0 hidden lg:flex flex-col z-50">
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <HiAcademicCap className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="font-semibold text-gray-900">EduPlatform</span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase">Menu</p>

        <NavLink to="/dashboard" className={link}>
          <HiHome className="h-4.5 w-4.5" /> Dashboard
        </NavLink>
        <NavLink to="/lectures" className={link}>
          <HiBookOpen className="h-4.5 w-4.5" /> Lectures
        </NavLink>
        <NavLink to="/quizzes" className={link}>
          <HiClipboardDocumentList className="h-4.5 w-4.5" /> Quizzes
        </NavLink>
        <NavLink to="/assignments" className={link}>
          <HiDocumentText className="h-4.5 w-4.5" /> Assignments
        </NavLink>
        <NavLink to="/attendance" className={link}>
          <HiClipboardDocumentCheck className="h-4.5 w-4.5" /> Attendance
        </NavLink>
        <NavLink to="/gradebook" className={link}>
          <HiTableCells className="h-4.5 w-4.5" /> Gradebook
        </NavLink>
        <NavLink to="/timetable" className={link}>
          <HiClock className="h-4.5 w-4.5" /> Timetable
        </NavLink>

        {canManageContent() && (
          <NavLink to="/quizzes/create" className={link}>
            <HiPlusCircle className="h-4.5 w-4.5" /> Create Quiz
          </NavLink>
        )}

        <p className="px-3 pt-5 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase">Community</p>

        <NavLink to="/announcements" className={link}>
          <HiMegaphone className="h-4.5 w-4.5" /> Announcements
        </NavLink>
        <NavLink to="/forum" className={link}>
          <HiChatBubbleLeftRight className="h-4.5 w-4.5" /> Forum
        </NavLink>
        <NavLink to="/calendar" className={link}>
          <HiCalendarDays className="h-4.5 w-4.5" /> Calendar
        </NavLink>
        <NavLink to="/notifications" className={link}>
          <HiBell className="h-4.5 w-4.5" /> Notifications
        </NavLink>
        {canManageContent() && (
          <NavLink to="/analytics" className={link}>
            <HiChartBar className="h-4.5 w-4.5" /> Analytics
          </NavLink>
        )}

        <NavLink to="/profile" className={link}>
          <HiUserCircle className="h-4.5 w-4.5" /> Profile
        </NavLink>

        {isAdmin() && (
          <>
            <p className="px-3 pt-5 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase">Admin</p>
            <NavLink to="/admin" end className={link}>
              <HiChartBarSquare className="h-4.5 w-4.5" /> Overview
            </NavLink>
            <NavLink to="/admin/users" className={link}>
              <HiUsers className="h-4.5 w-4.5" /> Users
            </NavLink>
            <NavLink to="/admin/courses" className={link}>
              <HiAcademicCap className="h-4.5 w-4.5" /> Courses
            </NavLink>
            <NavLink to="/admin/bulk" className={link}>
              <HiArrowUpTray className="h-4.5 w-4.5" /> Bulk Operations
            </NavLink>
            <NavLink to="/admin/audit-logs" className={link}>
              <HiShieldCheck className="h-4.5 w-4.5" /> Audit Logs
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
