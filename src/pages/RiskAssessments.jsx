import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RISK_MATRIX = [
  ["L", "L", "M", "M", "H"],
  ["L", "M", "M", "H", "H"],
  ["M", "M", "H", "H", "E"],
  ["M", "H", "H", "E", "E"],
  ["H", "H", "E", "E", "E"],
];

const RISK_COLORS = {
  L: "bg-emerald-100 text-emerald-800",
  M: "bg-amber-100 text-amber-800",
  H: "bg-orange-100 text-orange-800",
  E: "bg-rose-100 text-rose-800",
};

const RISK_NAMES = { L: "LOW", M: "MEDIUM", H: "HIGH", E: "EXTREME" };

const DEFAULT_HAZARDS = [
  { hazard: "Participant getting lost or disoriented", likelihood: "Possible", consequence: "Major", controls: "", residual_risk: "Low" },
  { hazard: "Traffic hazards / Crossing roads", likelihood: "Unlikely", consequence: "Major", controls: "", residual_risk: "Low" },
  { hazard: "Sensory overload (loud crowds/noise)", likelihood: "Likely", consequence: "Moderate", controls: "", residual_risk: "Low" },
];

function calculateRisk(likelihood, consequence) {
  const lMap = { Rare: 0, Unlikely: 1, Possible: 2, Likely: 3, "Almost Certain": 4 };
  const cMap = { Insignificant: 0, Minor: 1, Moderate: 2, Major: 3, Catastrophic: 4 };
  const l = lMap[likelihood] ?? 2;
  const c = cMap[consequence] ?? 2;
  return RISK_MATRIX[l][c];
}

export default function RiskAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeL, setActiveL] = useState(2);
  const [activeC, setActiveC] = useState(2);
  const [hazards, setHazards] = useState(DEFAULT_HAZARDS);
  const [assessorName, setAssessorName] = useState("");
  const [activity, setActivity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.RiskAssessment.list("-created_date");
      setAssessments(data);
      setLoading(false);
    }
    load();
  }, []);

  const updateHazard = (index, field, value) => {
    setHazards((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  };

  const addHazard = () => {
    setHazards((prev) => [...prev, { hazard: "", likelihood: "Possible", consequence: "Moderate", controls: "", residual_risk: "Low" }]);
  };

  const removeHazard = (index) => {
    setHazards((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAssessment = async () => {
    setSaving(true);
    const riskLevel = RISK_NAMES[RISK_MATRIX[activeL][activeC]];
    await base44.entities.RiskAssessment.create({
      assessor_name: assessorName,
      activity_description: activity,
      hazards,
      overall_risk_level: riskLevel === "LOW" ? "Low" : riskLevel === "MEDIUM" ? "Medium" : riskLevel === "HIGH" ? "High" : "Extreme",
      status: "Draft",
    });
    const data = await base44.entities.RiskAssessment.list("-created_date");
    setAssessments(data);
    setSaving(false);
    setAssessorName("");
    setActivity("");
    setHazards(DEFAULT_HAZARDS);
  };

  const currentRisk = RISK_MATRIX[activeL][activeC];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Risk Assessment Builder</h2>
        <p className="text-muted-foreground text-sm">Compliant with NDIS Practice Standards for Incident and Risk Management.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Matrix + Form */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
            <h3 className="font-black text-lg mb-4">Assessment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><Label>Assessor Name</Label><Input value={assessorName} onChange={(e) => setAssessorName(e.target.value)} placeholder="Your name" /></div>
              <div><Label>Activity / Scope</Label><Input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="e.g. Travel training via bus" /></div>
            </div>

            <h3 className="font-black text-lg mb-4">Interactive 5×5 Risk Matrix</h3>
            <div className="overflow-x-auto">
              <div className="grid gap-1 min-w-[400px]" style={{ gridTemplateColumns: "48px repeat(5, 1fr)" }}>
                <div />
                {["C1", "C2", "C3", "C4", "C5"].map((c) => (
                  <div key={c} className="text-[10px] font-black text-muted-foreground text-center uppercase tracking-widest py-1">{c}</div>
                ))}
                {RISK_MATRIX.map((row, rIdx) => (
                  <>
                    <div key={`l${rIdx}`} className="text-[10px] font-black text-muted-foreground flex items-center uppercase tracking-widest">L{rIdx + 1}</div>
                    {row.map((cell, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onClick={() => { setActiveL(rIdx); setActiveC(cIdx); }}
                        className={`h-12 rounded-lg flex items-center justify-center font-black text-xs cursor-pointer transition-all hover:scale-105 ${RISK_COLORS[cell]} ${activeL === rIdx && activeC === cIdx ? "ring-2 ring-foreground ring-offset-2 scale-105" : ""}`}
                      >
                        {cell}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-foreground text-card rounded-2xl flex justify-between items-center">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">Resulting Risk Level</p>
              <p className="text-xl font-black">{RISK_NAMES[currentRisk]}</p>
            </div>
          </div>

          {/* Hazards */}
          <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg">Hazard Identification</h3>
              <Button variant="outline" size="sm" onClick={addHazard} className="rounded-lg gap-1">
                <Plus size={14} /> Add Hazard
              </Button>
            </div>
            <div className="space-y-4">
              {hazards.map((h, i) => (
                <div key={i} className="p-4 bg-secondary rounded-2xl space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <Input value={h.hazard} onChange={(e) => updateHazard(i, "hazard", e.target.value)} placeholder="Describe hazard..." className="font-semibold" />
                    <button onClick={() => removeHazard(i)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={16} /></button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-[10px]">Likelihood</Label>
                      <Select value={h.likelihood} onValueChange={(v) => updateHazard(i, "likelihood", v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Consequence</Label>
                      <Select value={h.consequence} onValueChange={(v) => updateHazard(i, "consequence", v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Residual Risk</Label>
                      <Select value={h.residual_risk} onValueChange={(v) => updateHazard(i, "residual_risk", v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Low", "Medium", "High"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${RISK_COLORS[calculateRisk(h.likelihood, h.consequence)]}`}>
                        Rating: {RISK_NAMES[calculateRisk(h.likelihood, h.consequence)]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px]">Control Measures</Label>
                    <Textarea value={h.controls} onChange={(e) => updateHazard(i, "controls", e.target.value)} placeholder="What controls are in place?" className="h-16 text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Button onClick={saveAssessment} disabled={saving} className="w-full rounded-xl font-bold gap-2 py-6 text-base">
            <Save size={18} /> {saving ? "Saving..." : "Save Assessment"}
          </Button>

          <div className="bg-card border border-border rounded-3xl p-6">
            <h4 className="font-black mb-4">Saved Assessments</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : assessments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No assessments yet.</p>
            ) : (
              <div className="space-y-3">
                {assessments.slice(0, 5).map((a) => (
                  <div key={a.id} className="p-3 bg-secondary rounded-xl">
                    <p className="text-xs font-bold text-foreground truncate">{a.activity_description || "Untitled"}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-[10px] text-muted-foreground">{a.assessor_name}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${a.overall_risk_level === "Low" ? "bg-emerald-100 text-emerald-700" : a.overall_risk_level === "Medium" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                        {a.overall_risk_level}
                      </span>
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