import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LIKELIHOODS = ["Almost Certain", "Likely", "Possible", "Unlikely", "Rare"];
const CONSEQUENCES = ["Catastrophic", "Major", "Moderate", "Minor", "Insignificant"];

const RISK_MATRIX = {
  "Almost Certain": { Catastrophic: "Extreme", Major: "Extreme", Moderate: "High", Minor: "High", Insignificant: "Medium" },
  "Likely":         { Catastrophic: "Extreme", Major: "High",   Moderate: "High", Minor: "Medium", Insignificant: "Low" },
  "Possible":       { Catastrophic: "High",    Major: "High",   Moderate: "Medium", Minor: "Low", Insignificant: "Low" },
  "Unlikely":       { Catastrophic: "High",    Major: "Medium", Moderate: "Low",  Minor: "Low", Insignificant: "Low" },
  "Rare":           { Catastrophic: "Medium",  Major: "Low",    Moderate: "Low",  Minor: "Low", Insignificant: "Low" },
};

const RISK_COLORS = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-orange-100 text-orange-800",
  High: "bg-red-100 text-red-800",
  Extreme: "bg-red-900 text-white",
};

function getRating(likelihood, consequence) {
  return RISK_MATRIX[likelihood]?.[consequence] || "Medium";
}

const DEFAULT_HAZARDS = [
  { hazard: "Participant getting lost or disoriented", initial_likelihood: "Possible", initial_consequence: "Major", initial_rating: "High", controls: "", residual_likelihood: "Unlikely", residual_consequence: "Minor", residual_rating: "Low", person_responsible: "" },
  { hazard: "Traffic hazards / Crossing roads unsafely", initial_likelihood: "Unlikely", initial_consequence: "Major", initial_rating: "Medium", controls: "", residual_likelihood: "Rare", residual_consequence: "Minor", residual_rating: "Low", person_responsible: "" },
  { hazard: "Sensory overload (loud crowds/noise)", initial_likelihood: "Likely", initial_consequence: "Moderate", initial_rating: "High", controls: "", residual_likelihood: "Possible", residual_consequence: "Minor", residual_rating: "Low", person_responsible: "" },
];

export default function RiskAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [hazards, setHazards] = useState(DEFAULT_HAZARDS.map(h => ({ ...h })));
  const [participants, setParticipants] = useState([]);
  const [form, setForm] = useState({
    title: "", participant_id: "",
    participant_name: "", participant_dob: "", ndis_number: "",
    home_address: "", destination: "",
    assessor_name: "", assessor_role: "",
    activity_description: "", assessment_date: new Date().toISOString().split("T")[0], review_date: "",
    emergency_contact_1_name: "", emergency_contact_1_phone: "", emergency_contact_1_rel: "",
    emergency_contact_2_name: "", emergency_contact_2_phone: "", emergency_contact_2_rel: "",
  });

  useEffect(() => {
    Promise.all([
      base44.entities.RiskAssessment.list("-created_date"),
      base44.entities.Participant.list(),
    ]).then(([data, parts]) => {
      setAssessments(data);
      setParticipants(parts);
      setLoading(false);
    });
  }, []);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const selectParticipant = (id) => {
    const p = participants.find(x => x.id === id);
    if (!p) return;
    setForm(prev => ({
      ...prev,
      participant_id: p.id,
      participant_name: p.name,
      participant_dob: p.date_of_birth || "",
      ndis_number: p.ndis_number || "",
      home_address: p.address || "",
      emergency_contact_1_name: p.emergency_contact_name || "",
      emergency_contact_1_phone: p.emergency_contact_phone || "",
      emergency_contact_1_rel: p.emergency_contact_relationship || "",
    }));
  };

  const updateHazard = (i, field, value) => {
    setHazards(prev => prev.map((h, idx) => {
      if (idx !== i) return h;
      const updated = { ...h, [field]: value };
      // Auto-recalculate ratings when likelihood/consequence change
      if (field === "initial_likelihood" || field === "initial_consequence") {
        const l = field === "initial_likelihood" ? value : h.initial_likelihood;
        const c = field === "initial_consequence" ? value : h.initial_consequence;
        updated.initial_rating = getRating(l, c);
      }
      if (field === "residual_likelihood" || field === "residual_consequence") {
        const l = field === "residual_likelihood" ? value : h.residual_likelihood;
        const c = field === "residual_consequence" ? value : h.residual_consequence;
        updated.residual_rating = getRating(l, c);
      }
      return updated;
    }));
  };

  const addHazard = () => {
    setHazards(prev => [...prev, { hazard: "", initial_likelihood: "Possible", initial_consequence: "Moderate", initial_rating: "Medium", controls: "", residual_likelihood: "Unlikely", residual_consequence: "Minor", residual_rating: "Low", person_responsible: "" }]);
  };

  const removeHazard = (i) => setHazards(prev => prev.filter((_, idx) => idx !== i));

  const overallRisk = () => {
    const order = ["Extreme", "High", "Medium", "Low"];
    for (const level of order) {
      if (hazards.some(h => h.residual_rating === level)) return level;
    }
    return "Low";
  };

  const saveAssessment = async () => {
    setSaving(true);
    await base44.entities.RiskAssessment.create({
      ...form,
      hazards,
      overall_risk_level: overallRisk(),
      status: "Draft",
    });
    const data = await base44.entities.RiskAssessment.list("-created_date");
    setAssessments(data);
    setSaving(false);
  };

  if (printData) {
    return <RiskAssessmentPrint data={printData} onBack={() => setPrintData(null)} />;
  }

  const F = ({ label, field, type = "text", placeholder = "", readOnly = false }) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={form[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder} className="mt-1" readOnly={readOnly} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Risk Assessment Builder</h2>
        <p className="text-muted-foreground text-sm">Compliant with NDIS Practice Standards for Incident and Risk Management.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">

          {/* Participant & Assessment Details */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h3 className="font-black text-lg">Assessment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-xs">Assessment Title *</Label>
                <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Travel Risk Assessment — Coogee to Botany" className="mt-1 font-semibold" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Link to Participant</Label>
                <select value={form.participant_id} onChange={e => selectParticipant(e.target.value)} className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Select participant (auto-fills details)...</option>
                  {participants.map(p => <option key={p.id} value={p.id}>{p.name} — {p.ndis_number}</option>)}
                </select>
              </div>
            </div>
            <h3 className="font-black text-lg pt-2">Participant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Participant Full Name" field="participant_name" />
              <F label="Date of Birth" field="participant_dob" type="date" />
              <F label="NDIS Number" field="ndis_number" />
              <F label="Home Address" field="home_address" />
              <F label="Destination / Workplace" field="destination" />
              <F label="Activity / Scope" field="activity_description" placeholder="e.g. Independent travel training via bus" />
            </div>

            <h3 className="font-black text-lg pt-2">Assessor Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <F label="Assessor Name" field="assessor_name" />
              <F label="Assessor Role / Position" field="assessor_role" />
              <F label="Assessment Date" field="assessment_date" type="date" />
              <F label="Review Date" field="review_date" type="date" />
            </div>
          </div>

          {/* Risk Matrix Reference */}
          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="font-black text-lg mb-4">Risk Rating Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-border rounded-xl overflow-hidden">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-3 py-2 text-left text-muted-foreground font-black uppercase">Likelihood \ Consequence</th>
                    {CONSEQUENCES.map(c => <th key={c} className="px-3 py-2 text-center text-muted-foreground font-black uppercase">{c}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {LIKELIHOODS.map(l => (
                    <tr key={l}>
                      <td className="px-3 py-2 font-bold">{l}</td>
                      {CONSEQUENCES.map(c => {
                        const r = getRating(l, c);
                        return <td key={c} className={`px-3 py-2 text-center font-black text-[10px] ${RISK_COLORS[r]}`}>{r}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hazard Table */}
          <div className="bg-card border border-border rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg">Hazard Identification & Risk Assessment</h3>
              <Button variant="outline" size="sm" onClick={addHazard} className="rounded-lg gap-1"><Plus size={14} /> Add Hazard</Button>
            </div>
            <div className="space-y-5">
              {hazards.map((h, i) => (
                <div key={i} className="border border-border rounded-2xl overflow-hidden">
                  <div className="bg-secondary px-4 py-2 flex justify-between items-center">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Hazard {i + 1}</span>
                    <button onClick={() => removeHazard(i)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <Label className="text-xs">Hazard Description</Label>
                      <Input value={h.hazard} onChange={e => updateHazard(i, "hazard", e.target.value)} placeholder="Describe the hazard..." className="mt-1 font-semibold" />
                    </div>

                    {/* Initial Risk */}
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Initial Risk (Before Controls)</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-[10px]">Likelihood</Label>
                          <Select value={h.initial_likelihood} onValueChange={v => updateHazard(i, "initial_likelihood", v)}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>{LIKELIHOODS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[10px]">Consequence</Label>
                          <Select value={h.initial_consequence} onValueChange={v => updateHazard(i, "initial_consequence", v)}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>{CONSEQUENCES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[10px]">Rating</Label>
                          <div className={`mt-1 h-8 flex items-center justify-center rounded-md text-xs font-black ${RISK_COLORS[h.initial_rating]}`}>{h.initial_rating}</div>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div>
                      <Label className="text-xs">Control Measures</Label>
                      <Textarea value={h.controls} onChange={e => updateHazard(i, "controls", e.target.value)} placeholder="What controls are in place to mitigate this hazard?" className="mt-1 text-sm min-h-[70px]" />
                    </div>

                    {/* Residual Risk */}
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Residual Risk (After Controls)</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-[10px]">Likelihood</Label>
                          <Select value={h.residual_likelihood} onValueChange={v => updateHazard(i, "residual_likelihood", v)}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>{LIKELIHOODS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[10px]">Consequence</Label>
                          <Select value={h.residual_consequence} onValueChange={v => updateHazard(i, "residual_consequence", v)}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>{CONSEQUENCES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[10px]">Rating</Label>
                          <div className={`mt-1 h-8 flex items-center justify-center rounded-md text-xs font-black ${RISK_COLORS[h.residual_rating]}`}>{h.residual_rating}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Person Responsible</Label>
                      <Input value={h.person_responsible} onChange={e => updateHazard(i, "person_responsible", e.target.value)} placeholder="Name / role responsible for controls" className="mt-1 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-foreground text-card rounded-2xl flex justify-between items-center">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">Overall Residual Risk</p>
              <span className={`px-4 py-1 rounded-full text-sm font-black ${RISK_COLORS[overallRisk()]}`}>{overallRisk()}</span>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h3 className="font-black text-lg">Emergency Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <F label="Contact 1 Name" field="emergency_contact_1_name" />
              <F label="Contact 1 Phone" field="emergency_contact_1_phone" />
              <F label="Relationship" field="emergency_contact_1_rel" />
              <F label="Contact 2 Name" field="emergency_contact_2_name" />
              <F label="Contact 2 Phone" field="emergency_contact_2_phone" />
              <F label="Relationship" field="emergency_contact_2_rel" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Button onClick={saveAssessment} disabled={saving} className="w-full rounded-xl font-bold gap-2 py-6 text-base">
            <Save size={18} /> {saving ? "Saving..." : "Save Assessment"}
          </Button>
          <Button variant="outline" onClick={() => setPrintData({ ...form, hazards, overallRisk: overallRisk() })} className="w-full rounded-xl font-bold gap-2">
            <Printer size={16} /> Preview / Print
          </Button>

          <div className="bg-card border border-border rounded-3xl p-6">
            <h4 className="font-black mb-4">Saved Assessments</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : assessments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No assessments yet.</p>
            ) : (
              <div className="space-y-3">
                {assessments.slice(0, 8).map(a => (
                  <div key={a.id} className="p-3 bg-secondary rounded-xl cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => setPrintData({ ...a, overallRisk: a.overall_risk_level })}>
                    <p className="text-xs font-bold text-foreground truncate">{a.activity_description || "Untitled"}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-[10px] text-muted-foreground">{a.participant_name || a.assessor_name}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${RISK_COLORS[a.overall_risk_level] || "bg-slate-100 text-slate-600"}`}>{a.overall_risk_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskAssessmentPrint({ data, onBack }) {
  const today = new Date().toLocaleDateString("en-AU");

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body * { visibility: hidden; }
          #ra-print, #ra-print * { visibility: visible; }
          #ra-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        .risk-low { background-color: #dcfce7; color: #166534; }
        .risk-medium { background-color: #ffedd5; color: #9a3412; }
        .risk-high { background-color: #fee2e2; color: #991b1b; }
        .risk-extreme { background-color: #7f1d1d; color: white; }
      `}</style>

      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="text-primary font-bold text-sm hover:underline">← Back</button>
        <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2">
          <Printer size={16} /> Download / Print PDF
        </Button>
      </div>

      <div id="ra-print" className="bg-white max-w-4xl mx-auto text-slate-800 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>

        {/* Header */}
        <div style={{ background: '#1e3a5f', color: 'white', padding: '20px 24px', borderRadius: '8px 8px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>NDIS Travel Risk Assessment</h1>
              <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.8 }}>{data.activity_description || data.activityDescription || ""}</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', opacity: 0.8 }}>
              <p>Date: {data.assessment_date || today}</p>
              <p>Review: {data.review_date || "—"}</p>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '20px 24px' }}>

          {/* Participant Details */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Participant Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { label: "Client Full Name", value: data.participant_name },
                { label: "Date of Birth", value: data.participant_dob },
                { label: "NDIS Number", value: data.ndis_number },
                { label: "Home Address", value: data.home_address },
                { label: "Destination / Workplace", value: data.destination },
                { label: "Assessor", value: `${data.assessor_name || ""}${data.assessor_role ? ` (${data.assessor_role})` : ""}` },
              ].map(f => (
                <div key={f.label} style={{ background: '#f8fafc', borderRadius: '6px', padding: '8px 10px' }}>
                  <p style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', margin: '0 0 3px' }}>{f.label}</p>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{f.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Matrix */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Risk Rating Matrix</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ background: '#1e3a5f', color: 'white' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Likelihood \ Consequence</th>
                  {["Catastrophic", "Major", "Moderate", "Minor", "Insignificant"].map(c => (
                    <th key={c} style={{ padding: '6px 8px', textAlign: 'center' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Almost Certain", "Extreme", "Extreme", "High", "High", "Medium"],
                  ["Likely",         "Extreme", "High",    "High", "Medium", "Low"],
                  ["Possible",       "High",    "High",    "Medium", "Low", "Low"],
                  ["Unlikely",       "High",    "Medium",  "Low",  "Low", "Low"],
                  ["Rare",           "Medium",  "Low",     "Low",  "Low", "Low"],
                ].map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: '5px 8px', fontWeight: '700' }}>{row[0]}</td>
                    {row.slice(1).map((cell, ci) => {
                      const bg = { Low: '#dcfce7', Medium: '#ffedd5', High: '#fee2e2', Extreme: '#7f1d1d' }[cell];
                      const color = cell === 'Extreme' ? 'white' : { Low: '#166534', Medium: '#9a3412', High: '#991b1b' }[cell];
                      return <td key={ci} style={{ padding: '5px 8px', textAlign: 'center', fontWeight: '900', background: bg, color, fontSize: '10px' }}>{cell}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hazard Table */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Comprehensive Risk Assessment</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ background: '#1e3a5f', color: 'white' }}>
                  <th style={{ padding: '7px 8px', textAlign: 'left', width: '20%' }}>Hazard / Risk</th>
                  <th style={{ padding: '7px 8px', textAlign: 'center', width: '8%' }}>Initial Likelihood</th>
                  <th style={{ padding: '7px 8px', textAlign: 'center', width: '8%' }}>Initial Consequence</th>
                  <th style={{ padding: '7px 8px', textAlign: 'center', width: '8%' }}>Initial Rating</th>
                  <th style={{ padding: '7px 8px', textAlign: 'left', width: '28%' }}>Control Measures</th>
                  <th style={{ padding: '7px 8px', textAlign: 'center', width: '8%' }}>Residual Likelihood</th>
                  <th style={{ padding: '7px 8px', textAlign: 'center', width: '8%' }}>Residual Consequence</th>
                  <th style={{ padding: '7px 8px', textAlign: 'center', width: '8%' }}>Residual Rating</th>
                  <th style={{ padding: '7px 8px', textAlign: 'left', width: '12%' }}>Responsible</th>
                </tr>
              </thead>
              <tbody>
                {(data.hazards || []).map((h, i) => {
                  const irBg = { Low: '#dcfce7', Medium: '#ffedd5', High: '#fee2e2', Extreme: '#7f1d1d' }[h.initial_rating] || '#f1f5f9';
                  const irColor = h.initial_rating === 'Extreme' ? 'white' : { Low: '#166534', Medium: '#9a3412', High: '#991b1b' }[h.initial_rating] || '#64748b';
                  const rrBg = { Low: '#dcfce7', Medium: '#ffedd5', High: '#fee2e2', Extreme: '#7f1d1d' }[h.residual_rating] || '#f1f5f9';
                  const rrColor = h.residual_rating === 'Extreme' ? 'white' : { Low: '#166534', Medium: '#9a3412', High: '#991b1b' }[h.residual_rating] || '#64748b';
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px', fontWeight: '600', verticalAlign: 'top' }}>{h.hazard}</td>
                      <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>{h.initial_likelihood}</td>
                      <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>{h.initial_consequence}</td>
                      <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>
                        <span style={{ background: irBg, color: irColor, padding: '2px 6px', borderRadius: '4px', fontWeight: '900', fontSize: '9px' }}>{h.initial_rating}</span>
                      </td>
                      <td style={{ padding: '8px', verticalAlign: 'top', lineHeight: '1.4' }}>{h.controls || "—"}</td>
                      <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>{h.residual_likelihood}</td>
                      <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>{h.residual_consequence}</td>
                      <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>
                        <span style={{ background: rrBg, color: rrColor, padding: '2px 6px', borderRadius: '4px', fontWeight: '900', fontSize: '9px' }}>{h.residual_rating}</span>
                      </td>
                      <td style={{ padding: '8px', verticalAlign: 'top' }}>{h.person_responsible || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Overall risk */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>OVERALL RESIDUAL RISK:</span>
                <span style={{
                  padding: '4px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '13px',
                  background: { Low: '#dcfce7', Medium: '#ffedd5', High: '#fee2e2', Extreme: '#7f1d1d' }[data.overallRisk] || '#f1f5f9',
                  color: data.overallRisk === 'Extreme' ? 'white' : { Low: '#166534', Medium: '#9a3412', High: '#991b1b' }[data.overallRisk] || '#64748b'
                }}>{data.overallRisk || data.overall_risk_level}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Emergency Management Plan</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
              {[
                { label: "Primary Contact Name", value: data.emergency_contact_1_name },
                { label: "Relationship", value: data.emergency_contact_1_rel },
                { label: "Primary Phone", value: data.emergency_contact_1_phone },
                { label: "Secondary Contact Name", value: data.emergency_contact_2_name },
                { label: "Relationship", value: data.emergency_contact_2_rel },
                { label: "Secondary Phone", value: data.emergency_contact_2_phone },
              ].map(f => (
                <div key={f.label} style={{ background: '#fef9f0', border: '1px solid #fed7aa', borderRadius: '6px', padding: '8px 10px' }}>
                  <p style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#c2410c', margin: '0 0 4px' }}>{f.label}</p>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0, minHeight: '18px' }}>{f.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div>
            <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Acknowledgement & Signatures</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {["Participant / Representative", "Support Worker / Assessor"].map(role => (
                <div key={role}>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', marginBottom: '30px' }}>{role}</p>
                  <div style={{ borderBottom: '1px solid #cbd5e1', marginBottom: '6px', height: '30px' }} />
                  <p style={{ fontSize: '9px', color: '#94a3b8' }}>Signature</p>
                  <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ borderBottom: '1px solid #cbd5e1', marginBottom: '4px', height: '20px' }} />
                      <p style={{ fontSize: '9px', color: '#94a3b8' }}>Full Name (Print)</p>
                    </div>
                    <div>
                      <div style={{ borderBottom: '1px solid #cbd5e1', marginBottom: '4px', height: '20px' }} />
                      <p style={{ fontSize: '9px', color: '#94a3b8' }}>Date</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '9px', color: '#94a3b8', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            NDIS PRO — Risk Assessment Document · Compliant with NDIS Practice Standards · Generated {today}
          </div>
        </div>
      </div>
    </div>
  );
}