import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Plus, Save, Loader2, Heart, Printer, Trash2,
  AlertTriangle, CheckCircle, User, Phone, Pill, FileText, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_COLORS = {
  Active: "bg-emerald-100 text-emerald-700",
  "Under Review": "bg-amber-100 text-amber-700",
  Archived: "bg-slate-100 text-slate-600",
};

function Section({ title, icon: SectionIcon, color, children }) {
  return (
    <div className={`border rounded-3xl p-6 space-y-4 ${color || "border-border bg-card"}`}>
      <h3 className="font-black text-base flex items-center gap-2">
        {SectionIcon && <SectionIcon size={16} className="text-primary" />} {title}
      </h3>
      {children}
    </div>
  );
}

const BLANK = {
  participant_name: "", participant_id: "", ndis_number: "", date_of_birth: "",
  address: "", health_conditions: "",
  doctor_name: "", doctor_phone: "", doctor_address: "",
  parent_carer_name: "", parent_carer_phone: "", parent_carer_email: "",
  emergency_contact_name: "", emergency_contact_phone: "", emergency_contact_relationship: "",
  medications: [{ name: "", dose: "", frequency: "", route: "Oral", time: "", prescriber: "", notes: "" }],
  health_support_procedures: "", emergency_response: "", emergency_alert: "", additional_support: "",
  parent_consent: false, consent_date: "", plan_developed_by: "", review_date: "", status: "Active",
};

export default function HealthCarePlan() {
  const [plans, setPlans] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | form | detail
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const [p, parts] = await Promise.all([
      base44.entities.HealthCarePlan.list("-created_date"),
      base44.entities.Participant.list(),
    ]);
    setPlans(p);
    setParticipants(parts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const selectParticipant = (id) => {
    const p = participants.find(x => x.id === id);
    if (!p) return;
    setForm(prev => ({
      ...prev,
      participant_id: id,
      participant_name: p.name,
      ndis_number: p.ndis_number || "",
      date_of_birth: p.date_of_birth || "",
      address: p.address || "",
      parent_carer_name: p.parent_guardian_name || "",
      parent_carer_phone: p.parent_guardian_phone || "",
      parent_carer_email: p.parent_guardian_email || "",
      emergency_contact_name: p.emergency_contact_name || "",
      emergency_contact_phone: p.emergency_contact_phone || "",
      emergency_contact_relationship: p.emergency_contact_relationship || "",
    }));
  };

  const updateMed = (i, k, v) => {
    setForm(p => ({ ...p, medications: p.medications.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }));
  };
  const addMed = () => setForm(p => ({ ...p, medications: [...p.medications, { name: "", dose: "", frequency: "", route: "Oral", time: "", prescriber: "", notes: "" }] }));
  const removeMed = (i) => setForm(p => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    if (editingId) {
      await base44.entities.HealthCarePlan.update(editingId, form);
    } else {
      await base44.entities.HealthCarePlan.create(form);
    }
    setSaving(false);
    setView("list");
    setEditingId(null);
    load();
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    await base44.entities.HealthCarePlan.delete(id);
    load();
  };

  const openEdit = (plan) => {
    setForm({ ...BLANK, ...plan });
    setEditingId(plan.id);
    setView("form");
  };

  // ── LIST ──
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Individual Health Support Plans</h2>
            <p className="text-muted-foreground text-sm">IHSP — NDIS-compliant health care documentation with emergency care plans.</p>
          </div>
          <Button onClick={() => { setForm(BLANK); setEditingId(null); setView("form"); }} className="rounded-xl font-bold gap-2">
            <Plus size={15} /> New Plan
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : plans.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
            <Heart size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-black text-xl mb-1">No Health Support Plans</h3>
            <p className="text-muted-foreground text-sm mb-6">Create an IHSP for participants with health conditions.</p>
            <Button onClick={() => { setForm(BLANK); setEditingId(null); setView("form"); }} className="rounded-xl font-bold gap-2"><Plus size={15} /> Create Plan</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center"><Heart size={18} className="text-rose-600" /></div>
                    <div>
                      <p className="font-black text-foreground">{plan.participant_name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{plan.health_conditions || "No conditions listed"}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[plan.status]}`}>{plan.status}</span>
                </div>
                {plan.emergency_alert && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-700 font-bold mb-3">
                    ⚠️ {plan.emergency_alert}
                  </div>
                )}
                <div className="text-xs text-muted-foreground flex justify-between mt-2">
                  <span>{(plan.medications || []).length} medications</span>
                  <span>Review: {plan.review_date || "Not set"}</span>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => { setSelected(plan); setView("detail"); }} className="flex-1 rounded-lg gap-1 text-xs"><FileText size={12} /> View</Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(plan)} className="flex-1 rounded-lg gap-1 text-xs"><Edit size={12} /> Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => deletePlan(plan.id)} className="flex-1 rounded-lg gap-1 text-xs text-destructive hover:text-destructive"><Trash2 size={12} /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── FORM ──
  if (view === "form") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => setView("list")} className="text-primary text-sm font-bold hover:underline">← Back</button>
            <h2 className="text-2xl font-black mt-1">{editingId ? "Edit" : "New"} Health Support Plan</h2>
          </div>
          <Button onClick={save} disabled={!form.participant_name || saving} className="rounded-xl font-bold gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Section title="Participant Details" icon={User}>
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_id} onValueChange={selectParticipant}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select participant..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">NDIS Number</Label><Input value={form.ndis_number} onChange={e => setF("ndis_number", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => setF("date_of_birth", e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Address</Label><Input value={form.address} onChange={e => setF("address", e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Health Conditions</Label><Textarea value={form.health_conditions} onChange={e => setF("health_conditions", e.target.value)} placeholder="e.g. Epilepsy, Type 1 Diabetes, Severe Asthma" className="mt-1 min-h-[60px] text-sm" /></div>
            </Section>

            <Section title="Doctor / Health Professional" icon={Heart}>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Name</Label><Input value={form.doctor_name} onChange={e => setF("doctor_name", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Phone</Label><Input value={form.doctor_phone} onChange={e => setF("doctor_phone", e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Address</Label><Input value={form.doctor_address} onChange={e => setF("doctor_address", e.target.value)} className="mt-1" /></div>
            </Section>

            <Section title="Parent / Carer & Emergency Contacts" icon={Phone}>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Parent/Carer Name</Label><Input value={form.parent_carer_name} onChange={e => setF("parent_carer_name", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Phone</Label><Input value={form.parent_carer_phone} onChange={e => setF("parent_carer_phone", e.target.value)} className="mt-1" /></div>
                <div className="col-span-2"><Label className="text-xs">Email</Label><Input value={form.parent_carer_email} onChange={e => setF("parent_carer_email", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Emergency Contact</Label><Input value={form.emergency_contact_name} onChange={e => setF("emergency_contact_name", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Phone</Label><Input value={form.emergency_contact_phone} onChange={e => setF("emergency_contact_phone", e.target.value)} className="mt-1" /></div>
                <div className="col-span-2"><Label className="text-xs">Relationship</Label><Input value={form.emergency_contact_relationship} onChange={e => setF("emergency_contact_relationship", e.target.value)} className="mt-1" /></div>
              </div>
            </Section>
          </div>

          <div className="space-y-4">
            {/* Emergency Alert */}
            <div className="border-2 border-rose-400 bg-rose-50 rounded-3xl p-6 space-y-3">
              <h3 className="font-black text-rose-700 flex items-center gap-2"><AlertTriangle size={16} /> Emergency Alert</h3>
              <Textarea value={form.emergency_alert} onChange={e => setF("emergency_alert", e.target.value)} placeholder="Critical emergency information staff must know immediately (e.g. Allergic to penicillin, has epilepsy)..." className="min-h-[70px] text-sm border-rose-300" />
              <div><Label className="text-xs text-rose-700">Emergency Care / Response Plan</Label>
              <Textarea value={form.emergency_response} onChange={e => setF("emergency_response", e.target.value)} placeholder="What to do in an emergency involving this participant..." className="mt-1 min-h-[80px] text-sm border-rose-300" /></div>
            </div>

            {/* Medications */}
            <Section title="Medication Schedule" icon={Pill}>
              <div className="space-y-3">
                {form.medications.map((m, i) => (
                  <div key={i} className="p-4 bg-secondary rounded-2xl space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[10px]">Medication Name</Label><Input value={m.name} onChange={e => updateMed(i, "name", e.target.value)} className="mt-0.5 h-8 text-xs" /></div>
                      <div><Label className="text-[10px]">Dose</Label><Input value={m.dose} onChange={e => updateMed(i, "dose", e.target.value)} className="mt-0.5 h-8 text-xs" /></div>
                      <div><Label className="text-[10px]">Frequency</Label><Input value={m.frequency} onChange={e => updateMed(i, "frequency", e.target.value)} className="mt-0.5 h-8 text-xs" /></div>
                      <div><Label className="text-[10px]">Time(s)</Label><Input value={m.time} onChange={e => updateMed(i, "time", e.target.value)} placeholder="e.g. 8am, 1pm" className="mt-0.5 h-8 text-xs" /></div>
                      <div><Label className="text-[10px]">Prescriber</Label><Input value={m.prescriber} onChange={e => updateMed(i, "prescriber", e.target.value)} className="mt-0.5 h-8 text-xs" /></div>
                      <div className="flex items-end gap-1">
                        <div className="flex-1"><Label className="text-[10px]">Route</Label>
                          <Select value={m.route} onValueChange={v => updateMed(i, "route", v)}>
                            <SelectTrigger className="mt-0.5 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{["Oral","Topical","Inhaled","Injection","Sublingual","Other"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        {form.medications.length > 1 && <button onClick={() => removeMed(i)} className="text-muted-foreground hover:text-destructive pb-0.5"><Trash2 size={13} /></button>}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addMed} className="w-full rounded-xl gap-1"><Plus size={13} /> Add Medication</Button>
              </div>
            </Section>

            <Section title="Additional Notes & Consent">
              <div><Label className="text-xs">Health Support Procedures</Label><Textarea value={form.health_support_procedures} onChange={e => setF("health_support_procedures", e.target.value)} className="mt-1 min-h-[60px] text-sm" /></div>
              <div><Label className="text-xs">Additional Support Required</Label><Textarea value={form.additional_support} onChange={e => setF("additional_support", e.target.value)} className="mt-1 min-h-[60px] text-sm" /></div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <input type="checkbox" id="consent" checked={form.parent_consent} onChange={e => setF("parent_consent", e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                <label htmlFor="consent" className="text-sm font-bold text-emerald-800 cursor-pointer">Parent/carer consent provided</label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Plan Developed By</Label><Input value={form.plan_developed_by} onChange={e => setF("plan_developed_by", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Review Date</Label><Input type="date" value={form.review_date} onChange={e => setF("review_date", e.target.value)} className="mt-1" /></div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL ──
  if (view === "detail" && selected) {
    return (
      <div className="space-y-6">
        <style>{`@media print { .no-print{display:none!important} @page{size:A4;margin:12mm} }`}</style>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 no-print">
          <div>
            <button onClick={() => setView("list")} className="text-primary text-sm font-bold hover:underline">← All Plans</button>
            <h2 className="text-2xl font-black mt-1">{selected.participant_name}</h2>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black self-start ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
            <Button variant="outline" onClick={() => openEdit(selected)} className="rounded-xl gap-2 text-sm no-print"><Edit size={13} /> Edit</Button>
            <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2 text-sm no-print"><Printer size={13} /> Print</Button>
          </div>
        </div>

        {selected.emergency_alert && (
          <div className="bg-rose-600 text-white rounded-2xl p-5 flex items-start gap-3">
            <AlertTriangle size={20} className="shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-black text-lg">Emergency Alert</p>
              <p className="text-rose-100 mt-1">{selected.emergency_alert}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "NDIS Number", value: selected.ndis_number },
            { label: "Doctor", value: selected.doctor_name },
            { label: "Review Date", value: selected.review_date || "Not set" },
          ].map(k => (
            <div key={k.label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className="font-black text-foreground">{k.value || "—"}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {selected.emergency_response && (
            <Section title="🚨 Emergency Care / Response Plan" color="border-rose-200 bg-rose-50">
              <p className="text-sm text-rose-800 leading-relaxed whitespace-pre-wrap">{selected.emergency_response}</p>
            </Section>
          )}

          <Section title="Contacts">
            {[
              { label: "Parent/Carer", name: selected.parent_carer_name, phone: selected.parent_carer_phone },
              { label: "Emergency Contact", name: selected.emergency_contact_name, phone: selected.emergency_contact_phone },
              { label: "Doctor/GP", name: selected.doctor_name, phone: selected.doctor_phone },
            ].filter(c => c.name).map(c => (
              <div key={c.label} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{c.label}</p>
                  <p className="font-bold text-sm text-foreground">{c.name}</p>
                </div>
                {c.phone && <a href={`tel:${c.phone}`} className="font-black text-primary text-sm">{c.phone}</a>}
              </div>
            ))}
          </Section>

          {(selected.medications || []).length > 0 && (
            <Section title="Medication Schedule" icon={Pill} color="border-blue-100 bg-blue-50">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-muted-foreground font-black uppercase border-b border-blue-200">
                    {["Medication","Dose","Frequency","Time","Route","Prescriber"].map(h => <th key={h} className="py-2 px-2 text-left">{h}</th>)}
                  </tr></thead>
                  <tbody>{(selected.medications || []).map((m, i) => (
                    <tr key={i} className="border-b border-blue-100">
                      <td className="py-2 px-2 font-bold">{m.name}</td>
                      <td className="py-2 px-2">{m.dose}</td>
                      <td className="py-2 px-2">{m.frequency}</td>
                      <td className="py-2 px-2">{m.time}</td>
                      <td className="py-2 px-2">{m.route}</td>
                      <td className="py-2 px-2">{m.prescriber}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Section>
          )}

          {selected.health_conditions && (
            <Section title="Health Conditions & Support">
              <p className="text-sm text-foreground leading-relaxed">{selected.health_conditions}</p>
              {selected.health_support_procedures && <><p className="text-[10px] font-black text-muted-foreground uppercase mt-2 mb-1">Support Procedures</p><p className="text-sm">{selected.health_support_procedures}</p></>}
              {selected.additional_support && <><p className="text-[10px] font-black text-muted-foreground uppercase mt-2 mb-1">Additional Support</p><p className="text-sm">{selected.additional_support}</p></>}
            </Section>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          {selected.parent_consent ? <CheckCircle size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-500" />}
          <p className="text-sm font-bold">{selected.parent_consent ? "Parent/carer consent provided" : "Parent/carer consent NOT yet recorded"}</p>
          <span className="ml-auto text-xs text-muted-foreground">Developed by: {selected.plan_developed_by || "Not recorded"}</span>
        </div>
      </div>
    );
  }

  return null;
}