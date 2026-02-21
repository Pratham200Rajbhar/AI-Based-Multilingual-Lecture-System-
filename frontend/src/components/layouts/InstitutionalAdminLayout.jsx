import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icons } from '../shared/Icons'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/inst-admin/overview', label: 'Overview', icon: Icons.Dashboard },
  { to: '/inst-admin/departments', label: 'Departments', icon: Icons.Building },
  { to: '/inst-admin/dept-admins', label: 'Dept. Admins', icon: Icons.UserCog },
  { to: '/inst-admin/policies', label: 'Policies', icon: Icons.FileText },
  { to: '/inst-admin/escalations', label: 'Escalations', icon: Icons.AlertTriangle },
  { to: '/inst-admin/analytics', label: 'Analytics', icon: Icons.BarChart },
  { to: '/inst-admin/profile', label: 'Profile & Security', icon: Icons.ShieldCheck },
]

export default function InstitutionalAdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getInitials = (name) => {
    if (!name) return 'AD'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — Dark Navy */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[200px] bg-[#0f172a] flex flex-col shrink-0 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#2563eb] flex items-center justify-center text-white text-[14px] font-bold">
              E
            </div>
            <div>
              <p className="text-[15px] font-bold text-white leading-tight">EduLingual</p>
              <p className="text-[11px] text-white/50">Institutional Admin</p>
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
                      ? 'bg-[#2563eb] text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1e40af] flex items-center justify-center text-white text-[12px] font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-[11px] text-white/50 truncate">{user?.email || 'admin@edulingual.ec'}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="shrink-0">
              <Icons.Logout className="w-4 h-4 text-white/40 cursor-pointer hover:text-white transition" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
        {/* Header */}
        <header className="h-[60px] bg-white border-b border-[#e6eaf2] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2 text-[#64748b] hover:text-[#0f172a]" onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <p className="text-[18px] font-bold text-[#0f172a] capitalize">
              {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Overview'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-[260px] hidden sm:block">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
              <input
                type="text"
                placeholder="Search departments, admins..."
                className="w-full h-9 pl-9 pr-4 rounded-[8px] border border-[#e6eaf2] bg-[#f8fafc] text-[13px] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563eb]"
              />
            </div>
            <button className="h-9 px-3 rounded-[8px] border border-[#e6eaf2] text-[12px] text-[#64748b] cursor-pointer hidden md:block">
              TERM
            </button>
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] transition cursor-pointer" title="Notifications">
              <Icons.Bell className="w-[18px] h-[18px]" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-[12px] font-bold">
                {getInitials(user?.name)}
              </div>
              <span className="text-[13px] font-medium text-[#0f172a] hidden md:block">{user?.name || 'Dr. Admin'}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
