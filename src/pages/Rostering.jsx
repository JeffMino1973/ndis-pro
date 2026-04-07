import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
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

  const save = async () => {
    await base44.entities.Shift.create(form);
    setShowForm(false);
    setForm({ participant_name: "", staff_name: "", date: "", start_time: "09:00", end_time: "11:00", support_type: "", status: "Scheduled", notes: "" });
    load();
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

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
        <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2">
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
                  <div key={s.id} className={`text-[10px] font-bold px-2 py-1.5 rounded-lg ${STATUS_COLORS[s.status] || "bg-slate-100 text-slate-600"}`}>
                    <p className="truncate">{s.staff_name}</p>
                    <p className="truncate opacity-75">{s.participant_name}</p>
                    <p>{s.start_time}–{s.end_time}</p>
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
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span>
            </div>
          ))}
          {shifts.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm italic">No shifts yet. Add your first shift.</p>}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Shift</DialogTitle></DialogHeader>
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
    </div>
  );
}