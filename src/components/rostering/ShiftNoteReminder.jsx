import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, isSameDay, parseISO, addDays } from "date-fns";
import { AlertCircle, CheckCircle2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { getTemplateForShift, getDayOfWeek } from "@/utils/shiftNoteTemplates";

function matchShiftNote(shift, notes) {
  return notes.find(n =>
    n.shift_id === shift.id ||
    (n.shift_date === shift.date &&
      (n.staff_name || "").toLowerCase().trim() === (shift.staff_name || "").toLowerCase().trim())
  );
}

export default function ShiftNoteReminder({ shifts, weekStart }) {
  const [user, setUser] = useState(null);
  const [shiftNotes, setShiftNotes] = useState([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [me, notes] = await Promise.all([
          base44.auth.me().catch(() => null),
          base44.entities.ShiftNote.list("-shift_date", 200),
        ]);
        setUser(me);
        setShiftNotes(notes);
      } catch {
        /* not logged in or no notes */
      }
    }
    load();
  }, [shifts]);

  if (!user) return null;

  const myName = (user.full_name || "").toLowerCase().trim();
  if (!myName) return null;

  const weekEnd = addDays(weekStart, 6);
  const ci = (a, b) => (a || "").toLowerCase().trim() === b;

  const myWeekShifts = shifts
    .filter(s => {
      if (!ci(s.staff_name, myName)) return false;
      try { return isSameDay(parseISO(s.date), weekStart) || (parseISO(s.date) >= weekStart && parseISO(s.date) <= weekEnd); } catch { return false; }
    })
    .filter(s => s.status !== "Cancelled")
    .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.start_time || "").localeCompare(b.start_time || ""));

  const pending = myWeekShifts.filter(s => !matchShiftNote(s, shiftNotes));
  const completed = myWeekShifts.length - pending.length;

  if (myWeekShifts.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100/50 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-200 flex items-center justify-center shrink-0">
            <AlertCircle size={16} className="text-amber-700" />
          </div>
          <div className="text-left">
            <p className="font-black text-sm text-amber-900">Shift Notes Reminder</p>
            <p className="text-xs text-amber-700">
              {pending.length > 0
                ? `${pending.length} shift note${pending.length !== 1 ? "s" : ""} pending this week · ${completed} completed`
                : `All ${completed} shift note${completed !== 1 ? "s" : ""} completed this week ✓`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pending.length === 0 && (
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-2.5 py-1">
              <CheckCircle2 size={11} /> All done
            </span>
          )}
          {expanded ? <ChevronUp size={16} className="text-amber-600" /> : <ChevronDown size={16} className="text-amber-600" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {pending.length === 0 ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <p className="text-xs text-emerald-700 font-bold">No pending shift notes for this week. Great work!</p>
            </div>
          ) : (
            pending.map(s => {
              const tpl = getTemplateForShift(s);
              const dow = getDayOfWeek(s.date);
              return (
                <div key={s.id} className="bg-white border border-amber-200 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-amber-900">
                      {s.participant_name}
                      <span className="text-amber-600 font-bold ml-1.5">· {format(parseISO(s.date), "EEE d MMM")}</span>
                      <span className="text-amber-500 ml-1.5">· {dow}</span>
                    </p>
                    <p className="text-[10px] text-amber-600">
                      {s.start_time}–{s.end_time}
                      {s.program_type && ` · ${s.program_type}`}
                    </p>
                  </div>
                  {tpl ? (
                    <a
                      href={tpl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] font-black text-white bg-primary hover:bg-primary/90 rounded-lg px-3 py-1.5 transition shrink-0"
                    >
                      <ExternalLink size={11} /> {tpl.label}
                    </a>
                  ) : (
                    <span className="text-[10px] font-black text-amber-600 bg-amber-100 rounded-lg px-2.5 py-1">No template</span>
                  )}
                </div>
              );
            })
          )}
          <p className="text-[10px] text-amber-600 text-center pt-1">
            Click a template link above to open the correct shift note workbook for that shift.
          </p>
        </div>
      )}
    </div>
  );
}