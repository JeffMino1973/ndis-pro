import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Plus, Save, Loader2, AlertTriangle, CheckCircle, Brain,
  Trash2, Printer, ChevronDown, ChevronUp, Phone, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_EMERGENCY_STEPS = [
  "Stay calm and note the time the seizure started",
  "Clear the area of any hazards",
  "Place participant on their side (recovery position) if possible",
  "Cushion head with something soft",
  "Do NOT restrain — let the seizure run its course",
  "Stay with participant until fully recovered",
  "Record duration and behaviour",
  "Complete incident report after the event",
];

const DEFAULT_CALL_000 = [
  "Seizure lasts longer than 5 minutes",
  "Second seizure occurs without recovery in between",
  "Participant does not regain consciousness",
  "Participant is injured during seizure",
  "This is the first known seizure",
  "Participant is pregnant",
];

const DEFAULT_DO_NOT = [
  "Do NOT put anything in the participant's mouth",
  "Do NOT hold down or restrain",
  "Do NOT give food or water until fully alert",
  "Do NOT leave alone until fully recovered",
];

const DEFAULT_DAILY = [
  "Ensure medication is taken at consistent times",
  "Monitor for signs of breakthrough seizures",
  "Avoid known triggers (document these)",
  "Ensure safe environment — padded furniture if needed",
  "Keep emergency contacts accessible at all times",
];

export default function EpilepsyPlans() {
  const [plans, setPlans] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | form | detail
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({ emergency: true, medication: true, daily: true, risks: false });

  const load = async () => {
    const [p, parts] = await Promise.all([
      base44.entities.EpilepsyPlan.list("-created_date"),
      base44.entities.Participant.list(),
    ]);
    setPlans(p);
    setParticipants(parts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = (k) => setExpanded(p => ({ ...p, [k]: !p[k] }));

  const blankForm = () => ({
    participant_name: "", participant_id: "", ndis_number: "", date_of_birth: "",
    diagnosis: "", neurologist: "", neurologist_phone: "",
    seizure_types: "", typical_duration: "", warning_signs: "", known_triggers: "", postictal_description: "",
    emergency_steps: [...DEFAULT_EMERGENCY_STEPS],
    call_000_if: [...DEFAULT_CALL_000],
    do_not_do: [...DEFAULT_DO_NOT],
    rescue_medication_name: "", rescue_dose: "", rescue_route: "", rescue_when: "",
    daily_strategies: [...DEFAULT_DAILY],
    risk_strategies: ["Ensure safe home environment", "Helmet if required", "Shower supervision if at risk"],
    approved_by: "", approval_date: "", review_date: "",
    status: "Active",
  });

  const startNew = () => { setForm(blankForm()); setView("form"); };

  const selectParticipant = (id) => {
    const p = participants.find(x => x.id === id);
    if (!p) return;
    setForm(prev => ({ ...prev, participant_id: id, participant_name: p.name, ndis_number: p.ndis_number || "", date_of_birth: p.date_of_birth || "" }));
  };

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const updateList = (field, i, value) => {
    setForm(p => ({ ...p, [field]: p[field].map((x, idx) => idx === i ? value : x) }));
  };
  const addItem = (field) => setForm(p => ({ ...p, [field]: [...p[field], ""] }));
  const removeItem = (field, i) => setForm(p => ({ ...p, [field]: p[field].filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    const saved = await base44.entities.EpilepsyPlan.create(form);
    await load();
    setSelected(saved);
    setView("detail");
    setSaving(false);
  };

  // ── LIST ──
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Epilepsy Management Plans</h2>
            <p className="text-muted-foreground text-sm">NDIS-compliant health care & emergency response plans.</p>
          </div>
          <Button onClick={startNew} className="rounded-xl font-bold gap-2"><Plus size={15} /> New Plan</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : plans.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
            <Brain size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-black text-xl mb-1">No Plans Yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Create an epilepsy management plan for a participant.</p>
            <Button onClick={startNew} className="rounded-xl font-bold gap-2"><Plus size={15} /> Create Plan</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} onClick={() => { setSelected(plan); setView("detail"); }} className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Brain size={18} className="text-purple-600" /></div>
                    <div>
                      <p className="font-black text-foreground">{plan.participant_name}</p>
                      <p className="text-xs text-muted-foreground">{plan.diagnosis}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${plan.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{plan.status}</span>
                </div>
                {plan.rescue_medication_name && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-700 font-bold mt-3">
                    🚨 Rescue Med: {plan.rescue_medication_name} {plan.rescue_dose}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] text-muted-foreground">
                  <span>Review: {plan.review_date || "Not set"}</span>
                  <span className="text-right">By: {plan.approved_by || "Pending"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── FORM ──
  if (view === "form" && form) {
    const ListEditor = ({ field, label, placeholder }) => (
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-xs font-black">{label}</Label>
          <Button variant="outline" size="sm" onClick={() => addItem(field)} className="rounded-lg gap-1 h-6 text-xs px-2"><Plus size={10} /></Button>
        </div>
        <div className="space-y-1.5">
          {(form[field] || []).map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input value={item} onChange={e => updateList(field, i, e.target.value)} placeholder={placeholder} className="text-xs h-8" />
              <button onClick={() => removeItem(field, i)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => setView("list")} className="text-primary text-sm font-bold hover:underline">← Back</button>
            <h2 className="text-2xl font-black mt-1">New Epilepsy Management Plan</h2>
          </div>
          <Button onClick={save} disabled={!form.participant_name || !form.diagnosis || saving} className="rounded-xl font-bold gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Participant & Seizure */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <h3 className="font-black text-lg">Participant Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Participant</Label>
                  <Select value={form.participant_id} onValueChange={selectParticipant}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select participant..." /></SelectTrigger>
                    <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>NDIS Number</Label><Input value={form.ndis_number} onChange={e => setF("ndis_number", e.target.value)} className="mt-1" /></div>
                <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => setF("date_of_birth", e.target.value)} className="mt-1" /></div>
              </div>
              <h3 className="font-black text-lg pt-2">Seizure Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Diagnosis / Epilepsy Syndrome *</Label><Input value={form.diagnosis} onChange={e => setF("diagnosis", e.target.value)} placeholder="e.g. Focal onset impaired awareness seizures" className="mt-1" /></div>
                <div><Label>Neurologist / GP</Label><Input value={form.neurologist} onChange={e => setF("neurologist", e.target.value)} className="mt-1" /></div>
                <div><Label>Neurologist Phone</Label><Input value={form.neurologist_phone} onChange={e => setF("neurologist_phone", e.target.value)} className="mt-1" /></div>
                <div><Label>Seizure Types</Label><Input value={form.seizure_types} onChange={e => setF("seizure_types", e.target.value)} className="mt-1" /></div>
                <div><Label>Typical Duration</Label><Input value={form.typical_duration} onChange={e => setF("typical_duration", e.target.value)} placeholder="e.g. 1–3 minutes" className="mt-1" /></div>
                <div className="col-span-2"><Label>Warning Signs / Aura</Label><Input value={form.warning_signs} onChange={e => setF("warning_signs", e.target.value)} className="mt-1" /></div>
                <div className="col-span-2"><Label>Known Triggers</Label><Input value={form.known_triggers} onChange={e => setF("known_triggers", e.target.value)} className="mt-1" /></div>
                <div className="col-span-2"><Label>Post-Ictal State</Label><Textarea value={form.postictal_description} onChange={e => setF("postictal_description", e.target.value)} className="mt-1 min-h-[60px] text-sm" /></div>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 space-y-4">
              <h3 className="font-black text-lg text-rose-800">💊 Rescue Medication</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Medication Name</Label><Input value={form.rescue_medication_name} onChange={e => setF("rescue_medication_name", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Dose</Label><Input value={form.rescue_dose} onChange={e => setF("rescue_dose", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Route</Label><Input value={form.rescue_route} onChange={e => setF("rescue_route", e.target.value)} placeholder="e.g. Buccal/Intranasal" className="mt-1" /></div>
                <div><Label className="text-xs">When to Give</Label><Input value={form.rescue_when} onChange={e => setF("rescue_when", e.target.value)} placeholder="e.g. After 5 minutes" className="mt-1" /></div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h3 className="font-black text-lg">Approval</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Approved By (Doctor)</Label><Input value={form.approved_by} onChange={e => setF("approved_by", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Approval Date</Label><Input type="date" value={form.approval_date} onChange={e => setF("approval_date", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Review Date</Label><Input type="date" value={form.review_date} onChange={e => setF("review_date", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v => setF("status", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Active","Under Review","Archived"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Lists */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <h3 className="font-black text-lg text-rose-700">🚨 Emergency Response</h3>
              <ListEditor field="emergency_steps" label="Response Steps (in order)" placeholder="Step..." />
              <ListEditor field="call_000_if" label="Call 000 If..." placeholder="Condition..." />
              <ListEditor field="do_not_do" label="Do NOT Do" placeholder="Do not..." />
            </div>
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <h3 className="font-black text-lg">Daily Support & Risk</h3>
              <ListEditor field="daily_strategies" label="Daily Support Strategies" placeholder="Strategy..." />
              <ListEditor field="risk_strategies" label="Risk Management" placeholder="Risk strategy..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL ──
  if (view === "detail" && selected) {
    const Section = ({ id, title, color, children }) => (
      <div className={`border rounded-3xl overflow-hidden ${color || "border-border bg-card"}`}>
        <button onClick={() => toggle(id)} className="w-full flex justify-between items-center px-6 py-4 hover:bg-black/5 transition-colors">
          <h3 className="font-black text-base">{title}</h3>
          {expanded[id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expanded[id] && <div className="px-6 pb-6">{children}</div>}
      </div>
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center no-print">
          <button onClick={() => setView("list")} className="text-primary text-sm font-bold hover:underline">← All Plans</button>
          <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2 font-bold text-sm"><Printer size={14} /> Print / Save PDF</Button>
        </div>

        <div className="bg-white max-w-4xl mx-auto shadow-xl rounded-b-xl overflow-hidden text-slate-800 text-sm">
          {/* Gradient Header */}
          <div style={{background:"linear-gradient(90deg,#3b82f6 0%,#2563eb 40%,#9333ea 100%)"}} className="p-7 flex items-center justify-between">
            <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/09e12d07c_LOGO_LANDSCAPE.png" alt="SZ-JIE WANG" className="h-14 rounded-xl bg-white px-3 py-2 object-contain" />
            <div className="text-right text-white">
              <h1 className="text-2xl font-black tracking-tight">Epilepsy Management Plan</h1>
              <p className="text-blue-100 text-xs mt-1">SZ-JIE WANG Support Services · NDIS Registered Provider</p>
            </div>
          </div>

          <div className="p-8 space-y-7">
            {/* Section 1 - General Info */}
            <section>
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="opacity-60">1.</span> General Information
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Name", value: selected.participant_name, accent: true },
                  { label: "DOB", value: selected.date_of_birth || "—" },
                  { label: "Diagnosis", value: selected.diagnosis },
                  { label: "Emergency Contact", value: "See file", accent: true },
                ].map(f => (
                  <div key={f.label} className={`border-l-4 pl-3 ${f.accent ? "border-blue-500 bg-blue-50/50 pr-2 rounded-r-lg" : "border-slate-200"}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                    <p className={`font-black text-sm leading-tight ${f.accent ? "text-blue-800" : "text-slate-800"}`}>{f.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2 & 3 - Triggers & Warning Signs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
                <h3 className="font-black text-cyan-800 uppercase text-[9px] tracking-wider mb-2 flex items-center gap-2"><span>⚠️</span> 2. Triggers</h3>
                <p className="text-cyan-900 font-black text-sm">{selected.known_triggers || "—"}</p>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <h3 className="font-black text-purple-800 uppercase text-[9px] tracking-wider mb-2 flex items-center gap-2"><span>👀</span> 3. Warning Signs / Aura</h3>
                <p className="text-purple-900 font-black text-sm italic">"{selected.warning_signs || "None recorded"}"</p>
              </div>
            </div>

            {/* Section 4 - Seizure Table */}
            <section>
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="opacity-60">4.</span> Seizure Description &amp; Support Needs
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="p-3">Seizure Type</th>
                      <th className="p-3">Duration / Freq</th>
                      <th className="p-3 text-center">Rescue Med?</th>
                      <th className="p-3 bg-red-700">Ambulance Trigger</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 text-xs">
                      <td className="p-3 font-black text-slate-800">{selected.seizure_types || "—"}</td>
                      <td className="p-3 space-y-1">
                        <p><span className="text-slate-400 font-bold uppercase text-[8px]">Duration:</span> <span className="font-black">{selected.typical_duration || "—"}</span></p>
                      </td>
                      <td className="p-3 text-center font-black text-slate-400">{selected.rescue_medication_name ? "YES" : "NO"}</td>
                      <td className="p-3 bg-red-50 font-black text-red-700">
                        {(selected.call_000_if || []).slice(0, 1).map((c, i) => <div key={i} className="flex items-start gap-2"><span>🚨</span><span>{c}</span></div>)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5 & 6 - During & After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                <h3 className="font-black text-emerald-800 uppercase mb-3 text-[9px] tracking-widest">5. During Seizure</h3>
                <ol className="space-y-2">
                  {(selected.emergency_steps || []).map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs text-emerald-950 font-black"><span className="text-emerald-500 font-black shrink-0">{i + 1}.</span>{s}</li>
                  ))}
                </ol>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                <h3 className="font-black text-blue-800 uppercase mb-3 text-[9px] tracking-widest">6. After Seizure / Post-Ictal</h3>
                <p className="text-xs font-black text-blue-950">{selected.postictal_description || "—"}</p>
                {(selected.do_not_do || []).length > 0 && (
                  <div className="mt-3">
                    <p className="text-[9px] font-black text-red-600 uppercase mb-1">⛔ Do NOT:</p>
                    <ul className="space-y-1">{selected.do_not_do.map((d, i) => <li key={i} className="text-xs font-black text-red-800 flex gap-1.5"><span>✗</span>{d}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>

            {/* Rescue Medication */}
            {selected.rescue_medication_name && (
              <section>
                <div className="bg-red-700 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  💊 Emergency Rescue Medication
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Medication", value: selected.rescue_medication_name },
                    { label: "Dose", value: selected.rescue_dose },
                    { label: "Route", value: selected.rescue_route },
                    { label: "When to Give", value: selected.rescue_when },
                  ].map(f => (
                    <div key={f.label} className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="font-black text-red-800 text-sm">{f.value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 7 - Endorsements */}
            <section>
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="opacity-60">7.</span> Risk / Safety &amp; Endorsements
              </div>
              <div className="grid grid-cols-2 gap-6 px-2">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Strategies</p>
                  <ul className="space-y-1">{(selected.daily_strategies || []).map((s, i) => <li key={i} className="text-xs text-slate-700 font-bold flex gap-1.5"><span className="text-emerald-500">✓</span>{s}</li>)}</ul>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Treating Physician</p>
                  <p className="font-black text-sm text-slate-800">{selected.neurologist || "—"}</p>
                  {selected.neurologist_phone && <p className="text-xs font-bold text-slate-600">{selected.neurologist_phone}</p>}
                  {selected.approval_date && <p className="text-[9px] font-black text-blue-600 mt-1 uppercase">Endorsed: {selected.approval_date}</p>}
                </div>
              </div>
            </section>

            <p className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">SZ-JIE WANG Support Services · NDIS Registered Provider · This document is confidential.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}