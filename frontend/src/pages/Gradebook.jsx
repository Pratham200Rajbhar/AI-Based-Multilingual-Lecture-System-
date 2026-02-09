import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gradebookAPI, coursesAPI } from '../services/api';
import { HiAcademicCap, HiPlus } from 'react-icons/hi2';
import { StatSkeleton } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function Gradebook() {
  const { user, canManageContent, isStudent } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [gradebook, setGradebook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [components, setComponents] = useState([{ name: '', weightage: 0, maxMarks: 100 }]);
  const [gradeForm, setGradeForm] = useState({ studentId: '', componentName: '', marksObtained: '' });

  useEffect(() => {
    coursesAPI.getAll({ limit: 100 }).then(res => {
      const c = res.data.data || res.data.courses || [];
      setCourses(c);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCourse) loadGradebook();
  }, [selectedCourse]);

  const loadGradebook = async () => {
    setLoading(true);
    try {
      const res = await gradebookAPI.getCourse(selectedCourse);
      setGradebook(res.data.gradebook || res.data);
    } catch {
      setGradebook(null);
    } finally { setLoading(false); }
  };

  const handleSetComponents = async (e) => {
    e.preventDefault();
    const total = components.reduce((s, c) => s + Number(c.weightage), 0);
    if (total !== 100) return toast.error(`Weightages must total 100% (currently ${total}%)`);
    try {
      await gradebookAPI.setComponents(selectedCourse, { components });
      toast.success('Components saved');
      setShowComponentForm(false);
      loadGradebook();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleEnterGrade = async (e) => {
    e.preventDefault();
    try {
      await gradebookAPI.enterGrades(selectedCourse, {
        grades: [{ student: gradeForm.studentId, componentName: gradeForm.componentName, marksObtained: Number(gradeForm.marksObtained) }]
      });
      toast.success('Grade entered');
      setGradeForm({ studentId: '', componentName: '', marksObtained: '' });
      loadGradebook();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const addComponent = () => setComponents([...components, { name: '', weightage: 0, maxMarks: 100 }]);
  const removeComponent = (i) => setComponents(components.filter((_, idx) => idx !== i));
  const updateComponent = (i, field, value) => {
    const updated = [...components];
    updated[i] = { ...updated[i], [field]: field === 'name' ? value : Number(value) };
    setComponents(updated);
  };

  const gradeColor = (grade) => {
    if (!grade) return 'text-gray-500';
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    if (grade.startsWith('D')) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Gradebook</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input-field w-auto">
          <option value="">Select Course</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {canManageContent() && selectedCourse && (
          <button onClick={() => { setShowComponentForm(!showComponentForm); if (gradebook?.components) setComponents(gradebook.components); }}
            className="btn-secondary text-sm flex items-center gap-1">
            <HiPlus className="h-4 w-4" /> Set Components
          </button>
        )}
      </div>

      {/* Component Form */}
      {showComponentForm && (
        <div className="card p-4 mb-6">
          <h3 className="font-medium mb-3">Grade Components</h3>
          <form onSubmit={handleSetComponents}>
            {components.map((c, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <input placeholder="Component Name" value={c.name} onChange={e => updateComponent(i, 'name', e.target.value)} className="input-field flex-1" required />
                <input type="number" placeholder="Weight %" value={c.weightage} onChange={e => updateComponent(i, 'weightage', e.target.value)} className="input-field w-24" min={0} max={100} required />
                <input type="number" placeholder="Max Marks" value={c.maxMarks} onChange={e => updateComponent(i, 'maxMarks', e.target.value)} className="input-field w-24" min={1} required />
                {components.length > 1 && (
                  <button type="button" onClick={() => removeComponent(i)} className="text-red-500 text-sm">Remove</button>
                )}
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={addComponent} className="btn-secondary text-sm">+ Add Component</button>
              <button type="submit" className="btn-primary text-sm">Save Components</button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Total: {components.reduce((s, c) => s + Number(c.weightage), 0)}% (must be 100%)
            </p>
          </form>
        </div>
      )}

      {!selectedCourse ? (
        <EmptyState icon={HiAcademicCap} title="Select a course" description="Choose a course to view or manage grades" />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <StatSkeleton key={i} />)}</div>
      ) : !gradebook ? (
        <EmptyState icon={HiAcademicCap} title="No gradebook" description={canManageContent() ? "Set up grade components to get started" : "No grades available yet"} />
      ) : (
        <div>
          {/* Stats */}
          {gradebook.classStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold">{(gradebook.classStats.average || 0).toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Class Average</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{(gradebook.classStats.highest || 0).toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Highest</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{(gradebook.classStats.lowest || 0).toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Lowest</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold">{gradebook.students?.length || 0}</p>
                <p className="text-sm text-gray-500">Students</p>
              </div>
            </div>
          )}

          {/* Enter Grade form (professor) */}
          {canManageContent() && gradebook.components?.length > 0 && (
            <div className="card p-4 mb-6">
              <h3 className="font-medium mb-3">Enter Grade</h3>
              <form onSubmit={handleEnterGrade} className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs text-gray-500">Student ID</label>
                  <input value={gradeForm.studentId} onChange={e => setGradeForm({...gradeForm, studentId: e.target.value})} className="input-field" placeholder="Student ID" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Component</label>
                  <select value={gradeForm.componentName} onChange={e => setGradeForm({...gradeForm, componentName: e.target.value})} className="input-field" required>
                    <option value="">Select</option>
                    {gradebook.components.map(c => <option key={c.name} value={c.name}>{c.name} ({c.maxMarks})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Marks</label>
                  <input type="number" value={gradeForm.marksObtained} onChange={e => setGradeForm({...gradeForm, marksObtained: e.target.value})} className="input-field w-24" required />
                </div>
                <button type="submit" className="btn-primary">Save</button>
              </form>
            </div>
          )}

          {/* Grades table */}
          {gradebook.students?.length > 0 && (
            <div className="card overflow-x-auto">
              <table className="table-clean">
                <thead>
                  <tr>
                    <th>Student</th>
                    {gradebook.components?.map(c => (
                      <th key={c.name}>{c.name} ({c.weightage}%)</th>
                    ))}
                    <th>Weighted %</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {gradebook.students.map((s, i) => (
                    <tr key={i}>
                      <td className="font-medium">{s.name || s.student?.name || 'Student'}</td>
                      {gradebook.components?.map(c => {
                        const grade = s.grades?.find(g => g.componentName === c.name);
                        return <td key={c.name} className="text-sm">{grade ? `${grade.marksObtained}/${c.maxMarks}` : '-'}</td>;
                      })}
                      <td className="font-medium">{(s.weightedPercentage || 0).toFixed(1)}%</td>
                      <td className={`font-bold ${gradeColor(s.letterGrade)}`}>{s.letterGrade || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
