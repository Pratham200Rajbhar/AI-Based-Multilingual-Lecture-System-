import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { timetableAPI, coursesAPI } from '../services/api';
import { HiPlus, HiTrash, HiPencil } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 10 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);

export default function Timetable() {
  const { canManageContent } = useAuth();
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', room: '' });

  useEffect(() => {
    loadTimetable();
    if (canManageContent()) loadCourses();
  }, []);

  const loadTimetable = async () => {
    try {
      const res = await timetableAPI.getAll();
      setEntries(res.data.timetable || {});
    } catch { toast.error('Failed to load timetable'); }
    finally { setLoading(false); }
  };

  const loadCourses = async () => {
    try {
      const res = await coursesAPI.getAll({ limit: 100 });
      setCourses(res.data.data || res.data.courses || []);
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await timetableAPI.create(form);
      toast.success('Entry added');
      setShowForm(false);
      setForm({ course: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', room: '' });
      loadTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create entry');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await timetableAPI.delete(id);
      toast.success('Deleted');
      loadTimetable();
    } catch { toast.error('Failed to delete'); }
  };

  const getEntriesForSlot = (day, hour) => {
    const dayEntries = entries[day] || [];
    return dayEntries.filter(e => {
      const start = parseInt(e.startTime?.split(':')[0]);
      const end = parseInt(e.endTime?.split(':')[0]);
      const h = parseInt(hour);
      return h >= start && h < end;
    });
  };

  const isStartSlot = (day, hour, entry) => {
    return entry.startTime?.startsWith(hour);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="spinner h-8 w-8"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Timetable</h1>
        {canManageContent() && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <HiPlus className="h-4 w-4" /> Add Entry
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-4 mb-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select value={form.course} onChange={e => setForm({...form, course: e.target.value})} className="input-field" required>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select value={form.dayOfWeek} onChange={e => setForm({...form, dayOfWeek: e.target.value})} className="input-field">
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="input-field" required />
            <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="input-field" required />
            <input placeholder="Room" value={form.room} onChange={e => setForm({...form, room: e.target.value})} className="input-field" required />
            <div className="md:col-span-5">
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-2 w-20 text-sm font-medium text-gray-500">Time</th>
              {DAYS.map(d => <th key={d} className="border p-2 text-sm font-medium text-gray-700">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td className="border p-2 text-xs text-gray-500 text-center font-mono">{hour}</td>
                {DAYS.map(day => {
                  const slotEntries = getEntriesForSlot(day, hour);
                  return (
                    <td key={day} className="border p-1 align-top h-14">
                      {slotEntries.filter(e => isStartSlot(day, hour, e)).map(entry => (
                        <div key={entry._id} className="bg-blue-50 border border-blue-200 rounded p-1.5 text-xs mb-1 group relative">
                          <p className="font-medium text-blue-800 truncate">{entry.course?.name || 'Course'}</p>
                          <p className="text-gray-500">{entry.startTime} - {entry.endTime}</p>
                          <p className="text-gray-400">{entry.room}</p>
                          {canManageContent() && (
                            <button onClick={() => handleDelete(entry._id)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition">
                              <HiTrash className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
