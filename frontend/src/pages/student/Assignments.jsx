import { useState, useEffect } from 'react';
import { assignmentsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [aRes] = await Promise.allSettled([
        assignmentsAPI.getAll()
      ]);
      if (aRes.status === 'fulfilled') setAssignments(aRes.value.data.data || []);
    } catch (err) { toast.error('Failed to load assignments'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (assignmentId) => {
    try {
      const formData = new FormData();
      if (submissionText) formData.append('content', submissionText);
      if (submissionFile) formData.append('file', submissionFile);
      await assignmentsAPI.submit(assignmentId, formData);
      toast.success('Assignment submitted!');
      setSelectedAssignment(null);
      setSubmissionText('');
      setSubmissionFile(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
  };

  const getStatus = (a) => {
    if (a.submission) return a.submission.grade != null ? 'graded' : 'submitted';
    if (new Date(a.dueDate) < new Date()) return 'overdue';
    return 'pending';
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    submitted: 'bg-blue-100 text-blue-700',
    graded: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700'
  };

  const filtered = filter === 'all' ? assignments : assignments.filter(a => getStatus(a) === filter);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading">Assignments</h1>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'submitted', 'graded', 'overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-btn text-sm capitalize ${filter === f ? 'btn-primary' : 'border border-border hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {selectedAssignment && (
        <div className="bg-surface rounded-card shadow-card border border-border p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-heading">Submit: {selectedAssignment.title}</h2>
            <button onClick={() => setSelectedAssignment(null)} className="text-muted hover:text-heading">✕</button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Answer</label>
            <textarea value={submissionText} onChange={e => setSubmissionText(e.target.value)} className="form-input w-full" rows={4} placeholder="Type your answer..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Attach File (optional)</label>
            <input type="file" onChange={e => setSubmissionFile(e.target.files[0])} className="form-input w-full" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleSubmit(selectedAssignment._id)} className="btn-primary px-4 py-2 rounded-btn text-sm">Submit</button>
            <button onClick={() => setSelectedAssignment(null)} className="px-4 py-2 border border-border rounded-btn text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-surface rounded-card shadow-card border border-border p-12 text-center text-muted">No assignments found</div>
        ) : (
          filtered.map(a => {
            const status = getStatus(a);
            return (
              <div key={a._id} className="bg-surface rounded-card shadow-card border border-border p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-heading">{a.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[status]}`}>{status}</span>
                    </div>
                    <p className="text-sm text-muted mt-1">{a.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                      <span>Course: {a.course?.name || 'N/A'}</span>
                      <span>Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}</span>
                      {a.totalMarks && <span>Marks: {a.totalMarks}</span>}
                      {a.submission?.grade != null && <span className="text-green-600 font-medium">Grade: {a.submission.grade}/{a.totalMarks}</span>}
                    </div>
                  </div>
                  {status === 'pending' && (
                    <button onClick={() => setSelectedAssignment(a)} className="btn-primary px-3 py-1.5 rounded-btn text-sm">Submit</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
