import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lecturesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentLectureDetail() {
  const { id } = useParams();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLecture();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchLecture = async () => {
    try {
      const res = await lecturesAPI.getById(id);
      setLecture(res.data.data || res.data.lecture || res.data);
    } catch (err) {
      toast.error('Failed to load lecture');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-lg">Lecture not found</p>
        <Link to="/student/lectures" className="text-blue-600 hover:underline mt-2 inline-block">Back to Lectures</Link>
      </div>
    );
  }

  const fileUrl = lecture.fileUrl || lecture.file;
  const isVideo = fileUrl && /\.(mp4|webm|ogg)$/i.test(fileUrl);
  const isPdf = fileUrl && /\.pdf$/i.test(fileUrl);
  const isAudio = fileUrl && /\.(mp3|wav|ogg|m4a)$/i.test(fileUrl);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/student/lectures" className="hover:text-blue-600">Lectures</Link>
        <span>/</span>
        <span className="text-heading">{lecture.title}</span>
      </div>

      {/* Media Player */}
      <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
        {isVideo ? (
          <video controls className="w-full max-h-[500px] bg-black">
            <source src={fileUrl} />
            Your browser does not support video playback.
          </video>
        ) : isPdf ? (
          <div className="w-full h-[600px]">
            <iframe src={fileUrl} className="w-full h-full" title={lecture.title} />
          </div>
        ) : isAudio ? (
          <div className="p-8 flex justify-center bg-gradient-to-br from-blue-500 to-blue-700">
            <audio controls className="w-full max-w-lg">
              <source src={fileUrl} />
            </audio>
          </div>
        ) : fileUrl ? (
          <div className="p-8 text-center bg-gray-50">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">
              Download File
            </a>
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-white text-6xl">🎬</span>
          </div>
        )}
      </div>

      {/* Lecture Info */}
      <div className="bg-surface rounded-card shadow-card border border-border p-6">
        <h1 className="text-2xl font-bold text-heading">{lecture.title}</h1>
        <div className="flex flex-wrap gap-3 mt-3">
          {lecture.course?.name && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{lecture.course.name}</span>
          )}
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
            {new Date(lecture.createdAt).toLocaleDateString()}
          </span>
          {lecture.professor?.name && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              By {lecture.professor.name}
            </span>
          )}
        </div>
        {lecture.description && (
          <div className="mt-4 text-body">
            <h3 className="font-semibold text-heading mb-2">Description</h3>
            <p className="whitespace-pre-wrap">{lecture.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
