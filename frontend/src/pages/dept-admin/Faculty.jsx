import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function DeptFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchFaculty(); }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll({ role: 'professor', limit: 50 });
      setFaculty(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('All fields required');
    setSaving(true);
    try {
      await usersAPI.create({ ...form, role: 'professor' });
      toast.success('Professor added');
      setShowForm(false);
      setForm({ name: '', email: '', password: '' });
      fetchFaculty();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add professor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this faculty member?')) return;
    try {
      await usersAPI.delete(id);
      toast.success('Faculty removed');
      fetchFaculty();
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const filtered = faculty.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading">Faculty</h1>
          <p className="text-muted mt-1">Manage department professors</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Professor</button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-card shadow-card border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-heading">Add Professor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input" />
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="form-input" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Adding...' : 'Add'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-btn hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <input type="text" placeholder="Search faculty..." value={search} onChange={e => setSearch(e.target.value)} className="form-input w-full sm:w-64" />

      {loading ? (
        <div className="flex justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-card border border-border"><p className="text-muted">No faculty found</p></div>
      ) : (
        <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted">Department</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(f => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">{f.name?.[0]}</div>
                      <span className="font-medium text-heading">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{f.email}</td>
                  <td className="px-4 py-3 text-sm text-muted">{f.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(f._id)} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
