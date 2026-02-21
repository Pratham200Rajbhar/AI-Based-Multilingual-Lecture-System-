import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Icons } from '../shared/Icons'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/professor/dashboard', icon: Icons.Dashboard, label: 'Dashboard' },
  { to: '/professor/upload', icon: Icons.Upload, label: 'Upload Lecture' },
  { to: '/professor/my-lectures', icon: Icons.Book, label: 'My Lectures' },
  { to: '/professor/quiz-builder', icon: Icons.FileText, label: 'Quiz Builder' },
  { to: '/professor/assignments', icon: Icons.FileText, label: 'Assignments' },
  { to: '/professor/attendance', icon: Icons.Check, label: 'Attendance' },
  { to: '/professor/gradebook', icon: Icons.BarChart, label: 'Gradebook' },
  { to: '/professor/students', icon: Icons.Users, label: 'Students' },
  { to: '/professor/analytics', icon: Icons.Activity, label: 'Analytics' },
  { to: '/professor/settings', icon: Icons.Settings, label: 'Settings' },
]

export default function ProfessorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getInitials = (name) => {
    if (!name) return 'PR'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#f2f7ff] to-white overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[200px] bg-white border-r border-[#e6eaf2] flex flex-col shrink-0 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#e6eaf2]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#2563eb] flex items-center justify-center text-white text-[14px] font-bold">
              E
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#0f172a] leading-tight">GlobalFlow AI</p>
              <p className="text-[11px] text-[#94a3b8]">Professor Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-colors relative ${
                    isActive
                      ? 'bg-[#eff6ff] text-[#2563eb]'
                      : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                  }`}
                >
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#2563eb] rounded-r-full" />}
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* Quick Upload CTA */}
        <div className="px-3 pb-5">
          <Link to="/professor/upload" onClick={() => setSidebarOpen(false)} className="block bg-[#2563eb] rounded-[14px] p-4 text-white no-underline hover:bg-[#1e40af] transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-2">
              <Icons.Upload className="w-4 h-4" />
            </div>
            <p className="text-[14px] font-bold">Quick Upload</p>
            <p className="text-[11px] text-white/70">Upload your lecture in seconds</p>
          </Link>
        </div>

        {/* Logout */}
        <div className="border-t border-[#e6eaf2] p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors w-full">
            <Icons.Logout className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[64px] bg-white border-b border-[#e6eaf2] flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2 text-[#64748b] hover:text-[#0f172a]" onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="relative hidden sm:block w-[320px]">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] w-[18px] h-[18px]" />
              <input
                type="text"
                placeholder="Search lectures, students, quizzes..."
                className="w-full h-10 pl-10 pr-4 rounded-[10px] border border-[#e6eaf2] bg-[#f8fafc] text-sm placeholder-[#94a3b8] focus:outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="h-9 px-4 rounded-[10px] border border-[#e6eaf2] text-[13px] text-[#64748b] items-center gap-1 cursor-pointer hidden md:flex">
              Semester 6 <Icons.ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] transition cursor-pointer" title="Notifications">
              <Icons.Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-5 h-5 bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-[13px] font-bold">
                {getInitials(user?.name)}
              </div>
              <div className="hidden md:block">
                <p className="text-[13px] font-medium text-[#0f172a]">{user?.name || 'Professor'}</p>
                <p className="text-[11px] text-[#94a3b8]">{user?.department || 'Computer Science'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
