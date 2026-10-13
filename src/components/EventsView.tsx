import React, { useState } from 'react';
import { Calendar, Plus, User, Clock, MapPin, Sparkles, X, ShieldAlert, CheckCircle, Tag } from 'lucide-react';
import { User as UserType } from '../types';

interface EventEntity {
  id: string;
  title: string;
  date: string;
  time: string;
  host: string;
  type: string;
  desc: string;
  category: string;
  attendees?: string[];
}

interface EventsViewProps {
  currentUser: UserType | null;
  events: EventEntity[];
  onEventCreate: (eventPayload: any) => Promise<boolean>;
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}

export default function EventsView({
  currentUser,
  events,
  onEventCreate,
  triggerToast
}: EventsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-06-18');
  const [time, setTime] = useState('14:00');
  const [host, setHost] = useState(currentUser?.name || '');
  const [type, setType] = useState('UK Webinar'); // 'UK Webinar' | 'AIUB Laboratory' | 'Hybrid Workshop'
  const [category, setCategory] = useState('Smart Factory');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar parameters for grid (Focus on June 2026)
  const daysInJune = 30;
  const juneStartDayOffset = 1; // June 1st, 2026 is Monday (offset 1)

  // Quick check if user is allowed to post events
  const canPost = currentUser && ['admin', 'super_admin', 'instructor'].includes(currentUser.role);

  // Group events by event calendar date
  const getEventsForDay = (day: number) => {
    const formattedQuery = `2026-06-${day.toString().padStart(2, '0')}`;
    return events.filter(ev => ev.date === formattedQuery);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      triggerToast("Please provide at least a title and date for the event session.", "warn");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { title, date, time, host, type, desc, category };
      const ok = await onEventCreate(payload);
      if (ok) {
        setModalOpen(false);
        setTitle('');
        setDesc('');
        triggerToast("Transnational Event successfully scheduled!");
      } else {
        triggerToast("Could not publish event. Please verify your data.", "warn");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Connection failed.", "warn");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left" id="events-calendar-page">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00aaff]/10 border border-[#00ddff]/30 rounded-full text-xs font-bold text-[#00ddff] font-mono uppercase">
            <Calendar className="w-3.5 h-3.5 animate-pulse text-blue-400" />
            <span>Interactive Laboratory Calendar</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            Transnational Symposiums & Live Labs
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
            Coordinated hybrid events spanning robotic system diagnostics, Siemens relay programming, and UK certification roundtables.
          </p>
        </div>

        {/* Call to action for Instructors & Admins */}
        {canPost ? (
          <button 
            onClick={() => {
              setHost(currentUser?.name || '');
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-xs font-bold font-sans tracking-wide text-white cursor-pointer shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all shrink-0"
            id="post-event-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Post Dynamic Session</span>
          </button>
        ) : (
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[11px] text-slate-400 max-w-xs flex gap-2 items-center font-mono leading-tight shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Logged in as <b>Student</b>? Access roles via the <b>User switcher</b> to simulate posting!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Month Grid: June 2026 */}
        <div className="lg:col-span-8 p-6 rounded-3xl border border-white/5 bg-slate-900/25 relative overflow-hidden space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              📅 June 2026
            </h3>
            <span className="text-xs text-[#00ddff] font-mono font-bold bg-[#00ddff]/10 p-1 px-3 rounded border border-[#00aaff]/15">
              DMA Active Semester
            </span>
          </div>

          {/* Month Grid Table */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono">
            
            {/* Weekdays */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => (
              <div key={w} className="text-[10px] text-slate-500 font-extrabold py-2 uppercase">{w}</div>
            ))}

            {/* Empty days offsets */}
            {Array.from({ length: juneStartDayOffset }).map((_, idx) => (
              <div key={`offset-${idx}`} className="aspect-square bg-transparent rounded-lg border border-transparent" />
            ))}

            {/* Practical days of the month */}
            {Array.from({ length: daysInJune }).map((_, idx) => {
              const dayNum = idx + 1;
              const matches = getEventsForDay(dayNum);
              const isToday = dayNum === 8; // Simulate June 8th, 2026 as current day

              return (
                <div 
                  key={`day-${dayNum}`}
                  className={`aspect-square p-1.5 rounded-xl border flex flex-col justify-between transition-colors min-h-[75px] md:min-h-[85px] text-left relative ${
                    isToday 
                      ? 'border-[#00aaff] bg-[#1d2d44]/35' 
                      : matches.length > 0
                        ? 'border-emerald-500/25 bg-emerald-500/5'
                        : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${
                    isToday ? 'text-[#00ddff]' : 'text-slate-400'
                  }`}>
                    {dayNum} {isToday && <span className="text-[8px] bg-sky-500/10 text-sky-400 p-0.5 rounded font-bold">TODAY</span>}
                  </span>

                  <div className="space-y-1">
                    {matches.map(m => (
                      <div 
                        key={m.id}
                        className="text-[8px] p-1 rounded bg-blue-650/40 text-blue-300 font-sans truncate font-bold uppercase tracking-tight border border-blue-500/10 cursor-pointer"
                        title={m.title}
                        onClick={() => triggerToast(`Clicked: ${m.title} on June ${dayNum}!`)}
                      >
                        {m.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Scheduled Event List */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-base font-extrabold text-[#fff] flex items-center gap-2">
            🚀 Upcoming Action Items
          </h3>

          <div className="space-y-4">
            {events.map((ev) => (
              <div 
                key={ev.id}
                className="p-5 rounded-2xl border border-white/5 bg-[#111827] space-y-3 hover:border-[#00ddff]/25 transition-all text-left group"
                id={`event-item-${ev.id}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-400/5 p-1 px-2.5 rounded border border-emerald-500/10">
                    <Tag className="w-3 h-3" />
                    {ev.category}
                  </span>
                  
                  <span className="text-[10px] rounded p-0.5 px-2 bg-blue-600/10 border border-blue-500/10 font-mono text-[#00ddff] font-extrabold shrink-0">
                    {ev.type}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white leading-snug group-hover:text-blue-400 transition-colors">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                    {ev.desc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 font-mono border-t border-white/5 pt-3">
                  <div className="flex items-center gap-1 text-[#00aaff] font-bold">
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    <span>{ev.time} UTC</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Hosted by <b>{ev.host}</b></span>
                  </div>
                  
                  <button
                    onClick={() => triggerToast("Successfully registered for this session! Watch your email inbox.")}
                    className="p-1.5 px-3 bg-[#111827] hover:bg-emerald-600 border border-white/10 hover:border-emerald-500 rounded text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer font-mono"
                  >
                    Hold Seat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Post New Event Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="p-8 sm:p-10 rounded-3xl glass-dialog max-w-md w-full space-y-6 text-left relative">
            
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-extrabold text-sm p-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#00ddff] uppercase tracking-widest font-mono">
                Post Transnational Symposium
              </span>
              <h3 className="text-lg font-extrabold text-white">
                Core Dynamic Calendar Form
              </h3>
              <p className="text-slate-400 text-xs">
                Introduce a new webinar, physical lab assembly session, or joint UK certification Q&A loop.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1 font-mono">Event Session Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  placeholder="e.g. Siemens S7 Relay Automation Practicum" 
                  className="w-full glass-input" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1 font-mono">Date *</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    required 
                    className="w-full glass-input [color-scheme:dark]" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1 font-mono">Time (UTC) *</label>
                  <input 
                    type="text" 
                    value={time} 
                    onChange={e => setTime(e.target.value)} 
                    required 
                    placeholder="e.g. 14:00" 
                    className="w-full glass-input" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1 font-mono font-sans">Lab Presenter / Coordinator *</label>
                <input 
                  type="text" 
                  value={host} 
                  onChange={e => setHost(e.target.value)} 
                  required 
                  className="w-full glass-input" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1 font-mono">Session Type</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                    className="w-full glass-input cursor-pointer"
                  >
                    <option value="UK Webinar">UK Webinar</option>
                    <option value="AIUB Laboratory">AIUB Laboratory</option>
                    <option value="Hybrid Workshop">Hybrid Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1 font-mono">Topic Domain</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full glass-input cursor-pointer"
                  >
                    <option value="Smart Factory">Smart Factory</option>
                    <option value="Digital Twin">Digital Twin</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Circular Economy">Circular Economy</option>
                    <option value="IoT Security">IoT Security</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1 font-mono">Brief Description *</label>
                <textarea 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  required 
                  rows={3} 
                  placeholder="Outline the Siemens S7 modules, G-code chapters, or credentials mapping topics to cover..." 
                  className="w-full glass-input" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-extrabold text-xs text-white uppercase tracking-wider font-mono cursor-pointer transition-colors shadow-lg shadow-blue-650/20 flex justify-center items-center gap-2"
              >
                {isSubmitting ? 'Curating Session...' : 'Publish to Public Calendar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
