import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  FileText, Plus, Trash2,
  Printer, Mail, Loader2, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NDIS_ITEMS } from "@/utils/ndisItems";
import NDISItemSelect from "@/components/NDISItemSelect";

const TABS = ["Invoice Tracker", "Tax Calculator", "Receipts", "Accountant Report", "BAS Report", "Payroll Reconciliation"];

const STATUS_COLORS = {
  Draft: "bg-slate-100 text-slate-700",
  Sent: "bg-blue-100 text-blue-700",
  Paid: "bg-emerald-100 text-emerald-700",
  Overdue: "bg-rose-100 text-rose-700",
};

function generateInvoiceNumber() {
  return "INV-" + String(1000 + Math.floor(Math.random() * 9000));
}

const EMPTY_LINE = { date: new Date().toISOString().split("T")[0], description: "", support_item_code: "", hours: 2, rate: 70.23, amount: 140.46 };

// ─── Invoice Tracker (full featured) ─────────────────────────────────────────
function InvoiceTracker({ onReload }) {
  const [invoices, setInvoices] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState(null);

  const EMPTY_FORM = {
    invoice_number: generateInvoiceNumber(),
    participant_name: "", participant_ndis_number: "",
    plan_manager_name: "", plan_manager_email: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: "", status: "Draft", notes: "",
    line_items: [{ ...EMPTY_LINE }],
  };
  const [form, setForm] = useState(EMPTY_FORM);

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
    onReload(inv);
  };

  useEffect(() => { load(); }, []);

  const subtotal = form.line_items.reduce((a, l) => a + (l.amount || 0), 0);
  const total = subtotal;

  const updateLine = (i, field, value) => {
    setForm(prev => {
      const items = prev.line_items.map((line, idx) => {
        if (idx !== i) return line;
        const updated = { ...line, [field]: value };
        if (field === "support_item_code") {
          const found = NDIS_ITEMS.find(n => n.code === value);
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

  const openEdit = (inv) => {
    setEditingId(inv.id);
    setForm({
      invoice_number: inv.invoice_number || "",
      participant_name: inv.participant_name || "",
      participant_ndis_number: inv.participant_ndis_number || "",
      plan_manager_name: inv.plan_manager_name || "",
      plan_manager_email: inv.plan_manager_email || "",
      issue_date: inv.issue_date || new Date().toISOString().split("T")[0],
      due_date: inv.due_date || "",
      status: inv.status || "Draft",
      notes: inv.notes || "",
      line_items: inv.line_items?.length ? inv.line_items : [{ ...EMPTY_LINE }],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    await base44.entities.Invoice.delete(id);
    load();
  };

  const handleSave = async (status = form.status) => {
    const data = { ...form, status, subtotal, gst: 0, total };
    if (editingId) {
      await base44.entities.Invoice.update(editingId, data);
    } else {
      await base44.entities.Invoice.create(data);
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

  const totalInvoiced = invoices.reduce((a, i) => a + (parseFloat(i.total || i.amount) || 0), 0);
  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((a, i) => a + (parseFloat(i.total || i.amount) || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  const fmtDate = (d) => { if (!d) return ""; const p = d.split("-"); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0].slice(2)}` : d; };

  if (preview) {
    return (
      <div className="space-y-4">
        <style>{`@media print { @page{size:A4;margin:15mm;} body *{visibility:hidden;} #inv-print,#inv-print *{visibility:visible;} #inv-print{position:absolute;left:0;top:0;width:100%;} .no-print{display:none!important;} }`}</style>
        <div className="flex justify-between items-center no-print">
          <button onClick={() => setPreview(null)} className="text-primary font-bold text-sm hover:underline">← Back to Invoices</button>
          <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2"><Printer size={16} /> Print / PDF</Button>
        </div>
        <div id="inv-print" className="bg-white p-10 max-w-3xl mx-auto text-sm text-slate-800" style={{ fontFamily: "Arial, sans-serif" }}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-xl font-black" style={{ color: "#c0392b" }}>{config.businessName || "SZ-Jie Support Services"}</p>
              <div className="mt-2 space-y-0.5 text-sm text-slate-700">
                {config.abn && <p>ABN: {config.abn}</p>}
                {config.address && <p>{config.address}</p>}
                {config.email && <p className="text-blue-600 underline">{config.email}</p>}
                {config.phone && <p>{config.phone}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-bold"><span className="font-black">INVOICE #</span> {preview.invoice_number}</p>
              <p className="text-base mt-1"><span className="font-bold">Date:</span> {fmtDate(preview.issue_date)}</p>
            </div>
          </div>
          <div className="mb-6"><p className="font-black mb-1">To:</p><p>{preview.plan_manager_name || "—"}</p>{preview.plan_manager_email && <p className="text-blue-600 underline">{preview.plan_manager_email}</p>}</div>
          <div className="mb-6"><p><span className="font-bold">Customer:</span> {preview.participant_name}</p>{preview.participant_ndis_number && <p><span className="font-bold">NDIS:</span> {preview.participant_ndis_number}</p>}</div>
          <table className="w-full text-left text-sm mb-6" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#c0392b", color: "white" }}>
                {["Date", "Item Number", "Description", "Unit price", "Qty", "Line total"].map(h => <th key={h} className="px-3 py-2 font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {(preview.line_items || []).map((line, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td className="px-3 py-2 whitespace-nowrap">{fmtDate(line.date)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{line.support_item_code || "—"}</td>
                  <td className="px-3 py-2">{line.description}</td>
                  <td className="px-3 py-2 text-right">${(line.rate || 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-center">{line.hours}</td>
                  <td className="px-3 py-2 text-right font-bold">${(line.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#fdf2f2" }}><td colSpan={4} /><td className="px-3 py-2 font-black text-right" style={{ color: "#c0392b" }}>Subtotal</td><td className="px-3 py-2 text-right font-bold">${(preview.subtotal || 0).toFixed(2)}</td></tr>
              <tr><td colSpan={4} /><td className="px-3 py-2 font-black text-right" style={{ color: "#c0392b" }}>GST</td><td className="px-3 py-2 text-right">$0.00</td></tr>
              <tr style={{ backgroundColor: "#fdf2f2" }}><td colSpan={4} /><td className="px-3 py-2 font-black text-right" style={{ color: "#c0392b" }}>Total</td><td className="px-3 py-2 text-right font-black">${(preview.total || 0).toFixed(2)}</td></tr>
            </tfoot>
          </table>
          <div className="text-sm text-slate-700 mt-4">
            <p className="font-bold mb-1">Please make payment to:</p>
            {config.bankName && <p>{config.bankName}</p>}
            {config.accountName && <p>Account Name {config.accountName}</p>}
            {config.bsb && <p>BSB : {config.bsb}</p>}
            {config.accountNumber && <p>Account : {config.accountNumber}</p>}
          </div>
          {preview.notes && <div className="mt-6 text-xs text-slate-500"><p className="font-bold">Notes:</p><p>{preview.notes}</p></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Invoiced", value: "$" + totalInvoiced.toFixed(2), color: "text-foreground" },
          { label: "Total Paid", value: "$" + totalPaid.toFixed(2), color: "text-emerald-600" },
          { label: "Outstanding", value: "$" + totalOutstanding.toFixed(2), color: "text-rose-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => { setEditingId(null); setForm({ ...EMPTY_FORM, invoice_number: generateInvoiceNumber() }); setShowForm(true); }} className="rounded-xl font-bold gap-2">
          <Plus size={15} /> New Invoice
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <tr>
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-5 py-3">Participant</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-secondary/50 transition-all">
                  <td className="px-5 py-3 font-bold">{inv.invoice_number}</td>
                  <td className="px-5 py-3">{inv.participant_name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{inv.issue_date}</td>
                  <td className="px-5 py-3 font-black text-right">${(inv.total || 0).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <Select value={inv.status} onValueChange={v => updateStatus(inv.id, v)}>
                      <SelectTrigger className={`h-7 text-[10px] font-black w-24 rounded-full border-0 ${STATUS_COLORS[inv.status] || "bg-slate-100 text-slate-600"}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>{["Draft", "Sent", "Paid", "Overdue"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setPreview(inv)} className="rounded-lg gap-1 text-xs"><Printer size={13} /> Print</Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(inv)} className="rounded-lg gap-1 text-xs"><Pencil size={13} /> Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)} className="rounded-lg gap-1 text-xs text-destructive hover:text-destructive"><Trash2 size={13} /> Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground italic text-sm">No invoices yet. Click "New Invoice" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={open => { setShowForm(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Invoice" : "New Invoice"}</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><Label>Invoice #</Label><Input value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })} /></div>
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_name} onValueChange={v => {
                  const p = participants.find(x => x.name === v);
                  setForm({ ...form, participant_name: v, participant_ndis_number: p?.ndis_number || form.participant_ndis_number });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>NDIS Number</Label><Input value={form.participant_ndis_number} onChange={e => setForm({ ...form, participant_ndis_number: e.target.value })} placeholder="e.g. 430117666" /></div>
              <div><Label>Issue Date</Label><Input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} /></div>
              <div><Label>Plan Manager Name</Label><Input value={form.plan_manager_name} onChange={e => setForm({ ...form, plan_manager_name: e.target.value })} /></div>
              <div><Label>Plan Manager Email</Label><Input value={form.plan_manager_email} onChange={e => setForm({ ...form, plan_manager_email: e.target.value })} /></div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-bold">Support Line Items</Label>
                <Button variant="outline" size="sm" onClick={() => setForm(p => ({ ...p, line_items: [...p.line_items, { ...EMPTY_LINE }] }))} className="rounded-lg gap-1"><Plus size={13} /> Add Line</Button>
              </div>
              <div className="space-y-3">
                {form.line_items.map((line, i) => (
                  <div key={i} className="p-4 bg-secondary rounded-2xl space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><Label className="text-[10px]">Date of Service</Label><Input type="date" value={line.date || ""} onChange={e => updateLine(i, "date", e.target.value)} className="h-9 text-sm" /></div>
                      <div><Label className="text-[10px]">NDIS Support Item</Label><NDISItemSelect value={line.support_item_code} onSelect={n => updateLine(i, "support_item_code", n.code)} /></div>
                      <div className="md:col-span-2"><Label className="text-[10px]">Description</Label><Input value={line.description} onChange={e => updateLine(i, "description", e.target.value)} className="h-9 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-end">
                      <div><Label className="text-[10px]">Qty / Hours</Label><Input type="number" value={line.hours} onChange={e => updateLine(i, "hours", parseFloat(e.target.value))} className="h-9 text-sm" /></div>
                      <div><Label className="text-[10px]">Unit Price ($/hr)</Label><Input type="number" value={line.rate} onChange={e => updateLine(i, "rate", parseFloat(e.target.value))} className="h-9 text-sm" /></div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1"><Label className="text-[10px]">Line Total</Label><p className="font-black h-9 flex items-center">${(line.amount || 0).toFixed(2)}</p></div>
                        {form.line_items.length > 1 && <button onClick={() => setForm(p => ({ ...p, line_items: p.line_items.filter((_, idx) => idx !== i) }))} className="text-muted-foreground hover:text-destructive pb-2"><Trash2 size={15} /></button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST</span><span className="font-bold text-emerald-600">$0.00 (GST-free)</span></div>
              <div className="flex justify-between text-lg border-t border-border pt-2"><span className="font-black">Total</span><span className="font-black text-primary">${total.toFixed(2)}</span></div>
            </div>

            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Draft", "Sent", "Paid", "Overdue"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Payment terms, reference..." className="h-16" /></div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSave("Draft")} className="flex-1 rounded-xl font-bold">Save as Draft</Button>
              <Button onClick={() => handleSave("Sent")} disabled={!form.participant_name} className="flex-1 rounded-xl font-bold">Save &amp; Mark Sent</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tax Calculator ───────────────────────────────────────────────────────────
function TaxCalculator() {
  const [income, setIncome] = useState({ tue: 280.92, thu: 280.92, sun: 382.29 });
  const weekly = (income.tue || 0) + (income.thu || 0) + (income.sun || 0);
  const annual = weekly * 52;
  const super12 = weekly * 0.12;
  const calcTax = (g) => { if (g <= 18200) return 0; if (g <= 45000) return (g - 18200) * 0.19; if (g <= 135000) return 5092 + (g - 45000) * 0.325; if (g <= 190000) return 34204 + (g - 135000) * 0.37; return 54630 + (g - 190000) * 0.45; };
  const lito = (a) => { if (a <= 37500) return 700; if (a <= 45000) return 700 - (a - 37500) * 0.05; if (a <= 66667) return 325 - (a - 45000) * 0.015; return 0; };
  const annualTax = Math.max(0, calcTax(annual) - lito(annual));
  const medicare = annual * 0.02;
  const annualTaxTotal = annualTax + medicare;
  const weeklyTax = annualTaxTotal / 52;
  const weeklyNet = weekly - weeklyTax;
  const effectiveRate = annual > 0 ? ((annualTaxTotal / annual) * 100).toFixed(1) : 0;
  const rows = [
    { label: "Gross Weekly Income", value: weekly, color: "text-foreground" },
    { label: "Super (12% — employer pays)", value: super12, color: "text-blue-600" },
    { label: "Est. Weekly Tax Withheld", value: weeklyTax, color: "text-rose-600" },
    { label: "Medicare Levy (2%)", value: weekly * 0.02, color: "text-amber-600" },
    { label: "Net Take-Home (Weekly)", value: weeklyNet, color: "text-emerald-600", bold: true },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-black text-lg">Your Weekly Shifts</h3>
          {[{ label: "Tuesday Income ($)", key: "tue" }, { label: "Thursday Income ($)", key: "thu" }, { label: "Sunday Income ($)", key: "sun" }].map(({ label, key }) => (
            <div key={key}>
              <Label className="text-xs">{label}</Label>
              <Input type="number" step="0.01" value={income[key]} onChange={e => setIncome(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))} className="mt-1 font-bold" />
            </div>
          ))}
          <div className="bg-primary/5 rounded-2xl p-4 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Weekly Total</span><span className="font-black">${weekly.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Annual Estimate</span><span className="font-black">${annual.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</span></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
          <h3 className="font-black text-lg">Tax Breakdown <span className="text-xs font-normal text-muted-foreground">(ATO 2025–26)</span></h3>
          {rows.map(r => (
            <div key={r.label} className={`flex justify-between py-2 border-b border-border ${r.bold ? "border-t-2 border-t-border mt-2 pt-3" : ""}`}>
              <span className="text-sm text-muted-foreground">{r.label}</span>
              <span className={`font-black text-sm ${r.color}`}>${r.value.toFixed(2)}</span>
            </div>
          ))}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mt-2">
            <p className="text-xs text-rose-700 font-bold">Effective Tax Rate: {effectiveRate}%</p>
            <p className="text-xs text-rose-600 mt-1">Annual tax + Medicare: ${annualTaxTotal.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs text-blue-700 font-bold">Super (Annual @ 12%): ${(super12 * 52).toLocaleString("en-AU", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <p className="font-black mb-1">⚠️ Disclaimer</p>
        <p>This is an estimate only based on ATO 2025-26 rates. Figures may vary. Always consult a registered tax agent.</p>
      </div>
    </div>
  );
}

// ─── Receipts ─────────────────────────────────────────────────────────────────
const RECEIPT_CATS = ["Vehicle/Fuel","Phone/Internet","Work Clothing","Professional Development","Home Office","Equipment/Tools","Subscriptions","Other"];
function Receipts({ receipts, onLoad }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const EMPTY = { date: new Date().toISOString().split("T")[0], description: "", category: "Vehicle/Fuel", amount: "", receipt_url: "", notes: "" };
  const [form, setForm] = useState(EMPTY);
  const openEdit = (r) => { setEditingId(r.id); setForm({ date: r.date, description: r.description, category: r.category, amount: r.amount, receipt_url: r.receipt_url || "", notes: r.notes || "" }); setShowForm(true); };
  const handleFile = async (e) => { const file = e.target.files[0]; if (!file) return; setUploading(true); const { file_url } = await base44.integrations.Core.UploadFile({ file }); setForm(p => ({ ...p, receipt_url: file_url })); setUploading(false); };
  const save = async () => { const data = { ...form, amount: parseFloat(form.amount) || 0 }; if (editingId) { await base44.entities.Receipt.update(editingId, data); } else { await base44.entities.Receipt.create(data); } setShowForm(false); setEditingId(null); setForm(EMPTY); onLoad(); };
  const del = async (id) => { if (!window.confirm("Delete receipt?")) return; await base44.entities.Receipt.delete(id); onLoad(); };
  const total = receipts.reduce((a, r) => a + (parseFloat(r.amount) || 0), 0);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3">
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Total Deductible</p>
          <p className="text-2xl font-black text-emerald-700">${total.toFixed(2)}</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(EMPTY); setShowForm(true); }} className="rounded-xl font-bold gap-2"><Plus size={15} /> Add Receipt</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {receipts.map(r => (
          <div key={r.id} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div><p className="font-black text-sm">{r.description}</p><p className="text-xs text-muted-foreground">{r.category} · {r.date}</p></div>
              <p className="font-black text-primary">${parseFloat(r.amount || 0).toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              {r.receipt_url && <a href={r.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">View receipt</a>}
              <button onClick={() => openEdit(r)} className="text-xs text-muted-foreground hover:text-foreground ml-auto">Edit</button>
              <button onClick={() => del(r.id)} className="text-xs text-destructive">Delete</button>
            </div>
          </div>
        ))}
        {receipts.length === 0 && <p className="col-span-2 text-sm text-muted-foreground italic text-center py-8">No receipts logged yet.</p>}
      </div>
      <Dialog open={showForm} onOpenChange={open => { setShowForm(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingId ? "Edit Receipt" : "Add Tax Receipt"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Date</Label><Input type="date" value={form.date || ""} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Amount ($)</Label><Input type="number" value={form.amount || ""} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="mt-1" /></div>
              <div className="col-span-2"><Label className="text-xs">Description</Label><Input value={form.description || ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" /></div>
              <div className="col-span-2">
                <Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{RECEIPT_CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Upload Receipt (optional)</Label>
                <input type="file" onChange={handleFile} className="hidden" id="receipt-upload" />
                <label htmlFor="receipt-upload" className="mt-1 block cursor-pointer border-2 border-dashed border-border rounded-xl p-3 text-center text-xs text-muted-foreground hover:border-primary">
                  {uploading ? "Uploading..." : form.receipt_url ? "✓ File uploaded — click to replace" : "Click to upload receipt"}
                </label>
              </div>
              <div className="col-span-2"><Label className="text-xs">Notes</Label><Input value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="mt-1" /></div>
            </div>
            <Button onClick={save} disabled={!form.description || !form.amount} className="w-full rounded-xl font-bold">{editingId ? "Save Changes" : "Add Receipt"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Accountant Report ────────────────────────────────────────────────────────
function AccountantReport({ invoices, receipts }) {
  const [config, setConfig] = useState({});
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("new"); // "old" | "new" | "all"
  useEffect(() => { base44.auth.me().then(me => setConfig(me?.businessConfig || {})); }, []);

  // Filter invoices by entity period
  const filteredInvoices = reportPeriod === "old"
    ? invoices.filter(i => (i.issue_date || "") < CHANGEOVER_DATE)
    : reportPeriod === "new"
    ? invoices.filter(i => (i.issue_date || "") >= CHANGEOVER_DATE)
    : invoices;

  const filteredReceipts = reportPeriod === "old"
    ? receipts.filter(r => (r.date || "") < CHANGEOVER_DATE)
    : reportPeriod === "new"
    ? receipts.filter(r => (r.date || "") >= CHANGEOVER_DATE)
    : receipts;

  const reportEntity = reportPeriod === "old" ? ENTITY_OLD : ENTITY_NEW;

  const totalInvoiced = filteredInvoices.reduce((a, i) => a + (parseFloat(i.total || i.amount) || 0), 0);
  const totalPaid = filteredInvoices.filter(i => i.status === "Paid").reduce((a, i) => a + (parseFloat(i.total || i.amount) || 0), 0);
  const totalUnpaid = totalInvoiced - totalPaid;
  const totalDeductions = filteredReceipts.reduce((a, r) => a + (parseFloat(r.amount) || 0), 0);

  const calcAnnualTax = (a) => { if (a <= 18200) return 0; if (a <= 45000) return (a - 18200) * 0.19; if (a <= 135000) return 5092 + (a - 45000) * 0.325; if (a <= 190000) return 34204 + (a - 135000) * 0.37; return 54630 + (a - 190000) * 0.45; };
  const lito = (a) => { if (a <= 37500) return 700; if (a <= 45000) return 700 - (a - 37500) * 0.05; if (a <= 66667) return 325 - (a - 45000) * 0.015; return 0; };
  const annualIncome = totalPaid;
  const estTax = Math.max(0, calcAnnualTax(annualIncome) - Math.max(0, lito(annualIncome)));
  const estMedicare = annualIncome * 0.02;
  const estTaxTotal = estTax + estMedicare;
  const estSuper = totalPaid * 0.12;
  const netIncome = totalPaid - estTaxTotal;

  const receiptByCategory = filteredReceipts.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + parseFloat(r.amount || 0);
    return acc;
  }, {});

  const reportHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
@media print { @page { size: A4 portrait; margin: 15mm; } body { margin: 0; padding: 0; } }
body{font-family:Arial,sans-serif;color:#1e293b;max-width:800px;margin:0 auto;padding:40px;}
h1{color:#1e3a5f;font-size:22px;border-bottom:3px solid #1e3a5f;padding-bottom:10px;margin-bottom:16px;}
h2{color:#1e3a5f;font-size:14px;margin-top:28px;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em;border-left:4px solid #1e3a5f;padding-left:10px;}
table{width:100%;border-collapse:collapse;margin-bottom:16px;}
th{background:#1e3a5f;color:white;padding:8px 10px;text-align:left;font-size:12px;}
td{padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;}
tr:nth-child(even) td{background:#f8fafc;}
.total td{font-weight:900;background:#dbeafe!important;color:#1e3a5f;}
.highlight{background:#f0f9ff;border:1px solid #bfdbfe;padding:14px 16px;border-radius:8px;margin:14px 0;font-size:13px;}
.highlight p{margin:4px 0;}
.footer{margin-top:36px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;}
</style></head><body>
<h1>Annual Tax Summary Report — FY ${new Date().getFullYear()}</h1>
<p style="font-size:13px;color:#475569;"><strong>Prepared for:</strong> ${reportEntity.name} &nbsp;|&nbsp; <strong>ABN:</strong> ${reportEntity.abn}<br/>
<strong>Address:</strong> ${reportEntity.address} &nbsp;|&nbsp; <strong>Email:</strong> ${reportEntity.email}<br/>
<strong>Report Date:</strong> ${new Date().toLocaleDateString("en-AU")} &nbsp;|&nbsp; <strong>Financial Year:</strong> 2025–2026 &nbsp;|&nbsp; <strong>Period:</strong> ${reportPeriod === "old" ? "07/04/2026 – 17/05/2026" : reportPeriod === "new" ? "18/05/2026 onwards" : "Full year"}</p>
<div class="highlight">
  <p><strong>Total Invoiced:</strong> $${totalInvoiced.toFixed(2)} &nbsp;|&nbsp; <strong>Total Paid:</strong> $${totalPaid.toFixed(2)} &nbsp;|&nbsp; <strong>Outstanding:</strong> $${totalUnpaid.toFixed(2)}</p>
  <p><strong>Est. Tax Liability:</strong> $${estTaxTotal.toFixed(2)} &nbsp;|&nbsp; <strong>Est. Super (12%):</strong> $${estSuper.toFixed(2)}</p>
  <p><strong>Total Deductions:</strong> $${totalDeductions.toFixed(2)} &nbsp;|&nbsp; <strong>Est. Net Income After Tax:</strong> $${netIncome.toFixed(2)}</p>
</div>
<h2>Invoice Summary (${invoices.length} invoices)</h2>
<table><thead><tr><th>Date</th><th>Invoice #</th><th>Participant</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
<tbody>
${filteredInvoices.map(i => `<tr><td>${i.issue_date || i.date || "—"}</td><td>${i.invoice_number || "—"}</td><td>${i.participant_name || "—"}</td><td>${(i.line_items || []).length} line(s)</td><td>$${parseFloat(i.total || 0).toFixed(2)}</td><td>${i.status}</td></tr>`).join("")}
<tr class="total"><td colspan="4">TOTAL INVOICED / PAID</td><td>$${totalInvoiced.toFixed(2)} / $${totalPaid.toFixed(2)}</td><td></td></tr>
</tbody></table>
<h2>Tax Deductions by Category</h2>
<table><thead><tr><th>Category</th><th>Total</th></tr></thead>
<tbody>
${Object.entries(receiptByCategory).map(([cat, amt]) => `<tr><td>${cat}</td><td>$${amt.toFixed(2)}</td></tr>`).join("")}
<tr class="total"><td>TOTAL DEDUCTIONS</td><td>$${totalDeductions.toFixed(2)}</td></tr>
</tbody></table>
<h2>Tax Estimate Summary (ATO 2025–26)</h2>
<table><thead><tr><th>Item</th><th>Amount</th></tr></thead>
<tbody>
<tr><td>Gross Income (Paid Invoices)</td><td>$${totalPaid.toFixed(2)}</td></tr>
<tr><td>Less: Tax Deductions</td><td>– $${totalDeductions.toFixed(2)}</td></tr>
<tr><td>Taxable Income</td><td>$${Math.max(0, totalPaid - totalDeductions).toFixed(2)}</td></tr>
<tr><td>Income Tax</td><td>– $${estTax.toFixed(2)}</td></tr>
<tr><td>Medicare Levy (2%)</td><td>– $${estMedicare.toFixed(2)}</td></tr>
<tr><td>Superannuation (12% SGC)</td><td>$${estSuper.toFixed(2)}</td></tr>
<tr class="total"><td>Net Take-Home Estimate</td><td>$${netIncome.toFixed(2)}</td></tr>
</tbody></table>
<div class="footer">Generated by SZ-Jie Support Services on ${new Date().toLocaleDateString("en-AU")}. Estimates based on ATO 2025-26 rates. Consult a registered tax agent for personalised advice.</div>
</body></html>`;

  const sendReport = async () => {
    if (!email) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({ to: email, subject: `Tax Summary Report — ${config.businessName || "SZ-Jie"} — FY 2025-26`, body: reportHtml });
    setSent(true);
    setSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Entity / Period selector */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Report Entity / Trading Period</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "old", label: "SZ-Jie Wang (ABN 44 833 193 250)", sub: "07/04/2026 – 17/05/2026" },
            { value: "new", label: "SZ-Jie Support Services (ABN 86 959 042 971)", sub: "18/05/2026 onwards" },
            { value: "all", label: "All Records (combined)", sub: "Full year" },
          ].map(opt => (
            <button key={opt.value} onClick={() => setReportPeriod(opt.value)}
              className={`px-4 py-2 rounded-xl border text-left text-xs font-bold transition-all ${reportPeriod === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary"}`}>
              <p>{opt.label}</p>
              <p className="font-normal opacity-70">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Invoiced", value: "$" + totalInvoiced.toFixed(2) },
          { label: "Total Paid", value: "$" + totalPaid.toFixed(2) },
          { label: "Tax Deductions", value: "$" + totalDeductions.toFixed(2) },
          { label: "Est. Tax Liability", value: "$" + estTaxTotal.toFixed(2) },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xl font-black text-foreground">{s.value}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <h3 className="font-black text-lg flex items-center gap-2"><Mail size={18} className="text-primary" /> Email to Accountant</h3>
        <div className="flex gap-3">
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="accountant@example.com" className="flex-1" type="email" />
          <Button onClick={sendReport} disabled={!email || sending} className="rounded-xl font-bold gap-2 shrink-0">
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
            {sending ? "Sending..." : "Send Report"}
          </Button>
        </div>
        {sent && <p className="text-sm text-emerald-600 font-bold">✓ Report sent successfully!</p>}
      </div>
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-black">Report Preview</h3>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-xl gap-2"><Printer size={14} /> Print</Button>
        </div>
        <iframe srcDoc={reportHtml} className="w-full border-0" style={{ height: "640px" }} title="Accountant Report" />
      </div>
    </div>
  );
}

// Entity details based on date range
const ENTITY_OLD = {
  name: "SZ-Jie Wang",
  abn: "44 833 193 250",
  address: "309/12 Broome St, Waterloo NSW 2017",
  email: "Toby7796@gmail.com",
  phone: "0435 951 563",
  bankName: "NAB",
  accountName: "SZ JIE WANG",
  bsb: "083054",
  accountNumber: "429014456",
};
const ENTITY_NEW = {
  name: "SZ-Jie Support Services",
  abn: "86 959 042 971",
  address: "309/12 Broome St, Waterloo NSW 2017",
  email: "jeff@szjiesupportservices@gmail.com",
  phone: "0401 343 876",
  bankName: "",
  accountName: "",
  bsb: "",
  accountNumber: "",
};
const CHANGEOVER_DATE = "2026-05-18";

function getEntityForPeriod(from, to) {
  // If the period is entirely before changeover → old entity
  // If the period is entirely from changeover onwards → new entity
  // If it spans both → split: we return both with a note
  const beforeChangeover = to < CHANGEOVER_DATE;
  const afterChangeover = from >= CHANGEOVER_DATE;
  if (beforeChangeover) return { entity: ENTITY_OLD, split: false };
  if (afterChangeover) return { entity: ENTITY_NEW, split: false };
  // Spans both — return old for the portion before changeover, flag as split
  return { entity: ENTITY_OLD, entityNew: ENTITY_NEW, split: true, changeoverDate: CHANGEOVER_DATE };
}

// Quarter date ranges (Australian financial quarters)
function getQuarterDates(quarter, year) {
  const y = parseInt(year);
  const ranges = {
    Q1: { from: `${y}-01-01`, to: `${y}-03-31` },
    Q2: { from: `${y}-04-01`, to: `${y}-06-30` },
    Q3: { from: `${y}-07-01`, to: `${y}-09-30` },
    Q4: { from: `${y}-10-01`, to: `${y}-12-31` },
  };
  return ranges[quarter] || ranges.Q1;
}

// ─── BAS Report ───────────────────────────────────────────────────────────────
function BASReport({ invoices, receipts }) {
  const now = new Date();
  // Determine current quarter
  const currentMonth = now.getMonth() + 1;
  const defaultQ = currentMonth <= 3 ? "Q1" : currentMonth <= 6 ? "Q2" : currentMonth <= 9 ? "Q3" : "Q4";
  const [quarter, setQuarter] = useState(defaultQ);
  const [year, setYear] = useState(String(now.getFullYear()));
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [payslipRecords, setPayslipRecords] = useState([]);

  useEffect(() => {
    base44.entities.PayslipRecord.list("-date_from", 500).then(setPayslipRecords);
  }, []);

  const { from, to } = getQuarterDates(quarter, year);
  const { entity, entityNew, split } = getEntityForPeriod(from, to);

  // Filter invoices by quarter issue_date
  const qInvoices = invoices.filter(i => {
    const d = i.issue_date || i.date || "";
    return d >= from && d <= to;
  });

  // Filter receipts by quarter date
  const qReceipts = receipts.filter(r => {
    const d = r.date || "";
    return d >= from && d <= to;
  });

  // Filter payslip records by quarter (date_from within quarter)
  const qPayslips = payslipRecords.filter(p => {
    const d = p.date_from || "";
    return d >= from && d <= to;
  });

  const totalSales = qInvoices.reduce((a, i) => a + (parseFloat(i.total || 0)), 0);
  const paidSales = qInvoices.filter(i => i.status === "Paid").reduce((a, i) => a + (parseFloat(i.total || 0)), 0);
  const gstFree = totalSales;
  const gstCollected = 0;
  const totalExpenses = qReceipts.reduce((a, r) => a + (parseFloat(r.amount || 0)), 0);
  const gstOnExpenses = totalExpenses / 11;

  // PAYG withholding from actual payslip records for the quarter
  const paygTaxWithheld = qPayslips.reduce((a, p) => a + (p.tax || 0) + (p.medicare || 0), 0);
  const paygGrossSubject = qPayslips.reduce((a, p) => a + (p.gross_pay || 0), 0);

  const basHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
@media print { @page { size: A4 portrait; margin: 15mm; } body { margin: 0; padding: 0; } }
body{font-family:Arial,sans-serif;color:#1e293b;max-width:760px;margin:0 auto;padding:24px;}
h1{color:#1e3a5f;font-size:20px;border-bottom:3px solid #1e3a5f;padding-bottom:8px;margin-bottom:8px;}
h2{color:#1e3a5f;font-size:12px;margin-top:18px;margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em;border-left:4px solid #1e3a5f;padding-left:8px;}
table{width:100%;border-collapse:collapse;margin-bottom:12px;}
th{background:#1e3a5f;color:white;padding:6px 10px;text-align:left;font-size:11px;}
td{padding:5px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;}
tr:nth-child(even) td{background:#f8fafc;}
.total td{font-weight:900;background:#dbeafe!important;}
.badge{display:inline-block;background:#dcfce7;color:#166534;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;}
.highlight{background:#fffbeb;border:1px solid #fde68a;padding:8px 12px;border-radius:6px;margin:8px 0;font-size:11px;}
.split-notice{background:#fef3c7;border:1px solid #f59e0b;padding:8px 12px;border-radius:6px;margin:8px 0;font-size:11px;}
.footer{margin-top:20px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;}
p{margin:2px 0;font-size:12px;}
</style></head><body>
<h1>Business Activity Statement (BAS) — ${quarter} ${year}</h1>
<p><strong>Entity:</strong> ${entity.name} &nbsp;|&nbsp; <strong>ABN:</strong> ${entity.abn} &nbsp;|&nbsp; <strong>Period:</strong> ${from} to ${to} &nbsp;|&nbsp; <strong>Generated:</strong> ${new Date().toLocaleDateString("en-AU")}</p>
<p>${entity.address} &nbsp;|&nbsp; ${entity.email} &nbsp;|&nbsp; ${entity.phone}</p>
${split ? `<div class="split-notice"><strong>⚠️ Split Period Notice:</strong> This period spans two trading entities. Invoices from ${from} to ${CHANGEOVER_DATE.replace("2026-05-18","2026-05-17")} are reported under <strong>SZ-Jie Wang (ABN 44 833 193 250)</strong>. From ${CHANGEOVER_DATE} onwards, trading is under <strong>SZ-Jie Support Services (ABN 86 959 042 971)</strong>. Consider generating two separate BAS reports for complete accuracy.</div>` : ""}
<div class="highlight"><strong>⚠️ NDIS Note:</strong> All NDIS disability supports are GST-free under Division 38-D of the GST Act. GST collected = $0.00. Confirm with your registered BAS agent before lodging.</div>
<h2>Part A — GST Amounts</h2>
<table><thead><tr><th>Label</th><th>Description</th><th>Amount</th></tr></thead>
<tbody>
<tr><td><strong>G1</strong></td><td>Total Sales (invoices issued in period)</td><td>$${totalSales.toFixed(2)}</td></tr>
<tr><td><strong>G3</strong></td><td>GST-Free Sales (NDIS supports)</td><td>$${gstFree.toFixed(2)}</td></tr>
<tr><td><strong>G11</strong></td><td>Non-Capital Purchases (expenses)</td><td>$${totalExpenses.toFixed(2)}</td></tr>
<tr class="total"><td><strong>1A</strong></td><td>GST on Sales</td><td>$${gstCollected.toFixed(2)} <span class="badge">GST-Free</span></td></tr>
<tr class="total"><td><strong>1B</strong></td><td>GST Credits on Purchases (est.)</td><td>$${gstOnExpenses.toFixed(2)}</td></tr>
</tbody></table>
<h2>Part B — PAYG Withholding (from Payroll Records)</h2>
<table><thead><tr><th>Label</th><th>Description</th><th>Amount</th></tr></thead>
<tbody>
<tr><td><strong>W1</strong></td><td>Total Gross Wages Subject to Withholding (${qPayslips.length} payslip${qPayslips.length !== 1 ? "s" : ""})</td><td>$${paygGrossSubject.toFixed(2)}</td></tr>
<tr class="total"><td><strong>4</strong></td><td>PAYG Tax Withheld (tax + Medicare from payslips)</td><td>$${paygTaxWithheld.toFixed(2)}</td></tr>
</tbody></table>
<h2>Invoice Breakdown (${qInvoices.length} invoices — ${from} to ${to})</h2>
<table><thead><tr><th>Invoice #</th><th>Participant</th><th>Date</th><th>Total</th><th>GST</th><th>Status</th></tr></thead>
<tbody>
${qInvoices.map(i => `<tr><td>${i.invoice_number || "—"}</td><td>${i.participant_name || "—"}</td><td>${i.issue_date || "—"}</td><td>$${parseFloat(i.total || 0).toFixed(2)}</td><td>$0.00</td><td>${i.status}</td></tr>`).join("")}
${qInvoices.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:#94a3b8;font-style:italic;">No invoices in this period</td></tr>` : ""}
<tr class="total"><td colspan="3">TOTALS</td><td>$${totalSales.toFixed(2)}</td><td>$0.00</td><td></td></tr>
</tbody></table>
<h2>Payroll Summary (${qPayslips.length} payslips — ${from} to ${to})</h2>
<table><thead><tr><th>Payslip #</th><th>Staff</th><th>Period</th><th>Gross</th><th>Tax Withheld</th><th>Medicare</th></tr></thead>
<tbody>
${qPayslips.map(p => `<tr><td>${p.payslip_number || "—"}</td><td>${p.staff_name || "—"}</td><td>${p.date_from} → ${p.date_to}</td><td>$${(p.gross_pay || 0).toFixed(2)}</td><td>$${(p.tax || 0).toFixed(2)}</td><td>$${(p.medicare || 0).toFixed(2)}</td></tr>`).join("")}
${qPayslips.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:#94a3b8;font-style:italic;">No payslips in this period</td></tr>` : ""}
<tr class="total"><td colspan="3">TOTALS</td><td>$${paygGrossSubject.toFixed(2)}</td><td>$${qPayslips.reduce((a,p)=>a+(p.tax||0),0).toFixed(2)}</td><td>$${qPayslips.reduce((a,p)=>a+(p.medicare||0),0).toFixed(2)}</td></tr>
</tbody></table>
<h2>Expense Summary (${qReceipts.length} receipts)</h2>
<table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Est. GST</th></tr></thead>
<tbody>
${qReceipts.map(r => `<tr><td>${r.date || "—"}</td><td>${r.category || "—"}</td><td>${r.description || "—"}</td><td>$${parseFloat(r.amount || 0).toFixed(2)}</td><td>$${(parseFloat(r.amount || 0) / 11).toFixed(2)}</td></tr>`).join("")}
${qReceipts.length === 0 ? `<tr><td colspan="5" style="text-align:center;color:#94a3b8;font-style:italic;">No expenses in this period</td></tr>` : ""}
<tr class="total"><td colspan="3">TOTALS</td><td>$${totalExpenses.toFixed(2)}</td><td>$${gstOnExpenses.toFixed(2)}</td></tr>
</tbody></table>
<div class="footer">Generated by SZ-Jie Support Services on ${new Date().toLocaleDateString("en-AU")}. NDIS supports are GST-free (Division 38-D, GST Act 1999). PAYG withholding figures sourced from payroll records. Have a registered BAS agent review before lodging.</div>
</body></html>`;

  const sendBAS = async () => {
    if (!email) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({ to: email, subject: `BAS Report — SZ-Jie Support Services — ${quarter} ${year} (${from} to ${to})`, body: basHtml });
    setSent(true);
    setSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Quarter selector at the top */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Quarter</Label>
            <Select value={quarter} onValueChange={setQuarter}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{["Q1","Q2","Q3","Q4"].map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent></Select>
          </div>
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Year</Label>
            <Select value={year} onValueChange={setYear}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{["2024","2025","2026","2027"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
          </div>
          <p className="text-xs text-muted-foreground pb-1">Period: <strong>{from}</strong> → <strong>{to}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: `Total Sales (G1)`, value: "$" + totalSales.toFixed(2) },
          { label: "GST-Free (G3)", value: "$" + gstFree.toFixed(2) },
          { label: "PAYG Withheld", value: "$" + paygTaxWithheld.toFixed(2) },
          { label: "Total Expenses", value: "$" + totalExpenses.toFixed(2) },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xl font-black text-foreground">{s.value}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <h3 className="font-black text-lg flex items-center gap-2"><Mail size={18} className="text-primary" /> Email BAS to Accountant</h3>

        <div className="flex gap-3">
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="bas-agent@example.com" className="flex-1" type="email" />
          <Button onClick={sendBAS} disabled={!email || sending} className="rounded-xl font-bold gap-2 shrink-0">
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
            {sending ? "Sending..." : "Send BAS"}
          </Button>
        </div>
        {sent && <p className="text-sm text-emerald-600 font-bold">✓ BAS report sent!</p>}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <p className="font-black mb-1">⚠️ Important</p>
        <p>NDIS supports are GST-free. This report should be reviewed by a registered BAS agent before lodging with the ATO.</p>
      </div>
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-black">BAS Preview — {quarter} {year}</h3>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-xl gap-2"><Printer size={14} /> Print</Button>
        </div>
        <iframe srcDoc={basHtml} className="w-full border-0" style={{ height: "900px" }} title="BAS Report" />
      </div>
    </div>
  );
}

// ─── Payroll Reconciliation ───────────────────────────────────────────────────
function PayrollReconciliation() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStaff, setExpandedStaff] = useState(null);

  useEffect(() => {
    base44.entities.PayslipRecord.list("-date_from", 500).then(r => { setRecords(r); setLoading(false); });
  }, []);

  // Group by staff name
  const byStaff = records.reduce((acc, r) => {
    const name = r.staff_name || "Unknown";
    if (!acc[name]) acc[name] = [];
    acc[name].push(r);
    return acc;
  }, {});

  const staffList = Object.entries(byStaff).map(([name, payslips]) => {
    const totals = payslips.reduce((a, p) => ({
      gross: a.gross + (p.gross_pay || 0),
      tax: a.tax + (p.tax || 0),
      medicare: a.medicare + (p.medicare || 0),
      super_amount: a.super_amount + (p.super_amount || 0),
      net: a.net + (p.net_pay || 0),
    }), { gross: 0, tax: 0, medicare: 0, super_amount: 0, net: 0 });
    return { name, payslips, totals };
  });

  const grandTotals = staffList.reduce((a, s) => ({
    gross: a.gross + s.totals.gross,
    tax: a.tax + s.totals.tax,
    medicare: a.medicare + s.totals.medicare,
    super_amount: a.super_amount + s.totals.super_amount,
    net: a.net + s.totals.net,
  }), { gross: 0, tax: 0, medicare: 0, super_amount: 0, net: 0 });

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  if (records.length === 0) return (
    <div className="bg-card border border-border rounded-3xl p-16 text-center text-muted-foreground">
      <FileText size={32} className="mx-auto mb-3 opacity-30" />
      <p className="font-bold">No payslip records yet.</p>
      <p className="text-sm">Generate payslips in the Payslips section to see reconciliation data here.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Grand totals summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Gross Paid", value: grandTotals.gross, color: "text-foreground" },
          { label: "Tax Withheld", value: grandTotals.tax, color: "text-rose-600" },
          { label: "Medicare Levy", value: grandTotals.medicare, color: "text-amber-600" },
          { label: "Super (12%)", value: grandTotals.super_amount, color: "text-blue-600" },
          { label: "Total Net Paid", value: grandTotals.net, color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`text-xl font-black ${s.color}`}>${s.value.toFixed(2)}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-800">
        <p className="font-bold">💡 Bank Reconciliation Tip</p>
        <p className="text-xs mt-1">Match <strong>Net Pay</strong> to your bank transfers. Remit <strong>Tax Withheld + Medicare</strong> to the ATO via PAYG. Pay <strong>Super</strong> quarterly to the employee's nominated fund.</p>
      </div>

      {/* Per-staff breakdown */}
      <div className="space-y-3">
        {staffList.map(({ name, payslips, totals }) => (
          <div key={name} className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Staff header row */}
            <button
              onClick={() => setExpandedStaff(expandedStaff === name ? null : name)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                  {name[0]}
                </div>
                <div className="text-left">
                  <p className="font-black text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{payslips.length} payslip{payslips.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex gap-6 text-right text-xs">
                <div><p className="font-black">${totals.gross.toFixed(2)}</p><p className="text-muted-foreground">Gross</p></div>
                <div><p className="font-black text-rose-600">${totals.tax.toFixed(2)}</p><p className="text-muted-foreground">Tax</p></div>
                <div><p className="font-black text-amber-600">${totals.medicare.toFixed(2)}</p><p className="text-muted-foreground">Medicare</p></div>
                <div><p className="font-black text-blue-600">${totals.super_amount.toFixed(2)}</p><p className="text-muted-foreground">Super</p></div>
                <div><p className="font-black text-emerald-600">${totals.net.toFixed(2)}</p><p className="text-muted-foreground">Net Paid</p></div>
                <span className="text-muted-foreground self-center">{expandedStaff === name ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Expanded payslip rows */}
            {expandedStaff === name && (
              <div className="border-t border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-2 text-left">Payslip #</th>
                      <th className="px-4 py-2 text-left">Period</th>
                      <th className="px-4 py-2 text-right">Gross</th>
                      <th className="px-4 py-2 text-right">Tax Withheld</th>
                      <th className="px-4 py-2 text-right">Medicare</th>
                      <th className="px-4 py-2 text-right">Super</th>
                      <th className="px-4 py-2 text-right">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payslips.map(p => (
                      <tr key={p.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-2 font-mono font-bold text-primary">{p.payslip_number}</td>
                        <td className="px-4 py-2 text-muted-foreground">{p.date_from} → {p.date_to}</td>
                        <td className="px-4 py-2 text-right font-bold">${(p.gross_pay || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right text-rose-600 font-bold">${(p.tax || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right text-amber-600 font-bold">${(p.medicare || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right text-blue-600 font-bold">${(p.super_amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right text-emerald-600 font-bold">${(p.net_pay || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    {/* Staff subtotal row */}
                    <tr className="bg-secondary/50 font-black text-[10px]">
                      <td className="px-4 py-2 text-muted-foreground" colSpan={2}>SUBTOTAL</td>
                      <td className="px-4 py-2 text-right">${totals.gross.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-rose-600">${totals.tax.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-amber-600">${totals.medicare.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-blue-600">${totals.super_amount.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-emerald-600">${totals.net.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Finance() {
  const [tab, setTab] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);

  const loadReceipts = async () => {
    const data = await base44.entities.Receipt.list("-created_date");
    setReceipts(data);
  };

  useEffect(() => { loadReceipts(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Finance Centre</h2>
        <p className="text-muted-foreground text-sm">Invoice tracking · Tax & super calculator · Receipts · Accountant report · BAS report</p>
      </div>

      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit flex-wrap">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === i ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <InvoiceTracker onReload={setInvoices} />}
      {tab === 1 && <TaxCalculator />}
      {tab === 2 && <Receipts receipts={receipts} onLoad={loadReceipts} />}
      {tab === 3 && <AccountantReport invoices={invoices} receipts={receipts} />}
      {tab === 4 && <BASReport invoices={invoices} receipts={receipts} />}
      {tab === 5 && <PayrollReconciliation />}
    </div>
  );
}