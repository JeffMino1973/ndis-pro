import { useState } from "react";
import { format, addDays, isSameDay, parseISO, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, MapPin, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_STYLE = {
  Scheduled:  { dot: "bg-blue-400",    badge: "bg-blue-100 text-blue-700" },
  Confirmed:  { dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
  Completed:  { dot: "bg-slate-300",   badge: "bg-slate-100 text-slate-600" },
  Cancelled:  { dot: "bg-rose-400",    badge: "bg-rose-100 text-rose-700" },
  "No Show":  { dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-700" },
};

// Pending tasks are shifts that are Scheduled/Confirmed and have no progress note logged yet
function getPendingTasks(shifts) {
  return shifts.filter(s => s.status === "Scheduled" || s.status === "Confirmed");
}

function ShiftCard({ shift, pendingParticipants }) {
  const style = STATUS_STYLE[shift.status] || { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600" };
  const isPending = pendingParticipants.has(shift.participant_name);

  return (
    <div className={`rounded-xl border p-3 bg-card transition-shadow hover:shadow-sm ${isPending ? "border-amber-200" : "border-border"}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${style.dot}`} />
          <span className="font-black text-sm leading-tight">{shift.participant_name}</span>
        </div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>{shift.status}</span>
      </div>

      <div className="ml-4 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={11} />
          <span>{shift.start_time} – {shift.end_time}</span>
          {shift.support_type && <span className="text-foreground/60">· {shift.support_type}</span>}
        </div>
        {shift.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={11} />
            <span>{shift.location}</span>
          </div>
        )}
        {shift.notes && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1">
            <FileText size={11} className="shrink-0 mt-0.5" />
            <span className="line-clamp-2 italic">{shift.notes}</span>
          </div>
        )}
      </div>

      {isPending && (
        <div className="ml-4 mt-2 flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
          <AlertCircle size={11} />
          Pending — progress note due after shift
        </div>
      )}
    </div>
  );
}

function DayColumn({ day, shifts, pendingParticipants }) {
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
            <ShiftCard key={s.id} shift={s} pendingParticipants={pendingParticipants} />
          ))
        )}
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
            />
          ))}
        </div>
      </div>

      {totalShifts === 0 && (
        <div className="text-center py-6 text-muted-foreground italic text-sm">
          No shifts rostered this week.
        </div>
      )}
    </div>
  );
}