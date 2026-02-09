import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../services/api';
import { HiArrowRightOnRectangle, HiBell } from 'react-icons/hi2';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationsAPI.getMy({ limit: 1, unread: true });
        setUnreadCount(res.data.pagination?.totalItems || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-60 z-40 h-14">
      <div className="px-6 h-full flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Welcome, <span className="font-medium text-gray-900">{user?.name}</span>
        </p>
        <div className="flex items-center gap-3">
          <span className="badge bg-blue-50 text-blue-700 capitalize">{user?.role?.replace('_', ' ')}</span>
          <Link to="/notifications" className="relative p-1.5 text-gray-400 hover:text-gray-600 transition-colors" title="Notifications">
            <HiBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link to="/profile" className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-medium text-white">
            {user?.name?.charAt(0)?.toUpperCase()}
          </Link>
          <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
            <HiArrowRightOnRectangle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
