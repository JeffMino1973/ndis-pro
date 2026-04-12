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
  Paid: "bg-emerald-100 text-emerald-700",
  Overdue: "bg-rose-100 text-rose-700",
};

function generateInvoiceNumber() {
  return "INV-" + String(1000 + Math.floor(Math.random() * 9000));
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    invoice_number: generateInvoiceNumber(),
    participant_name: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: "",
    status: "Draft",
    notes: "",
    line_items: [{ description: "", support_item_code: "", hours: 1, rate: 68.12, amount: 68.12 }],
  });

  const load = async () => {
    const [inv, parts, me] = await Promise.all([
      base44.entities.Invoice.list("-created_date"),
      base44.entities.Participant.list(),
      base44.auth.me(),
    ]);
    setInvoices(inv);
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
  const gst = 0; // NDIS supports are GST-free
  const total = subtotal + gst;

  const EMPTY_FORM = { invoice_number: generateInvoiceNumber(), participant_name: "", issue_date: new Date().toISOString().split("T")[0], due_date: "", status: "Draft", notes: "", line_items: [{ description: "", support_item_code: "", hours: 1, rate: 68.12, amount: 68.12 }] };

  const openEdit = (inv) => {
    setEditingId(inv.id);
    setForm({ invoice_number: inv.invoice_number, participant_name: inv.participant_name, issue_date: inv.issue_date, due_date: inv.due_date || "", status: inv.status, notes: inv.notes || "", line_items: inv.line_items || [] });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    await base44.entities.Invoice.delete(id);
    load();
  };

  const handleSave = async (status = "Draft") => {
    if (editingId) {
      await base44.entities.Invoice.update(editingId, { ...form, status, subtotal, gst, total });
    } else {
      await base44.entities.Invoice.create({ ...form, status, subtotal, gst, total });
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    load();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.Invoice.update(id, { status });
    load();
  };

  if (preview) {
    return <InvoicePrint invoice={preview} config={config} onBack={() => setPreview(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Invoices & Claims</h2>
          <p className="text-muted-foreground text-sm">NDIS Pricing Arrangements 2025-26 · GST-free supports</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2">
          <Plus size={18} /> New Invoice
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Invoices", value: invoices.length },
          { label: "Paid", value: invoices.filter((i) => i.status === "Paid").length },
          { label: "Pending", value: invoices.filter((i) => i.status === "Sent").length },
          { label: "Total Billed", value: "$" + invoices.reduce((a, i) => a + (i.total || 0), 0).toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : invoices.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center">
          <FileText size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-black">No Invoices Yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Create your first invoice to get started.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-secondary text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-secondary/50 transition-all">
                  <td className="px-6 py-4 font-bold text-foreground">{inv.invoice_number}</td>
                  <td className="px-6 py-4 text-foreground">{inv.participant_name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{inv.issue_date}</td>
                  <td className="px-6 py-4 font-black text-foreground">${(inv.total || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Select value={inv.status} onValueChange={(v) => updateStatus(inv.id, v)}>
                      <SelectTrigger className={`h-7 text-[10px] font-black w-28 rounded-full border-0 ${statusColor[inv.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Draft", "Sent", "Paid", "Overdue"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setPreview(inv)} className="rounded-lg gap-1"><Printer size={14} /> Print</Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(inv)} className="rounded-lg gap-1"><Pencil size={14} /> Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)} className="rounded-lg gap-1 text-destructive hover:text-destructive"><Trash2 size={14} /> Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Invoice" : "New Invoice"}</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Invoice #</Label>
                <Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
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
            </div>

            {/* Line Items */}
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
                        <NDISItemSelect
                          value={line.support_item_code}
                          onSelect={(n) => updateLine(i, "support_item_code", n.code)}
                        />
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

            {/* Totals */}
            <div className="bg-secondary rounded-2xl p-5 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST</span><span className="font-bold text-emerald-600">$0.00 (GST-free)</span></div>
              <div className="flex justify-between text-lg border-t border-border pt-2 mt-2"><span className="font-black">Total</span><span className="font-black text-primary">${total.toFixed(2)}</span></div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Payment terms, reference numbers..." className="h-16" />
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

function InvoicePrint({ invoice, config, onBack }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="text-primary font-bold text-sm hover:underline">← Back to Invoices</button>
        <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2">
          <Printer size={16} /> Print / PDF
        </Button>
      </div>

      <div className="bg-white border border-border rounded-3xl p-8 lg:p-14 max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">TAX INVOICE</h1>
            <p className="text-sm text-slate-500">NDIS Support Services · GST-free</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900">{config.businessName || "NDIS PRO"}</p>
            {config.abn && <p className="text-sm text-slate-500">ABN: {config.abn}</p>}
            {config.address && <p className="text-xs text-slate-400">{config.address}</p>}
            {config.email && <p className="text-xs text-slate-400">{config.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="p-5 bg-slate-50 rounded-2xl">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Bill To</p>
            <p className="font-black text-slate-900">{invoice.participant_name}</p>
            <p className="text-sm text-slate-500">NDIS Participant</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">Invoice #</span>
              <span className="font-black text-slate-900">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">Issue Date</span>
              <span className="font-bold text-slate-700">{invoice.issue_date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">Status</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusColor[invoice.status]}`}>{invoice.status}</span>
            </div>
          </div>
        </div>

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
            {(invoice.line_items || []).map((line, i) => (
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

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-bold">${(invoice.subtotal || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">GST (0%)</span><span className="font-bold text-emerald-600">$0.00</span></div>
            <div className="flex justify-between text-lg border-t border-slate-200 pt-2 font-black">
              <span>Total</span>
              <span className="text-blue-600">${(invoice.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Payment Details</p>
          <div className="grid grid-cols-2 gap-6 text-sm">
            {config.bankName && <div><p className="text-[10px] text-slate-400 font-bold uppercase">Bank</p><p className="font-semibold text-slate-800">{config.bankName}</p></div>}
            {config.accountName && <div><p className="text-[10px] text-slate-400 font-bold uppercase">Account Name</p><p className="font-semibold text-slate-800">{config.accountName}</p></div>}
            {config.bsb && <div><p className="text-[10px] text-slate-400 font-bold uppercase">BSB</p><p className="font-mono font-bold text-slate-800">{config.bsb}</p></div>}
            {config.accountNumber && <div><p className="text-[10px] text-slate-400 font-bold uppercase">Account Number</p><p className="font-mono font-bold text-slate-800">{config.accountNumber}</p></div>}
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Notes</p>
            <p className="text-sm text-slate-600">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          NDIS supports are GST-free under Section 38-38 of the A New Tax System (Goods and Services Tax) Act 1999
        </div>
      </div>
    </div>
  );
}