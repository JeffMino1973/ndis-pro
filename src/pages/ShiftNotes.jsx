import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Loader2, ChevronDown, ChevronUp, FileText, ExternalLink } from "lucide-react";
import ShiftNoteTemplatePicker from "@/components/shiftnotes/ShiftNoteTemplatePicker";
import ShiftNoteWorkbook from "@/components/shiftnotes/ShiftNoteWorkbook";
import { getDayOfWeek } from "@/utils/shiftNoteTemplates";

const DAY_COLORS = {
  Monday: "bg-blue-100 text-blue-700",
  Tuesday: "bg-amber-100 text-amber-700",
  Wednesday: "bg-purple-100 text-purple-700",
  Thursday: "bg-rose-100 text-rose-700",
  Friday: "bg-emerald-100 text-emerald-700",
  Saturday: "bg-cyan-100 text-cyan-700",
  Sunday: "bg-orange-100 text-orange-700",
};

export default function ShiftNotes() {
  const [notes, setNotes] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [allShifts, setAllShifts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [activeWorkbookNote, setActiveWorkbookNote] = useState(null);

  useEffect(() => {
    async function load() {
      const [me, allNotes, allStaff, allParticipants, shifts] = await Promise.all([
        base44.auth.me(),
        base44.entities.ShiftNote.list("-shift_date"),
        base44.entities.StaffMember.list(),
        base44.entities.Participant.list(),
        base44.entities.Shift.list("-date", 500),
      ]);
      setUser(me);
      setNotes(allNotes);
      setStaffMembers(allStaff);
      setParticipants(allParticipants);
      setAllShifts(shifts);
      setLoading(false);
    }
    load();
  }, []);

  const refreshNotes = async () => {
    const updated = await base44.entities.ShiftNote.list("-shift_date");
    setNotes(updated);
  };

  // Match a shift note template selection to a rostered shift by staff/participant/date
  const matchShift = () => {
    const myName = (user?.full_name || "").toLowerCase().trim();
    if (!myName) return null;
    const today = new Date().toISOString().split("T")[0];
    const ci = (a, b) => (a || "").toLowerCase().trim() === b;
    // Prefer today's shift, then most recent upcoming/past shift
    const myShifts = allShifts.filter(s => ci(s.staff_name, myName));
    const todays = myShifts.find(s => s.date === today);
    if (todays) return todays;
    const sorted = [...myShifts].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return sorted[0] || null;
  };

  const handleTemplateSelect = async (tpl) => {
    setCreating(true);
    const shift = matchShift();
    const dow = getDayOfWeek(shift?.date);
    await base44.entities.ShiftNote.create({
      staff_name: user?.full_name || shift?.staff_name || "",
      participant_name: shift?.participant_name || "",
      shift_date: shift?.date || new Date().toISOString().split("T")[0],
      shift_id: shift?.id || "",
      day_of_week: dow || "",
      program_type: shift?.program_type || tpl.program_types[0] || "Other",
      template_id: tpl.id,
      template_label: tpl.label,
      template_url: tpl.url,
      status: "Submitted",
    });
    await refreshNotes();
    setCreating(false);
    setShowPicker(false);
    // Open the workbook in-portal instead of a new tab
    setActiveWorkbookNote({
      template_url: tpl.url,
      template_label: tpl.label,
      shiftInfo: shift,
      status: "Submitted",
    });
  };

  const handleMarkReviewed = async () => {
    if (!activeWorkbookNote?.id) return;
    await base44.entities.ShiftNote.update(activeWorkbookNote.id, { status: "Reviewed" });
    await refreshNotes();
    setActiveWorkbookNote(null);
  };

  const openNoteWorkbook = (note) => {
    setActiveWorkbookNote({
      ...note,
      shiftInfo: { participant_name: note.participant_name, date: note.shift_date, staff_name: note.staff_name },
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ClipboardList size={22} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Shift Notes & Checklists</h2>
            <p className="text-sm text-muted-foreground">Life Skills · Community Programs · Domestic Skills · Weekly Shopping</p>
          </div>
        </div>
        {!showPicker && (
          <Button onClick={() => setShowPicker(true)} className="rounded-xl font-bold gap-2">
            <Plus size={16} /> New Shift Note
          </Button>
        )}
      </div>

      {/* Template Picker */}
      {showPicker && (
        <ShiftNoteTemplatePicker
          defaultStaffName={user?.full_name}
          matchedShift={matchShift()}
          onSelect={handleTemplateSelect}
          onCancel={() => setShowPicker(false)}
          creating={creating}
        />
      )}

      {/* List */}
      {!showPicker && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
              <ClipboardList size={40} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-bold text-sm">No shift notes yet</p>
              <p className="text-xs mt-1">Click "New Shift Note" to get started.</p>
            </div>
          ) : (
            notes.map(note => {
              const expanded = expandedId === note.id;
              return (
                <div key={note.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expanded ? null : note.id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black ${DAY_COLORS[note.day_of_week] || "bg-slate-100 text-slate-600"}`}>
                      {(note.day_of_week || "—").slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{note.participant_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {note.shift_date ? format(parseISO(note.shift_date), "d MMM yyyy") : "—"} · {note.staff_name || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {note.template_label || "Template"}
                      </span>
                      {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-border p-4 space-y-3 bg-secondary/20">
                      {/* Template link — opens in-portal */}
                      {note.template_url ? (
                        <button
                          onClick={() => openNoteWorkbook(note)}
                          className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl px-4 py-3 transition w-full"
                        >
                          <FileText size={16} /> {note.template_label || "Open Shift Note Workbook"}
                        </button>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No template linked to this shift note.</p>
                      )}

                      {/* Meta badges */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {note.program_type && (
                          <span className="bg-card border border-border rounded-lg px-2.5 py-1 font-semibold">{note.program_type}</span>
                        )}
                        {note.day_of_week && (
                          <span className="bg-card border border-border rounded-lg px-2.5 py-1 font-semibold">{note.day_of_week}</span>
                        )}
                        <span className={`rounded-lg px-2.5 py-1 font-black ${
                          note.status === "Submitted" ? "bg-blue-100 text-blue-700" :
                          note.status === "Reviewed" ? "bg-emerald-100 text-emerald-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{note.status}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Full-screen in-portal workbook viewer */}
      {activeWorkbookNote?.template_url && (
        <ShiftNoteWorkbook
          templateUrl={activeWorkbookNote.template_url}
          templateLabel={activeWorkbookNote.template_label}
          shiftInfo={activeWorkbookNote.shiftInfo}
          status={activeWorkbookNote.status}
          onClose={() => setActiveWorkbookNote(null)}
          onComplete={activeWorkbookNote.id ? handleMarkReviewed : undefined}
        />
      )}
    </div>
  );
}