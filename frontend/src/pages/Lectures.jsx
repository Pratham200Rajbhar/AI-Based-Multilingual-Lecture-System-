import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lecturesAPI, coursesAPI } from '../services/api';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import {
  HiMagnifyingGlass, HiDocumentText, HiVideoCamera,
  HiDocument, HiBookOpen, HiCloudArrowUp, HiXMark, HiTrash,
  HiArrowTopRightOnSquare, HiFunnel
} from 'react-icons/hi2';

export default function Lectures() {
  const { canManageContent } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', course: '', semester: '', file: null });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchLectures(); }, [courseFilter, page]);
  useEffect(() => { fetchCourses(); }, []);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (courseFilter) params.course = courseFilter;
      if (search) params.search = search;
      const res = await lecturesAPI.getAll(params);
      setLectures(res.data.lectures || res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try { const res = await coursesAPI.getAll(); setCourses(res.data.courses); }
    catch (error) { console.error(error); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchLectures(); };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('Please select a file');
    if (!uploadForm.course) return toast.error('Please select a course');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('course', uploadForm.course);
      if (uploadForm.semester) formData.append('semester', uploadForm.semester);
      formData.append('file', uploadForm.file);
      await lecturesAPI.create(formData);
      toast.success('Lecture uploaded!');
      setShowUpload(false);
      setUploadForm({ title: '', description: '', course: '', semester: '', file: null });
      fetchLectures();
    } catch (error) { toast.error(error.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lecture?')) return;
    try { await lecturesAPI.delete(id); toast.success('Deleted'); fetchLectures(); }
    catch { toast.error('Delete failed'); }
  };

  const fileIcon = (type) => {
    if (type === 'pdf') return <HiDocumentText className="h-5 w-5 text-red-500" />;
    if (type === 'video') return <HiVideoCamera className="h-5 w-5 text-blue-500" />;
    return <HiDocument className="h-5 w-5 text-gray-400" />;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner h-10 w-10"></div></div>;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lectures</h1>
          <p className="text-sm text-gray-500">{lectures.length} available</p>
        </div>
        {canManageContent() && (
          <button onClick={() => setShowUpload(!showUpload)} className={showUpload ? 'btn-secondary' : 'btn-primary'}>
            {showUpload ? <><HiXMark className="h-4 w-4" /> Cancel</> : <><HiCloudArrowUp className="h-4 w-4" /> Upload</>}
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="card p-5 animate-slide-up">
          <h2 className="font-semibold text-gray-900 mb-4">Upload New Lecture</h2>
          <form onSubmit={handleUpload} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  required className="input-field" placeholder="Lecture title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select value={uploadForm.course}
                  onChange={(e) => setUploadForm({ ...uploadForm, course: e.target.value })}
                  required className="input-field">
                  <option value="">Select Course</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                rows={2} className="input-field" placeholder="Brief description..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input type="number" min="1" max="12" value={uploadForm.semester}
                  onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
                  className="input-field" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input type="file"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  accept=".pdf,.mp4,.webm,.doc,.docx,.ppt,.pptx"
                  className="input-field file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading ? <><span className="spinner h-4 w-4"></span> Uploading...</> : 'Upload'}
              </button>
              <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lectures..." className="input-field pl-9" />
          </div>
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>
        <div className="relative">
          <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}
            className="input-field pl-9 min-w-[160px]">
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {lectures.length === 0 ? (
        <div className="text-center py-12">
          <HiBookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No lectures found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lectures.map((lecture) => (
            <div key={lecture._id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${
                  lecture.fileType === 'pdf' ? 'bg-red-50' : lecture.fileType === 'video' ? 'bg-blue-50' : 'bg-gray-50'
                }`}>{fileIcon(lecture.fileType)}</div>
                <span className="badge bg-gray-100 text-gray-500 text-[10px] uppercase">{lecture.fileType}</span>
              </div>
              <Link to={`/lectures/${lecture._id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-1">{lecture.title}</h3>
              </Link>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{lecture.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span className="font-medium text-gray-500">{lecture.course?.name}</span>
                <span>{new Date(lecture.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">By {lecture.uploadedBy?.name}</span>
                <div className="flex items-center gap-1">
                  <Link to={`/lectures/${lecture._id}`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md" title="View">
                    <HiArrowTopRightOnSquare className="h-4 w-4" />
                  </Link>
                  {canManageContent() && (
                    <button onClick={() => handleDelete(lecture._id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md" title="Delete">
                      <HiTrash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
