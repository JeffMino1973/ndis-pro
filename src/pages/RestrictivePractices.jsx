import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, ShieldAlert, AlertTriangle, CheckCircle, Printer, Pencil, Trash2, Download, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PRACTICE_TYPES = ["Chemical Restraint", "Mechanical Restraint", "Physical Restraint", "Environmental Restraint", "Seclusion"];

const PRACTICE_COLOR = {
  "Chemical Restraint": "bg-purple-100 text-purple-700",
  "Mechanical Restraint": "bg-orange-100 text-orange-700",
  "Physical Restraint": "bg-rose-100 text-rose-700",
  "Environmental Restraint": "bg-amber-100 text-amber-700",
  "Seclusion": "bg-red-100 text-red-700",
};

const STATUS_COLOR = {
  Draft: "bg-slate-100 text-slate-600",
  Submitted: "bg-blue-100 text-blue-700",
  "Under Review": "bg-amber-100 text-amber-700",
  Closed: "bg-emerald-100 text-emerald-700",
};

const EMPTY = {
  participant_name: "", practice_type: "Physical Restraint", description: "",
  authorisation_date: "", authorised_by: "", authorisation_expiry: "",
  bsp_in_place: false, bsp_practitioner: "", bsp_expiry: "",
  episode_date: new Date().toISOString().split("T")[0], episode_time: new Date().toTimeString().substring(0, 5),
  duration_minutes: 0, trigger: "", action_taken: "", post_incident_support: "",
  reported_to_commission: false, commission_report_date: "", commission_reference: "",
  staff_name: "", witness_name: "", status: "Draft",
};

function DaysUntil({ date, label }) {
  if (!date) return null;
  const days = Math.ceil((new Date(date) - new Date()) / 86400000);
  const color = days < 0 ? "text-rose-600 bg-rose-50" : days < 30 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";
  return (
    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {label}: {days < 0 ? `${Math.abs(days)}d expired` : `${days}d remaining`}
    </div>
  );
}

export default function RestrictivePractices() {
  const [records, setRecords] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filterPart, setFilterPart] = useState("All");
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().substring(0, 7));

  const load = async () => {
    const [r, p, s] = await Promise.all([
      base44.entities.RestrictivePractice.list("-episode_date", 200),
      base44.entities.Participant.list(),
      base44.entities.StaffMember.list(),
    ]);
    setRecords(r);
    setParticipants(p);
    setStaff(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSave = async (status) => {
    const data = { ...form, status };
    if (editingId) {
      await base44.entities.RestrictivePractice.update(editingId, data);
    } else {
      await base44.entities.RestrictivePractice.create(data);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    load();
  };

  const openEdit = (r) => {
    setEditingId(r.id);
    setForm({
      participant_name: r.participant_name, practice_type: r.practice_type, description: r.description || "",
      authorisation_date: r.authorisation_date || "", authorised_by: r.authorised_by || "",
      authorisation_expiry: r.authorisation_expiry || "", bsp_in_place: r.bsp_in_place || false,
      bsp_practitioner: r.bsp_practitioner || "", bsp_expiry: r.bsp_expiry || "",
      episode_date: r.episode_date, episode_time: r.episode_time || "",
      duration_minutes: r.duration_minutes || 0, trigger: r.trigger || "",
      action_taken: r.action_taken || "", post_incident_support: r.post_incident_support || "",
      reported_to_commission: r.reported_to_commission || false,
      commission_report_date: r.commission_report_date || "", commission_reference: r.commission_reference || "",
      staff_name: r.staff_name || "", witness_name: r.witness_name || "", status: r.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this restrictive practice record?")) return;
    await base44.entities.RestrictivePractice.delete(id);
    load();
  };

  const exportCSV = () => {
    const monthRecords = records.filter(r => r.episode_date?.startsWith(exportMonth));
    if (monthRecords.length === 0) { alert("No records for selected month."); return; }
    const headers = ["Episode Date", "Episode Time", "Participant", "Practice Type", "Duration (min)", "Staff", "Trigger", "Action Taken", "Reported to Commission", "Commission Reference", "Authorisation Expiry", "BSP Expiry"];
    const rows = monthRecords.map(r => [
      r.episode_date, r.episode_time, r.participant_name, r.practice_type, r.duration_minutes,
      r.staff_name, `"${(r.trigger || "").replace(/"/g, "'")}"`, `"${(r.action_taken || "").replace(/"/g, "'")}"`,
      r.reported_to_commission ? "Yes" : "No", r.commission_reference || "",
      r.authorisation_expiry || "", r.bsp_expiry || "",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restrictive-practices-${exportMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compliance alerts
  const expiringAuthorisations = records.filter(r => r.authorisation_expiry && Math.ceil((new Date(r.authorisation_expiry) - new Date()) / 86400000) <= 30 && Math.ceil((new Date(r.authorisation_expiry) - new Date()) / 86400000) > 0);
  const expiringBSPs = records.filter(r => r.bsp_expiry && Math.ceil((new Date(r.bsp_expiry) - new Date()) / 86400000) <= 30 && Math.ceil((new Date(r.bsp_expiry) - new Date()) / 86400000) > 0);
  const unreported = records.filter(r => !r.reported_to_commission && r.status !== "Draft");

  const filtered = filterPart === "All" ? records : records.filter(r => r.participant_name === filterPart);

  const TA = ({ field, label }) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <textarea value={form[field]} onChange={e => set(field, e.target.value)} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[70px] mt-1" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={22} className="text-rose-600" />
            <h2 className="text-3xl font-black tracking-tight">Restrictive Practices</h2>
          </div>
          <p className="text-muted-foreground text-sm">Secure module · NDIS Commission reporting · Regulated practice tracking.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(EMPTY); setShowForm(true); }} className="rounded-xl font-bold gap-2 bg-rose-600 hover:bg-rose-700">
          <Plus size={18} /> Log Incident
        </Button>
      </div>

      {/* Compliance Alerts */}
      {(expiringAuthorisations.length > 0 || expiringBSPs.length > 0 || unreported.length > 0) && (
        <div className="space-y-2">
          {unreported.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle size={18} className="text-rose-600 shrink-0" />
              <div>
                <p className="font-black text-rose-700 text-sm">{unreported.length} record{unreported.length > 1 ? "s" : ""} not yet reported to NDIS Commission</p>
                <p className="text-xs text-rose-500">Review and mark as reported once submitted.</p>
              </div>
            </div>
          )}
          {expiringAuthorisations.map(r => (
            <div key={r.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <Calendar size={18} className="text-amber-600 shrink-0" />
              <p className="text-sm font-bold text-amber-700">Authorisation expiring soon: <span className="font-black">{r.participant_name}</span> — {r.authorisation_expiry}</p>
            </div>
          ))}
          {expiringBSPs.map(r => (
            <div key={r.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <Calendar size={18} className="text-amber-600 shrink-0" />
              <p className="text-sm font-bold text-amber-700">BSP expiring soon: <span className="font-black">{r.participant_name}</span> — {r.bsp_expiry}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Logged", value: records.length },
          { label: "Unreported", value: unreported.length, warn: unreported.length > 0 },
          { label: "This Month", value: records.filter(r => r.episode_date?.startsWith(new Date().toISOString().substring(0, 7))).length },
          { label: "Closed", value: records.filter(r => r.status === "Closed").length },
        ].map(s => (
          <div key={s.label} className={`border rounded-2xl p-4 ${s.warn ? "bg-rose-50 border-rose-200" : "bg-card border-border"}`}>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.warn ? "text-rose-700" : ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Export */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground"><Download size={16} className="text-primary" /> Monthly Commission Export</div>
        <Input type="month" value={exportMonth} onChange={e => setExportMonth(e.target.value)} className="w-44 h-8 text-sm" />
        <Button variant="outline" size="sm" onClick={exportCSV} className="rounded-xl gap-1 font-bold"><Download size={14} /> Export CSV</Button>
        <p className="text-xs text-muted-foreground">Export all records for the selected month as a CSV for NDIS Commission reporting.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterPart("All")} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${filterPart === "All" ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground"}`}>All</button>
        {[...new Set(records.map(r => r.participant_name))].map(name => (
          <button key={name} onClick={() => setFilterPart(name)} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${filterPart === name ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground"}`}>{name}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="font-black text-foreground">{r.participant_name}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${PRACTICE_COLOR[r.practice_type]}`}>{r.practice_type}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                    {r.reported_to_commission
                      ? <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><CheckCircle size={10} /> Reported</span>
                      : <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5"><AlertTriangle size={10} /> Not Reported</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <DaysUntil date={r.authorisation_expiry} label="Auth" />
                    <DaysUntil date={r.bsp_expiry} label="BSP" />
                  </div>
                  <p className="text-xs text-muted-foreground">{r.episode_date} {r.episode_time} · {r.duration_minutes} min · {r.staff_name}</p>
                  {r.trigger && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">Trigger: {r.trigger}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-card border border-border rounded-3xl p-12 text-center">
              <ShieldAlert size={40} className="text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-black">No Records</h3>
              <p className="text-sm text-muted-foreground">No restrictive practice incidents have been logged.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={o => { setShowForm(o); if (!o) setEditingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <ShieldAlert size={18} /> {editingId ? "Edit" : "Log"} Restrictive Practice Incident
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700">
              <strong>Regulated Module.</strong> All entries are timestamped and retained for compliance auditing. Ensure accuracy — these records may be reviewed by the NDIS Quality and Safeguards Commission.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Participant *</Label>
                <Select value={form.participant_name} onValueChange={v => set("participant_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Practice Type *</Label>
                <Select value={form.practice_type} onValueChange={v => set("practice_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRACTICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Episode Date *</Label>
                <Input type="date" value={form.episode_date} onChange={e => set("episode_date", e.target.value)} />
              </div>
              <div>
                <Label>Episode Time</Label>
                <Input type="time" value={form.episode_time} onChange={e => set("episode_time", e.target.value)} />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input type="number" value={form.duration_minutes} onChange={e => set("duration_minutes", parseInt(e.target.value))} />
              </div>
              <div>
                <Label>Staff Member</Label>
                <Select value={form.staff_name} onValueChange={v => set("staff_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Witness Name</Label>
                <Input value={form.witness_name} onChange={e => set("witness_name", e.target.value)} />
              </div>
            </div>

            <TA field="description" label="Description of Practice" />
            <TA field="trigger" label="Trigger / Antecedent" />
            <TA field="action_taken" label="Action Taken" />
            <TA field="post_incident_support" label="Post-Incident Support Provided" />

            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Authorisation</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Authorisation Date</Label><Input type="date" value={form.authorisation_date} onChange={e => set("authorisation_date", e.target.value)} /></div>
                <div><Label className="text-xs">Authorised By</Label><Input value={form.authorised_by} onChange={e => set("authorised_by", e.target.value)} /></div>
                <div><Label className="text-xs">Authorisation Expiry</Label><Input type="date" value={form.authorisation_expiry} onChange={e => set("authorisation_expiry", e.target.value)} /></div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Behaviour Support Plan</p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.bsp_in_place} onChange={e => set("bsp_in_place", e.target.checked)} className="w-4 h-4 accent-blue-600" />
                  BSP in Place
                </label>
              </div>
              {form.bsp_in_place && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">BSP Practitioner</Label><Input value={form.bsp_practitioner} onChange={e => set("bsp_practitioner", e.target.value)} /></div>
                  <div><Label className="text-xs">BSP Expiry Date</Label><Input type="date" value={form.bsp_expiry} onChange={e => set("bsp_expiry", e.target.value)} /></div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">NDIS Commission</p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.reported_to_commission} onChange={e => set("reported_to_commission", e.target.checked)} className="w-4 h-4 accent-blue-600" />
                  Reported to Commission
                </label>
              </div>
              {form.reported_to_commission && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Report Date</Label><Input type="date" value={form.commission_report_date} onChange={e => set("commission_report_date", e.target.value)} /></div>
                  <div><Label className="text-xs">Reference Number</Label><Input value={form.commission_reference} onChange={e => set("commission_reference", e.target.value)} /></div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSave("Draft")} className="flex-1 rounded-xl">Save Draft</Button>
              <Button onClick={() => handleSave("Submitted")} disabled={!form.participant_name || !form.episode_date} className="flex-1 rounded-xl font-bold bg-rose-600 hover:bg-rose-700">Submit Record</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}