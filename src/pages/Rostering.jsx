import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, ChevronLeft, ChevronRight, Calendar, Pencil, Trash2, Copy, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";

const STATUS_COLORS = {
  Scheduled: "bg-blue-100 text-blue-700",
  Confirmed: "bg-emerald-100 text-emerald-700",
  Completed: "bg-slate-100 text-slate-600",
  Cancelled: "bg-rose-100 text-rose-700",
  "No Show": "bg-amber-100 text-amber-700",
};

export default function Rostering() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copySource, setCopySource] = useState(null);
  const [copyMode, setCopyMode] = useState("date"); // "date" | "nextweek" | "recurring"
  const [copyDate, setCopyDate] = useState("");
  const [recurWeeks, setRecurWeeks] = useState(4);
  const [copying, setCopying] = useState(false);
  const [form, setForm] = useState({ participant_name: "", staff_name: "", date: "", start_time: "09:00", end_time: "11:00", support_type: "", status: "Scheduled", notes: "" });

  const load = async () => {
    const [s, p, st] = await Promise.all([
      base44.entities.Shift.list("-date"),
      base44.entities.Participant.list(),
      base44.entities.StaffMember.list(),
    ]);
    setShifts(s);
    setParticipants(p);
    setStaff(st);
  };

  useEffect(() => { load(); }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const EMPTY_FORM = { participant_name: "", staff_name: "", date: "", start_time: "09:00", end_time: "11:00", support_type: "", status: "Scheduled", notes: "" };

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (s) => { setEditingId(s.id); setForm({ participant_name: s.participant_name, staff_name: s.staff_name, date: s.date, start_time: s.start_time, end_time: s.end_time, support_type: s.support_type || "", status: s.status, notes: s.notes || "" }); setShowForm(true); };

  const save = async () => {
    if (editingId) {
      await base44.entities.Shift.update(editingId, form);
    } else {
      await base44.entities.Shift.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    load();
  };

  const deleteShift = async (id) => {
    if (!window.confirm("Delete this shift?")) return;
    await base44.entities.Shift.delete(id);
    load();
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const openCopy = (shift) => {
    setCopySource(shift);
    setCopyMode("nextweek");
    setCopyDate("");
    setRecurWeeks(4);
    setShowCopyDialog(true);
  };

  const executeCopy = async () => {
    if (!copySource) return;
    setCopying(true);
    const base = { participant_name: copySource.participant_name, staff_name: copySource.staff_name, start_time: copySource.start_time, end_time: copySource.end_time, support_type: copySource.support_type || "", status: "Scheduled", notes: copySource.notes || "" };
    if (copyMode === "date") {
      await base44.entities.Shift.create({ ...base, date: copyDate });
    } else if (copyMode === "nextweek") {
      const next = addDays(parseISO(copySource.date), 7);
      await base44.entities.Shift.create({ ...base, date: format(next, "yyyy-MM-dd") });
    } else if (copyMode === "recurring") {
      const creates = [];
      for (let w = 1; w <= recurWeeks; w++) {
        const d = addDays(parseISO(copySource.date), w * 7);
        creates.push(base44.entities.Shift.create({ ...base, date: format(d, "yyyy-MM-dd") }));
      }
      await Promise.all(creates);
    }
    setCopying(false);
    setShowCopyDialog(false);
    setCopySource(null);
    load();
  };

  const getShiftsForDay = (day) => shifts.filter(s => {
    try { return isSameDay(parseISO(s.date), day); } catch { return false; }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Rostering</h2>
          <p className="text-muted-foreground text-sm">Weekly shift scheduling for staff and participants.</p>
        </div>
        <Button onClick={openAdd} className="rounded-xl font-bold gap-2">
          <Plus size={18} /> Add Shift
        </Button>
      </div>

      {/* Week Navigation */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}><ChevronLeft size={18} /></Button>
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Calendar size={18} className="text-primary" />
          {format(weekStart, "d MMM")} – {format(addDays(weekStart, 6), "d MMM yyyy")}
        </div>
        <Button variant="outline" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}><ChevronRight size={18} /></Button>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayShifts = getShiftsForDay(day);
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className={`bg-card border rounded-2xl p-3 min-h-[160px] ${isToday ? "border-primary" : "border-border"}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {format(day, "EEE")}
              </p>
              <p className={`text-lg font-black mb-3 ${isToday ? "text-primary" : "text-foreground"}`}>{format(day, "d")}</p>
              <div className="space-y-1.5">
                {dayShifts.map((s) => (
                  <div key={s.id} className={`text-[10px] font-bold px-2 py-1.5 rounded-lg group relative ${STATUS_COLORS[s.status] || "bg-slate-100 text-slate-600"}`}>
                    <p className="truncate">{s.staff_name}</p>
                    <p className="truncate opacity-75">{s.participant_name}</p>
                    <p>{s.start_time}–{s.end_time}</p>
                    <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                      <button onClick={e => { e.stopPropagation(); openCopy(s); }} className="p-0.5 bg-white/70 rounded hover:bg-white text-blue-600" title="Copy/Repeat"><Copy size={10} /></button>
                      <button onClick={e => { e.stopPropagation(); openEdit(s); }} className="p-0.5 bg-white/70 rounded hover:bg-white"><Pencil size={10} /></button>
                      <button onClick={e => { e.stopPropagation(); deleteShift(s.id); }} className="p-0.5 bg-white/70 rounded hover:bg-white text-rose-600"><Trash2 size={10} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Shifts List */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-border bg-secondary/50">
          <h3 className="font-black">All Shifts</h3>
        </div>
        <div className="divide-y divide-border">
          {shifts.slice(0, 20).map((s) => (
            <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs">{s.date?.slice(5)}</div>
                <div>
                  <p className="font-bold text-foreground text-sm">{s.staff_name} → {s.participant_name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.date} · {s.start_time}–{s.end_time} · {s.support_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                <button onClick={() => openCopy(s)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-blue-600" title="Copy/Repeat"><Copy size={14} /></button>
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                <button onClick={() => deleteShift(s.id)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-rose-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {shifts.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm italic">No shifts yet. Add your first shift.</p>}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit Shift" : "New Shift"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Staff Member</Label>
                <Select value={form.staff_name} onValueChange={(v) => update("staff_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_name} onValueChange={(v) => update("participant_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => update("date", e.target.value)} />
              </div>
              <div>
                <Label>Support Type</Label>
                <Input value={form.support_type} onChange={e => update("support_type", e.target.value)} placeholder="e.g. Daily Living" />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input type="time" value={form.start_time} onChange={e => update("start_time", e.target.value)} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" value={form.end_time} onChange={e => update("end_time", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Scheduled","Confirmed","Completed","Cancelled","No Show"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={save} disabled={!form.staff_name || !form.participant_name || !form.date} className="w-full rounded-xl font-bold">Save Shift</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy / Recurring Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Copy size={16} /> Copy / Repeat Shift</DialogTitle>
          </DialogHeader>
          {copySource && (
            <div className="space-y-4">
              <div className="bg-secondary rounded-xl p-3 text-sm">
                <p className="font-black">{copySource.staff_name} → {copySource.participant_name}</p>
                <p className="text-muted-foreground text-xs">{copySource.date} · {copySource.start_time}–{copySource.end_time}</p>
              </div>

              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Copy Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "nextweek", label: "Next Week", icon: ChevronRight },
                    { id: "date", label: "Specific Date", icon: Calendar },
                    { id: "recurring", label: "Recurring", icon: RefreshCw },
                  ].map(m => (
                    <button key={m.id} onClick={() => setCopyMode(m.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border font-bold text-xs transition-all ${
                        copyMode === m.id ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"
                      }`}>
                      <m.icon size={16} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {copyMode === "date" && (
                <div>
                  <Label>Copy to Date</Label>
                  <Input type="date" value={copyDate} onChange={e => setCopyDate(e.target.value)} />
                </div>
              )}

              {copyMode === "nextweek" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                  Will create 1 copy on <strong>{copySource.date ? format(addDays(parseISO(copySource.date), 7), "EEEE d MMM yyyy") : "next week"}</strong>
                </div>
              )}

              {copyMode === "recurring" && (
                <div className="space-y-3">
                  <div>
                    <Label>Repeat for how many weeks?</Label>
                    <Input type="number" min={1} max={52} value={recurWeeks} onChange={e => setRecurWeeks(parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                    Will create <strong>{recurWeeks} shifts</strong> every week on the same day/time.
                  </div>
                </div>
              )}

              <Button
                onClick={executeCopy}
                disabled={copying || (copyMode === "date" && !copyDate)}
                className="w-full rounded-xl font-bold gap-2"
              >
                {copying ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
                {copying ? "Creating shifts..." : `Create ${copyMode === "recurring" ? recurWeeks + " Shifts" : "1 Copy"}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}