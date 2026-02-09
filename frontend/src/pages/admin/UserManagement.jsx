import { useState, useEffect } from 'react';
import { usersAPI, adminAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiMagnifyingGlass, HiXMark, HiUsers } from 'react-icons/hi2';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', institution: '', department: ''
  });

  useEffect(() => { fetchUsers(); }, [roleFilter, page]);
  useEffect(() => { fetchInstitutions(); fetchDepartments(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await usersAPI.getAll(params);
      setUsers(res.data.users || res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchInstitutions = async () => {
    try { const res = await adminAPI.getInstitutions(); setInstitutions(res.data.institutions); }
    catch (error) { console.error(error); }
  };

  const fetchDepartments = async () => {
    try { const res = await adminAPI.getDepartments(); setDepartments(res.data.departments); }
    catch (error) { console.error(error); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'student', institution: '', department: '' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role,
      institution: user.institution?._id || '', department: user.department?._id || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updates = { name: form.name, role: form.role };
        if (form.institution) updates.institution = form.institution;
        if (form.department) updates.department = form.department;
        await usersAPI.update(editingUser._id, updates);
        toast.success('User updated');
      } else {
        await usersAPI.create(form);
        toast.success('User created');
      }
      setShowModal(false); fetchUsers();
    } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await usersAPI.delete(id); toast.success('User deleted'); fetchUsers(); }
    catch (error) { toast.error(error.response?.data?.message || 'Delete failed'); }
  };

  const getRoleBadge = (role) => {
    const styles = {
      student: 'bg-blue-50 text-blue-600', professor: 'bg-green-50 text-green-600',
      dept_admin: 'bg-purple-50 text-purple-600', inst_admin: 'bg-amber-50 text-amber-600',
      super_admin: 'bg-red-50 text-red-600'
    };
    return <span className={`badge text-xs ${styles[role] || 'bg-gray-100 text-gray-500'}`}>{role.replace('_', ' ')}</span>;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner h-10 w-10"></div></div>;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">{users.length} users total</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <HiPlus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..." className="input-field pl-10" />
          </div>
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field min-w-[150px]">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="professor">Professor</option>
          <option value="dept_admin">Dept Admin</option>
          <option value="inst_admin">Inst Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Institution</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="font-medium text-gray-900">{user.name}</td>
                  <td className="text-gray-500">{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td className="text-gray-500">{user.institution?.name || '-'}</td>
                  <td className="text-gray-500">{user.department?.name || '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(user)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-md" title="Edit">
                        <HiPencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(user._id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-md" title="Delete">
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-10">
            <HiUsers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400">No users found</p>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-md">
                <HiXMark className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required disabled={!!editingUser}
                  className="input-field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editingUser} minLength={6} className="input-field" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-field">
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="dept_admin">Dept Admin</option>
                  <option value="inst_admin">Inst Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <select value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })} className="input-field">
                  <option value="">None</option>
                  {institutions.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field">
                  <option value="">None</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editingUser ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
