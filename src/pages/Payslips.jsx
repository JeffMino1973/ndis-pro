import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Plus, Trash2, Loader2, FileText, Banknote } from "lucide-react";
import { format, parseISO } from "date-fns";

// ── NDIS Item codes with day-type rates ──────────────────────────────────────
const NDIS_ITEMS = [
  { code: "04_104_0125_6_1", description: "Access Community Social and Rec Activ – Weekday", rate: 70.23 },
  { code: "04_105_0125_6_1", description: "Access Community Social and Rec Activ – Saturday", rate: 98.83 },
  { code: "04_106_0125_6_1", description: "Access Community Social and Rec Activ – Sunday",   rate: 127.43 },
];

// ── ATO 2025-26 tax ──────────────────────────────────────────────────────────
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
function periodTax(gross, periodsPerYear) {
  const ann = gross * periodsPerYear;
  const tax = Math.max(0, calcAnnualTax(ann) - Math.max(0, calcLITO(ann)));
  const med = ann * 0.02;
  return { tax: tax / periodsPerYear, medicare: med / periodsPerYear };
}

const PERIODS = { weekly: 52, fortnightly: 26, monthly: 12 };

const EMPTY_LINE = () => ({
  id: crypto.randomUUID(),
  date: "",
  time: "",
  item_code: "04_104_0125_6_1",
  description: "Access Community Social and Rec Activ – Weekday",
  unit_price: 70.23,
  qty: 1,
});

const LOGO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/641f2cf35_3cb3f155-51c2-49f0-993b-fc2df2583281.jpg";

export default function Payslips() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [staffName, setStaffName] = useState("");
  const [payPeriod, setPayPeriod] = useState("fortnightly");
  const [dateFrom, setDateFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [lines, setLines] = useState([EMPTY_LINE()]);
  const [payslipNo, setPayslipNo] = useState("PS-" + String(Date.now()).slice(-6));

  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    base44.entities.StaffMember.list().then(s => { setStaff(s); setLoading(false); });
  }, []);

  // ── Line editing helpers ──────────────────────────────────────────────────
  const updateLine = (id, field, value) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      // Auto-fill description + rate when item code changes
      if (field === "item_code") {
        const item = NDIS_ITEMS.find(i => i.code === value);
        if (item) { updated.description = item.description; updated.unit_price = item.rate; }
      }
      return updated;
    }));
  };

  const addLine = () => setLines(prev => [...prev, EMPTY_LINE()]);
  const removeLine = (id) => setLines(prev => prev.filter(l => l.id !== id));

  // ── Calculations ─────────────────────────────────────────────────────────
  const lineTotal = (l) => parseFloat(l.unit_price || 0) * parseFloat(l.qty || 0);
  const subtotal = lines.reduce((a, l) => a + lineTotal(l), 0);
  const { tax, medicare } = periodTax(subtotal, PERIODS[payPeriod]);
  const superAmt = subtotal * 0.12;
  const totalDeductions = tax + medicare;
  const netPay = Math.max(0, subtotal - totalDeductions);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Payslip Generator</h2>
        <p className="text-muted-foreground text-sm">Enter shifts manually using NDIS item codes. Tax, super &amp; Medicare calculated automatically.</p>
      </div>

      {/* ── Settings ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4 print:hidden">
        <h3 className="font-black text-base">Payslip Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Payslip #</Label>
            <Input value={payslipNo} onChange={e => setPayslipNo(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Staff Member</Label>
            <Select value={staffName} onValueChange={setStaffName}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                <SelectItem value="Sz-Jie (Toby)">Sz-Jie (Toby)</SelectItem>
                <SelectItem value="Jeffrey Minton">Jeffrey Minton</SelectItem>
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
        <Button onClick={() => setGenerated(true)} disabled={!staffName} className="rounded-xl font-bold gap-2 px-8">
          <FileText size={15} /> Preview Payslip
        </Button>
      </div>

      {/* ── Line Items Entry ─────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden print:hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <h3 className="font-black">Shift Line Items</h3>
          <Button size="sm" onClick={addLine} className="rounded-xl gap-2 font-bold"><Plus size={14} /> Add Shift</Button>
        </div>
        <div className="p-4 space-y-3">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[110px_100px_200px_1fr_90px_70px_90px_36px] gap-2 px-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <span>Date</span><span>Time</span><span>Item Code</span><span>Description</span>
            <span className="text-right">Unit Price</span><span className="text-right">Qty (hrs)</span>
            <span className="text-right">Total</span><span></span>
          </div>

          {lines.map((l) => (
            <div key={l.id} className="grid grid-cols-1 md:grid-cols-[110px_100px_200px_1fr_90px_70px_90px_36px] gap-2 items-center bg-secondary/20 rounded-xl p-2">
              <Input
                type="date"
                value={l.date}
                onChange={e => updateLine(l.id, "date", e.target.value)}
                className="text-xs h-8"
              />
              <Input
                placeholder="10:45am"
                value={l.time}
                onChange={e => updateLine(l.id, "time", e.target.value)}
                className="text-xs h-8"
              />
              <Select value={l.item_code} onValueChange={v => updateLine(l.id, "item_code", v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NDIS_ITEMS.map(i => (
                    <SelectItem key={i.code} value={i.code}>
                      <span className="font-mono text-xs">{i.code}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={l.description}
                onChange={e => updateLine(l.id, "description", e.target.value)}
                className="text-xs h-8"
              />
              <Input
                type="number"
                step="0.01"
                value={l.unit_price}
                onChange={e => updateLine(l.id, "unit_price", parseFloat(e.target.value) || 0)}
                className="text-xs h-8 text-right"
              />
              <Input
                type="number"
                step="0.5"
                min="0"
                value={l.qty}
                onChange={e => updateLine(l.id, "qty", parseFloat(e.target.value) || 0)}
                className="text-xs h-8 text-right"
              />
              <div className="text-right text-sm font-black text-foreground pr-1">
                ${lineTotal(l).toFixed(2)}
              </div>
              <button onClick={() => removeLine(l.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Subtotal row */}
          <div className="flex justify-end gap-8 px-3 pt-3 border-t border-border text-sm">
            <span className="font-black text-muted-foreground uppercase tracking-widest text-xs">Gross Total</span>
            <span className="font-black text-lg">${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── PAYSLIP PREVIEW ─────────────────────────────────────────────── */}
      {generated && (
        <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30 print:hidden">
            <h3 className="font-black">Payslip Preview</h3>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 rounded-xl">
              <Printer size={14} /> Print / Save PDF
            </Button>
          </div>

          <div className="p-10 space-y-8 text-sm font-inter" style={{ fontFamily: "Arial, sans-serif" }}>

            {/* ── TOP HEADER (matches invoice style) ── */}
            <div className="flex justify-between items-start gap-6">
              <div>
                <img src={LOGO} alt="SZ-Jie" className="h-16 mb-3 object-contain" />
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p className="font-bold text-slate-800">SZ-Jie Support Services</p>
                  <p>ABN: 86 959 042 971</p>
                  <p>309/12 Broome St, Waterloo NSW 2017</p>
                  <p>jeff@szjiesupportservices@gmail.com</p>
                  <p>0401 343 876</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">PAYSLIP</h1>
                <div className="mt-3 space-y-1 text-sm">
                  <p><span className="font-bold text-slate-800">Payslip #</span> <span className="text-slate-600">{payslipNo}</span></p>
                  <p><span className="font-bold text-slate-800">Employee:</span> <span className="text-slate-600">{staffName}</span></p>
                  <p><span className="font-bold text-slate-800">Period:</span> <span className="text-slate-600 capitalize">{payPeriod}</span></p>
                  <p><span className="font-bold text-slate-800">From:</span> <span className="text-slate-600">{dateFrom ? format(parseISO(dateFrom), "dd/MM/yyyy") : "—"}</span></p>
                  <p><span className="font-bold text-slate-800">To:</span> <span className="text-slate-600">{dateTo ? format(parseISO(dateTo), "dd/MM/yyyy") : "—"}</span></p>
                </div>
              </div>
            </div>

            {/* ── SHIFT LINE ITEMS TABLE ── */}
            <div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#1e3a5f" }}>
                    {["Date", "Time", "Item Number", "Description", "Unit Price", "Qty", "Line Total"].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-white font-bold text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={l.id} style={{ backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff" }}>
                      <td className="px-3 py-2.5 text-slate-600">{l.date ? format(parseISO(l.date), "dd/MM/yy") : "—"}</td>
                      <td className="px-3 py-2.5 text-slate-600">{l.time || "—"}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-700">{l.item_code}</td>
                      <td className="px-3 py-2.5 text-slate-700">{l.description}</td>
                      <td className="px-3 py-2.5 text-right font-medium">${parseFloat(l.unit_price || 0).toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-right">{l.qty}</td>
                      <td className="px-3 py-2.5 text-right font-bold">${lineTotal(l).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotal / GST / Gross */}
              <div className="flex justify-end mt-1">
                <div className="w-64 border border-slate-200 rounded-b-xl overflow-hidden text-sm">
                  {[
                    { label: "Subtotal", value: subtotal, normal: true },
                    { label: "GST", value: 0, normal: true },
                    { label: "Gross Pay", value: subtotal, bold: true },
                  ].map(r => (
                    <div key={r.label} className={`flex justify-between px-4 py-2 ${r.bold ? "bg-slate-100 font-black" : "border-b border-slate-100"}`}>
                      <span className="text-slate-600">{r.label}</span>
                      <span className={r.bold ? "text-slate-900" : "text-slate-700"}>${r.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── TAX / SUPER / NET PAY ── */}
            <div className="grid grid-cols-2 gap-6">
              {/* Deductions */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-200" style={{ backgroundColor: "#f0f9ff" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Deductions (ATO 2025–26)</p>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { label: "Income Tax Withheld", value: tax, color: "text-rose-600" },
                    { label: "Medicare Levy (2%)", value: medicare, color: "text-rose-600" },
                    { label: "Total Deductions", value: totalDeductions, color: "text-rose-700", bold: true },
                  ].map(r => (
                    <div key={r.label} className={`flex justify-between text-sm ${r.bold ? "border-t border-slate-200 pt-2 font-black" : ""}`}>
                      <span className="text-slate-500">{r.label}</span>
                      <span className={`font-bold ${r.color}`}>– ${r.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Super */}
              <div className="border border-blue-200 rounded-2xl overflow-hidden" style={{ backgroundColor: "#eff6ff" }}>
                <div className="px-4 py-2 border-b border-blue-200 bg-blue-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Superannuation (12% SGC)</p>
                </div>
                <div className="p-4 flex flex-col justify-center h-full space-y-1">
                  <p className="text-2xl font-black text-blue-800">${superAmt.toFixed(2)}</p>
                  <p className="text-xs text-blue-500">Employer contribution — paid separately to super fund</p>
                  <p className="text-xs text-blue-400 mt-1">Based on gross pay of ${subtotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* ── NET PAY BANNER ── */}
            <div className="rounded-2xl p-6 flex items-center justify-between" style={{ backgroundColor: "#1e3a5f" }}>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-1">Net Pay (Take Home)</p>
                <p className="text-4xl font-black text-white">${netPay.toFixed(2)}</p>
              </div>
              <div className="text-right text-sm text-blue-200 space-y-1">
                <p>Gross: <span className="text-white font-bold">${subtotal.toFixed(2)}</span></p>
                <p>Tax: <span className="text-white font-bold">– ${tax.toFixed(2)}</span></p>
                <p>Medicare: <span className="text-white font-bold">– ${medicare.toFixed(2)}</span></p>
                <p>Super (sep): <span className="text-white font-bold">${superAmt.toFixed(2)}</span></p>
              </div>
            </div>

            {/* ── PAYMENT DETAILS ── */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Payment Details</p>
              <div className="text-sm text-slate-700 space-y-1">
                <p><span className="font-bold">Bank:</span> NAB</p>
                <p><span className="font-bold">Account Name:</span> SZ-JIE WANG JEFFREY KENNETH MINTON</p>
                <p><span className="font-bold">BSB:</span> 083-054</p>
                <p><span className="font-bold">Account:</span> 42-731-9774</p>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="border-t border-slate-200 pt-4 text-xs text-slate-400">
              <p>Tax calculated on ATO 2025–26 resident rates with LITO. Superannuation 12% per SGC. This payslip is computer-generated by SZ-Jie Support Services management system.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}