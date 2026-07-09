import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Loader2, ChevronDown, ChevronUp, MapPin, Check } from "lucide-react";
import ShiftNoteForm from "@/components/shiftnotes/ShiftNoteForm";

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function load() {
      const [me, allNotes, allStaff, allParticipants] = await Promise.all([
        base44.auth.me(),
        base44.entities.ShiftNote.list("-shift_date"),
        base44.entities.StaffMember.list(),
        base44.entities.Participant.list(),
      ]);
      setUser(me);
      setNotes(allNotes);
      setStaffMembers(allStaff);
      setParticipants(allParticipants);
      setLoading(false);
    }
    load();
  }, []);

  const handleSubmit = async (formData) => {
    await base44.entities.ShiftNote.create({ ...formData, status: "Submitted" });
    const updated = await base44.entities.ShiftNote.list("-shift_date");
    setNotes(updated);
    setShowForm(false);
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
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2">
            <Plus size={16} /> New Shift Note
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <ShiftNoteForm
          staffMembers={staffMembers}
          participants={participants}
          defaultStaffName={user?.full_name}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* List */}
      {!showForm && (
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
                        {note.tasks_completed?.length || 0} tasks
                      </span>
                      {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-border p-4 space-y-4 bg-secondary/20">
                      {/* Route */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/5 rounded-lg px-3 py-2">
                        <MapPin size={13} /> {note.travel_route || "—"}
                      </div>

                      {/* Tasks */}
                      {note.tasks_completed?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Tasks Completed</p>
                          <div className="flex flex-wrap gap-1.5">
                            {note.tasks_completed.map((t, i) => (
                              <span key={i} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-medium">
                                <Check size={11} /> {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assessment */}
                      <div className="grid sm:grid-cols-3 gap-2">
                        {[
                          { label: "Engagement", value: note.participant_engagement },
                          { label: "Support", value: note.support_level },
                          { label: "Mood", value: note.mood_behaviour },
                        ].map(a => (
                          <div key={a.label} className="bg-card border border-border rounded-lg px-3 py-2">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{a.label}</p>
                            <p className="text-xs font-bold mt-0.5">{a.value || "—"}</p>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
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

                      {/* Signature */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">Signed: <strong className="text-foreground">{note.staff_signature || "—"}</strong></span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
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
    </div>
  );
}