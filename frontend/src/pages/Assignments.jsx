import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentsAPI, coursesAPI } from '../services/api';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { CardSkeleton } from '../components/Skeletons';
import { HiCalendar, HiDocumentText, HiPlusCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Assignments() {
  const { canManageContent } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ course: '', search: '', status: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course: '', dueDate: '', maxMarks: 100 });
  const [files, setFiles] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [page, filters]);

  const loadCourses = async () => {
    try {
      const res = await coursesAPI.getAll({ limit: 100 });
      setCourses(res.data.courses);
    } catch {}
  };

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await assignmentsAPI.getAll({ page, limit: 20, ...filters });
      setAssignments(res.data.assignments);
      setPagination(res.data);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (files) {
        Array.from(files).forEach(f => formData.append('files', f));
      }
      await assignmentsAPI.create(formData);
      toast.success('Assignment created');
      setShowCreate(false);
      setForm({ title: '', description: '', course: '', dueDate: '', maxMarks: 100 });
      loadAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Assignments</h1>
        {canManageContent() && (
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            <HiPlusCircle className="h-4 w-4" /> New Assignment
          </button>
        )}
      </div>

      {showCreate && (
        <div className="card p-5 mb-6">
          <h2 className="font-medium mb-4">Create Assignment</h2>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
            <select value={form.course} onChange={e => setForm({...form, course: e.target.value})} className="input-field" required>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field md:col-span-2" rows={3} />
            <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="input-field" required />
            <input type="number" placeholder="Max Marks" value={form.maxMarks} onChange={e => setForm({...form, maxMarks: e.target.value})} className="input-field" min={1} required />
            <input type="file" multiple onChange={e => setFiles(e.target.files)} className="input-field md:col-span-2" />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Creating...' : 'Create'}</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchBar onSearch={(q) => { setFilters({...filters, search: q}); setPage(1); }} placeholder="Search assignments..." />
        </div>
        <select value={filters.course} onChange={e => { setFilters({...filters, course: e.target.value}); setPage(1); }} className="input-field w-auto">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={filters.status} onChange={e => { setFilters({...filters, status: e.target.value}); setPage(1); }} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="graded">Graded</option>
        </select>
      </div>

      {loading ? <CardSkeleton count={6} /> : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map(a => (
              <Link key={a._id} to={`/assignments/${a._id}`} className="card p-5 hover:shadow-md transition-shadow">
                <h3 className="font-medium mb-1 truncate">{a.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{a.course?.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <HiCalendar className="h-3.5 w-3.5" />
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                  {a.isOverdue && <span className="text-red-500 font-medium">Overdue</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{a.maxMarks} marks</span>
                  {a.mySubmission ? (
                    <span className={`badge ${a.mySubmission.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {a.mySubmission.status === 'graded' ? `${a.mySubmission.marks}/${a.maxMarks}` : 'Submitted'}
                    </span>
                  ) : canManageContent() ? (
                    <span className="badge bg-gray-100 text-gray-600">{a.submissionCount} submissions</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
          {assignments.length === 0 && <p className="text-center text-gray-500 py-8">No assignments found</p>}
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} totalItems={pagination.totalItems} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
