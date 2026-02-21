import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function InstDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const res = await adminAPI.getDepartments();
      setDepartments(res.data.data || res.data || []);
    } catch (err) { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await adminAPI.updateDepartment(editingDept._id, form);
        toast.success('Department updated');
      } else {
        await adminAPI.createDepartment(form);
        toast.success('Department created');
      }
      resetForm();
      fetchDepartments();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await adminAPI.deleteDepartment(id);
      toast.success('Department deleted');
      fetchDepartments();
    } catch (err) { toast.error('Failed to delete department'); }
  };

  const resetForm = () => {
    setForm({ name: '', code: '', description: '' });
    setEditingDept(null);
    setShowForm(false);
  };

  const startEdit = (dept) => {
    setEditingDept(dept);
    setForm({ name: dept.name, code: dept.code || '', description: dept.description || '' });
    setShowForm(true);
  };

  const filtered = departments.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-heading">Departments</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary px-4 py-2 rounded-btn text-sm">
          {showForm ? 'Cancel' : '+ Add Department'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-card shadow-card border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-heading">{editingDept ? 'Edit' : 'New'} Department</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="form-input w-full" placeholder="e.g., CS, MATH" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="form-input w-full" rows={3} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary px-4 py-2 rounded-btn text-sm">{editingDept ? 'Update' : 'Create'}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border border-border rounded-btn text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      <div>
        <input type="text" placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} className="form-input w-full max-w-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted">No departments found</div>
        ) : (
          filtered.map(dept => (
            <div key={dept._id} className="bg-surface rounded-card shadow-card border border-border p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-heading">{dept.name}</h3>
                  {dept.code && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">{dept.code}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(dept)} className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1">Edit</button>
                  <button onClick={() => handleDelete(dept._id)} className="text-red-600 hover:text-red-800 text-sm px-2 py-1">Delete</button>
                </div>
              </div>
              {dept.description && <p className="text-sm text-muted mt-2">{dept.description}</p>}
              <div className="mt-3 pt-3 border-t border-border text-sm text-muted">
                <span>{dept.courses?.length || 0} courses</span>
                <span className="mx-2">•</span>
                <span>{dept.faculty?.length || dept.professors?.length || 0} faculty</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
