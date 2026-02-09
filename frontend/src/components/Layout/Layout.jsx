import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-60">
        <Navbar />
        <main className="p-6 mt-14">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
