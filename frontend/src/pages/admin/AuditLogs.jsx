import { useState, useEffect, useCallback } from 'react';
import { HiShieldCheck, HiFunnel } from 'react-icons/hi2';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import { TableSkeleton } from '../../components/Skeletons';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (search) params.userId = search;
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource = resourceFilter;
      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.logs || res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load audit logs'); }
    finally { setLoading(false); }
  }, [page, search, actionFilter, resourceFilter]);

  useEffect(() => { load(); }, [load]);

  const actionColors = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-purple-100 text-purple-700',
    LOGOUT: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Audit Logs</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by user ID..." />
        </div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </select>
        <select value={resourceFilter} onChange={e => { setResourceFilter(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
          <option value="">All Resources</option>
          <option value="User">User</option>
          <option value="Course">Course</option>
          <option value="Lecture">Lecture</option>
          <option value="Quiz">Quiz</option>
          <option value="Assignment">Assignment</option>
          <option value="Attendance">Attendance</option>
        </select>
      </div>

      {loading ? <TableSkeleton rows={10} cols={6} /> : logs.length === 0 ? (
        <EmptyState icon={HiShieldCheck} title="No audit logs" description="No audit logs match your filters" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Description</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td className="text-xs text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="text-sm font-medium">{log.userId?.name || log.userId || '-'}</td>
                  <td><span className={`badge text-xs ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>{log.action}</span></td>
                  <td className="text-sm">{log.resource}</td>
                  <td className="text-sm text-gray-600 max-w-xs truncate">{log.description || '-'}</td>
                  <td className="text-xs text-gray-400 font-mono">{log.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
