import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Printer, Trash2, FileText, Pencil } from "lucide-react";
import { NDIS_ITEMS } from "@/utils/ndisItems";
import NDISItemSelect from "@/components/NDISItemSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const statusColor = {
  Draft: "bg-slate-100 text-slate-700",
  Sent: "bg-blue-100 text-blue-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Declined: "bg-rose-100 text-rose-700",
  Expired: "bg-amber-100 text-amber-700",
};

function generateQuoteNumber() {
  return "QTE-" + String(1000 + Math.floor(Math.random() * 9000));
}

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    quote_number: generateQuoteNumber(),
    participant_name: "",
    issue_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    status: "Draft",
    notes: "",
    line_items: [{ description: "", support_item_code: "", hours: 1, rate: 68.12, amount: 68.12 }],
  });

  const load = async () => {
    const [q, parts, me] = await Promise.all([
      base44.entities.Quote.list("-created_date"),
      base44.entities.Participant.list(),
      base44.auth.me(),
    ]);
    setQuotes(q);
    setParticipants(parts);
    setConfig(me?.businessConfig || {});
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateLine = (i, field, value) => {
    setForm((prev) => {
      const items = prev.line_items.map((line, idx) => {
        if (idx !== i) return line;
        const updated = { ...line, [field]: value };
        if (field === "support_item_code") {
          const found = NDIS_ITEMS.find((n) => n.code === value);
          if (found) { updated.description = found.name; updated.rate = found.rate; updated.amount = parseFloat(((updated.hours || 0) * found.rate).toFixed(2)); }
        }
        if (field === "hours" || field === "rate") {
          updated.amount = parseFloat(((updated.hours || 0) * (updated.rate || 0)).toFixed(2));
        }
        return updated;
      });
      return { ...prev, line_items: items };
    });
  };

  const addLine = () => {
    setForm((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { description: "", support_item_code: "", hours: 1, rate: 68.12, amount: 68.12 }],
    }));
  };

  const removeLine = (i) => {
    setForm((prev) => ({ ...prev, line_items: prev.line_items.filter((_, idx) => idx !== i) }));
  };

  const subtotal = form.line_items.reduce((a, l) => a + (l.amount || 0), 0);
  const gst = 0;
  const total = subtotal + gst;

  const EMPTY_FORM = {
    quote_number: generateQuoteNumber(), participant_name: "", issue_date: new Date().toISOString().split("T")[0],
    expiry_date: "", status: "Draft", notes: "",
    line_items: [{ description: "", support_item_code: "", hours: 1, rate: 68.12, amount: 68.12 }],
  };

  const openEdit = (q) => {
    setEditingId(q.id);
    setForm({ quote_number: q.quote_number, participant_name: q.participant_name, issue_date: q.issue_date, expiry_date: q.expiry_date || "", status: q.status, notes: q.notes || "", line_items: q.line_items || [] });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quote?")) return;
    await base44.entities.Quote.delete(id);
    load();
  };

  const handleSave = async (status = "Draft") => {
    if (editingId) {
      await base44.entities.Quote.update(editingId, { ...form, status, subtotal, gst, total });
    } else {
      await base44.entities.Quote.create({ ...form, status, subtotal, gst, total });
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    load();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.Quote.update(id, { status });
    load();
  };

  if (preview) {
    return <QuotePrint quote={preview} config={config} onBack={() => setPreview(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Quotes</h2>
          <p className="text-muted-foreground text-sm">NDIS Support Quotes · Pricing Arrangements 2025-26</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2">
          <Plus size={18} /> New Quote
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Quotes", value: quotes.length },
          { label: "Accepted", value: quotes.filter((q) => q.status === "Accepted").length },
          { label: "Pending", value: quotes.filter((q) => q.status === "Sent").length },
          { label: "Total Quoted", value: "$" + quotes.reduce((a, q) => a + (q.total || 0), 0).toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : quotes.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center">
          <FileText size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-black">No Quotes Yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Create your first quote to get started.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-secondary text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Quote #</th>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-secondary/50 transition-all">
                  <td className="px-6 py-4 font-bold text-foreground">{q.quote_number}</td>
                  <td className="px-6 py-4 text-foreground">{q.participant_name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{q.issue_date}</td>
                  <td className="px-6 py-4 font-black text-foreground">${(q.total || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Select value={q.status} onValueChange={(v) => updateStatus(q.id, v)}>
                      <SelectTrigger className={`h-7 text-[10px] font-black w-28 rounded-full border-0 ${statusColor[q.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Draft", "Sent", "Accepted", "Declined", "Expired"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setPreview(q)} className="rounded-lg gap-1"><Printer size={14} /> Print</Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(q)} className="rounded-lg gap-1"><Pencil size={14} /> Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)} className="rounded-lg gap-1 text-destructive hover:text-destructive"><Trash2 size={14} /> Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Quote" : "New Quote"}</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Quote #</Label>
                <Input value={form.quote_number} onChange={(e) => setForm({ ...form, quote_number: e.target.value })} />
              </div>
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_name} onValueChange={(v) => setForm({ ...form, participant_name: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {participants.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Issue Date</Label>
                <Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-bold">Support Line Items</Label>
                <Button variant="outline" size="sm" onClick={addLine} className="rounded-lg gap-1"><Plus size={13} /> Add Line</Button>
              </div>
              <div className="space-y-3">
                {form.line_items.map((line, i) => (
                  <div key={i} className="p-4 bg-secondary rounded-2xl space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">NDIS Support Item</Label>
                        <NDISItemSelect value={line.support_item_code} onSelect={(n) => updateLine(i, "support_item_code", n.code)} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Description</Label>
                        <Input value={line.description} onChange={(e) => updateLine(i, "description", e.target.value)} className="h-9 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-end">
                      <div>
                        <Label className="text-[10px]">Hours</Label>
                        <Input type="number" value={line.hours} onChange={(e) => updateLine(i, "hours", parseFloat(e.target.value))} className="h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-[10px]">Rate ($/hr)</Label>
                        <Input type="number" value={line.rate} onChange={(e) => updateLine(i, "rate", parseFloat(e.target.value))} className="h-9 text-sm" />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label className="text-[10px]">Amount</Label>
                          <p className="font-black text-foreground h-9 flex items-center">${(line.amount || 0).toFixed(2)}</p>
                        </div>
                        {form.line_items.length > 1 && (
                          <button onClick={() => removeLine(i)} className="text-muted-foreground hover:text-destructive pb-2"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary rounded-2xl p-5 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST</span><span className="font-bold text-emerald-600">$0.00 (GST-free)</span></div>
              <div className="flex justify-between text-lg border-t border-border pt-2 mt-2"><span className="font-black">Total</span><span className="font-black text-primary">${total.toFixed(2)}</span></div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes or conditions..." className="h-16" />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSave("Draft")} className="flex-1 rounded-xl font-bold">Save as Draft</Button>
              <Button onClick={() => handleSave("Sent")} disabled={!form.participant_name} className="flex-1 rounded-xl font-bold">Create & Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuotePrint({ quote, config, onBack }) {
  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body * { visibility: hidden; }
          #quote-print, #quote-print * { visibility: visible; }
          #quote-print { position: absolute; left: 0; top: 0; width: 100%; border: none !important; border-radius: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="text-primary font-bold text-sm hover:underline">← Back to Quotes</button>
        <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2">
          <Printer size={16} /> Print / PDF
        </Button>
      </div>

      <div id="quote-print" className="bg-white border border-border rounded-3xl p-8 lg:p-14 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">QUOTE</h1>
            <p className="text-sm text-slate-500">NDIS Support Services · GST-free</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900">{config.businessName || "NDIS PRO"}</p>
            {config.abn && <p className="text-sm text-slate-500">ABN: {config.abn}</p>}
            {config.address && <p className="text-xs text-slate-400">{config.address}</p>}
            {config.email && <p className="text-xs text-slate-400">{config.email}</p>}
            {config.phone && <p className="text-xs text-slate-400">{config.phone}</p>}
          </div>
        </div>

        {/* Quote Details */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="p-5 bg-slate-50 rounded-2xl">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Prepared For</p>
            <p className="font-black text-slate-900">{quote.participant_name}</p>
            <p className="text-sm text-slate-500">NDIS Participant</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">Quote #</span>
              <span className="font-black text-slate-900">{quote.quote_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">Issue Date</span>
              <span className="font-bold text-slate-700">{quote.issue_date}</span>
            </div>
            {quote.expiry_date && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">Valid Until</span>
                <span className="font-bold text-slate-700">{quote.expiry_date}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">Status</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusColor[quote.status]}`}>{quote.status}</span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full text-left text-sm mb-8">
          <thead className="bg-slate-50">
            <tr className="text-[9px] font-black text-slate-400 uppercase">
              <th className="px-4 py-3">Support Item</th>
              <th className="px-4 py-3 text-right">Hours</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(quote.line_items || []).map((line, i) => (
              <tr key={i}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-800">{line.description}</p>
                  {line.support_item_code && <p className="text-[10px] text-slate-400">{line.support_item_code}</p>}
                </td>
                <td className="px-4 py-4 text-right text-slate-600">{line.hours}</td>
                <td className="px-4 py-4 text-right text-slate-600">${line.rate?.toFixed(2)}</td>
                <td className="px-4 py-4 text-right font-black text-slate-900">${(line.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-bold">${(quote.subtotal || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">GST (0%)</span><span className="font-bold text-emerald-600">$0.00</span></div>
            <div className="flex justify-between text-lg border-t border-slate-200 pt-2 font-black">
              <span>Total</span>
              <span className="text-blue-600">${(quote.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="mb-8 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Notes</p>
            <p className="text-sm text-slate-600">{quote.notes}</p>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="border-t border-slate-200 pt-8">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Terms &amp; Conditions</h3>
          <div className="space-y-2 text-xs text-slate-500 leading-relaxed">
            <p><strong className="text-slate-700">1. Quote Validity:</strong> This quote is valid for 30 days from the issue date unless an expiry date is specified above. After this period, prices may be subject to change.</p>
            <p><strong className="text-slate-700">2. NDIS Pricing:</strong> All rates are based on the NDIS Pricing Arrangements and Price Limits 2025–2026. All supports are GST-free under Section 38-38 of the A New Tax System (Goods and Services Tax) Act 1999.</p>
            <p><strong className="text-slate-700">3. Service Agreement:</strong> Acceptance of this quote is subject to the signing of a formal Service Agreement. Supports will not commence until a Service Agreement is executed by both parties.</p>
            <p><strong className="text-slate-700">4. Cancellations:</strong> A minimum of 24 hours' notice is required for cancellation of scheduled supports. Cancellations made with less than 24 hours' notice may be charged at the applicable short notice cancellation rate.</p>
            <p><strong className="text-slate-700">5. Funding:</strong> The participant or their representative confirms that the NDIS funding is available and sufficient to cover the quoted supports. The provider is not responsible for shortfalls in plan funding.</p>
            <p><strong className="text-slate-700">6. Changes to Supports:</strong> Any changes to the scope or nature of supports must be agreed in writing and may result in an updated quote or Service Agreement.</p>
            <p><strong className="text-slate-700">7. Privacy:</strong> Personal information collected is handled in accordance with the Privacy Act 1988 and the NDIS Privacy Policy.</p>
          </div>
        </div>

        {/* Acceptance */}
        <div className="mt-10 pt-6 border-t border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Acceptance of Quote</p>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-xs text-slate-500 mb-10">Participant / Representative Signature</p>
              <div className="border-b border-slate-300 w-full" />
              <p className="text-xs text-slate-400 mt-2">Date: ___ / ___ / ________</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-10">Provider Representative Signature</p>
              <div className="border-b border-slate-300 w-full" />
              <p className="text-xs text-slate-400 mt-2">Date: ___ / ___ / ________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}