import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Clock, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const KM_RATE = 0.99; // NDIS km rate

const STATUS_COLORS = {
  Draft: "bg-slate-100 text-slate-600",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
};

export default function Timesheets() {
  const [timesheets, setTimesheets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    staff_name: "", participant_name: "", date: new Date().toISOString().split("T")[0],
    start_time: "09:00", end_time: "11:00", support_item_code: "", km_travelled: 0, notes: "", status: "Draft"
  });

  const load = async () => {
    const [t, s, p] = await Promise.all([
      base44.entities.Timesheet.list("-date"),
      base44.entities.StaffMember.list(),
      base44.entities.Participant.list(),
    ]);
    setTimesheets(t); setStaff(s); setParticipants(p);
  };

  useEffect(() => { load(); }, []);

  const calcHours = (start, end) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60);
  };

  const save = async () => {
    const hours = calcHours(form.start_time, form.end_time);
    const km_travelled = parseFloat(form.km_travelled) || 0;
    const travel_claim = parseFloat((km_travelled * KM_RATE).toFixed(2));
    await base44.entities.Timesheet.create({ ...form, hours: parseFloat(hours.toFixed(2)), km_travelled, travel_claim });
    setShowForm(false);
    setForm({ staff_name: "", participant_name: "", date: new Date().toISOString().split("T")[0], start_time: "09:00", end_time: "11:00", support_item_code: "", km_travelled: 0, notes: "", status: "Draft" });
    load();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.Timesheet.update(id, { status });
    load();
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const previewHours = calcHours(form.start_time, form.end_time);
  const previewTravel = ((parseFloat(form.km_travelled) || 0) * KM_RATE).toFixed(2);

  const totalHours = timesheets.reduce((a, t) => a + (t.hours || 0), 0);
  const totalTravel = timesheets.reduce((a, t) => a + (t.travel_claim || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Timesheets & Travel Claims</h2>
          <p className="text-muted-foreground text-sm">Log staff hours and KM claims against NDIS supports.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2">
          <Plus size={18} /> Log Hours
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Entries", value: timesheets.length, icon: Clock },
          { label: "Total Hours", value: totalHours.toFixed(1) + "h", icon: Clock },
          { label: "Travel Claims", value: "$" + totalTravel.toFixed(2), icon: Car },
          { label: "Pending Approval", value: timesheets.filter(t => t.status === "Submitted").length, icon: Clock },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-secondary text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Staff</th>
              <th className="px-6 py-4">Participant</th>
              <th className="px-6 py-4">Hours</th>
              <th className="px-6 py-4">KM / Travel</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {timesheets.map(t => (
              <tr key={t.id} className="hover:bg-secondary/50">
                <td className="px-6 py-4 text-sm text-muted-foreground">{t.date}</td>
                <td className="px-6 py-4 font-bold text-sm">{t.staff_name}</td>
                <td className="px-6 py-4 text-sm">{t.participant_name}</td>
                <td className="px-6 py-4 font-bold text-sm">{t.hours}h</td>
                <td className="px-6 py-4 text-sm">{t.km_travelled} km · <span className="text-primary font-bold">${t.travel_claim}</span></td>
                <td className="px-6 py-4">
                  <Select value={t.status} onValueChange={v => updateStatus(t.id, v)}>
                    <SelectTrigger className={`h-7 text-[10px] font-black w-28 rounded-full border-0 ${STATUS_COLORS[t.status]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Draft","Submitted","Approved","Rejected"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
            {timesheets.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground italic text-sm">No timesheets yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Log Hours</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Staff Member</Label>
                <Select value={form.staff_name} onValueChange={v => update("staff_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_name} onValueChange={v => update("participant_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => update("date", e.target.value)} />
              </div>
              <div>
                <Label>KM Travelled</Label>
                <Input type="number" value={form.km_travelled} onChange={e => update("km_travelled", e.target.value)} placeholder="0" />
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
            <div className="bg-primary/5 rounded-2xl p-4 flex justify-between text-sm">
              <span className="font-bold text-muted-foreground">Preview: <span className="text-foreground">{previewHours.toFixed(2)}h</span></span>
              <span className="font-bold text-muted-foreground">Travel: <span className="text-primary">${previewTravel}</span> @ $0.99/km</span>
            </div>
            <Button onClick={save} disabled={!form.staff_name || !form.date} className="w-full rounded-xl font-bold">Save Timesheet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}