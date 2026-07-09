import { useState, useEffect } from "react";
import { format, addDays, isSameDay, parseISO, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, MapPin, FileText, AlertCircle, CheckCircle2, ClipboardList, X, DollarSign, User, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import ShiftNoteForm from "@/components/shiftnotes/ShiftNoteForm";

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

function getDayOfWeek(dateStr) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date(dateStr + "T00:00:00").getDay()];
}

// ── Compact shift card (in the calendar grid) ──
function ShiftCard({ shift, pendingParticipants, hasNote, onClick }) {
  const style = STATUS_STYLE[shift.status] || { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600" };
  const isPending = pendingParticipants.has(shift.participant_name);
  const progBadge = PROGRAM_BADGE[shift.program_type] || "bg-slate-100 text-slate-600";

  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-2.5 bg-card transition-all hover:shadow-md hover:border-primary/40 overflow-hidden text-left w-full ${isPending ? "border-amber-200" : "border-border"} ${hasNote ? "ring-1 ring-primary/20" : ""}`}
    >
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
        {shift.notes && (
          <div className="flex items-start gap-1 text-[10px] text-muted-foreground mt-0.5 min-w-0">
            <FileText size={10} className="shrink-0 mt-0.5" />
            <span className="line-clamp-2 italic">{shift.notes}</span>
          </div>
        )}
        {hasNote && (
          <div className="flex items-center gap-1 text-[9px] font-black text-primary bg-primary/5 border border-primary/20 rounded-lg px-1.5 py-1 mt-1 w-full min-w-0 overflow-hidden">
            <ClipboardList size={10} className="shrink-0" />
            <span className="truncate">Shift note completed</span>
          </div>
        )}
        {!hasNote && isPending && (
          <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-1.5 py-1 mt-1">
            <AlertCircle size={10} className="shrink-0" />
            <span>Note due</span>
          </div>
        )}
      </div>
    </button>
  );
}

function DayColumn({ day, shifts, pendingParticipants, shiftNotes, onShiftClick }) {
  const today = isToday(day);
  const dayShifts = shifts
    .filter(s => { try { return isSameDay(parseISO(s.date), day); } catch { return false; } })
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  return (
    <div className={`flex flex-col min-h-[120px] ${today ? "relative" : ""}`}>
      <div className={`rounded-xl px-3 py-2 mb-2 text-center ${today ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary"}`}>
        <div className={`text-[10px] font-black uppercase tracking-widest ${today ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {format(day, "EEE")}
        </div>
        <div className="text-xl font-black leading-none mt-0.5">
          {format(day, "d")}
        </div>
        {today && <div className="text-[8px] font-black uppercase tracking-widest mt-0.5 text-primary-foreground/80">Today</div>}
      </div>

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
              hasNote={!!matchShiftNote(s, shiftNotes)}
              onClick={() => onShiftClick(s)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Shift Detail Modal ──
function ShiftDetailModal({ shift, shiftNote, staffMembers, participants, onClose, onNoteSubmitted }) {
  const [mode, setMode] = useState("detail"); // "detail" | "note" | "viewNote"
  const [saving, setSaving] = useState(false);

  if (!shift) return null;

  const style = STATUS_STYLE[shift.status] || { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600" };
  const progBadge = PROGRAM_BADGE[shift.program_type] || "bg-slate-100 text-slate-600";
  const dow = getDayOfWeek(shift.date);

  const handleNoteSubmit = async (formData) => {
    setSaving(true);
    await base44.entities.ShiftNote.create({ ...formData, status: "Submitted" });
    setSaving(false);
    onNoteSubmitted();
    setMode("detail");
  };

  const prefill = {
    staff_name: shift.staff_name,
    participant_name: shift.participant_name,
    shift_date: shift.date,
    day_of_week: dow,
    program_type: shift.program_type || "Life Skills Program",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <h3 className="font-black text-sm">Shift Details</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {mode === "note" ? (
            /* ── Complete Shift Note Form ── */
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList size={18} className="text-primary" />
                <h4 className="font-black text-sm">Complete Shift Note</h4>
              </div>
              <ShiftNoteForm
                staffMembers={staffMembers}
                participants={participants}
                defaultStaffName={shift.staff_name}
                prefill={prefill}
                onSubmit={handleNoteSubmit}
                onCancel={() => setMode("detail")}
              />
            </div>
          ) : (
            <>
              {/* ── Shift Info ── */}
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${style.dot}`} />
                    <span className="font-black text-base">{shift.participant_name}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${style.badge}`}>{shift.status}</span>
                </div>

                {shift.program_type && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${progBadge}`}>{shift.program_type}</span>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">Staff:</span>
                    <span className="font-bold text-xs">{shift.staff_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-muted-foreground" />
                    <span className="font-bold text-xs">{shift.date} ({dow})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-muted-foreground" />
                    <span className="font-bold text-xs">{shift.start_time} – {shift.end_time}</span>
                  </div>
                  {shift.support_type && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Type: </span>
                      <span className="font-bold">{shift.support_type}</span>
                    </div>
                  )}
                  {shift.support_item_code && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Code: </span>
                      <span className="font-mono font-bold">{shift.support_item_code}</span>
                    </div>
                  )}
                  {shift.hourly_rate ? (
                    <div className="flex items-center gap-2">
                      <DollarSign size={13} className="text-muted-foreground" />
                      <span className="font-bold text-xs">${shift.hourly_rate}/hr</span>
                      {shift.hours ? <span className="text-muted-foreground text-xs">· {shift.hours}h = ${(shift.hourly_rate * shift.hours).toFixed(2)}</span> : null}
                    </div>
                  ) : null}
                </div>
                {shift.notes && (
                  <div className="flex items-start gap-2 text-xs bg-card rounded-lg p-2.5 border border-border">
                    <FileText size={13} className="text-muted-foreground shrink-0 mt-0.5" />
                    <span className="italic">{shift.notes}</span>
                  </div>
                )}
              </div>

              {/* ── Shift Note Section ── */}
              <div className="border-t border-border pt-4">
                {shiftNote ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ClipboardList size={16} className="text-primary" />
                        <h4 className="font-black text-sm">Shift Note</h4>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        shiftNote.status === "Submitted" ? "bg-blue-100 text-blue-700" :
                        shiftNote.status === "Reviewed" ? "bg-emerald-100 text-emerald-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>{shiftNote.status}</span>
                    </div>
                    <ShiftNoteContent note={shiftNote} />
                  </>
                ) : (
                  <div className="text-center py-6">
                    <ClipboardList size={32} className="text-muted-foreground/50 mx-auto mb-2" />
                    <p className="font-black text-sm text-muted-foreground mb-1">No shift note yet</p>
                    <p className="text-xs text-muted-foreground mb-4">Complete a shift note for this shift.</p>
                    <Button onClick={() => setMode("note")} className="rounded-xl font-bold gap-2">
                      <ClipboardList size={15} /> Complete Shift Note
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shift Note Content (reused in detail + view) ──
function ShiftNoteContent({ note }) {
  return (
    <div className="space-y-3 text-sm">
      {note.travel_route && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 rounded-lg px-3 py-2">
          <MapPin size={13} /> {note.travel_route}
        </div>
      )}
      {note.tasks_completed?.length > 0 && (
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Tasks Completed ({note.tasks_completed.length})</p>
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
          <div key={a.label} className="bg-secondary rounded-lg px-2 py-1.5 text-center">
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
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">Signed: <strong className="text-foreground">{note.staff_signature || "—"}</strong></span>
      </div>
    </div>
  );
}

export default function WeeklyCalendar({ shifts }) {
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const mon = new Date(today);
    mon.setDate(today.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  });
  const [shiftNotes, setShiftNotes] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);

  const loadNotes = () => {
    base44.entities.ShiftNote.list("-shift_date", 200)
      .then(setShiftNotes)
      .catch(() => setShiftNotes([]));
  };

  useEffect(() => {
    loadNotes();
    base44.entities.StaffMember.list().then(setStaffMembers).catch(() => {});
    base44.entities.Participant.list().then(setParticipants).catch(() => {});
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
  const notesCount = weekShifts.filter(s => matchShiftNote(s, shiftNotes)).length;

  const selectedNote = selectedShift ? matchShiftNote(selectedShift, shiftNotes) : null;

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
          {totalShifts} shift{totalShifts !== 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold">
          <CheckCircle2 size={12} className="text-emerald-500" />
          {completedShifts} completed
        </div>
        {notesCount > 0 && (
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold">
            <ClipboardList size={12} className="text-primary" />
            {notesCount} note{notesCount !== 1 ? "s" : ""}
          </div>
        )}
        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-black text-amber-700">
            <AlertCircle size={12} className="text-amber-500" />
            {pendingCount} pending
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

      <p className="text-[11px] text-muted-foreground text-center">
        Tap any shift to view details and complete shift notes.
      </p>

      {/* Calendar grid */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-cols-7 gap-2 min-w-[700px]">
          {weekDays.map(day => (
            <DayColumn
              key={day.toISOString()}
              day={day}
              shifts={weekShifts}
              pendingParticipants={pendingParticipants}
              shiftNotes={shiftNotes}
              onShiftClick={setSelectedShift}
            />
          ))}
        </div>
      </div>

      {totalShifts === 0 && (
        <div className="text-center py-6 text-muted-foreground italic text-sm">
          No shifts rostered this week.
        </div>
      )}

      <ShiftDetailModal
        shift={selectedShift}
        shiftNote={selectedNote}
        staffMembers={staffMembers}
        participants={participants}
        onClose={() => setSelectedShift(null)}
        onNoteSubmitted={() => {
          loadNotes();
        }}
      />
    </div>
  );
}