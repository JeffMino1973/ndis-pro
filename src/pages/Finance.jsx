import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  DollarSign, Calculator, Receipt, FileText, Plus, Trash2,
  Printer, Mail, TrendingUp, Loader2, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TABS = ["Invoice Tracker", "Tax Calculator", "Receipts", "Accountant Report"];

// ─── Tax Calculator ───────────────────────────────────────────────────────────
function TaxCalculator() {
  const [income, setIncome] = useState({ tue: 280.92, thu: 280.92, sun: 382.29 });
  const [period, setPeriod] = useState("weekly");

  const weekly = (income.tue || 0) + (income.thu || 0) + (income.sun || 0);
  const annual = weekly * 52;
  const super12 = weekly * 0.12;

  // ATO 2025-26 tax brackets for residents
  const calcTax = (gross) => {
    if (gross <= 18200) return 0;
    if (gross <= 45000) return (gross - 18200) * 0.19;
    if (gross <= 135000) return 5092 + (gross - 45000) * 0.325;
    if (gross <= 190000) return 34204 + (gross - 135000) * 0.37;
    return 54630 + (gross - 190000) * 0.45;
  };

  const lito = (ann) => {
    if (ann <= 37500) return 700;
    if (ann <= 45000) return 700 - (ann - 37500) * 0.05;
    if (ann <= 66667) return 325 - (ann - 45000) * 0.015;
    return 0;
  };

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
          {[
            { label: "Tuesday Income ($)", key: "tue" },
            { label: "Thursday Income ($)", key: "thu" },
            { label: "Sunday Income ($)", key: "sun" },
          ].map(({ label, key }) => (
            <div key={key}>
              <Label className="text-xs">{label}</Label>
              <Input
                type="number"
                step="0.01"
                value={income[key]}
                onChange={e => setIncome(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                className="mt-1 font-bold"
              />
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
            <p className="text-xs text-blue-600 mt-1">Check with your employer if super is paid on top or from your rate.</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <p className="font-black mb-1">⚠️ Disclaimer</p>
        <p>This is an estimate only based on ATO 2025-26 rates. Figures may vary based on tax-free threshold, HECS debt, additional income, and deductions. Always consult a registered tax agent.</p>
      </div>
    </div>
  );
}

// ─── Invoice Tracker ──────────────────────────────────────────────────────────
function InvoiceTracker() {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    payment_date: "",
    client_name: "",
    description: "",
    amount: "",
    status: "Unpaid",
  });

  const load = async () => {
    const data = await base44.entities.Invoice.list("-created_date");
    setInvoices(data);
  };

  useEffect(() => { load(); }, []);

  const EMPTY = {
    date: new Date().toISOString().split("T")[0], invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0], payment_date: "",
    client_name: "", description: "", amount: "", status: "Unpaid",
  };

  const openEdit = (inv) => {
    setEditingId(inv.id);
    setForm({ date: inv.date || "", invoice_number: inv.invoice_number || "",
      invoice_date: inv.invoice_date || inv.issue_date || "", payment_date: inv.payment_date || "",
      client_name: inv.participant_name || inv.client_name || "",
      description: inv.description || inv.notes || "", amount: inv.total || inv.amount || "",
      status: inv.status || "Unpaid" });
    setShowForm(true);
  };

  const save = async () => {
    const data = { ...form, total: parseFloat(form.amount) || 0, issue_date: form.invoice_date, participant_name: form.client_name };
    if (editingId) {
      await base44.entities.Invoice.update(editingId, data);
    } else {
      await base44.entities.Invoice.create(data);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    load();
  };

  const deleteInv = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    await base44.entities.Invoice.delete(id);
    load();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.Invoice.update(id, { status });
    load();
  };

  const totalInvoiced = invoices.reduce((a, i) => a + (parseFloat(i.total || i.amount) || 0), 0);
  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((a, i) => a + (parseFloat(i.total || i.amount) || 0), 0);
  const totalUnpaid = totalInvoiced - totalPaid;

  const STATUS_COLORS = { Paid: "bg-emerald-100 text-emerald-700", Unpaid: "bg-amber-100 text-amber-700", Overdue: "bg-rose-100 text-rose-700", Sent: "bg-blue-100 text-blue-700", Draft: "bg-slate-100 text-slate-600" };

  const F = ({ label, field, type = "text" }) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={form[field] || ""} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} className="mt-1" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Invoiced", value: "$" + totalInvoiced.toFixed(2), color: "text-foreground" },
          { label: "Total Paid", value: "$" + totalPaid.toFixed(2), color: "text-emerald-600" },
          { label: "Outstanding", value: "$" + totalUnpaid.toFixed(2), color: "text-rose-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => { setEditingId(null); setForm(EMPTY); setShowForm(true); }} className="rounded-xl font-bold gap-2">
          <Plus size={15} /> Add Invoice
        </Button>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 text-muted-foreground">{inv.date || inv.issue_date}</td>
                <td className="px-4 py-3 font-bold">{inv.invoice_number}</td>
                <td className="px-4 py-3">{inv.participant_name || inv.client_name}</td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[180px]">{inv.description || inv.notes}</td>
                <td className="px-4 py-3 font-black text-right">${parseFloat(inv.total || inv.amount || 0).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Select value={inv.status} onValueChange={v => updateStatus(inv.id, v)}>
                    <SelectTrigger className={`h-6 text-[10px] font-black w-24 rounded-full border-0 ${STATUS_COLORS[inv.status] || "bg-slate-100 text-slate-600"}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>{["Draft","Unpaid","Sent","Paid","Overdue"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(inv)} className="gap-1 h-7 px-2"><FileText size={12} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteInv(inv.id)} className="gap-1 h-7 px-2 text-destructive"><Trash2 size={12} /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground italic text-sm">No invoices yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={showForm} onOpenChange={open => { setShowForm(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit Invoice" : "Add Invoice"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <F label="Date" field="date" type="date" />
            <F label="Invoice Number" field="invoice_number" />
            <F label="Invoice Date" field="invoice_date" type="date" />
            <F label="Payment Date" field="payment_date" type="date" />
            <F label="Client Name" field="client_name" />
            <F label="Amount ($)" field="amount" type="number" />
            <div className="col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1 min-h-[60px] text-sm" />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{["Draft","Unpaid","Sent","Paid","Overdue"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={save} disabled={!form.client_name || !form.amount} className="w-full rounded-xl font-bold mt-4">
            {editingId ? "Save Changes" : "Add Invoice"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Receipts ─────────────────────────────────────────────────────────────────
const RECEIPT_CATS = ["Vehicle/Fuel","Phone/Internet","Work Clothing","Professional Development","Home Office","Equipment/Tools","Subscriptions","Other"];

function Receipts({ receipts, setReceipts, onLoad }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const EMPTY = { date: new Date().toISOString().split("T")[0], description: "", category: "Vehicle/Fuel", amount: "", receipt_url: "", notes: "" };
  const [form, setForm] = useState(EMPTY);

  const openEdit = (r) => { setEditingId(r.id); setForm({ date: r.date, description: r.description, category: r.category, amount: r.amount, receipt_url: r.receipt_url || "", notes: r.notes || "" }); setShowForm(true); };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, receipt_url: file_url }));
    setUploading(false);
  };

  const save = async () => {
    const data = { ...form, amount: parseFloat(form.amount) || 0 };
    if (editingId) {
      await base44.entities.Receipt.update(editingId, data);
    } else {
      await base44.entities.Receipt.create(data);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    onLoad();
  };

  const del = async (id) => {
    if (!window.confirm("Delete receipt?")) return;
    await base44.entities.Receipt.delete(id);
    onLoad();
  };

  const total = receipts.reduce((a, r) => a + (parseFloat(r.amount) || 0), 0);

  const F = ({ label, field, type = "text" }) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={form[field] || ""} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} className="mt-1" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3">
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Total Deductible</p>
          <p className="text-2xl font-black text-emerald-700">${total.toFixed(2)}</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(EMPTY); setShowForm(true); }} className="rounded-xl font-bold gap-2">
          <Plus size={15} /> Add Receipt
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {receipts.map(r => (
          <div key={r.id} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-black text-sm">{r.description}</p>
                <p className="text-xs text-muted-foreground">{r.category} · {r.date}</p>
              </div>
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
              <F label="Date" field="date" type="date" />
              <F label="Amount ($)" field="amount" type="number" />
              <div className="col-span-2"><F label="Description" field="description" /></div>
              <div className="col-span-2">
                <Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{RECEIPT_CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Upload Receipt (optional)</Label>
                <input type="file" onChange={handleFile} className="hidden" id="receipt-upload" />
                <label htmlFor="receipt-upload" className="mt-1 block cursor-pointer border-2 border-dashed border-border rounded-xl p-3 text-center text-xs text-muted-foreground hover:border-primary">
                  {uploading ? "Uploading..." : form.receipt_url ? "✓ File uploaded — click to replace" : "Click to upload receipt"}
                </label>
              </div>
              <div className="col-span-2"><F label="Notes" field="notes" /></div>
            </div>
            <Button onClick={save} disabled={!form.description || !form.amount} className="w-full rounded-xl font-bold">
              {editingId ? "Save Changes" : "Add Receipt"}
            </Button>
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

  useEffect(() => { base44.auth.me().then(me => setConfig(me?.businessConfig || {})); }, []);

  const totalInvoiced = invoices.reduce((a, i) => a + (parseFloat(i.total || i.amount) || 0), 0);
  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((a, i) => a + (parseFloat(i.total || i.amount) || 0), 0);
  const totalDeductions = receipts.reduce((a, r) => a + (parseFloat(r.amount) || 0), 0);
  const weekly = 944.13;
  const annual = weekly * 52;
  const annualTax = annual > 45000 ? 5092 + (annual - 45000) * 0.325 : (annual - 18200) * 0.19;
  const lito = annual <= 37500 ? 700 : annual <= 45000 ? 700 - (annual - 37500) * 0.05 : 325 - (annual - 45000) * 0.015;
  const netTax = Math.max(0, annualTax - Math.max(0, lito)) + annual * 0.02;
  const superAnnual = annual * 0.12;

  const reportHtml = `
<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;color:#1e293b;max-width:800px;margin:0 auto;padding:40px;}
h1{color:#1e3a5f;font-size:24px;border-bottom:3px solid #2563eb;padding-bottom:12px;}
h2{color:#1e3a5f;font-size:16px;margin-top:32px;margin-bottom:12px;border-left:4px solid #2563eb;padding-left:12px;}
table{width:100%;border-collapse:collapse;margin-bottom:20px;}
th{background:#1e3a5f;color:white;padding:10px 12px;text-align:left;font-size:12px;}
td{padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;}
tr:nth-child(even){background:#f8fafc;}
.total{font-weight:900;background:#f0f9ff!important;color:#1e3a5f;}
.highlight{background:#dbeafe;padding:16px;border-radius:8px;margin:16px 0;}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;}
</style></head><body>
<h1>Annual Tax Summary Report — ${new Date().getFullYear()}</h1>
<p><strong>Prepared for:</strong> ${config.businessName || "SZ Jie Wang"}<br/>
<strong>ABN:</strong> ${config.abn || "—"}<br/>
<strong>Report Date:</strong> ${new Date().toLocaleDateString("en-AU")}<br/>
<strong>Financial Year:</strong> 2025–2026</p>

<div class="highlight">
<strong>Total Gross Income:</strong> $${totalInvoiced.toFixed(2)} invoiced · $${totalPaid.toFixed(2)} received<br/>
<strong>Estimated Annual Income:</strong> $${annual.toLocaleString("en-AU", { maximumFractionDigits: 0 })}<br/>
<strong>Estimated Tax Liability:</strong> $${netTax.toLocaleString("en-AU", { maximumFractionDigits: 0 })}<br/>
<strong>Superannuation (12%):</strong> $${superAnnual.toLocaleString("en-AU", { maximumFractionDigits: 0 })} per year<br/>
<strong>Total Deductions Claimed:</strong> $${totalDeductions.toFixed(2)}
</div>

<h2>Invoice Summary (${invoices.length} invoices)</h2>
<table><thead><tr><th>Date</th><th>Invoice #</th><th>Client</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
<tbody>
${invoices.map(i => `<tr><td>${i.date || i.issue_date || "—"}</td><td>${i.invoice_number || "—"}</td><td>${i.participant_name || i.client_name || "—"}</td><td>${i.description || i.notes || "—"}</td><td>$${parseFloat(i.total || i.amount || 0).toFixed(2)}</td><td>${i.status}</td></tr>`).join("")}
<tr class="total"><td colspan="4">TOTAL INVOICED</td><td>$${totalInvoiced.toFixed(2)}</td><td></td></tr>
</tbody></table>

<h2>Tax Deductions (${receipts.length} receipts)</h2>
<table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
<tbody>
${receipts.map(r => `<tr><td>${r.date || "—"}</td><td>${r.category || "—"}</td><td>${r.description || "—"}</td><td>$${parseFloat(r.amount || 0).toFixed(2)}</td></tr>`).join("")}
<tr class="total"><td colspan="3">TOTAL DEDUCTIONS</td><td>$${totalDeductions.toFixed(2)}</td></tr>
</tbody></table>

<h2>Tax Estimate Summary (2025–26)</h2>
<table><thead><tr><th>Item</th><th>Weekly</th><th>Annual</th></tr></thead>
<tbody>
<tr><td>Gross Income</td><td>$${weekly.toFixed(2)}</td><td>$${annual.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</td></tr>
<tr><td>Superannuation (12%)</td><td>$${(weekly * 0.12).toFixed(2)}</td><td>$${superAnnual.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</td></tr>
<tr><td>Estimated Tax + Medicare</td><td>$${(netTax / 52).toFixed(2)}</td><td>$${netTax.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</td></tr>
<tr class="total"><td>Net Take-Home</td><td>$${(weekly - netTax / 52).toFixed(2)}</td><td>$${(annual - netTax).toLocaleString("en-AU", { maximumFractionDigits: 0 })}</td></tr>
</tbody></table>

<div class="footer">This report was generated by NDIS PRO on ${new Date().toLocaleDateString("en-AU")}. Tax estimates are based on ATO 2025-26 rates and are for informational purposes only. Please consult a registered tax agent for advice specific to your situation.</div>
</body></html>`;

  const sendReport = async () => {
    if (!email) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Tax Summary Report — ${config.businessName || "NDIS Support Worker"} — FY 2025-26`,
      body: reportHtml,
    });
    setSent(true);
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Invoiced", value: "$" + totalInvoiced.toFixed(2) },
          { label: "Total Paid", value: "$" + totalPaid.toFixed(2) },
          { label: "Tax Deductions", value: "$" + totalDeductions.toFixed(2) },
          { label: "Est. Annual Tax", value: "$" + netTax.toLocaleString("en-AU", { maximumFractionDigits: 0 }) },
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
        <iframe srcDoc={reportHtml} className="w-full border-0" style={{ height: "600px" }} title="Accountant Report" />
      </div>
    </div>
  );
}

// ─── Main Finance Page ────────────────────────────────────────────────────────
export default function Finance() {
  const [tab, setTab] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);

  const loadInvoices = async () => {
    const data = await base44.entities.Invoice.list("-created_date");
    setInvoices(data);
  };

  const loadReceipts = async () => {
    const data = await base44.entities.Receipt.list("-created_date");
    setReceipts(data);
  };

  useEffect(() => { loadInvoices(); loadReceipts(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Finance Centre</h2>
        <p className="text-muted-foreground text-sm">Invoice tracking · Tax & super calculator · Receipt log · Accountant report</p>
      </div>

      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit flex-wrap">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === i ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <InvoiceTracker />}
      {tab === 1 && <TaxCalculator />}
      {tab === 2 && <Receipts receipts={receipts} setReceipts={setReceipts} onLoad={loadReceipts} />}
      {tab === 3 && <AccountantReport invoices={invoices} receipts={receipts} />}
    </div>
  );
}