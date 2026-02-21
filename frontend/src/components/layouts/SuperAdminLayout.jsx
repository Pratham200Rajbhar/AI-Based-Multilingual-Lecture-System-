import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Icons } from '../shared/Icons'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/super-admin/overview', label: 'Overview', icon: Icons.Dashboard },
  { to: '/super-admin/institutions', label: 'Institutions', icon: Icons.Building },
  { to: '/super-admin/inst-admins', label: 'Institutional Admins', icon: Icons.UserCog },
  { to: '/super-admin/policies', label: 'Policies', icon: Icons.FileText },
  { to: '/super-admin/monitoring', label: 'System Monitoring', icon: Icons.Activity },
  { to: '/super-admin/security-logs', label: 'Security Logs', icon: Icons.Shield },
  { to: '/super-admin/analytics', label: 'Analytics', icon: Icons.BarChart },
  { to: '/super-admin/profile', label: 'Profile & Security', icon: Icons.Lock },
]

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getInitials = (name) => {
    if (!name) return 'SA'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[220px] bg-white border-r border-[#e6eaf2] flex flex-col shrink-0 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <p className="text-[18px] font-bold text-[#0f172a]">EduLingual</p>
          <p className="text-[11px] text-[#94a3b8]">Super Admin Platform</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition ${
                  isActive
                    ? 'bg-[#eff6ff] text-[#2563eb]'
                    : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-[#e6eaf2] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-[12px] font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#0f172a] leading-tight truncate">{user?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-[#64748b] truncate">{user?.email || 'Platform Owner'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a] transition w-full">
            <Icons.Logout className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[56px] bg-white border-b border-[#e6eaf2] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2 text-[#64748b] hover:text-[#0f172a]" onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="relative hidden sm:block">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
              <input
                type="text"
                placeholder="Search institutions, admins, logs..."
                className="h-9 w-[320px] pl-9 pr-4 rounded-lg border border-[#e6eaf2] text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 bg-[#f0fdf4] px-3 py-1.5 rounded-full">
              <Icons.CheckCircle className="w-3.5 h-3.5 text-[#16a34a]" />
              <span className="text-[12px] font-medium text-[#16a34a]">All Systems Operational</span>
            </div>
            <button className="relative cursor-pointer p-1" title="Notifications">
              <Icons.Bell className="w-[18px] h-[18px] text-[#64748b]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full text-[9px] text-white flex items-center justify-center font-bold">5</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-[12px] font-bold">
                {getInitials(user?.name)}
              </div>
              <div className="hidden md:block">
                <p className="text-[13px] font-semibold text-[#0f172a] leading-tight">{user?.name || 'Super Admin'}</p>
                <p className="text-[10px] text-[#64748b]">Platform Owner</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#f2f7ff] to-white">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
