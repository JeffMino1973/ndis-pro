import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Plus, Trash2, Loader2, FileText, Pencil, ChevronLeft, Banknote, Search, Info } from "lucide-react";
import { format } from "date-fns";
import PayslipPreview, { getEmployer } from "@/components/payslips/PayslipPreview";
import { calcPayPeriodDeductions, TAX_STATUS_LABELS } from "@/utils/taxCalc";

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



// Remove old local tax functions — now using utils/taxCalc.js

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



export default function Payslips() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [saving, setSaving] = useState(false);

  // view: "list" | "new" | "view"
  const [view, setView] = useState("list");
  const [activeRecord, setActiveRecord] = useState(null); // record being viewed/edited
  const [search, setSearch] = useState("");

  // Form state (for new or edit)
  const [staffName, setStaffName] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [payPeriod, setPayPeriod] = useState("fortnightly");
  const [dateFrom, setDateFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [lines, setLines] = useState([EMPTY_LINE()]);
  const [payslipNo, setPayslipNo] = useState("PS-" + String(Date.now()).slice(-6));
  const [taxStatus, setTaxStatus] = useState("resident_with_threshold");
  const [medicareExemption, setMedicareExemption] = useState(false);

  useEffect(() => {
    base44.entities.StaffMember.list().then(s => { setStaff(s); setLoading(false); });
    base44.entities.PayslipRecord.list("-created_date", 100).then(setRecords);
  }, []);

  const lineTotal = (l) => parseFloat(l.unit_price || 0) * parseFloat(l.qty || 0);
  const subtotal = lines.reduce((a, l) => a + lineTotal(l), 0);
  const { tax, medicare, super: superAmt, net: netPay } = calcPayPeriodDeductions(subtotal, payPeriod, taxStatus, medicareExemption);

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
    setTaxStatus(found?.tax_status || r.tax_status || "resident_with_threshold");
    setMedicareExemption(found?.medicare_exemption || r.medicare_exemption || false);
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
      tax_status: taxStatus,
      medicare_exemption: medicareExemption,
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
    setTaxStatus("resident_with_threshold");
    setMedicareExemption(false);
    setActiveRecord(null);
    setView("new");
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
    </div>
  );

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
              <Button variant="outline" onClick={() => printBankingWindow(activeRecord)} className="gap-2">
                <Banknote size={14} /> Banking Report
              </Button>
              <Button variant="outline" onClick={() => { loadIntoForm(activeRecord); setView("new"); }} className="gap-2">
                <Pencil size={14} /> Edit
              </Button>
              <Button variant="outline" onClick={() => handleDelete(activeRecord.id)} className="gap-2 text-destructive hover:text-destructive">
                <Trash2 size={14} /> Delete
              </Button>
              <Button onClick={() => printLandscape(activeRecord)} className="gap-2">
                <Printer size={14} /> Print Landscape PDF
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
                const found = staff.find(s => s.name === v) || null;
                setSelectedStaff(found);
                if (found?.tax_status) setTaxStatus(found.tax_status);
                if (found?.medicare_exemption !== undefined) setMedicareExemption(found.medicare_exemption);
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

          {/* Tax Declaration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Tax Declaration Status</Label>
              <Select value={taxStatus} onValueChange={setTaxStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TAX_STATUS_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Info size={10} /> Auto-filled from staff profile. ATO 2025–26 rates.
              </p>
            </div>
            <div className="flex items-start gap-3 pt-5">
              <input
                type="checkbox"
                id="medicareExemption"
                checked={medicareExemption}
                onChange={e => setMedicareExemption(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded"
              />
              <div>
                <label htmlFor="medicareExemption" className="text-sm font-semibold cursor-pointer">Medicare Levy Exemption</label>
                <p className="text-[10px] text-muted-foreground">Tick if employee holds a Medicare Exemption Certificate</p>
              </div>
            </div>
          </div>

          {/* Live deduction preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-secondary/40 rounded-xl text-center">
            {[
              { label: "Gross", value: subtotal, color: "text-foreground" },
              { label: "Tax (PAYG)", value: tax, color: "text-rose-600" },
              { label: "Medicare", value: medicare, color: "text-orange-600" },
              { label: "Net Pay", value: netPay, color: "text-emerald-600" },
            ].map(s => (
              <div key={s.label}>
                <p className={`text-base font-black ${s.color}`}>${s.value.toFixed(2)}</p>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
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

  // ── helpers: open payslip / banking in new window ───────────────────────
  const printLandscape = (r) => {
    const foundStaff = staff.find(s => s.name === r.staff_name);
    const emp = getEmployer(r.date_from);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <style>
        @media print { @page { size: A4 landscape; margin: 10mm; } .no-print { display: none !important; } }
        body { font-family: Arial, sans-serif; color: #1e293b; padding: 24px; font-size: 11px; }
        h1 { color: #1e3a5f; font-size: 18px; border-bottom: 3px solid #1e3a5f; padding-bottom: 6px; margin-bottom: 4px; }
        h2 { color: #1e3a5f; font-size: 10px; margin: 14px 0 6px; text-transform: uppercase; letter-spacing: .06em; border-left: 4px solid #1e3a5f; padding-left: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th { background: #1e3a5f; color: white; padding: 5px 8px; font-size: 10px; text-align: left; }
        td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        tr:nth-child(even) td { background: #f8fafc; }
        .total-row td { font-weight: 900; background: #dbeafe !important; color: #1e3a5f; }
        .meta { font-size: 10px; color: #475569; margin-bottom: 10px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 40px; font-size: 10px; }
        .summary { display: flex; gap: 24px; background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px 14px; margin: 10px 0; }
        .summary-item { text-align: center; }
        .summary-item .val { font-weight: 900; font-size: 14px; color: #1e3a5f; }
        .summary-item .lbl { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: .04em; }
        .print-btn { position: fixed; top: 12px; right: 16px; padding: 7px 14px; background: #1e3a5f; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 11px; }
        .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; }
      </style>
    </head><body>
      <button class="print-btn no-print" onclick="window.print()">🖨 Print / Save PDF</button>
      <h1>Payslip — ${r.payslip_number || ""}</h1>
      <p class="meta">
        <strong>${r.staff_name}</strong> &nbsp;·&nbsp; Period: ${r.date_from} → ${r.date_to}
        &nbsp;·&nbsp; Pay: ${r.pay_period || "Fortnightly"} &nbsp;·&nbsp; Employer: ${emp.name}
        &nbsp;·&nbsp; Generated: ${format(new Date(), "dd/MM/yyyy")}
      </p>
      <div class="summary">
        <div class="summary-item"><div class="val">$${(r.gross_pay || 0).toFixed(2)}</div><div class="lbl">Gross Pay</div></div>
        <div class="summary-item"><div class="val" style="color:#e11d48">-$${(r.tax || 0).toFixed(2)}</div><div class="lbl">Tax Withheld</div></div>
        <div class="summary-item"><div class="val" style="color:#ea580c">-$${(r.medicare || 0).toFixed(2)}</div><div class="lbl">Medicare</div></div>
        <div class="summary-item"><div class="val" style="color:#16a34a">$${(r.net_pay || 0).toFixed(2)}</div><div class="lbl">Net Pay</div></div>
        <div class="summary-item"><div class="val" style="color:#2563eb">$${(r.super_amount || 0).toFixed(2)}</div><div class="lbl">Super (12%)</div></div>
      </div>
      <h2>Shift Line Items</h2>
      <table><thead><tr><th>Date</th><th>Time</th><th>Item Code</th><th>Description</th><th style="text-align:right">Rate</th><th style="text-align:right">Hrs</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>
        ${(r.line_items || []).map(l => `<tr><td>${l.date || ""}</td><td>${l.time || ""}</td><td style="font-family:monospace">${l.item_code || ""}</td><td>${l.description || ""}</td><td style="text-align:right">$${(l.unit_price || 0).toFixed(2)}</td><td style="text-align:right">${l.qty || ""}</td><td style="text-align:right;font-weight:700">$${(l.total || l.unit_price * l.qty || 0).toFixed(2)}</td></tr>`).join("")}
        <tr class="total-row"><td colspan="6">GROSS PAY</td><td style="text-align:right">$${(r.gross_pay || 0).toFixed(2)}</td></tr>
      </tbody></table>
      <div class="grid2">
        <div>
          <h2>Staff Details</h2>
          <p><strong>Name:</strong> ${r.staff_name || "—"}</p>
          <p><strong>Email:</strong> ${r.staff_email || "—"}</p>
          <p><strong>Phone:</strong> ${r.staff_phone || "—"}</p>
          <p><strong>Address:</strong> ${r.staff_address || "—"}</p>
          <p><strong>TFN:</strong> ${r.staff_tfn ? "••• ••• " + String(r.staff_tfn).slice(-3) : "—"}</p>
          <p><strong>ABN:</strong> ${r.staff_abn || "—"}</p>
        </div>
        <div>
          <h2>Banking &amp; Super</h2>
          <p><strong>Bank:</strong> ${r.bank_name || "—"}</p>
          <p><strong>BSB:</strong> ${r.bank_bsb || "—"}</p>
          <p><strong>Account:</strong> ${r.bank_account_number || "—"} (${r.bank_account_name || "—"})</p>
          <p><strong>Super Fund:</strong> ${r.super_fund_name || "—"}</p>
          <p><strong>Fund ABN:</strong> ${r.super_fund_abn || "—"}</p>
          <p><strong>USI:</strong> ${r.super_usi || "—"} &nbsp; <strong>Member:</strong> ${r.super_member_number || "—"}</p>
        </div>
      </div>
      <div class="footer">SZ-Jie Support Services · NDIS Provider · ${emp.name} · ABN ${emp.abn}</div>
    </body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  const printBankingWindow = (r) => {
    const emp = getEmployer(r.date_from);
    const taxPayable = ((r.tax || 0) + (r.medicare || 0)).toFixed(2);
    const taxStatusLabel = TAX_STATUS_LABELS[r.tax_status] || "Australian Resident — Tax-Free Threshold Claimed";
    const superPayable = (r.super_amount || 0).toFixed(2);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <style>
        @media print { @page { size: A4 portrait; margin: 14mm; } .no-print { display: none !important; } }
        body { font-family: Arial, sans-serif; color: #1e293b; max-width: 760px; margin: 0 auto; padding: 28px; font-size: 11px; }
        h1 { color: #1e3a5f; font-size: 19px; border-bottom: 3px solid #1e3a5f; padding-bottom: 6px; margin-bottom: 4px; }
        h2 { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .07em; color: inherit; border-left: 4px solid currentColor; padding-left: 7px; margin: 0 0 8px 0; }
        .meta { font-size: 10px; color: #475569; margin-bottom: 12px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 40px; font-size: 10px; margin-bottom: 8px; }
        .box { border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; }
        .box-blue { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a5f; }
        .box-orange { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }
        .box-green { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
        .box-amount { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); }
        .amount-val { font-size: 20px; font-weight: 900; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e3a5f; color: white; padding: 6px 9px; text-align: left; font-size: 10px; }
        td { padding: 6px 9px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        .total-row { background: #1e3a5f; color: white; font-weight: 900; }
        .print-btn { position: fixed; top: 12px; right: 16px; padding: 7px 14px; background: #1e3a5f; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }
        .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; }
      </style>
    </head><body>
      <button class="print-btn no-print" onclick="window.print()">🖨 Print / Save PDF</button>
      <h1>Payroll Banking Report</h1>
      <p class="meta">Payslip #${r.payslip_number || "—"} &nbsp;·&nbsp; ${r.date_from} → ${r.date_to} &nbsp;·&nbsp; Generated: ${format(new Date(), "dd/MM/yyyy")}</p>

      <div style="margin-bottom:12px;">
        <h2 style="color:#1e3a5f;">Employer Details</h2>
        <div class="grid2">
          <p><strong>Business Name:</strong> ${emp.name}</p>
          <p><strong>ABN:</strong> ${emp.abn}</p>
          <p><strong>Address:</strong> ${emp.address}</p>
          <p><strong>Phone / Email:</strong> ${emp.phone} / ${emp.email}</p>
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <h2 style="color:#1e3a5f;">Staff Member Details</h2>
        <div class="grid2">
          <p><strong>Full Name:</strong> ${r.staff_name || "—"}</p>
          <p><strong>Email:</strong> ${r.staff_email || "—"}</p>
          <p><strong>Phone:</strong> ${r.staff_phone || "—"}</p>
          <p><strong>Address:</strong> ${r.staff_address || "—"}</p>
          <p><strong>TFN:</strong> ${r.staff_tfn ? "••• ••• " + String(r.staff_tfn).slice(-3) : "—"}</p>
          <p><strong>ABN:</strong> ${r.staff_abn || "—"}</p>
          <p><strong>Tax Declaration:</strong> ${taxStatusLabel}</p>
          ${r.medicare_exemption ? "<p><strong>Medicare:</strong> Levy Exemption Applied</p>" : ""}
        </div>
      </div>

      <div class="box box-blue">
        <h2 style="color:#1e40af;">💳 Bank Transfer — Net Pay</h2>
        <div class="grid2">
          <p><strong>Bank:</strong> ${r.bank_name || "—"}</p>
          <p><strong>Account Name:</strong> ${r.bank_account_name || "—"}</p>
          <p><strong>BSB:</strong> ${r.bank_bsb || "—"}</p>
          <p><strong>Account Number:</strong> ${r.bank_account_number || "—"}</p>
          <p><strong>Reference:</strong> ${r.payslip_number} – ${r.date_from} to ${r.date_to}</p>
        </div>
        <div class="box-amount"><span style="font-weight:900;color:#1e40af;">TRANSFER AMOUNT</span><span class="amount-val" style="color:#1e40af;">$${(r.net_pay || 0).toFixed(2)}</span></div>
      </div>

      <div class="box box-orange">
        <h2 style="color:#9a3412;">🏛️ ATO — PAYG Withholding</h2>
        <div class="grid2">
          <p><strong>Payee:</strong> Australian Taxation Office</p>
          <p><strong>Reference:</strong> Employer ABN ${emp.abn}</p>
          <p><strong>Tax Withheld:</strong> $${(r.tax || 0).toFixed(2)}</p>
          <p><strong>Medicare Levy:</strong> $${(r.medicare || 0).toFixed(2)}</p>
        </div>
        <div class="box-amount"><span style="font-weight:900;color:#9a3412;">TOTAL PAYG TO REMIT</span><span class="amount-val" style="color:#9a3412;">$${taxPayable}</span></div>
      </div>

      <div class="box box-green">
        <h2 style="color:#166534;">📊 Superannuation Contribution (SGC 12%)</h2>
        <div class="grid2">
          <p><strong>Fund Name:</strong> ${r.super_fund_name || "—"}</p>
          <p><strong>Fund ABN:</strong> ${r.super_fund_abn || "—"}</p>
          <p><strong>USI:</strong> ${r.super_usi || "—"}</p>
          <p><strong>Member Number:</strong> ${r.super_member_number || "—"}</p>
          <p><strong>Member Name:</strong> ${r.staff_name || "—"}</p>
          <p><strong>SGC Rate:</strong> 12% of Gross</p>
        </div>
        <div class="box-amount"><span style="font-weight:900;color:#166534;">SUPER CONTRIBUTION</span><span class="amount-val" style="color:#166534;">$${superPayable}</span></div>
      </div>

      <h2 style="color:#1e3a5f;margin-top:4px;">Payment Summary</h2>
      <table>
        <thead><tr><th>Item</th><th>Payee / Account</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          <tr><td>Gross Pay</td><td>${r.staff_name}</td><td style="text-align:right;font-weight:700">$${(r.gross_pay || 0).toFixed(2)}</td></tr>
          <tr><td>Less: Tax &amp; Medicare</td><td>ATO (PAYG)</td><td style="text-align:right;font-weight:700;color:#e11d48">– $${taxPayable}</td></tr>
          <tr><td style="font-weight:900">Net Pay (Bank Transfer)</td><td>${r.bank_account_name || r.staff_name} — ${r.bank_bsb} / ${r.bank_account_number}</td><td style="text-align:right;font-weight:900;color:#1d4ed8">$${(r.net_pay || 0).toFixed(2)}</td></tr>
          <tr><td>Super (12% SGC)</td><td>${r.super_fund_name || "Super Fund"}</td><td style="text-align:right;font-weight:700;color:#16a34a">$${superPayable}</td></tr>
          <tr class="total-row"><td colspan="2">TOTAL OUTGOING</td><td style="text-align:right;font-size:13px">$${((r.net_pay || 0) + (r.super_amount || 0) + parseFloat(taxPayable)).toFixed(2)}</td></tr>
        </tbody>
      </table>
      <div class="footer">SZ-Jie Support Services · TFN partially masked for security. Super must be remitted quarterly. PAYG per ATO schedule.</div>
    </body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  // ── VIEW: history list ───────────────────────────────────────────────────
  const filtered = records.filter(r =>
    !search || r.staff_name?.toLowerCase().includes(search.toLowerCase()) || r.payslip_number?.toLowerCase().includes(search.toLowerCase())
  );

  const totalGross = filtered.reduce((a, r) => a + (r.gross_pay || 0), 0);
  const totalNet = filtered.reduce((a, r) => a + (r.net_pay || 0), 0);
  const totalSuper = filtered.reduce((a, r) => a + (r.super_amount || 0), 0);
  const totalTax = filtered.reduce((a, r) => a + (r.tax || 0) + (r.medicare || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Payslip Management</h2>
          <p className="text-muted-foreground text-sm">{records.length} payslip{records.length !== 1 ? "s" : ""} on record</p>
        </div>
        <Button onClick={startNew} className="gap-2 rounded-xl font-bold">
          <Plus size={15} /> New Payslip
        </Button>
      </div>

      {/* Summary stats */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Gross", value: `$${totalGross.toFixed(2)}`, color: "text-foreground" },
            { label: "Tax + Medicare", value: `$${totalTax.toFixed(2)}`, color: "text-rose-600" },
            { label: "Net Paid", value: `$${totalNet.toFixed(2)}`, color: "text-emerald-600" },
            { label: "Super (SGC)", value: `$${totalSuper.toFixed(2)}`, color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {records.length > 0 && (
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by staff or payslip #..." className="pl-9" />
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-16 text-center text-muted-foreground">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-bold">No payslips yet</p>
          <p className="text-sm">Click "New Payslip" to create your first one.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="px-6 py-3 border-b border-border bg-secondary/30 grid grid-cols-[1fr_120px_90px_90px_90px_90px_auto] gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest items-center">
            <span>Staff / Period</span>
            <span>Payslip #</span>
            <span className="text-right">Gross</span>
            <span className="text-right">Tax+Medi</span>
            <span className="text-right">Net Pay</span>
            <span className="text-right">Super</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.length === 0 && (
              <p className="px-6 py-8 text-sm text-muted-foreground italic text-center">No payslips match your search.</p>
            )}
            {filtered.map(r => (
              <div key={r.id} className="grid grid-cols-[1fr_120px_90px_90px_90px_90px_auto] gap-3 px-6 py-3 hover:bg-secondary/20 items-center text-sm">
                <div className="cursor-pointer" onClick={() => { setActiveRecord(r); setView("view"); }}>
                  <p className="font-bold truncate">{r.staff_name}</p>
                  <p className="text-xs text-muted-foreground">{r.date_from} → {r.date_to} · {r.pay_period}</p>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{r.payslip_number}</span>
                <span className="text-right font-bold">${(r.gross_pay || 0).toFixed(2)}</span>
                <span className="text-right text-rose-600 text-xs">${((r.tax || 0) + (r.medicare || 0)).toFixed(2)}</span>
                <span className="text-right font-black text-emerald-600">${(r.net_pay || 0).toFixed(2)}</span>
                <span className="text-right text-blue-600 text-xs">${(r.super_amount || 0).toFixed(2)}</span>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => printLandscape(r)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground" title="Print landscape PDF">
                    <Printer size={14} />
                  </button>
                  <button onClick={() => printBankingWindow(r)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground" title="Banking report">
                    <Banknote size={14} />
                  </button>
                  <button onClick={() => { loadIntoForm(r); setActiveRecord(r); setView("new"); }} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground" title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Totals footer */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-[1fr_120px_90px_90px_90px_90px_auto] gap-3 px-6 py-3 bg-secondary/50 border-t border-border text-[10px] font-black uppercase tracking-widest">
              <span className="text-muted-foreground">Totals ({filtered.length})</span>
              <span />
              <span className="text-right">${totalGross.toFixed(2)}</span>
              <span className="text-right text-rose-600">${totalTax.toFixed(2)}</span>
              <span className="text-right text-emerald-600">${totalNet.toFixed(2)}</span>
              <span className="text-right text-blue-600">${totalSuper.toFixed(2)}</span>
              <span />
            </div>
          )}
        </div>
      )}
    </div>
  );
}