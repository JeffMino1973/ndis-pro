import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Plus, Trash2, Loader2, FileText, Pencil, X, ChevronLeft, Banknote } from "lucide-react";
import { format } from "date-fns";
import PayslipPreview, { getEmployer } from "@/components/payslips/PayslipPreview";

const PRINT_STYLES = `
@media print {
  @page { size: A4 landscape; margin: 10mm; }
  body * { visibility: hidden !important; }
  #payslip-printable, #payslip-printable * { visibility: visible !important; }
  #payslip-printable {
    position: fixed !important;
    top: 0 !important; left: 0 !important;
    width: 100% !important; height: auto !important;
    background: white !important;
    padding: 0 !important; margin: 0 !important;
    border: none !important; border-radius: 0 !important;
    box-shadow: none !important; overflow: visible !important;
  }
}
`;

const BANK_PRINT_STYLES = `
@media print {
  @page { size: A4 portrait; margin: 15mm; }
  body * { visibility: hidden !important; }
  #banking-report-printable, #banking-report-printable * { visibility: visible !important; }
  #banking-report-printable {
    position: fixed !important;
    top: 0 !important; left: 0 !important;
    width: 100% !important; height: auto !important;
    background: white !important;
    padding: 0 !important; margin: 0 !important;
  }
}
`;

const NDIS_ITEMS = [
  { code: "04_104_0125_6_1", description: "Access Community Social and Rec Activ – Weekday", rate: 70.23 },
  { code: "04_105_0125_6_1", description: "Access Community Social and Rec Activ – Saturday", rate: 98.83 },
  { code: "04_106_0125_6_1", description: "Access Community Social and Rec Activ – Sunday", rate: 127.43 },
];

const EMPTY_LINE = () => ({
  id: crypto.randomUUID(),
  date: "", time: "",
  item_code: "04_104_0125_6_1",
  description: "Access Community Social and Rec Activ – Weekday",
  unit_price: 70.23, qty: 1,
});

function calcAnnualTax(a) {
  if (a <= 18200) return 0;
  if (a <= 45000) return (a - 18200) * 0.19;
  if (a <= 135000) return 5092 + (a - 45000) * 0.325;
  if (a <= 190000) return 34204 + (a - 135000) * 0.37;
  return 54630 + (a - 190000) * 0.45;
}
function calcLITO(a) {
  if (a <= 37500) return 700;
  if (a <= 45000) return 700 - (a - 37500) * 0.05;
  if (a <= 66667) return 325 - (a - 45000) * 0.015;
  return 0;
}
const PERIODS = { weekly: 52, fortnightly: 26, monthly: 12 };
function periodTax(gross, payPeriod) {
  const periodsPerYear = PERIODS[payPeriod] || 26;
  const ann = gross * periodsPerYear;
  const tax = Math.max(0, calcAnnualTax(ann) - Math.max(0, calcLITO(ann)));
  const med = ann * 0.02;
  return { tax: tax / periodsPerYear, medicare: med / periodsPerYear };
}

export default function Payslips() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [saving, setSaving] = useState(false);

  // view: "list" | "new" | "view" | "banking"
  const [view, setView] = useState("list");
  const [activeRecord, setActiveRecord] = useState(null); // record being viewed/edited

  // Form state (for new or edit)
  const [staffName, setStaffName] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [payPeriod, setPayPeriod] = useState("fortnightly");
  const [dateFrom, setDateFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [lines, setLines] = useState([EMPTY_LINE()]);
  const [payslipNo, setPayslipNo] = useState("PS-" + String(Date.now()).slice(-6));

  useEffect(() => {
    base44.entities.StaffMember.list().then(s => { setStaff(s); setLoading(false); });
    base44.entities.PayslipRecord.list("-created_date", 100).then(setRecords);
  }, []);

  const lineTotal = (l) => parseFloat(l.unit_price || 0) * parseFloat(l.qty || 0);
  const subtotal = lines.reduce((a, l) => a + lineTotal(l), 0);
  const { tax, medicare } = periodTax(subtotal, payPeriod);
  const superAmt = subtotal * 0.12;
  const netPay = Math.max(0, subtotal - tax - medicare);

  const updateLine = (id, field, value) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (field === "item_code") {
        const item = NDIS_ITEMS.find(i => i.code === value);
        if (item) { updated.description = item.description; updated.unit_price = item.rate; }
      }
      return updated;
    }));
  };

  const loadIntoForm = (r) => {
    setStaffName(r.staff_name || "");
    const found = staff.find(s => s.name === r.staff_name);
    setSelectedStaff(found || null);
    setPayPeriod(r.pay_period || "fortnightly");
    setDateFrom(r.date_from || "");
    setDateTo(r.date_to || "");
    setPayslipNo(r.payslip_number || "");
    setLines((r.line_items || []).map(l => ({ ...l, id: crypto.randomUUID() })));
  };

  const handleSave = async (editingId = null) => {
    setSaving(true);
    const emp = getEmployer(dateFrom);
    const foundStaff = staff.find(s => s.name === staffName);
    const record = {
      payslip_number: payslipNo,
      staff_name: staffName,
      pay_period: payPeriod,
      date_from: dateFrom,
      date_to: dateTo,
      gross_pay: subtotal,
      tax, medicare,
      super_amount: superAmt,
      net_pay: netPay,
      employer_name: emp.name,
      staff_email: foundStaff?.email || "",
      staff_phone: foundStaff?.phone || "",
      staff_address: foundStaff?.address || "",
      staff_tfn: foundStaff?.tfn || "",
      staff_abn: foundStaff?.abn || "",
      bank_name: foundStaff?.bank_name || "",
      bank_account_name: foundStaff?.bank_account_name || "",
      bank_bsb: foundStaff?.bank_bsb || "",
      bank_account_number: foundStaff?.bank_account_number || "",
      super_fund_name: foundStaff?.super_fund_name || "",
      super_fund_abn: foundStaff?.super_fund_abn || "",
      super_usi: foundStaff?.super_usi || "",
      super_member_number: foundStaff?.super_member_number || "",
      line_items: lines.map(l => ({ ...l, total: lineTotal(l) })),
    };

    let saved;
    if (editingId) {
      saved = await base44.entities.PayslipRecord.update(editingId, record);
      setRecords(prev => prev.map(r => r.id === editingId ? saved : r));
    } else {
      saved = await base44.entities.PayslipRecord.create(record);
      setRecords(prev => [saved, ...prev]);
    }
    setActiveRecord(saved);
    setView("view");
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this payslip record?")) return;
    await base44.entities.PayslipRecord.delete(id);
    setRecords(prev => prev.filter(r => r.id !== id));
    if (activeRecord?.id === id) { setActiveRecord(null); setView("list"); }
  };

  const startNew = () => {
    setStaffName(""); setSelectedStaff(null);
    setPayPeriod("fortnightly");
    setDateFrom(format(new Date(), "yyyy-MM-dd"));
    setDateTo(format(new Date(), "yyyy-MM-dd"));
    setLines([EMPTY_LINE()]);
    setPayslipNo("PS-" + String(Date.now()).slice(-6));
    setActiveRecord(null);
    setView("new");
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
    </div>
  );

  // ── VIEW: banking report ─────────────────────────────────────────────────
  if (view === "banking" && activeRecord) {
    const r = activeRecord;
    const emp = getEmployer(r.date_from);
    const superPayable = (r.super_amount || 0).toFixed(2);
    const taxPayable = ((r.tax || 0) + (r.medicare || 0)).toFixed(2);
    return (
      <>
        <style>{BANK_PRINT_STYLES}</style>
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center justify-between print:hidden">
            <Button variant="ghost" onClick={() => setView("view")} className="gap-2">
              <ChevronLeft size={16} /> Back to Payslip
            </Button>
            <Button onClick={() => window.print()} className="gap-2">
              <Printer size={14} /> Print Banking Report
            </Button>
          </div>

          <div id="banking-report-printable" className="bg-white border border-border rounded-2xl p-8 space-y-6 text-sm" style={{ fontFamily: "Arial, sans-serif" }}>
            {/* Header */}
            <div style={{ borderBottom: "3px solid #1e3a5f", paddingBottom: "12px", marginBottom: "4px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#1e3a5f", margin: 0 }}>PAYROLL BANKING REPORT</h1>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "11px" }}>
                Payslip #{r.payslip_number} &nbsp;·&nbsp; {r.date_from} → {r.date_to} &nbsp;·&nbsp; Generated: {format(new Date(), "dd/MM/yyyy")}
              </p>
            </div>

            {/* Employer */}
            <section>
              <h2 style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#1e3a5f", borderLeft: "4px solid #1e3a5f", paddingLeft: "8px", margin: "0 0 8px 0" }}>Employer Details</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                <p><strong>Business Name:</strong> {emp.name}</p>
                <p><strong>ABN:</strong> {emp.abn}</p>
                <p><strong>Address:</strong> {emp.address}</p>
                <p><strong>Phone:</strong> {emp.phone}</p>
                <p><strong>Email:</strong> {emp.email}</p>
              </div>
            </section>

            {/* Staff */}
            <section>
              <h2 style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#1e3a5f", borderLeft: "4px solid #1e3a5f", paddingLeft: "8px", margin: "0 0 8px 0" }}>Staff Member Details</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                <p><strong>Name:</strong> {r.staff_name}</p>
                <p><strong>Email:</strong> {r.staff_email || "—"}</p>
                <p><strong>Phone:</strong> {r.staff_phone || "—"}</p>
                <p><strong>Address:</strong> {r.staff_address || "—"}</p>
                <p><strong>TFN:</strong> {r.staff_tfn ? "••• ••• " + r.staff_tfn.slice(-3) : "—"}</p>
                <p><strong>ABN:</strong> {r.staff_abn || "—"}</p>
              </div>
            </section>

            {/* Bank Transfer */}
            <section style={{ backgroundColor: "#f0f9ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "14px" }}>
              <h2 style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#1e40af", borderLeft: "4px solid #1e40af", paddingLeft: "8px", margin: "0 0 10px 0" }}>💳 Bank Transfer — Net Pay</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                <p><strong>Bank:</strong> {r.bank_name || "—"}</p>
                <p><strong>Account Name:</strong> {r.bank_account_name || "—"}</p>
                <p><strong>BSB:</strong> {r.bank_bsb || "—"}</p>
                <p><strong>Account Number:</strong> {r.bank_account_number || "—"}</p>
                <p><strong>Reference:</strong> {r.payslip_number} – {r.date_from} to {r.date_to}</p>
              </div>
              <div style={{ marginTop: "10px", borderTop: "1px solid #bfdbfe", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 900, color: "#1e40af" }}>TRANSFER AMOUNT</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#1e40af" }}>${(r.net_pay || 0).toFixed(2)}</span>
              </div>
            </section>

            {/* ATO PAYG */}
            <section style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "14px" }}>
              <h2 style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9a3412", borderLeft: "4px solid #ea580c", paddingLeft: "8px", margin: "0 0 10px 0" }}>🏛️ ATO — PAYG Withholding Remittance</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                <p><strong>Payee:</strong> Australian Taxation Office</p>
                <p><strong>Reference:</strong> Employer ABN {emp.abn}</p>
                <p><strong>Tax Withheld:</strong> ${(r.tax || 0).toFixed(2)}</p>
                <p><strong>Medicare Levy:</strong> ${(r.medicare || 0).toFixed(2)}</p>
              </div>
              <div style={{ marginTop: "10px", borderTop: "1px solid #fed7aa", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 900, color: "#9a3412" }}>TOTAL PAYG TO REMIT</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#9a3412" }}>${taxPayable}</span>
              </div>
            </section>

            {/* Super */}
            <section style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px" }}>
              <h2 style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#166534", borderLeft: "4px solid #16a34a", paddingLeft: "8px", margin: "0 0 10px 0" }}>📊 Superannuation Payment</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                <p><strong>Fund Name:</strong> {r.super_fund_name || "—"}</p>
                <p><strong>Fund ABN:</strong> {r.super_fund_abn || "—"}</p>
                <p><strong>USI:</strong> {r.super_usi || "—"}</p>
                <p><strong>Member Number:</strong> {r.super_member_number || "—"}</p>
                <p><strong>Member Name:</strong> {r.staff_name}</p>
                <p><strong>SGC Rate:</strong> 12%</p>
              </div>
              <div style={{ marginTop: "10px", borderTop: "1px solid #bbf7d0", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 900, color: "#166534" }}>SUPER CONTRIBUTION</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#166534" }}>${superPayable}</span>
              </div>
            </section>

            {/* Payment Summary */}
            <section>
              <h2 style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#1e3a5f", borderLeft: "4px solid #1e3a5f", paddingLeft: "8px", margin: "0 0 8px 0" }}>Payment Summary</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1e3a5f" }}>
                    <th style={{ textAlign: "left", padding: "7px 10px", color: "white", fontWeight: 700 }}>Item</th>
                    <th style={{ textAlign: "left", padding: "7px 10px", color: "white", fontWeight: 700 }}>Payee</th>
                    <th style={{ textAlign: "right", padding: "7px 10px", color: "white", fontWeight: 700 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <td style={{ padding: "6px 10px" }}>Gross Pay</td>
                    <td style={{ padding: "6px 10px", color: "#64748b" }}>{r.staff_name}</td>
                    <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 700 }}>${(r.gross_pay || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 10px" }}>Less: Tax &amp; Medicare</td>
                    <td style={{ padding: "6px 10px", color: "#64748b" }}>ATO (PAYG)</td>
                    <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 700, color: "#e11d48" }}>– ${taxPayable}</td>
                  </tr>
                  <tr style={{ backgroundColor: "#f8fafc", fontWeight: 900 }}>
                    <td style={{ padding: "6px 10px" }}>Net Pay (Bank Transfer)</td>
                    <td style={{ padding: "6px 10px", color: "#64748b" }}>{r.bank_account_name || r.staff_name} — {r.bank_bsb} / {r.bank_account_number}</td>
                    <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 900, color: "#1d4ed8" }}>${(r.net_pay || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 10px" }}>Super (12% SGC)</td>
                    <td style={{ padding: "6px 10px", color: "#64748b" }}>{r.super_fund_name || "Super Fund"}</td>
                    <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 700, color: "#16a34a" }}>${superPayable}</td>
                  </tr>
                  <tr style={{ backgroundColor: "#1e3a5f" }}>
                    <td colSpan={2} style={{ padding: "8px 10px", color: "white", fontWeight: 900 }}>TOTAL OUTGOING</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", color: "white", fontWeight: 900, fontSize: "14px" }}>
                      ${((r.net_pay || 0) + (r.super_amount || 0) + parseFloat(taxPayable)).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", fontSize: "9px", color: "#94a3b8" }}>
              <p>This report is generated by SZ-Jie Support Services payroll system. TFN is partially masked for security. Super must be remitted at least quarterly. PAYG withholding must be remitted per your ATO payment schedule.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── VIEW: payslip preview (print mode) ──────────────────────────────────
  if (view === "view" && activeRecord) {
    const foundStaff = staff.find(s => s.name === activeRecord.staff_name);
    return (
      <>
        <style>{PRINT_STYLES}</style>
        <div className="space-y-4 max-w-5xl">
          <div className="flex items-center justify-between print:hidden">
            <Button variant="ghost" onClick={() => setView("list")} className="gap-2">
              <ChevronLeft size={16} /> Back to History
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setView("banking"); }} className="gap-2">
                <Banknote size={14} /> Banking Report
              </Button>
              <Button variant="outline" onClick={() => { loadIntoForm(activeRecord); setView("new"); }} className="gap-2">
                <Pencil size={14} /> Edit
              </Button>
              <Button variant="outline" onClick={() => handleDelete(activeRecord.id)} className="gap-2 text-destructive hover:text-destructive">
                <Trash2 size={14} /> Delete
              </Button>
              <Button onClick={() => window.print()} className="gap-2">
                <Printer size={14} /> Print / Save PDF
              </Button>
            </div>
          </div>
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <PayslipPreview record={activeRecord} staffMember={foundStaff} />
          </div>
        </div>
      </>
    );
  }

  // ── VIEW: new / edit form ────────────────────────────────────────────────
  if (view === "new") {
    const isEditing = !!activeRecord;
    return (
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center gap-3 print:hidden">
          <Button variant="ghost" onClick={() => setView("list")} className="gap-2">
            <ChevronLeft size={16} /> Back
          </Button>
          <h2 className="font-black text-lg">{isEditing ? "Edit Payslip" : "New Payslip"}</h2>
        </div>

        {/* Details */}
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-black text-base">Payslip Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Payslip #</Label>
              <Input value={payslipNo} onChange={e => setPayslipNo(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Staff Member</Label>
              <Select value={staffName} onValueChange={v => {
                setStaffName(v);
                setSelectedStaff(staff.find(s => s.name === v) || null);
              }}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Pay Period</Label>
              <Select value={payPeriod} onValueChange={setPayPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Period From</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Period To</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
            <h3 className="font-black">Shift Line Items</h3>
            <Button size="sm" onClick={() => setLines(prev => [...prev, EMPTY_LINE()])} className="rounded-xl gap-2 font-bold">
              <Plus size={14} /> Add Shift
            </Button>
          </div>
          <div className="p-4 space-y-3">
            <div className="hidden md:grid grid-cols-[110px_100px_200px_1fr_90px_70px_90px_36px] gap-2 px-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <span>Date</span><span>Time</span><span>Item Code</span><span>Description</span>
              <span className="text-right">Unit Price</span><span className="text-right">Qty</span>
              <span className="text-right">Total</span><span></span>
            </div>
            {lines.map(l => (
              <div key={l.id} className="grid grid-cols-1 md:grid-cols-[110px_100px_200px_1fr_90px_70px_90px_36px] gap-2 items-center bg-secondary/20 rounded-xl p-2">
                <Input type="date" value={l.date} onChange={e => updateLine(l.id, "date", e.target.value)} className="text-xs h-8" />
                <Input placeholder="10:45am" value={l.time} onChange={e => updateLine(l.id, "time", e.target.value)} className="text-xs h-8" />
                <Select value={l.item_code} onValueChange={v => updateLine(l.id, "item_code", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NDIS_ITEMS.map(i => <SelectItem key={i.code} value={i.code}><span className="font-mono text-xs">{i.code}</span></SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={l.description} onChange={e => updateLine(l.id, "description", e.target.value)} className="text-xs h-8" />
                <Input type="number" step="0.01" value={l.unit_price} onChange={e => updateLine(l.id, "unit_price", parseFloat(e.target.value) || 0)} className="text-xs h-8 text-right" />
                <Input type="number" step="0.5" min="0" value={l.qty} onChange={e => updateLine(l.id, "qty", parseFloat(e.target.value) || 0)} className="text-xs h-8 text-right" />
                <div className="text-right text-sm font-black pr-1">${lineTotal(l).toFixed(2)}</div>
                <button onClick={() => setLines(prev => prev.filter(x => x.id !== l.id))} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="flex justify-end gap-8 px-3 pt-3 border-t border-border text-sm">
              <span className="font-black text-muted-foreground uppercase tracking-widest text-xs">Gross Total</span>
              <span className="font-black text-lg">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Button onClick={() => handleSave(isEditing ? activeRecord.id : null)} disabled={!staffName || saving} className="rounded-xl font-bold gap-2 px-8">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
          {isEditing ? "Save Changes & Preview" : "Save & Preview Payslip"}
        </Button>
      </div>
    );
  }

  // ── VIEW: history list ───────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-xl">Payslips</h2>
        <Button onClick={startNew} className="gap-2 rounded-xl font-bold">
          <Plus size={15} /> New Payslip
        </Button>
      </div>

      {records.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-16 text-center text-muted-foreground">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-bold">No payslips yet</p>
          <p className="text-sm">Click "New Payslip" to create your first one.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-secondary/30">
            <h3 className="font-black">Payslip History</h3>
          </div>
          <div className="divide-y divide-border">
            {records.map(r => (
              <div key={r.id} className="flex items-center justify-between px-6 py-3 hover:bg-secondary/20 text-sm">
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => { setActiveRecord(r); setView("view"); }}>
                  <FileText size={16} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-bold">{r.staff_name} <span className="text-muted-foreground font-normal">#{r.payslip_number}</span></p>
                    <p className="text-xs text-muted-foreground">{r.date_from} → {r.date_to} · {r.employer_name} · {r.pay_period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-green-700">${r.net_pay?.toFixed(2)} net</p>
                    <p className="text-xs text-muted-foreground">Gross ${r.gross_pay?.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setActiveRecord(r); setView("view"); }} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground" title="View / Print">
                      <Printer size={14} />
                    </button>
                    <button onClick={() => { loadIntoForm(r); setActiveRecord(r); setView("new"); }} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}