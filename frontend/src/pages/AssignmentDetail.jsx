import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentsAPI } from '../services/api';
import { HiPaperClip, HiArrowUpTray } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user, canManageContent } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [grading, setGrading] = useState({});

  useEffect(() => {
    loadAssignment();
    if (canManageContent()) loadSubmissions();
  }, [id]);

  const loadAssignment = async () => {
    try {
      const res = await assignmentsAPI.getById(id);
      setAssignment(res.data.assignment);
    } catch (err) {
      toast.error('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const res = await assignmentsAPI.getSubmissions(id);
      setSubmissions(res.data.submissions || []);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files) return toast.error('Please select files');
    setSubmitting(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('files', f));
      const res = await assignmentsAPI.submit(id, formData);
      toast.success(res.data.isLate ? 'Submitted (late submission)' : 'Submitted successfully');
      loadAssignment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrade = async (submissionId) => {
    const { marks, feedback } = grading[submissionId] || {};
    if (marks === undefined) return toast.error('Enter marks');
    try {
      await assignmentsAPI.gradeSubmission(id, submissionId, { marks: parseInt(marks), feedback: feedback || '' });
      toast.success('Graded successfully');
      loadSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grade');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="spinner h-8 w-8"></div></div>;
  if (!assignment) return <p className="text-center text-gray-500 py-12">Assignment not found</p>;

  const mySubmission = assignment.submissions?.[0];
  const isOverdue = new Date() > new Date(assignment.dueDate);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">{assignment.title}</h1>
            <p className="text-sm text-gray-500">{assignment.course?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Max Marks: {assignment.maxMarks}</p>
            <p className={`text-sm ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
              {isOverdue && ' (Overdue)'}
            </p>
          </div>
        </div>
        {assignment.description && <p className="text-gray-700 mb-4">{assignment.description}</p>}
        {assignment.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {assignment.attachments.map((a, i) => (
              <a key={i} href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="badge bg-gray-100 text-gray-700 hover:bg-gray-200">
                <HiPaperClip className="h-3.5 w-3.5" /> {a.fileName}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Student submission form */}
      {user?.role === 'student' && !mySubmission && (
        <div className="card p-6 mb-6">
          <h2 className="font-medium mb-4">Submit Assignment</h2>
          <form onSubmit={handleSubmit}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
              <HiArrowUpTray className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <input type="file" multiple onChange={e => setFiles(e.target.files)} className="input-field" />
              <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX, images accepted</p>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </form>
        </div>
      )}

      {/* Student's submission */}
      {mySubmission && user?.role === 'student' && (
        <div className="card p-6 mb-6">
          <h2 className="font-medium mb-3">Your Submission</h2>
          <div className="flex items-center gap-3 mb-3">
            <span className={`badge ${mySubmission.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {mySubmission.status}
            </span>
            {mySubmission.isLate && <span className="badge bg-yellow-100 text-yellow-700">Late</span>}
            <span className="text-sm text-gray-500">Submitted: {new Date(mySubmission.submittedAt).toLocaleString()}</span>
          </div>
          {mySubmission.status === 'graded' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-lg font-bold mb-1">{mySubmission.marks}/{assignment.maxMarks}</p>
              {mySubmission.feedback && <p className="text-sm text-gray-700">{mySubmission.feedback}</p>}
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {mySubmission.files?.map((f, i) => (
              <a key={i} href={f.fileUrl} target="_blank" rel="noopener noreferrer" className="badge bg-gray-100 text-gray-700 hover:bg-gray-200">
                <HiPaperClip className="h-3 w-3" /> {f.fileName}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Professor grading view */}
      {canManageContent() && submissions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b"><h2 className="font-medium">Submissions ({submissions.length})</h2></div>
          <table className="table-clean">
            <thead>
              <tr>
                <th>Student</th>
                <th>Submitted</th>
                <th>Late</th>
                <th>Files</th>
                <th>Marks</th>
                <th>Feedback</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s._id}>
                  <td className="font-medium">{s.student?.name}</td>
                  <td className="text-sm text-gray-500">{new Date(s.submittedAt).toLocaleString()}</td>
                  <td>{s.isLate ? <span className="badge bg-yellow-100 text-yellow-700">Late</span> : '-'}</td>
                  <td>
                    {s.files?.map((f, i) => (
                      <a key={i} href={f.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline block">
                        {f.fileName}
                      </a>
                    ))}
                  </td>
                  <td>
                    {s.status === 'graded' ? (
                      <span className="font-medium">{s.marks}/{assignment.maxMarks}</span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={assignment.maxMarks}
                        value={grading[s._id]?.marks ?? ''}
                        onChange={e => setGrading({...grading, [s._id]: {...grading[s._id], marks: e.target.value}})}
                        className="input-field w-20"
                        placeholder="0"
                      />
                    )}
                  </td>
                  <td>
                    {s.status === 'graded' ? (
                      <span className="text-sm text-gray-500">{s.feedback || '-'}</span>
                    ) : (
                      <input
                        value={grading[s._id]?.feedback ?? ''}
                        onChange={e => setGrading({...grading, [s._id]: {...grading[s._id], feedback: e.target.value}})}
                        className="input-field w-32"
                        placeholder="Feedback"
                      />
                    )}
                  </td>
                  <td>
                    {s.status !== 'graded' && (
                      <button onClick={() => handleGrade(s._id)} className="btn-primary text-xs py-1">Grade</button>
                    )}
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
