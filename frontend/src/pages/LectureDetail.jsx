import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lecturesAPI } from '../services/api';
import {
  HiArrowLeft, HiArrowDownTray, HiDocumentText, HiVideoCamera,
  HiDocument, HiCalendarDays, HiUser, HiAcademicCap, HiBookOpen
} from 'react-icons/hi2';

export default function LectureDetail() {
  const { id } = useParams();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLecture = async () => {
      try { const res = await lecturesAPI.getById(id); setLecture(res.data.lecture); }
      catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchLecture();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner h-10 w-10"></div></div>;

  if (!lecture) {
    return (
      <div className="text-center py-16">
        <HiBookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">Lecture not found</p>
      </div>
    );
  }

  const fileIcon = () => {
    if (lecture.fileType === 'pdf') return <HiDocumentText className="h-6 w-6 text-red-500" />;
    if (lecture.fileType === 'video') return <HiVideoCamera className="h-6 w-6 text-blue-500" />;
    return <HiDocument className="h-6 w-6 text-gray-400" />;
  };

  return (
    <div className="animate-fade-in max-w-4xl space-y-5">
      <Link to="/lectures" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 text-sm">
        <HiArrowLeft className="h-4 w-4" /> Back to Lectures
      </Link>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2.5 rounded-lg">{fileIcon()}</div>
            <div>
              <h1 className="text-xl font-bold text-white">{lecture.title}</h1>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-blue-200">
                <HiAcademicCap className="h-4 w-4" />
                <span>{lecture.course?.name} ({lecture.course?.code})</span>
                {lecture.semester && <span className="badge bg-white/20 text-white text-xs">Sem {lecture.semester}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {lecture.description && (
            <div className="mb-5">
              <h2 className="text-sm font-medium text-gray-700 mb-1">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{lecture.description}</p>
            </div>
          )}

          {/* Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Type', value: lecture.fileType, icon: <HiDocument className="h-4 w-4 text-blue-500" />, cap: true },
              { label: 'Uploaded By', value: lecture.uploadedBy?.name, icon: <HiUser className="h-4 w-4 text-green-500" /> },
              { label: 'Date', value: new Date(lecture.createdAt).toLocaleDateString(), icon: <HiCalendarDays className="h-4 w-4 text-amber-500" /> },
              { label: 'File', value: lecture.fileName || 'File', icon: <HiDocumentText className="h-4 w-4 text-gray-400" /> },
            ].map((cell) => (
              <div key={cell.label} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">{cell.icon}
                  <p className="text-[11px] font-medium text-gray-400 uppercase">{cell.label}</p>
                </div>
                <p className={`font-medium text-gray-900 text-sm truncate ${cell.cap ? 'capitalize' : ''}`}>{cell.value}</p>
              </div>
            ))}
          </div>

          {/* Preview */}
          {lecture.fileType === 'video' && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
              <video controls className="w-full" src={lecture.fileUrl}>Your browser does not support video.</video>
            </div>
          )}
          {lecture.fileType === 'pdf' && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
              <iframe src={lecture.fileUrl} className="w-full h-[600px]" title={lecture.title} />
            </div>
          )}

          <a href={lecture.fileUrl} download className="btn-primary inline-flex">
            <HiArrowDownTray className="h-4 w-4" /> Download File
          </a>
        </div>
      </div>
    </div>
  );
}
