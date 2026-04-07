import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    participant_name: "",
    incident_type: "Injury",
    severity: "Medium",
    description: "",
    action_taken: "",
    incident_date: new Date().toISOString().split("T")[0],
    status: "Open",
  });

  const load = async () => {
    const [i, p] = await Promise.all([
      base44.entities.Incident.list("-created_date"),
      base44.entities.Participant.list(),
    ]);
    setIncidents(i);
    setParticipants(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    await base44.entities.Incident.create(form);
    setShowForm(false);
    setForm({ participant_name: "", incident_type: "Injury", severity: "Medium", description: "", action_taken: "", incident_date: new Date().toISOString().split("T")[0], status: "Open" });
    load();
  };

  const severityColor = {
    Low: "bg-emerald-100 text-emerald-700",
    Medium: "bg-amber-100 text-amber-700",
    High: "bg-orange-100 text-orange-700",
    Critical: "bg-rose-100 text-rose-700",
  };

  const statusColor = {
    Open: "bg-rose-100 text-rose-700",
    "Under Investigation": "bg-amber-100 text-amber-700",
    Resolved: "bg-emerald-100 text-emerald-700",
  };

  const openCount = incidents.filter((i) => i.status === "Open").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Incidents & Safeguards</h2>
          <p className="text-muted-foreground text-sm">NDIS Commission aligned reporting (24hr / 5 business days)</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2">
          <Plus size={18} /> Log Incident
        </Button>
      </div>

      {openCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="text-amber-600 shrink-0" size={20} />
          <p className="text-sm font-medium text-amber-700">
            You have {openCount} open incident(s). Reportable incidents require 24-hour notification to the NDIS Commission.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : incidents.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center">
          <AlertTriangle size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-black">No Incidents Recorded</h3>
          <p className="text-muted-foreground text-sm mt-1">All clear — no incidents have been logged.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${severityColor[inc.severity] || ""}`}>
                      {inc.severity}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${statusColor[inc.status] || ""}`}>
                      {inc.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold">{inc.incident_type}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{inc.description}</p>
                  {inc.action_taken && <p className="text-xs text-muted-foreground mt-1">Action: {inc.action_taken}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-foreground">{inc.incident_date}</p>
                  {inc.participant_name && <p className="text-[10px] text-muted-foreground">{inc.participant_name}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Log New Incident</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Participant</Label>
              <Select value={form.participant_name} onValueChange={(v) => setForm({...form, participant_name: v})}>
                <SelectTrigger><SelectValue placeholder="Select participant" /></SelectTrigger>
                <SelectContent>
                  {participants.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Incident Type</Label>
                <Select value={form.incident_type} onValueChange={(v) => setForm({...form, incident_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Injury", "Abuse/Neglect", "Restrictive Practice", "Death", "Medication Error", "Property Damage", "Other"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({...form, severity: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High", "Critical"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.incident_date} onChange={(e) => setForm({...form, incident_date: e.target.value})} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Describe what happened..." className="h-24" />
            </div>
            <div>
              <Label>Action Taken</Label>
              <Textarea value={form.action_taken} onChange={(e) => setForm({...form, action_taken: e.target.value})} placeholder="What action was taken?" className="h-16" />
            </div>
            <Button onClick={handleSave} disabled={!form.description} className="w-full rounded-xl font-bold">
              Log Incident
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}