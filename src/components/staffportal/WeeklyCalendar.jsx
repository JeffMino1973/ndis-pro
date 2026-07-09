import { useState, useEffect } from "react";
import { format, addDays, isSameDay, parseISO, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, MapPin, FileText, AlertCircle, CheckCircle2, ClipboardList } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const STATUS_STYLE = {
  Scheduled:  { dot: "bg-blue-400",    badge: "bg-blue-100 text-blue-700" },
  Confirmed:  { dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
  Completed:  { dot: "bg-slate-300",   badge: "bg-slate-100 text-slate-600" },
  Cancelled:  { dot: "bg-rose-400",    badge: "bg-rose-100 text-rose-700" },
  "No Show":  { dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-700" },
};

const PROGRAM_BADGE = {
  "Life Skills Program": "bg-indigo-100 text-indigo-700",
  "Travel Training": "bg-cyan-100 text-cyan-700",
  "Travel to/from Work": "bg-blue-100 text-blue-700",
  "Community Program": "bg-violet-100 text-violet-700",
  "Domestic Skills": "bg-teal-100 text-teal-700",
  "Weekly Shopping": "bg-emerald-100 text-emerald-700",
  "Other": "bg-slate-100 text-slate-600",
};

// Pending tasks are shifts that are Scheduled/Confirmed and have no progress note logged yet
function getPendingTasks(shifts) {
  return shifts.filter(s => s.status === "Scheduled" || s.status === "Confirmed");
}

function matchShiftNote(shift, notes) {
  if (!notes || notes.length === 0) return null;
  return notes.find(n =>
    (n.staff_name || "").toLowerCase().trim() === (shift.staff_name || "").toLowerCase().trim() &&
    (n.participant_name || "").toLowerCase().trim() === (shift.participant_name || "").toLowerCase().trim() &&
    n.shift_date === shift.date
  ) || null;
}

function ShiftCard({ shift, pendingParticipants, shiftNote, onOpenNote }) {
  const style = STATUS_STYLE[shift.status] || { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600" };
  const isPending = pendingParticipants.has(shift.participant_name);
  const progBadge = PROGRAM_BADGE[shift.program_type] || "bg-slate-100 text-slate-600";

  return (
    <div className={`rounded-xl border p-2.5 bg-card transition-shadow hover:shadow-sm overflow-hidden ${isPending ? "border-amber-200" : "border-border"}`}>
      <div className="flex items-start justify-between gap-1.5 mb-1.5 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${style.dot}`} />
          <span className="font-black text-sm leading-tight truncate">{shift.participant_name}</span>
        </div>
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${style.badge}`}>{shift.status}</span>
      </div>

      {shift.program_type && (
        <div className="mb-1.5">
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full inline-block truncate max-w-full ${progBadge}`}>{shift.program_type}</span>
        </div>
      )}

      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground min-w-0">
          <Clock size={10} className="shrink-0" />
          <span className="shrink-0">{shift.start_time}–{shift.end_time}</span>
          {shift.support_type && <span className="text-foreground/60 truncate">· {shift.support_type}</span>}
        </div>
        {shift.location && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground min-w-0">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{shift.location}</span>
          </div>
        )}
        {shift.notes && (
          <div className="flex items-start gap-1 text-[10px] text-muted-foreground mt-0.5 min-w-0">
            <FileText size={10} className="shrink-0 mt-0.5" />
            <span className="line-clamp-2 italic">{shift.notes}</span>
          </div>
        )}
        {shiftNote && (
          <button
            onClick={() => onOpenNote?.(shiftNote)}
            className="flex items-center gap-1 text-[9px] font-black text-primary bg-primary/5 border border-primary/20 rounded-lg px-1.5 py-1 mt-1 hover:bg-primary/10 transition w-full min-w-0 overflow-hidden"
          >
            <ClipboardList size={10} className="shrink-0" />
            <span className="truncate">Note · {shiftNote.tasks_completed?.length || 0} tasks · {shiftNote.status}</span>
          </button>
        )}
      </div>

      {isPending && (
        <div className="ml-4 mt-2 flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
          <AlertCircle size={11} />
          Pending — shift note due after shift
        </div>
      )}
    </div>
  );
}

function DayColumn({ day, shifts, pendingParticipants, shiftNotes, onOpenNote }) {
  const today = isToday(day);
  const dayShifts = shifts
    .filter(s => { try { return isSameDay(parseISO(s.date), day); } catch { return false; } })
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  return (
    <div className={`flex flex-col min-h-[120px] ${today ? "relative" : ""}`}>
      {/* Day header */}
      <div className={`rounded-xl px-3 py-2 mb-2 text-center ${today ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary"}`}>
        <div className={`text-[10px] font-black uppercase tracking-widest ${today ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {format(day, "EEE")}
        </div>
        <div className={`text-xl font-black leading-none mt-0.5 ${today ? "" : ""}`}>
          {format(day, "d")}
        </div>
        {today && <div className="text-[8px] font-black uppercase tracking-widest mt-0.5 text-primary-foreground/80">Today</div>}
      </div>

      {/* Shift cards */}
      <div className="flex flex-col gap-2 flex-1">
        {dayShifts.length === 0 ? (
          <div className="flex-1 rounded-xl border border-dashed border-border flex items-center justify-center py-4 text-xs text-muted-foreground italic">
            Off
          </div>
        ) : (
          dayShifts.map(s => (
            <ShiftCard
              key={s.id}
              shift={s}
              pendingParticipants={pendingParticipants}
              shiftNote={matchShiftNote(s, shiftNotes)}
              onOpenNote={onOpenNote}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ShiftNoteModal({ note, onClose }) {
  if (!note) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-primary" />
            <h3 className="font-black text-sm">Shift Note</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">✕</Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-muted-foreground text-xs">Staff:</span> <strong>{note.staff_name}</strong></div>
            <div><span className="text-muted-foreground text-xs">Participant:</span> <strong>{note.participant_name}</strong></div>
            <div><span className="text-muted-foreground text-xs">Date:</span> <strong>{note.shift_date}</strong></div>
            <div><span className="text-muted-foreground text-xs">Program:</span> <strong>{note.program_type}</strong></div>
          </div>
          {note.travel_route && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 rounded-lg px-3 py-2">
              <MapPin size={13} /> {note.travel_route}
            </div>
          )}
          {note.tasks_completed?.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Tasks Completed</p>
              <div className="flex flex-wrap gap-1.5">
                {note.tasks_completed.map((t, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-medium">
                    <CheckCircle2 size={10} /> {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Engagement", value: note.participant_engagement },
              { label: "Support", value: note.support_level },
              { label: "Mood", value: note.mood_behaviour },
            ].map(a => (
              <div key={a.label} className="bg-secondary rounded-lg px-2 py-1.5">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{a.label}</p>
                <p className="text-xs font-bold mt-0.5">{a.value || "—"}</p>
              </div>
            ))}
          </div>
          {note.progress_notes && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Progress Notes</p>
              <p className="text-sm">{note.progress_notes}</p>
            </div>
          )}
          {note.safety_observations && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Safety Observations</p>
              <p className="text-sm">{note.safety_observations}</p>
            </div>
          )}
          {note.next_session_goals && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Goals for Next Session</p>
              <p className="text-sm">{note.next_session_goals}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Signed: <strong className="text-foreground">{note.staff_signature || "—"}</strong></span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            note.status === "Submitted" ? "bg-blue-100 text-blue-700" :
            note.status === "Reviewed" ? "bg-emerald-100 text-emerald-700" :
            "bg-slate-100 text-slate-600"
          }`}>{note.status}</span>
        </div>
      </div>
    </div>
  );
}

export default function WeeklyCalendar({ shifts }) {
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    // Start week on Monday
    const day = today.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const mon = new Date(today);
    mon.setDate(today.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  });
  const [shiftNotes, setShiftNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    base44.entities.ShiftNote.list("-shift_date", 200)
      .then(setShiftNotes)
      .catch(() => setShiftNotes([]));
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekFrom = format(weekStart, "yyyy-MM-dd");
  const weekTo = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const weekShifts = shifts.filter(s => s.date >= weekFrom && s.date <= weekTo);
  const pending = getPendingTasks(weekShifts);
  const pendingParticipants = new Set(pending.map(s => s.participant_name));

  const totalShifts = weekShifts.length;
  const completedShifts = weekShifts.filter(s => s.status === "Completed").length;
  const pendingCount = pending.length;

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => setWeekStart(d => addDays(d, -7))} className="rounded-xl shrink-0">
          <ChevronLeft size={16} />
        </Button>
        <div className="flex-1 text-center">
          <p className="font-black text-sm">
            {format(weekStart, "d MMM")} – {format(addDays(weekStart, 6), "d MMM yyyy")}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setWeekStart(d => addDays(d, 7))} className="rounded-xl shrink-0">
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Week summary pills */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-primary" />
          {totalShifts} shift{totalShifts !== 1 ? "s" : ""} this week
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold">
          <CheckCircle2 size={12} className="text-emerald-500" />
          {completedShifts} completed
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-black text-amber-700">
            <AlertCircle size={12} className="text-amber-500" />
            {pendingCount} pending task{pendingCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Pending tasks callout */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-amber-500 shrink-0" />
            <h4 className="font-black text-sm text-amber-800">Pending Tasks This Week</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...new Set(pending.map(s => s.participant_name))].map(name => {
              const participantPending = pending.filter(s => s.participant_name === name);
              return (
                <div key={name} className="bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs">
                  <span className="font-black text-amber-800">{name}</span>
                  <span className="text-amber-600 ml-1">— {participantPending.length} shift{participantPending.length !== 1 ? "s" : ""} to log</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar grid — horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-cols-7 gap-2 min-w-[700px]">
          {weekDays.map(day => (
            <DayColumn
              key={day.toISOString()}
              day={day}
              shifts={weekShifts}
              pendingParticipants={pendingParticipants}
              shiftNotes={shiftNotes}
              onOpenNote={setSelectedNote}
            />
          ))}
        </div>
      </div>

      {totalShifts === 0 && (
        <div className="text-center py-6 text-muted-foreground italic text-sm">
          No shifts rostered this week.
        </div>
      )}

      <ShiftNoteModal note={selectedNote} onClose={() => setSelectedNote(null)} />
    </div>
  );
}