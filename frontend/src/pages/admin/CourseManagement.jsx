import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiPlus, HiPencil, HiTrash, HiXMark,
  HiAcademicCap, HiBuildingLibrary, HiBuildingOffice2
} from 'react-icons/hi2';

export default function CourseManagement() {
  const [activeTab, setActiveTab] = useState('courses');
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [instRes, deptRes, courseRes] = await Promise.all([
        adminAPI.getInstitutions(), adminAPI.getDepartments(), adminAPI.getCourses()
      ]);
      setInstitutions(instRes.data.institutions);
      setDepartments(deptRes.data.departments);
      setCourses(courseRes.data.courses);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'institution') {
      setForm(item ? { name: item.name, code: item.code, address: item.address || '' } : { name: '', code: '', address: '' });
    } else if (type === 'department') {
      setForm(item ? { name: item.name, code: item.code || '', institution: item.institution?._id || '' } : { name: '', code: '', institution: '' });
    } else {
      setForm(item ? { name: item.name, code: item.code, department: item.department?._id || '', semester: item.semester || '' } : { name: '', code: '', department: '', semester: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'institution') {
        editingItem ? await adminAPI.updateInstitution(editingItem._id, form) : await adminAPI.createInstitution(form);
      } else if (modalType === 'department') {
        editingItem ? await adminAPI.updateDepartment(editingItem._id, form) : await adminAPI.createDepartment(form);
      } else {
        const data = { ...form, semester: form.semester ? parseInt(form.semester) : undefined };
        editingItem ? await adminAPI.updateCourse(editingItem._id, data) : await adminAPI.createCourse(data);
      }
      toast.success(`${modalType} ${editingItem ? 'updated' : 'created'} successfully`);
      setShowModal(false); fetchAll();
    } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      if (type === 'institution') await adminAPI.deleteInstitution(id);
      else if (type === 'department') await adminAPI.deleteDepartment(id);
      else await adminAPI.deleteCourse(id);
      toast.success(`${type} deleted`); fetchAll();
    } catch (error) { toast.error('Delete failed'); }
  };

  const tabs = [
    { id: 'courses', label: 'Courses', count: courses.length, icon: HiAcademicCap },
    { id: 'departments', label: 'Departments', count: departments.length, icon: HiBuildingOffice2 },
    { id: 'institutions', label: 'Institutions', count: institutions.length, icon: HiBuildingLibrary }
  ];

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner h-10 w-10"></div></div>;

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Course Management</h1>
        <p className="text-sm text-gray-500">Manage institutions, departments & courses</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 max-w-lg">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-blue-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}>
            <tab.icon className="h-4 w-4" />
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'institutions' && (
        <TableSection
          addLabel="Add Institution" onAdd={() => openModal('institution')}
          columns={['Name', 'Code', 'Address', 'Actions']} emptyText="No institutions yet"
          rows={institutions.map(inst => ({
            key: inst._id,
            cells: [
              <span className="font-medium text-gray-900">{inst.name}</span>,
              inst.code, inst.address || '-',
              <ActionButtons onEdit={() => openModal('institution', inst)} onDelete={() => handleDelete('institution', inst._id)} />
            ]
          }))}
        />
      )}

      {activeTab === 'departments' && (
        <TableSection
          addLabel="Add Department" onAdd={() => openModal('department')}
          columns={['Name', 'Code', 'Institution', 'Actions']} emptyText="No departments yet"
          rows={departments.map(dept => ({
            key: dept._id,
            cells: [
              <span className="font-medium text-gray-900">{dept.name}</span>,
              dept.code || '-', dept.institution?.name || '-',
              <ActionButtons onEdit={() => openModal('department', dept)} onDelete={() => handleDelete('department', dept._id)} />
            ]
          }))}
        />
      )}

      {activeTab === 'courses' && (
        <TableSection
          addLabel="Add Course" onAdd={() => openModal('course')}
          columns={['Name', 'Code', 'Department', 'Semester', 'Actions']} emptyText="No courses yet"
          rows={courses.map(course => ({
            key: course._id,
            cells: [
              <span className="font-medium text-gray-900">{course.name}</span>,
              course.code, course.department?.name || '-', course.semester || '-',
              <ActionButtons onEdit={() => openModal('course', course)} onDelete={() => handleDelete('course', course._id)} />
            ]
          }))}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 capitalize">
                {editingItem ? 'Edit' : 'Add'} {modalType}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input type="text" value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="input-field" placeholder="e.g. CS, MATH" />
              </div>

              {modalType === 'institution' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={form.address || ''}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
                </div>
              )}

              {modalType === 'department' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <select value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    required className="input-field">
                    <option value="">Select Institution</option>
                    {institutions.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                  </select>
                </div>
              )}

              {modalType === 'course' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      required className="input-field">
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <input type="number" min="1" max="12" value={form.semester}
                      onChange={(e) => setForm({ ...form, semester: e.target.value })} className="input-field" />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editingItem ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={onEdit} className="p-1 text-blue-600 hover:bg-blue-50 rounded-md" title="Edit">
        <HiPencil className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="p-1 text-red-500 hover:bg-red-50 rounded-md" title="Delete">
        <HiTrash className="h-4 w-4" />
      </button>
    </div>
  );
}

function TableSection({ addLabel, onAdd, columns, rows, emptyText }) {
  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={onAdd} className="btn-primary">
          <HiPlus className="h-4 w-4" /> {addLabel}
        </button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-clean">
            <thead>
              <tr>{columns.map(col => <th key={col}>{col}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key}>
                  {row.cells.map((cell, i) => <td key={i} className="text-gray-500">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400">{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
