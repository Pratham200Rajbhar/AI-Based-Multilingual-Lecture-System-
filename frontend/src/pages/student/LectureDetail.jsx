import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lecturesAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Format seconds to MM:SS
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function StudentLectureDetail() {
  const { id } = useParams();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transcription, setTranscription] = useState(null);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [activeSegment, setActiveSegment] = useState(-1);
  const mediaRef = useRef(null);

  useEffect(() => {
    fetchLecture();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchLecture = async () => {
    try {
      const res = await lecturesAPI.getById(id);
      const lectureData = res.data.data || res.data.lecture || res.data;
      setLecture(lectureData);
      // Fetch transcription separately
      fetchTranscription();
    } catch (err) {
      toast.error('Failed to load lecture');
    } finally {
      setLoading(false);
    }
  };

  const fetchTranscription = async () => {
    setTranscriptionLoading(true);
    try {
      const res = await lecturesAPI.getTranscription(id);
      setTranscription(res.data.transcription || { status: 'none' });
    } catch (err) {
      // Transcription not available — that's ok
      setTranscription({ status: 'none' });
    } finally {
      setTranscriptionLoading(false);
    }
  };

  // Seek media to a specific timestamp when clicking a transcript segment
  const seekTo = (time) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      mediaRef.current.play();
    }
  };

  // Track active segment based on media playback
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !transcription?.segments?.length) return;

    const handleTimeUpdate = () => {
      const currentTime = media.currentTime;
      const idx = transcription.segments.findIndex(
        (seg, i) => currentTime >= seg.start && (i === transcription.segments.length - 1 || currentTime < transcription.segments[i + 1].start)
      );
      setActiveSegment(idx);
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    return () => media.removeEventListener('timeupdate', handleTimeUpdate);
  }, [transcription]);

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
          <video ref={mediaRef} controls className="w-full max-h-[500px] bg-black">
            <source src={fileUrl} />
            Your browser does not support video playback.
          </video>
        ) : isPdf ? (
          <div className="w-full h-[600px]">
            <iframe src={fileUrl} className="w-full h-full" title={lecture.title} />
          </div>
        ) : isAudio ? (
          <div className="p-8 flex justify-center bg-gradient-to-br from-blue-500 to-blue-700">
            <audio ref={mediaRef} controls className="w-full max-w-lg">
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

      {/* Transcription Section */}
      {(isVideo || isAudio) && (
        <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-border cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowTranscript(prev => !prev)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📝</span>
              <h3 className="font-semibold text-heading">Transcript</h3>
              {transcription?.status === 'completed' && transcription.duration > 0 && (
                <span className="text-xs text-muted bg-gray-100 px-2 py-0.5 rounded-full">
                  {formatTime(transcription.duration)} duration
                </span>
              )}
              {transcription?.status === 'processing' && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                  Processing...
                </span>
              )}
              {transcription?.status === 'completed' && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Available
                </span>
              )}
              {transcription?.status === 'failed' && (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  Unavailable
                </span>
              )}
            </div>
            <span className={`text-muted transition-transform ${showTranscript ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>

          {showTranscript && (
            <div className="p-6">
              {transcriptionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-muted">Loading transcript...</span>
                </div>
              ) : transcription?.status === 'completed' && transcription.text ? (
                <div className="space-y-4">
                  {/* Full transcript text */}
                  {transcription.segments && transcription.segments.length > 0 ? (
                    <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
                      {transcription.segments.map((seg, idx) => (
                        <div
                          key={idx}
                          onClick={() => seekTo(seg.start)}
                          className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${
                            activeSegment === idx
                              ? 'bg-blue-50 border-l-4 border-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded shrink-0 group-hover:bg-blue-100 h-fit">
                            {formatTime(seg.start)}
                          </span>
                          <p className="text-sm text-body leading-relaxed">{seg.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-body whitespace-pre-wrap leading-relaxed">{transcription.text}</p>
                    </div>
                  )}

                  {/* Language info */}
                  {transcription.language && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <span className="text-xs text-muted">Language: <span className="font-medium">{transcription.language.toUpperCase()}</span></span>
                    </div>
                  )}
                </div>
              ) : transcription?.status === 'processing' ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="animate-pulse flex items-center gap-2 text-amber-600">
                    <span className="text-2xl">🎙️</span>
                    <span className="font-medium">Transcription in progress...</span>
                  </div>
                  <p className="text-sm text-muted mt-2">
                    The AI is transcribing this lecture. Please check back in a few minutes.
                  </p>
                </div>
              ) : transcription?.status === 'failed' ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-sm text-red-600 mt-2 font-medium">Transcription could not be generated</p>
                  <p className="text-xs text-muted mt-1">{transcription.error || 'An error occurred during processing'}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-2xl">📄</span>
                  <p className="text-sm text-muted mt-2">No transcript available for this lecture</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
