import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Plus, Save, Loader2, AlertTriangle, CheckCircle, Pill, Clock,
  Trash2, FileText, ShieldAlert, Bell, X, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_COLORS = {
  Active: "bg-emerald-100 text-emerald-700",
  Ceased: "bg-slate-100 text-slate-600",
  "On Hold": "bg-amber-100 text-amber-700",
  PRN: "bg-blue-100 text-blue-700",
};

function EmergencyModal({ med, onClose, onLogged }) {
  const [step, setStep] = useState(1); // 1=confirm, 2=timer, 3=outcome
  const [elapsed, setElapsed] = useState(0);
  const [givenBy, setGivenBy] = useState("");
  const [outcome, setOutcome] = useState("");
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (step === 2) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const logAndClose = async () => {
    setSaving(true);
    clearInterval(timerRef.current);
    const log = {
      given_at: new Date().toISOString(),
      given_by: givenBy,
      dose_given: med.rescue_dose || med.dose,
      outcome,
      is_emergency: true,
      notes: `Emergency administration. Duration until given: ${fmt(elapsed)}`,
    };
    const updated = { ...med, dose_logs: [...(med.dose_logs || []), log] };
    await base44.entities.Medication.update(med.id, { dose_logs: updated.dose_logs });
    // Auto-create incident
    await base44.entities.Incident.create({
      participant_name: med.participant_name,
      incident_type: "Medication Error",
      severity: "High",
      description: `Emergency rescue medication administered: ${med.medication_name} ${med.dose}. Given by: ${givenBy}. Outcome: ${outcome}`,
      action_taken: `Rescue medication ${med.medication_name} administered at ${new Date().toLocaleTimeString("en-AU")}`,
      status: "Open",
      incident_date: new Date().toISOString().split("T")[0],
    });
    setSaving(false);
    onLogged();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Red header */}
        <div className="bg-rose-600 text-white p-6 text-center">
          <ShieldAlert size={36} className="mx-auto mb-2 animate-pulse" />
          <h2 className="text-2xl font-black">EMERGENCY MEDICATION</h2>
          <p className="text-rose-200 text-sm mt-1">{med.medication_name} — {med.participant_name}</p>
        </div>

        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <p className="font-black text-rose-800 mb-2">Rescue Instructions:</p>
                <p className="text-sm text-rose-700 leading-relaxed">{med.rescue_instructions || "Follow prescriber instructions. Administer as directed."}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <Phone size={20} className="text-amber-600 shrink-0" />
                <div>
                  <p className="font-black text-amber-800 text-sm">Call 000 if seizure continues &gt;5 minutes or if unsure</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 text-center">Press confirm to start the administration timer and log this event.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
                <Button onClick={() => setStep(2)} className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 font-black gap-2">
                  <CheckCircle size={16} /> Confirm & Start Timer
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center py-4">
                <p className="text-6xl font-black text-rose-600 font-mono">{fmt(elapsed)}</p>
                <p className="text-slate-500 text-sm mt-2">Time since administration</p>
              </div>
              <div>
                <Label>Administered By *</Label>
                <Input value={givenBy} onChange={e => setGivenBy(e.target.value)} placeholder="Staff name" className="mt-1" />
              </div>
              <div>
                <Label>Outcome / Response</Label>
                <Textarea value={outcome} onChange={e => setOutcome(e.target.value)} placeholder="Describe participant's response..." className="mt-1 min-h-[70px]" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-amber-700">⚠️ An incident report will be automatically generated</p>
              </div>
              <Button onClick={logAndClose} disabled={!givenBy || saving} className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 font-black gap-2 py-6">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Log Administration & Generate Incident
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DoseModal({ med, onClose, onLogged }) {
  const [form, setForm] = useState({ given_at: new Date().toISOString().slice(0, 16), given_by: "", dose_given: med.dose, outcome: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const log = { ...form, is_emergency: false };
    await base44.entities.Medication.update(med.id, { dose_logs: [...(med.dose_logs || []), log] });
    setSaving(false);
    onLogged();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Log Dose — {med.medication_name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Date & Time</Label><Input type="datetime-local" value={form.given_at} onChange={e => setForm(p => ({ ...p, given_at: e.target.value }))} className="mt-1 h-8 text-xs" /></div>
            <div><Label className="text-xs">Dose Given</Label><Input value={form.dose_given} onChange={e => setForm(p => ({ ...p, dose_given: e.target.value }))} className="mt-1 h-8 text-xs" /></div>
          </div>
          <div><Label className="text-xs">Given By</Label><Input value={form.given_by} onChange={e => setForm(p => ({ ...p, given_by: e.target.value }))} placeholder="Staff name" className="mt-1" /></div>
          <div><Label className="text-xs">Outcome / Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="mt-1 min-h-[60px] text-sm" /></div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={save} disabled={!form.given_by || saving} className="flex-1 rounded-xl gap-1">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Log Dose
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const EMPTY_MED = {
  participant_name: "", participant_id: "", medication_name: "", generic_name: "",
  dose: "", route: "Oral", frequency: "", times: [""],
  prescriber: "", indication: "", is_rescue: false, rescue_instructions: "",
  side_effects: "", storage: "Room temperature", start_date: "", status: "Active",
};

export default function MedicationDashboard() {
  const [meds, setMeds] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParticipant, setFilterParticipant] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_MED);
  const [saving, setSaving] = useState(false);
  const [emergencyMed, setEmergencyMed] = useState(null);
  const [doseMed, setDoseMed] = useState(null);
  const [selectedMed, setSelectedMed] = useState(null);

  const load = async () => {
    const [m, p] = await Promise.all([
      base44.entities.Medication.list("-created_date"),
      base44.entities.Participant.list(),
    ]);
    setMeds(m);
    setParticipants(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const saveMed = async () => {
    setSaving(true);
    if (editingId) {
      await base44.entities.Medication.update(editingId, form);
    } else {
      await base44.entities.Medication.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_MED);
    setSaving(false);
    load();
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({ ...m });
    setShowForm(true);
  };

  const deleteMed = async (id) => {
    if (!window.confirm("Delete this medication?")) return;
    await base44.entities.Medication.delete(id);
    load();
  };

  const selectParticipant = (id) => {
    const p = participants.find(x => x.id === id);
    if (p) setF("participant_name", p.name);
    setF("participant_id", id);
  };

  const filtered = filterParticipant === "all" ? meds : meds.filter(m => m.participant_name === filterParticipant);
  const rescueMeds = filtered.filter(m => m.is_rescue && m.status === "Active");
  const activeMeds = filtered.filter(m => !m.is_rescue && m.status === "Active");
  const todayLogs = meds.flatMap(m => (m.dose_logs || []).filter(l => l.given_at?.startsWith(new Date().toISOString().split("T")[0])));

  return (
    <div className="space-y-6">
      {emergencyMed && <EmergencyModal med={emergencyMed} onClose={() => setEmergencyMed(null)} onLogged={() => { setEmergencyMed(null); load(); }} />}
      {doseMed && <DoseModal med={doseMed} onClose={() => setDoseMed(null)} onLogged={() => { setDoseMed(null); load(); }} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Medication Dashboard</h2>
          <p className="text-muted-foreground text-sm">NDIS-compliant medication management, dose tracking & audit log.</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_MED); }} className="rounded-xl font-bold gap-2">
          <Plus size={15} /> Add Medication
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterParticipant} onValueChange={setFilterParticipant}>
          <SelectTrigger className="w-56"><SelectValue placeholder="All Participants" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Participants</SelectItem>
            {[...new Set(meds.map(m => m.participant_name))].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-3 text-xs font-bold text-muted-foreground ml-auto">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">{activeMeds.length} Active</span>
          <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full">{rescueMeds.length} Rescue</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{todayLogs.length} Doses Today</span>
        </div>
      </div>

      {/* RESCUE MEDICATION BUTTONS */}
      {rescueMeds.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5"><Bell size={12} /> Emergency / Rescue Medications</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rescueMeds.map(m => (
              <button
                key={m.id}
                onClick={() => setEmergencyMed(m)}
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl p-5 text-left transition-all shadow-lg shadow-rose-200 border-2 border-rose-700"
              >
                <div className="flex items-center gap-3 mb-2">
                  <ShieldAlert size={24} className="shrink-0 animate-pulse" />
                  <div>
                    <p className="font-black text-lg leading-none">🚨 EMERGENCY MEDICATION</p>
                    <p className="text-rose-200 text-xs mt-0.5">{m.participant_name}</p>
                  </div>
                </div>
                <p className="font-black text-white/90">{m.medication_name} — {m.dose}</p>
                <p className="text-rose-200 text-xs mt-1">Tap to administer, start timer & log incident</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Medication Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
          <Pill size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-black text-xl mb-1">No Medications</h3>
          <p className="text-muted-foreground text-sm">Add a medication to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.filter(m => !m.is_rescue).map(m => (
            <div key={m.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Pill size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-foreground">{m.medication_name} <span className="font-normal text-muted-foreground text-sm">{m.dose}</span></p>
                    <p className="text-xs text-muted-foreground truncate">{m.participant_name} · {m.frequency} · {m.route} · {m.prescriber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_COLORS[m.status]}`}>{m.status}</span>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-bold">{(m.dose_logs || []).length} doses</span>
                  <Button size="sm" onClick={() => setDoseMed(m)} className="rounded-lg font-bold gap-1 text-xs h-7 px-2"><CheckCircle size={12} /> Log</Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedMed(selectedMed?.id === m.id ? null : m)} className="rounded-lg h-7 px-2 text-xs">History</Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(m)} className="rounded-lg h-7 w-7 p-0"><FileText size={13} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMed(m.id)} className="rounded-lg h-7 w-7 p-0 text-destructive hover:text-destructive"><Trash2 size={13} /></Button>
                </div>
              </div>

              {/* Dose history */}
              {selectedMed?.id === m.id && (
                <div className="border-t border-border px-5 py-4 bg-secondary">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Dose History — Audit Log</p>
                  {(m.dose_logs || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No doses logged yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[...(m.dose_logs || [])].reverse().map((log, i) => (
                        <div key={i} className={`flex items-start justify-between text-xs p-2.5 rounded-xl ${log.is_emergency ? "bg-rose-50 border border-rose-200" : "bg-white border border-border"}`}>
                          <div>
                            <p className="font-bold text-foreground">{new Date(log.given_at).toLocaleString("en-AU")} {log.is_emergency && <span className="text-rose-600 font-black">🚨 EMERGENCY</span>}</p>
                            <p className="text-muted-foreground">{log.dose_given} · Given by: {log.given_by}</p>
                            {log.notes && <p className="text-muted-foreground mt-0.5">{log.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Medication" : "Add Medication"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Participant</Label>
                <Select value={form.participant_id} onValueChange={selectParticipant}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select participant..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Medication Name *</Label><Input value={form.medication_name} onChange={e => setF("medication_name", e.target.value)} className="mt-1" /></div>
              <div><Label>Generic Name</Label><Input value={form.generic_name} onChange={e => setF("generic_name", e.target.value)} className="mt-1" /></div>
              <div><Label>Dose *</Label><Input value={form.dose} onChange={e => setF("dose", e.target.value)} placeholder="e.g. 5mg" className="mt-1" /></div>
              <div><Label>Route</Label>
                <Select value={form.route} onValueChange={v => setF("route", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Oral","Topical","Inhaled","Injection","Sublingual","Rectal","Other"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Frequency</Label><Input value={form.frequency} onChange={e => setF("frequency", e.target.value)} placeholder="e.g. Twice daily" className="mt-1" /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setF("status", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Active","Ceased","On Hold","PRN"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Prescriber</Label><Input value={form.prescriber} onChange={e => setF("prescriber", e.target.value)} className="mt-1" /></div>
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setF("start_date", e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label>Indication / Purpose</Label><Input value={form.indication} onChange={e => setF("indication", e.target.value)} className="mt-1" /></div>
            <div><Label>Side Effects</Label><Input value={form.side_effects} onChange={e => setF("side_effects", e.target.value)} className="mt-1" /></div>
            <div><Label>Storage</Label><Input value={form.storage} onChange={e => setF("storage", e.target.value)} className="mt-1" /></div>

            {/* Rescue toggle */}
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
              <input type="checkbox" id="rescue" checked={form.is_rescue} onChange={e => setF("is_rescue", e.target.checked)} className="w-4 h-4 accent-rose-600" />
              <label htmlFor="rescue" className="font-black text-rose-700 cursor-pointer">🚨 This is a Rescue / Emergency Medication</label>
            </div>
            {form.is_rescue && (
              <div><Label>Rescue Instructions</Label><Textarea value={form.rescue_instructions} onChange={e => setF("rescue_instructions", e.target.value)} placeholder="Step-by-step instructions for administration..." className="mt-1 min-h-[80px]" /></div>
            )}

            <Button onClick={saveMed} disabled={!form.medication_name || !form.dose || saving} className="w-full rounded-xl font-bold">
              {saving ? <Loader2 size={15} className="animate-spin mr-2" /> : null}
              {editingId ? "Save Changes" : "Add Medication"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}