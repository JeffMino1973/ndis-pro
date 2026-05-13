import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Printer, Plus, Trash2, Pencil } from "lucide-react";
import { NDIS_ITEMS } from "@/utils/ndisItems";
import NDISItemSelect from "@/components/NDISItemSelect";
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
  const [editingId, setEditingId] = useState(null);
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
          if (found) { updated.description = found.name; updated.rate = found.rate; updated.amount = parseFloat(((updated.hours || 1) * found.rate).toFixed(2)); }
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

  const EMPTY_FORM = { participant_name: "", start_date: "", end_date: "", services: [{ ndis_code: "", description: "", category: "Core Support", hours: 1, rate: 0, amount: 0 }], status: "Draft" };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({ participant_name: a.participant_name, start_date: a.start_date || "", end_date: a.end_date || "", services: a.services || [], status: a.status });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service agreement?")) return;
    await base44.entities.ServiceAgreement.delete(id);
    load();
  };

  const handleSave = async () => {
    if (editingId) {
      await base44.entities.ServiceAgreement.update(editingId, form);
    } else {
      await base44.entities.ServiceAgreement.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
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
          <p className="text-muted-foreground text-sm">Practice Standard compliant contracts.</p>
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
            <div key={a.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-black text-foreground cursor-pointer" onClick={() => setPreview(a)}>{a.participant_name}</h3>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${statusColor[a.status] || ""}`}>{a.status}</span>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                <span>{a.start_date || "N/A"}</span>
                <span>→</span>
                <span>{a.end_date || "N/A"}</span>
              </div>
              <p className="text-lg font-black text-primary">${totalValue(a.services).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Value</p>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setPreview(a)} className="rounded-lg gap-1 flex-1"><Printer size={14} /> View</Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(a)} className="rounded-lg gap-1 flex-1"><Pencil size={14} /> Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="rounded-lg gap-1 flex-1 text-destructive hover:text-destructive"><Trash2 size={14} /> Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Service Agreement" : "New Service Agreement"}</DialogTitle></DialogHeader>
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
                <Label className="text-sm font-bold">Support Items</Label>
                <Button variant="outline" size="sm" onClick={addService} className="rounded-lg gap-1"><Plus size={13} /> Add Item</Button>
              </div>
              <div className="space-y-3">
                {form.services.map((s, i) => (
                  <div key={i} className="p-4 bg-secondary rounded-2xl space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">Support Item Code & Name</Label>
                        <NDISItemSelect
                          value={s.ndis_code}
                          onSelect={(n) => { updateService(i, "ndis_code", n.code); }}
                        />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-[10px]">Description</Label>
                          <Input value={s.description} onChange={(e) => updateService(i, "description", e.target.value)} className="h-9 text-sm" placeholder="Support description..." />
                        </div>
                        {form.services.length > 1 && (
                          <button onClick={() => removeService(i)} className="text-muted-foreground hover:text-destructive pb-1"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </div>
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

            <Button onClick={handleSave} disabled={!form.participant_name} className="w-full rounded-xl font-bold">{editingId ? "Save Changes" : "Create Agreement"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgreementPreview({ agreement, onBack }) {
  const [config, setConfig] = useState({});
  useEffect(() => { base44.auth.me().then(me => setConfig(me?.businessConfig || {})); }, []);

  const total = (agreement.services || []).reduce((a, s) => a + (Number(s.amount) || 0), 0);

  // Resolve rate and code from stored value or lookup from NDIS_ITEMS
  const resolveItem = (s) => {
    const code = s.ndis_code || s.support_item_code;
    // 1. Try exact code lookup
    if (code) {
      const found = NDIS_ITEMS.find(n => n.code === code);
      if (found) return { code: found.code, rate: found.rate };
    }
    // 2. Use stored rate directly (avoids wrong description match across time variants)
    if (s.rate && Number(s.rate) > 0) return { code: code || "—", rate: Number(s.rate) };
    // 3. Derive rate from amount / hours
    if (s.amount && s.hours && Number(s.hours) > 0) return { code: code || "—", rate: Number(s.amount) / Number(s.hours) };
    return { code: code || "—", rate: 0 };
  };

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body * { visibility: hidden; }
          #agreement-print, #agreement-print * { visibility: visible; }
          #agreement-print { position: absolute; left: 0; top: 0; width: 100%; border: none !important; border-radius: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    <div className="space-y-4">
      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="text-primary font-bold text-sm hover:underline">← Back</button>
        <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2">
          <Printer size={16} /> Print / Save as PDF (A4)
        </Button>
      </div>

      <div id="agreement-print" className="bg-white max-w-4xl mx-auto shadow-xl rounded-b-xl overflow-hidden text-slate-800 text-sm">
        {/* Gradient Header */}
        <div style={{background:"linear-gradient(90deg,#3b82f6 0%,#2563eb 40%,#9333ea 100%)"}} className="p-7 flex items-center justify-between">
          <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/09e12d07c_LOGO_LANDSCAPE.png" alt="SZ-JIE WANG" className="h-14 rounded-xl bg-white px-3 py-2 object-contain" />
          <div className="text-right text-white">
            <h1 className="text-2xl font-black tracking-tight">Service Agreement</h1>
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
                { label: "Participant Name", value: agreement.participant_name, accent: true },
                { label: "Agreement Date", value: agreement.start_date || new Date().toLocaleDateString("en-AU") },
                { label: "NDIS Number", value: agreement.participant_ndis_number || "—" },
                { label: "Agreement Status", value: agreement.status || "Draft", accent: true },
              ].map(f => (
                <div key={f.label} className={`border-l-4 pl-3 ${f.accent ? "border-blue-500 bg-blue-50/50 pr-2 rounded-r-lg" : "border-slate-200"}`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                  <p className={`font-black text-sm ${f.accent ? "text-blue-800" : "text-slate-800"}`}>{f.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2 - Purpose */}
          <section>
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="opacity-60">2.</span> Purpose of Agreement
            </div>
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 italic text-slate-700 leading-relaxed">
              "This Service Agreement is made for the purpose of providing supports under the participant's National Disability Insurance Scheme (NDIS) plan. The parties agree to work together to provide supports that help <strong>{agreement.participant_name}</strong> achieve their goals of developing life skills and increasing community participation."
            </div>
          </section>

          {/* Section 3 - Schedule */}
          <section>
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="opacity-60">3.</span> Schedule of Supports &amp; Costing
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Item Code</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Support Description</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Rate (Per Hour)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(agreement.services || []).map((s, i) => {
                    const { code, rate } = resolveItem(s);
                    return (
                      <tr key={i} className={i % 2 === 1 ? "bg-slate-50/30" : ""}>
                        <td className="p-4 font-mono text-xs font-bold text-blue-700">{code}</td>
                        <td className="p-4 text-sm font-semibold text-slate-800">{s.description}</td>
                        <td className="p-4 text-sm font-bold text-right">${rate.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic px-2">Costs are based on the NDIS Pricing Arrangements and Price Limits 2025-2026 (National/Standard rates).</p>
          </section>

          {/* Section 4 & 5 - Responsibilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <div className="bg-emerald-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="opacity-60">4.</span> Provider Responsibilities
              </div>
              <ul className="space-y-2.5 px-2">
                {["Provide supports that meet the participant's goals.", "Ensure workers are trained and appropriately screened.", "Provide clear, itemized invoices and financial records.", "Respect the participant's rights, privacy and dignity at all times."].map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-medium"><span className="text-emerald-500 font-black">•</span>{r}</li>
                ))}
              </ul>
            </section>
            <section>
              <div className="bg-amber-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="opacity-60">5.</span> Participant Responsibilities
              </div>
              <ul className="space-y-2.5 px-2">
                {["Be ready for scheduled sessions.", "Provide 24 hours' notice for cancellations.", "Inform provider of NDIS plan changes promptly.", "Treat support workers with respect."].map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-medium"><span className="text-amber-600 font-black">•</span>{r}</li>
                ))}
              </ul>
            </section>
          </div>

          {/* Section 6 - Signatures */}
          <section className="pt-4">
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="opacity-60">6.</span> Endorsements &amp; Signatures
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
              <div className="space-y-5">
                <div className="border-b-2 border-slate-300 w-full h-10" />
                <div className="flex justify-between items-end">
                  <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Participant / Representative</p><p className="font-black text-slate-800">{agreement.participant_name} (or Representative)</p></div>
                  <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p><p className="font-black text-slate-400">___ / ___ / 2026</p></div>
                </div>
              </div>
              <div className="space-y-5">
                <div className="border-b-2 border-slate-300 w-full h-10" />
                <div className="flex justify-between items-end">
                  <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p><p className="font-black text-slate-400">___ / ___ / 2026</p></div>
                  <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Provider Representative</p><p className="font-black text-slate-800">SZ-JIE WANG</p></div>
                </div>
              </div>
            </div>
          </section>

          <p className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">SZ-JIE WANG Support Services · NDIS Registered Provider · This document is confidential.</p>
        </div>
      </div>
    </div>
    </>
  );
}