import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfessorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchStudents(); }, [page, search]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, role: 'student' };
      if (search) params.search = search;
      const res = await usersAPI.getAll(params);
      setStudents(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Students</h1>
        <p className="text-muted mt-1">View and manage your students</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search students..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input flex-1" />
      </div>

      {loading ? (
        <div className="flex justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border">
          <p className="text-muted text-lg">No students found</p>
        </div>
      ) : (
        <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted">Department</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">{s.name?.[0]}</div>
                        <span className="font-medium text-heading">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{s.email}</td>
                    <td className="px-4 py-3 text-sm text-muted">{s.department?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-border">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-primary px-3 py-1 text-sm disabled:opacity-50">Previous</button>
              <span className="px-3 py-1 text-sm text-muted">Page {page} of {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p+1))} disabled={page>=pagination.pages} className="btn-primary px-3 py-1 text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
