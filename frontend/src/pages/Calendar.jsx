import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../services/api';
import { HiPlus, HiCalendarDays, HiTrash } from 'react-icons/hi2';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const EVENT_COLORS = {
  exam: 'bg-red-100 text-red-700 border-red-300',
  holiday: 'bg-green-100 text-green-700 border-green-300',
  event: 'bg-blue-100 text-blue-700 border-blue-300',
  deadline: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  meeting: 'bg-purple-100 text-purple-700 border-purple-300',
};

export default function Calendar() {
  const { canManageContent } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'event', startDate: '', endDate: '', isAllDay: true });

  useEffect(() => { load(); }, [currentMonth]);

  const load = async () => {
    setLoading(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0).toISOString();
    try {
      const res = await eventsAPI.getAll({ startDate: start, endDate: end });
      setEvents(res.data.events || res.data.data || []);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await eventsAPI.create({ ...form, endDate: form.endDate || form.startDate });
      toast.success('Event created');
      setShowForm(false);
      setForm({ title: '', description: '', type: 'event', startDate: '', endDate: '', isAllDay: true });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete event?')) return;
    try { await eventsAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  // Calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);
  while (calDays.length % 7 !== 0) calDays.push(null);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const date = new Date(year, month, day);
    return events.filter(e => {
      const start = new Date(e.startDate);
      const end = e.endDate ? new Date(e.endDate) : start;
      return date >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             date <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  };

  const isToday = (day) => day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Academic Calendar</h1>
        {canManageContent() && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <HiPlus className="h-4 w-4" /> Add Event
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-4 mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Event Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                <option value="event">Event</option>
                <option value="exam">Exam</option>
                <option value="holiday">Holiday</option>
                <option value="deadline">Deadline</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
            <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={2} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input-field" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Create Event</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Month navigation */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <button onClick={prevMonth} className="btn-secondary text-sm">&larr; Prev</button>
          <h2 className="font-semibold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="btn-secondary text-sm">Next &rarr;</button>
        </div>

        <div className="grid grid-cols-7">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-2 text-center text-xs font-medium text-gray-500 border-b bg-gray-50">{d}</div>
          ))}
          {calDays.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div key={i} className={`min-h-[90px] border-b border-r p-1 ${!day ? 'bg-gray-50' : ''} ${isToday(day) ? 'bg-blue-50' : ''}`}>
                {day && (
                  <>
                    <span className={`text-xs font-medium ${isToday(day) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-600'}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev._id} className={`text-xs px-1.5 py-0.5 rounded truncate cursor-default group relative ${EVENT_COLORS[ev.type] || EVENT_COLORS.event}`}>
                          {ev.title}
                          {canManageContent() && (
                            <button onClick={() => handleDelete(ev._id)} className="absolute right-0.5 top-0.5 opacity-0 group-hover:opacity-100">
                              <HiTrash className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <span className="text-xs text-gray-400 px-1">+{dayEvents.length - 3} more</span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming events list */}
      <div className="mt-6">
        <h2 className="font-medium mb-3">This Month's Events</h2>
        {events.length === 0 ? (
          <EmptyState icon={HiCalendarDays} title="No events" description="No events scheduled this month" />
        ) : (
          <div className="space-y-2">
            {events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).map(e => (
              <div key={e._id} className="card p-3 flex items-center gap-3">
                <span className={`badge text-xs ${EVENT_COLORS[e.type]}`}>{e.type}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(e.startDate).toLocaleDateString()}
                    {e.endDate && e.endDate !== e.startDate && ` — ${new Date(e.endDate).toLocaleDateString()}`}
                  </p>
                </div>
                {canManageContent() && (
                  <button onClick={() => handleDelete(e._id)} className="text-gray-400 hover:text-red-600">
                    <HiTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
