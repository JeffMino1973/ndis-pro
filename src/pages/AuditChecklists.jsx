import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, CheckSquare, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STANDARDS = [
  "Rights and Responsibilities",
  "Governance and Operational Management",
  "The Provision of Supports",
  "Support Provision Environment",
  "Responsive Support Provision",
  "Specialist Support - Behaviour Support",
  "Specialist Support - Early Childhood",
];

const DEFAULT_CRITERIA = {
  "Rights and Responsibilities": [
    "Participants are informed of their rights and responsibilities",
    "Participants have access to an independent advocate",
    "Complaints and feedback mechanisms are in place and communicated",
    "Privacy and confidentiality policies are documented and followed",
    "Participants are free from abuse, neglect, and exploitation",
  ],
  "Governance and Operational Management": [
    "Organisational governance structures are documented",
    "Risk management framework is in place",
    "Policies and procedures are current and accessible",
    "Staff screening and induction processes are followed",
    "Financial management practices comply with NDIS requirements",
  ],
  "The Provision of Supports": [
    "Support plans are individualised and reflect participant goals",
    "Supports are delivered as agreed in the service agreement",
    "Staff competency is matched to participant needs",
    "Incidents are recorded and reported appropriately",
    "Participant progress is reviewed regularly",
  ],
};

const STATUS_COLORS = {
  Compliant: "bg-emerald-100 text-emerald-700",
  "Non-Compliant": "bg-rose-100 text-rose-700",
  Partial: "bg-amber-100 text-amber-700",
  "N/A": "bg-slate-100 text-slate-600",
};

export default function AuditChecklists() {
  const [checklists, setChecklists] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", standard: STANDARDS[0], reviewed_by: "", review_date: new Date().toISOString().split("T")[0] });

  const load = async () => {
    const data = await base44.entities.AuditChecklist.list("-created_date");
    setChecklists(data);
  };

  useEffect(() => { load(); }, []);

  const createChecklist = async () => {
    const criteria = (DEFAULT_CRITERIA[newForm.standard] || []).map(c => ({ criterion: c, status: "N/A", evidence: "" }));
    const created = await base44.entities.AuditChecklist.create({ ...newForm, items: criteria, overall_status: "In Progress" });
    setShowNew(false);
    await load();
    const fresh = await base44.entities.AuditChecklist.list("-created_date");
    setActive(fresh.find(c => c.id === created.id) || fresh[0]);
  };

  const updateItem = (i, field, value) => {
    setActive(prev => ({
      ...prev,
      items: prev.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item)
    }));
  };

  const saveActive = async () => {
    setSaving(true);
    const compliant = active.items.filter(i => i.status === "Compliant").length;
    const total = active.items.filter(i => i.status !== "N/A").length;
    const overall = compliant === total && total > 0 ? "Complete" : "In Progress";
    await base44.entities.AuditChecklist.update(active.id, { items: active.items, overall_status: overall });
    setSaving(false);
    load();
  };

  const getScore = (items) => {
    if (!items) return { pct: 0, compliant: 0, total: 0 };
    const total = items.filter(i => i.status !== "N/A").length;
    const compliant = items.filter(i => i.status === "Compliant").length;
    return { pct: total > 0 ? Math.round((compliant / total) * 100) : 0, compliant, total };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Audit Checklists</h2>
          <p className="text-muted-foreground text-sm">NDIS Practice Standards self-audit and compliance tracking.</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="rounded-xl font-bold gap-2"><Plus size={18} /> New Checklist</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="space-y-3">
          {checklists.map(c => {
            const { pct } = getScore(c.items);
            return (
              <div
                key={c.id}
                onClick={() => setActive(c)}
                className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all hover:border-primary/50 ${active?.id === c.id ? "border-primary" : "border-border"}`}
              >
                <p className="font-bold text-sm text-foreground">{c.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{c.standard}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-black text-muted-foreground mb-1">
                    <span>Compliance</span><span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
          {checklists.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <CheckSquare size={32} className="text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground italic">No checklists yet.</p>
            </div>
          )}
        </div>

        {/* Active Checklist */}
        <div className="lg:col-span-2">
          {!active ? (
            <div className="bg-card border border-border rounded-3xl p-16 text-center">
              <CheckSquare size={48} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-semibold">Select or create a checklist</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-lg">{active.title}</h3>
                  <p className="text-xs text-muted-foreground">{active.standard}</p>
                </div>
                <Button size="sm" onClick={saveActive} disabled={saving} className="rounded-lg gap-1">
                  <Save size={14} />{saving ? "Saving..." : "Save"}
                </Button>
              </div>
              <div className="space-y-3">
                {(active.items || []).map((item, i) => (
                  <div key={i} className="p-4 bg-secondary rounded-2xl">
                    <p className="text-sm font-semibold text-foreground mb-3">{item.criterion}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">Status</Label>
                        <Select value={item.status} onValueChange={v => updateItem(i, "status", v)}>
                          <SelectTrigger className={`h-8 text-xs ${STATUS_COLORS[item.status] || ""}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Compliant","Non-Compliant","Partial","N/A"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px]">Evidence / Notes</Label>
                        <Input value={item.evidence || ""} onChange={e => updateItem(i, "evidence", e.target.value)} placeholder="Document reference..." className="h-8 text-xs" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Audit Checklist</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Checklist Title</Label>
              <Input value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Q1 2026 Practice Standards Audit" />
            </div>
            <div>
              <Label>NDIS Practice Standard</Label>
              <Select value={newForm.standard} onValueChange={v => setNewForm(p => ({ ...p, standard: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STANDARDS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Reviewed By</Label>
                <Input value={newForm.reviewed_by} onChange={e => setNewForm(p => ({ ...p, reviewed_by: e.target.value }))} />
              </div>
              <div>
                <Label>Review Date</Label>
                <Input type="date" value={newForm.review_date} onChange={e => setNewForm(p => ({ ...p, review_date: e.target.value }))} />
              </div>
            </div>
            <Button onClick={createChecklist} disabled={!newForm.title} className="w-full rounded-xl font-bold">Create Checklist</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}