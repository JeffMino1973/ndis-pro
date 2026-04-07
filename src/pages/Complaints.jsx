import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_COLORS = {
  Open: "bg-rose-100 text-rose-700",
  "Under Review": "bg-amber-100 text-amber-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Escalated: "bg-purple-100 text-purple-700",
};

const PRIORITY_COLORS = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-rose-100 text-rose-700",
};

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    participant_name: "", complainant: "", complaint_type: "Service Delivery",
    description: "", date_received: new Date().toISOString().split("T")[0],
    priority: "Medium", status: "Open", resolution: "", resolved_date: ""
  });

  const load = async () => {
    const [c, p] = await Promise.all([base44.entities.Complaint.list("-date_received"), base44.entities.Participant.list()]);
    setComplaints(c); setParticipants(p);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    await base44.entities.Complaint.create(form);
    setShowForm(false);
    setForm({ participant_name: "", complainant: "", complaint_type: "Service Delivery", description: "", date_received: new Date().toISOString().split("T")[0], priority: "Medium", status: "Open", resolution: "", resolved_date: "" });
    load();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.Complaint.update(id, { status });
    load();
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const open = complaints.filter(c => c.status === "Open").length;
  const critical = complaints.filter(c => c.priority === "Critical").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Complaints & Feedback Register</h2>
          <p className="text-muted-foreground text-sm">Log and track participant complaints in line with NDIS requirements.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2"><Plus size={18} /> Log Complaint</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: complaints.length },
          { label: "Open", value: open },
          { label: "Critical", value: critical },
          { label: "Resolved", value: complaints.filter(c => c.status === "Resolved").length },
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
              <th className="px-6 py-4">Participant</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {complaints.map(c => (
              <tr key={c.id} className="hover:bg-secondary/50 cursor-pointer" onClick={() => setSelected(c)}>
                <td className="px-6 py-4 text-sm text-muted-foreground">{c.date_received}</td>
                <td className="px-6 py-4 font-bold text-sm">{c.participant_name}</td>
                <td className="px-6 py-4 text-sm">{c.complaint_type}</td>
                <td className="px-6 py-4"><span className={`text-[10px] font-black px-2 py-1 rounded-full ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span></td>
                <td className="px-6 py-4">
                  <Select value={c.status} onValueChange={v => { updateStatus(c.id, v); }}>
                    <SelectTrigger className={`h-7 text-[10px] font-black w-32 rounded-full border-0 ${STATUS_COLORS[c.status]}`} onClick={e => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Open","Under Review","Resolved","Escalated"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-muted-foreground italic text-sm">No complaints recorded. Great news!</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Complaint Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <p><span className="font-black text-muted-foreground">Participant:</span> {selected.participant_name}</p>
                <p><span className="font-black text-muted-foreground">Complainant:</span> {selected.complainant}</p>
                <p><span className="font-black text-muted-foreground">Type:</span> {selected.complaint_type}</p>
                <p><span className="font-black text-muted-foreground">Date:</span> {selected.date_received}</p>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <p className="font-black text-muted-foreground mb-1">Description</p>
                <p>{selected.description}</p>
              </div>
              {selected.resolution && (
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="font-black text-emerald-700 mb-1">Resolution</p>
                  <p className="text-emerald-800">{selected.resolution}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Complaint Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Log Complaint</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_name} onValueChange={v => update("participant_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Complainant</Label>
                <Input value={form.complainant} onChange={e => update("complainant", e.target.value)} placeholder="Name / Role" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.complaint_type} onValueChange={v => update("complaint_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Service Delivery","Staff Conduct","Communication","Billing","Safety","Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => update("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Low","Medium","High","Critical"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Received</Label>
                <Input type="date" value={form.date_received} onChange={e => update("date_received", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Describe the complaint..." className="h-24" />
            </div>
            <div>
              <Label>Resolution (if known)</Label>
              <Textarea value={form.resolution} onChange={e => update("resolution", e.target.value)} placeholder="Actions taken..." className="h-16" />
            </div>
            <Button onClick={save} disabled={!form.participant_name || !form.description} className="w-full rounded-xl font-bold">Save Complaint</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}