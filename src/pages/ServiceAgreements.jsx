import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Printer, Plus, Trash2 } from "lucide-react";

const NDIS_ITEMS = [
  { code: "01_011_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Weekday Daytime", rate: 68.12 },
  { code: "01_011_0107_1_1_T", name: "Assistance With Self-Care Activities - Standard - Weekday Evening", rate: 74.86 },
  { code: "01_011_0107_1_1_S", name: "Assistance With Self-Care Activities - Standard - Saturday", rate: 95.29 },
  { code: "01_011_0107_1_1_U", name: "Assistance With Self-Care Activities - Standard - Sunday", rate: 122.46 },
  { code: "01_011_0107_1_1_P", name: "Assistance With Self-Care Activities - Standard - Public Holiday", rate: 149.63 },
  { code: "04_104_0125_6_1", name: "Access Community Social and Rec Activities - Standard - Weekday", rate: 68.12 },
  { code: "04_104_0125_6_1_S", name: "Access Community Social and Rec Activities - Standard - Saturday", rate: 95.29 },
  { code: "04_104_0125_6_1_U", name: "Access Community Social and Rec Activities - Standard - Sunday", rate: 122.46 },
  { code: "07_001_0106_1_3", name: "Support Coordination Level 1: Support Connection", rate: 76.52 },
  { code: "07_002_0106_1_3", name: "Support Coordination Level 2: Coordination of Supports", rate: 102.64 },
  { code: "01_741_0128_1_3", name: "Assessment Recommendation Therapy or Training - Social Worker", rate: 199.05 },
  { code: "15_056_0128_1_3", name: "Assessment Recommendation Therapy or Training - Other Therapy", rate: 199.05 },
  { code: "11_022_0117_1_3", name: "Individual Life Skills - Standard - Weekday Daytime", rate: 68.12 },
  { code: "09_009_0115_1_1", name: "Innovative Community Participation - Standard", rate: 68.12 },
  { code: "08_001_0106_6_3", name: "Plan Management - Financial Administration", rate: 116.54 },
];
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ServiceAgreements() {
  const [agreements, setAgreements] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    participant_name: "",
    start_date: "",
    end_date: "",
    services: [{ ndis_code: "", description: "", category: "Core Support", hours: 1, rate: 0, amount: 0 }],
    status: "Draft",
  });

  const load = async () => {
    const [a, p] = await Promise.all([
      base44.entities.ServiceAgreement.list("-created_date"),
      base44.entities.Participant.list(),
    ]);
    setAgreements(a);
    setParticipants(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateService = (i, field, value) => {
    setForm((prev) => {
      const services = prev.services.map((s, idx) => {
        if (idx !== i) return s;
        const updated = { ...s, [field]: value };
        if (field === "ndis_code") {
          const found = NDIS_ITEMS.find((n) => n.code === value);
          if (found) { updated.description = found.name; updated.rate = found.rate; }
        }
        if (field === "hours" || field === "rate") {
          updated.amount = parseFloat(((updated.hours || 0) * (updated.rate || 0)).toFixed(2));
        }
        return updated;
      });
      return { ...prev, services };
    });
  };

  const addService = () => {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { ndis_code: "", description: "", category: "Core Support", hours: 1, rate: 0, amount: 0 }],
    }));
  };

  const removeService = (i) => {
    setForm((prev) => ({ ...prev, services: prev.services.filter((_, idx) => idx !== i) }));
  };

  const handleSave = async () => {
    await base44.entities.ServiceAgreement.create(form);
    setShowForm(false);
    setForm({ participant_name: "", start_date: "", end_date: "", services: [{ description: "", category: "Core Support", amount: 0 }], status: "Draft" });
    load();
  };

  const totalValue = (services) => (services || []).reduce((a, s) => a + (Number(s.amount) || 0), 0);

  const statusColor = {
    Draft: "bg-slate-100 text-slate-700",
    Active: "bg-emerald-100 text-emerald-700",
    Expired: "bg-amber-100 text-amber-700",
    Terminated: "bg-rose-100 text-rose-700",
  };

  if (preview) {
    return <AgreementPreview agreement={preview} onBack={() => setPreview(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Service Agreements</h2>
          <p className="text-muted-foreground text-sm">NDIS Practice Standard compliant contracts.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2">
          <Plus size={18} /> New Agreement
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : agreements.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center">
          <h3 className="text-xl font-black">No Service Agreements</h3>
          <p className="text-muted-foreground text-sm mt-1">Create your first agreement to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agreements.map((a) => (
            <div key={a.id} onClick={() => setPreview(a)} className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-black text-foreground">{a.participant_name}</h3>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${statusColor[a.status] || ""}`}>{a.status}</span>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                <span>{a.start_date || "N/A"}</span>
                <span>→</span>
                <span>{a.end_date || "N/A"}</span>
              </div>
              <p className="text-lg font-black text-primary">${totalValue(a.services).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Value</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Service Agreement</DialogTitle></DialogHeader>
          <div className="space-y-5">
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
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} /></div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-bold">NDIS Support Items</Label>
                <Button variant="outline" size="sm" onClick={addService} className="rounded-lg gap-1"><Plus size={13} /> Add Item</Button>
              </div>
              <div className="space-y-3">
                {form.services.map((s, i) => (
                  <div key={i} className="p-4 bg-secondary rounded-2xl space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <Label className="text-[10px]">NDIS Item Code & Name</Label>
                        <Select value={s.ndis_code} onValueChange={(v) => updateService(i, "ndis_code", v)}>
                          <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Select NDIS item..." /></SelectTrigger>
                          <SelectContent>
                            {NDIS_ITEMS.map((n) => (
                              <SelectItem key={n.code} value={n.code}>
                                <span className="text-[10px] font-mono text-muted-foreground">{n.code}</span> — {n.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {form.services.length > 1 && (
                        <button onClick={() => removeService(i)} className="text-muted-foreground hover:text-destructive mt-5"><Trash2 size={15} /></button>
                      )}
                    </div>
                    {s.description && <p className="text-xs text-muted-foreground italic">{s.description}</p>}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[10px]">Hours</Label>
                        <Input type="number" value={s.hours} onChange={(e) => updateService(i, "hours", parseFloat(e.target.value))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-[10px]">Rate ($/hr)</Label>
                        <Input type="number" value={s.rate} onChange={(e) => updateService(i, "rate", parseFloat(e.target.value))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-[10px]">Amount</Label>
                        <p className="font-black text-primary text-sm h-8 flex items-center">${(s.amount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-4 bg-primary/5 rounded-xl flex justify-between">
                <span className="text-sm font-bold text-muted-foreground">Total Agreement Value</span>
                <span className="text-lg font-black text-primary">${form.services.reduce((a, s) => a + (s.amount || 0), 0).toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={handleSave} disabled={!form.participant_name} className="w-full rounded-xl font-bold">Create Agreement</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgreementPreview({ agreement, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-primary font-bold text-sm hover:underline">← Back</button>
        <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2">
          <Printer size={16} /> Print Agreement
        </Button>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 lg:p-16 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">SERVICE AGREEMENT</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 rounded-md">
              NDIS Practice Standard Compliant
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-foreground">NDIS PRO</p>
            <p className="text-xs text-muted-foreground">NSW Provider</p>
          </div>
        </div>

        <div className="space-y-10">
          <section>
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">1. Parties to the Agreement</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-secondary rounded-2xl">
                <p className="text-[9px] font-black text-muted-foreground uppercase mb-2">Participant</p>
                <p className="font-bold text-foreground">{agreement.participant_name}</p>
              </div>
              <div className="p-6 bg-secondary rounded-2xl">
                <p className="text-[9px] font-black text-muted-foreground uppercase mb-2">Agreement Period</p>
                <p className="font-bold text-foreground">{agreement.start_date || "TBD"} — {agreement.end_date || "TBD"}</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">2. Supports Provided</h4>
            <div className="border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary">
                  <tr className="text-[9px] font-black text-muted-foreground uppercase">
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {(agreement.services || []).map((s, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-6 py-4 font-bold text-foreground">{s.description}</td>
                      <td className="px-6 py-4 text-muted-foreground">{s.category}</td>
                      <td className="px-6 py-4 text-right font-black">${Number(s.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest">3. Responsibilities</h4>
            <p><span className="font-bold text-foreground">The Provider agrees to:</span> Deliver supports in a safe manner, communicate regularly, and protect the participant's privacy in accordance with NDIS Practice Standards.</p>
            <p><span className="font-bold text-foreground">The Participant agrees to:</span> Treat staff with respect, pay invoices on time, and provide 24-hours notice for cancellations.</p>
          </section>

          <div className="grid grid-cols-2 gap-16 pt-16 border-t border-border">
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase mb-16">Participant Signature</p>
              <div className="border-b border-foreground/20 w-full h-1" />
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase mb-16">Provider Representative</p>
              <div className="border-b border-foreground/20 w-full h-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}