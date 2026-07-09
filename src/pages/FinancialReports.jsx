import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { Printer, RefreshCw, TrendingUp, DollarSign, FileText, Users, Calendar, ChevronDown, ChevronUp, AlertTriangle, Receipt, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NDIS_ITEMS, NDIS_ITEMS_BY_CODE } from "@/utils/ndisItems";
import { calcPayPeriodDeductions, TAX_STATUS_LABELS } from "@/utils/taxCalc";
import FinanceNav from "@/components/FinanceNav";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, Math.round(((eh * 60 + em - sh * 60 - sm) / 60) * 100) / 100);
}

function fmt(n) { return `$${(n || 0).toFixed(2)}`; }

// Resolves the hourly rate: uses shift's stored rate first, falls back to NDIS catalogue
function resolveRate(shift) {
  if (shift.hourly_rate && shift.hourly_rate > 0) return shift.hourly_rate;
  const item = shift.support_item_code ? NDIS_ITEMS_BY_CODE[shift.support_item_code] : null;
  return item ? item.rate : 0;
}

function shiftHours(s) {
  return s.hours || calcHours(s.start_time, s.end_time);
}

// Amount uses NDIS catalogue rate as fallback when shift rate is missing
function shiftAmount(s) {
  const hrs = shiftHours(s);
  const rate = resolveRate(s);
  return s.amount && s.amount > 0 ? s.amount : hrs * rate;
}

function printHTML(html) {
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

// ─── Print templates ──────────────────────────────────────────────────────────

const LOGO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png";
const CO_INFO = `<div><strong>SZ-JIE Support Services</strong></div><div>ABN: 86 959 042 971</div><div>309/12 Broome St, Waterloo NSW 2017</div><div>jeff@szjiesupportservices.com</div>`;
const BASE_STYLE = `*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:32px 40px;}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1e293b;padding-bottom:14px;margin-bottom:20px;}
.logo{width:140px;}.co{text-align:right;font-size:11px;color:#475569;line-height:1.8;}
h1{font-size:26px;font-weight:900;margin-bottom:4px;}h2{font-size:14px;font-weight:900;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;}
p.sub{font-size:12px;color:#64748b;margin-bottom:16px;}
table{width:100%;border-collapse:collapse;margin-bottom:8px;}
thead tr{background:#1e293b;color:white;}thead th{padding:8px 10px;font-size:11px;text-align:left;}
tbody tr{border-bottom:1px solid #f1f5f9;}tbody td{padding:7px 10px;font-size:12px;}
tfoot td{padding:8px 10px;font-weight:900;font-size:13px;border-top:2px solid #1e293b;}
.footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;}
.no-print{display:none;}@media print{.page-break{page-break-before:always;}}`;

function buildBASHtml(monthData, period) {
  const totalRevenue = monthData.reduce((a, m) => a + m.revenue, 0);
  const totalHours = monthData.reduce((a, m) => a + m.hours, 0);
  const rows = monthData.map(m =>
    `<tr><td>${m.label}</td><td style="text-align:right">${m.shifts}</td><td style="text-align:right">${m.hours.toFixed(2)}</td><td style="text-align:right;font-weight:bold;color:#16a34a">${fmt(m.revenue)}</td><td style="text-align:right;color:#94a3b8">$0.00</td><td style="text-align:right;font-weight:bold">${fmt(m.revenue)}</td></tr>`
  ).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BAS Statement – ${period}</title>
  <style>${BASE_STYLE}
  .bas-box{border:2px solid #1e293b;border-radius:8px;padding:16px 20px;margin-bottom:20px;}
  .bas-box h2{font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;color:#1e293b;border:none;margin-top:0;padding-bottom:0;}
  .bas-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .bas-field{border:1px solid #cbd5e1;border-radius:4px;padding:8px 12px;}
  .bl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
  .bv{font-size:16px;font-weight:900;}.bv.green{color:#16a34a;}
  .note{background:#fef9c3;border:1px solid #fde68a;border-radius:6px;padding:10px 14px;font-size:11px;color:#854d0e;margin-bottom:16px;}
  </style></head><body>
  <div class="hdr"><img src="${LOGO}" class="logo"/><div class="co">${CO_INFO}</div></div>
  <h1>Business Activity Statement (BAS)</h1>
  <p class="sub">Period: ${period} · Generated: ${format(new Date(), "dd/MM/yyyy")}</p>
  <div class="note">⚠️ NDIS disability supports are GST-free under s38-30 of the A New Tax System (Goods and Services Tax) Act 1999. All revenue is GST-free. Rates sourced from NDIS Support Catalogue. Verify with your registered BAS agent before lodging.</div>
  <div class="bas-box"><h2>GST Amounts — Labels G1 / G2</h2>
    <div class="bas-grid">
      <div class="bas-field"><div class="bl">G1 — Total Sales (incl. GST-free)</div><div class="bv green">${fmt(totalRevenue)}</div></div>
      <div class="bas-field"><div class="bl">G2 — GST-free Sales</div><div class="bv green">${fmt(totalRevenue)}</div></div>
      <div class="bas-field"><div class="bl">G3 — Input-taxed Sales</div><div class="bv">$0.00</div></div>
      <div class="bas-field"><div class="bl">1A — GST on Sales</div><div class="bv">$0.00</div></div>
    </div>
  </div>
  <h2>Monthly Revenue Breakdown</h2>
  <table>
    <thead><tr><th>Month</th><th style="text-align:right">Shifts</th><th style="text-align:right">Hours</th><th style="text-align:right">Revenue (G1)</th><th style="text-align:right">GST (G2 ref)</th><th style="text-align:right">Net Payable</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td>TOTAL</td><td style="text-align:right">${monthData.reduce((a, m) => a + m.shifts, 0)}</td><td style="text-align:right">${totalHours.toFixed(2)}</td><td style="text-align:right;color:#16a34a">${fmt(totalRevenue)}</td><td style="text-align:right">$0.00</td><td style="text-align:right">${fmt(totalRevenue)}</td></tr></tfoot>
  </table>
  <div class="footer">SZ-JIE Support Services · ABN 86 959 042 971 · CONFIDENTIAL – For BAS Agent Use Only</div>
  <div class="no-print" style="text-align:center;padding:20px;display:block!important;"><button onclick="window.print()" style="background:#1e293b;color:white;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">🖨️ Print / Save PDF</button></div>
  </body></html>`;
}

function buildAccountantHtml(monthData, byCode, byStaff, byParticipant, staffTaxRows, period) {
  const totalRevenue = monthData.reduce((a, m) => a + m.revenue, 0);
  const totalHours = monthData.reduce((a, m) => a + m.hours, 0);
  const totalShifts = monthData.reduce((a, m) => a + m.shifts, 0);
  const totalLabour = Object.values(byStaff).reduce((a, d) => a + d.gross, 0);
  const totalTax = staffTaxRows.reduce((a, r) => a + r.tax, 0);
  const totalSuper = staffTaxRows.reduce((a, r) => a + r.super, 0);

  const monthRows = monthData.map(m =>
    `<tr><td>${m.label}</td><td style="text-align:right">${m.shifts}</td><td style="text-align:right">${m.hours.toFixed(2)}</td><td style="text-align:right;font-weight:bold;color:#16a34a">${fmt(m.revenue)}</td></tr>`).join("");
  const codeRows = Object.entries(byCode).sort((a, b) => b[1].revenue - a[1].revenue).map(([code, d]) =>
    `<tr><td style="font-family:monospace">${code}</td><td>${d.desc}</td><td style="text-align:right">${d.shifts}</td><td style="text-align:right">${d.hours.toFixed(2)}</td><td style="text-align:right">${fmt(d.ndisRate)}/hr</td><td style="text-align:right;font-weight:bold">${fmt(d.revenue)}</td></tr>`).join("");
  const staffRows = Object.entries(byStaff).sort((a, b) => b[1].gross - a[1].gross).map(([name, d]) =>
    `<tr><td>${name}</td><td style="text-align:right">${d.shifts}</td><td style="text-align:right">${d.hours.toFixed(2)}</td><td style="text-align:right;font-weight:bold;color:#dc2626">${fmt(d.gross)}</td></tr>`).join("");
  const partRows = Object.entries(byParticipant).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, d]) =>
    `<tr><td>${name}</td><td style="text-align:right">${d.shifts}</td><td style="text-align:right">${d.hours.toFixed(2)}</td><td style="text-align:right;font-weight:bold">${fmt(d.revenue)}</td></tr>`).join("");
  const taxRows = staffTaxRows.map(r =>
    `<tr><td>${r.name}</td><td style="text-align:right">${r.taxStatus}</td><td style="text-align:right;color:#dc2626">${fmt(r.gross)}</td><td style="text-align:right">${fmt(r.tax)}</td><td style="text-align:right">${fmt(r.medicare)}</td><td style="text-align:right">${fmt(r.super)}</td><td style="text-align:right;font-weight:bold">${fmt(r.net)}</td></tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Accountant Report – ${period}</title>
  <style>${BASE_STYLE}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
  .kcard{border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px;}
  .kl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
  .kv{font-size:18px;font-weight:900;}.kv.green{color:#16a34a;}.kv.blue{color:#2563eb;}.kv.red{color:#dc2626;}
  </style></head><body>
  <div class="hdr"><img src="${LOGO}" class="logo"/><div class="co">${CO_INFO}</div></div>
  <h1>Accountant Financial Report</h1>
  <p class="sub">Period: ${period} · Generated: ${format(new Date(), "dd/MM/yyyy")} · Rates from NDIS Support Catalogue</p>
  <div class="kpi">
    <div class="kcard"><div class="kl">Total Revenue (G1)</div><div class="kv green">${fmt(totalRevenue)}</div></div>
    <div class="kcard"><div class="kl">Completed Shifts</div><div class="kv blue">${totalShifts}</div></div>
    <div class="kcard"><div class="kl">Total Labour Cost</div><div class="kv red">${fmt(totalLabour)}</div></div>
    <div class="kcard"><div class="kl">Net Margin (est.)</div><div class="kv">${fmt(totalRevenue - totalLabour)}</div></div>
  </div>
  <h2>Monthly Revenue Summary</h2>
  <table><thead><tr><th>Month</th><th style="text-align:right">Shifts</th><th style="text-align:right">Hours</th><th style="text-align:right">Revenue</th></tr></thead>
  <tbody>${monthRows}</tbody>
  <tfoot><tr><td>TOTAL</td><td style="text-align:right">${totalShifts}</td><td style="text-align:right">${totalHours.toFixed(2)}</td><td style="text-align:right;color:#16a34a">${fmt(totalRevenue)}</td></tr></tfoot></table>
  <div class="page-break"></div>
  <h2>Revenue by NDIS Support Item Code</h2>
  <table><thead><tr><th>Item Code</th><th>Description</th><th style="text-align:right">Shifts</th><th style="text-align:right">Hours</th><th style="text-align:right">NDIS Rate</th><th style="text-align:right">Revenue</th></tr></thead>
  <tbody>${codeRows}</tbody></table>
  <h2>Revenue by Participant</h2>
  <table><thead><tr><th>Participant</th><th style="text-align:right">Shifts</th><th style="text-align:right">Hours</th><th style="text-align:right">Revenue</th></tr></thead>
  <tbody>${partRows}</tbody></table>
  <h2>Staff Labour Cost (Gross Pay)</h2>
  <table><thead><tr><th>Staff Member</th><th style="text-align:right">Shifts</th><th style="text-align:right">Hours</th><th style="text-align:right">Gross Pay</th></tr></thead>
  <tbody>${staffRows}</tbody>
  <tfoot><tr><td>TOTAL LABOUR</td><td></td><td></td><td style="text-align:right;color:#dc2626">${fmt(totalLabour)}</td></tr></tfoot></table>
  ${staffTaxRows.length > 0 ? `
  <div class="page-break"></div>
  <h2>Staff Tax & Super Summary (ATO 2025–26 Tables)</h2>
  <table><thead><tr><th>Staff Member</th><th>Tax Status</th><th style="text-align:right">Gross Pay</th><th style="text-align:right">PAYG Tax</th><th style="text-align:right">Medicare</th><th style="text-align:right">Super (12%)</th><th style="text-align:right">Net Pay</th></tr></thead>
  <tbody>${taxRows}</tbody>
  <tfoot><tr><td>TOTALS</td><td></td><td style="text-align:right">${fmt(staffTaxRows.reduce((a,r)=>a+r.gross,0))}</td><td style="text-align:right;color:#dc2626">${fmt(totalTax)}</td><td style="text-align:right">${fmt(staffTaxRows.reduce((a,r)=>a+r.medicare,0))}</td><td style="text-align:right">${fmt(totalSuper)}</td><td style="text-align:right;font-weight:bold">${fmt(staffTaxRows.reduce((a,r)=>a+r.net,0))}</td></tr></tfoot></table>
  <p style="font-size:10px;color:#94a3b8;margin-top:6px;">Tax calculated by annualising period gross pay using ATO 2025–26 NAT 1008 tables. Figures are estimates — verify with your payroll software or tax agent.</p>` : ""}
  <div class="footer">SZ-JIE Support Services · ABN 86 959 042 971 · CONFIDENTIAL – For Accountant Use Only</div>
  <div class="no-print" style="text-align:center;padding:20px;display:block!important;"><button onclick="window.print()" style="background:#1e293b;color:white;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">🖨️ Print / Save PDF</button></div>
  </body></html>`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FinancialReports() {
  const [shifts, setShifts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodMode, setPeriodMode] = useState("fy");
  const [expandedMonth, setExpandedMonth] = useState(null);

  const load = async () => {
    setLoading(true);
    const [s, sm, inv] = await Promise.all([
      base44.entities.Shift.list("-date"),
      base44.entities.StaffMember.list(),
      base44.entities.Invoice.list("-issue_date"),
    ]);
    setShifts(s);
    setStaffMembers(sm);
    setInvoices(inv);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const completed = useMemo(() => shifts.filter(s => s.status === "Completed"), [shifts]);

  const filtered = useMemo(() => {
    const now = new Date();
    if (periodMode === "12months") {
      const cutoff = subMonths(startOfMonth(now), 11);
      return completed.filter(s => s.date && parseISO(s.date) >= cutoff);
    }
    if (periodMode === "fy") {
      const fyStart = now.getMonth() >= 6
        ? new Date(now.getFullYear(), 6, 1)
        : new Date(now.getFullYear() - 1, 6, 1);
      return completed.filter(s => s.date && parseISO(s.date) >= fyStart);
    }
    return completed;
  }, [completed, periodMode]);

  const periodLabel = periodMode === "12months" ? "Last 12 Months"
    : periodMode === "fy" ? `FY ${new Date().getMonth() >= 6 ? new Date().getFullYear() : new Date().getFullYear() - 1}–${new Date().getMonth() >= 6 ? new Date().getFullYear() + 1 : new Date().getFullYear()} (Jul–Jun)`
    : "All Time";

  // Monthly aggregation
  const monthData = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      const key = s.date ? s.date.slice(0, 7) : "Unknown";
      if (!map[key]) map[key] = { key, label: key, shifts: 0, hours: 0, revenue: 0, rows: [] };
      map[key].shifts++;
      map[key].hours += shiftHours(s);
      map[key].revenue += shiftAmount(s);
      map[key].rows.push(s);
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered]);

  // By NDIS code — includes the catalogue rate for reference
  const byCode = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      const code = s.support_item_code || "No Code";
      const catalogueItem = code !== "No Code" ? NDIS_ITEMS_BY_CODE[code] : null;
      if (!map[code]) map[code] = {
        desc: catalogueItem?.name || s.support_type || code,
        ndisRate: catalogueItem?.rate || s.hourly_rate || 0,
        shifts: 0, hours: 0, revenue: 0
      };
      map[code].shifts++;
      map[code].hours += shiftHours(s);
      map[code].revenue += shiftAmount(s);
    });
    return map;
  }, [filtered]);

  // By staff
  const byStaff = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      if (!map[s.staff_name]) map[s.staff_name] = { shifts: 0, hours: 0, gross: 0 };
      map[s.staff_name].shifts++;
      map[s.staff_name].hours += shiftHours(s);
      map[s.staff_name].gross += shiftAmount(s);
    });
    return map;
  }, [filtered]);

  // By participant
  const byParticipant = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      if (!map[s.participant_name]) map[s.participant_name] = { shifts: 0, hours: 0, revenue: 0 };
      map[s.participant_name].shifts++;
      map[s.participant_name].hours += shiftHours(s);
      map[s.participant_name].revenue += shiftAmount(s);
    });
    return map;
  }, [filtered]);

  // Filter invoices to the selected period
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    let inv = invoices;
    if (periodMode === "12months") {
      const cutoff = subMonths(startOfMonth(now), 11);
      inv = invoices.filter(i => i.issue_date && parseISO(i.issue_date) >= cutoff);
    } else if (periodMode === "fy") {
      const fyStart = now.getMonth() >= 6
        ? new Date(now.getFullYear(), 6, 1)
        : new Date(now.getFullYear() - 1, 6, 1);
      inv = invoices.filter(i => i.issue_date && parseISO(i.issue_date) >= fyStart);
    }
    return inv;
  }, [invoices, periodMode]);

  // Monthly invoice aggregation
  const invoiceMonthData = useMemo(() => {
    const map = {};
    filteredInvoices.forEach(inv => {
      const key = inv.issue_date ? inv.issue_date.slice(0, 7) : "Unknown";
      if (!map[key]) map[key] = { key, invoices: 0, total: 0, paid: 0, pending: 0, draft: 0 };
      map[key].invoices++;
      map[key].total += inv.total || 0;
      if (inv.status === "Paid") map[key].paid += inv.total || 0;
      else if (inv.status === "Draft") map[key].draft += inv.total || 0;
      else map[key].pending += inv.total || 0;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredInvoices]);

  const totalInvoiced = filteredInvoices.reduce((a, i) => a + (i.total || 0), 0);
  const totalPaid = filteredInvoices.filter(i => i.status === "Paid").reduce((a, i) => a + (i.total || 0), 0);
  const totalOutstanding = filteredInvoices.filter(i => ["Sent","Overdue"].includes(i.status)).reduce((a, i) => a + (i.total || 0), 0);

  // Tax summary per staff — annualise their period gross using ATO tables
  const staffTaxRows = useMemo(() => {
    return Object.entries(byStaff).map(([name, d]) => {
      const sm = staffMembers.find(s => s.name === name) || {};
      const taxStatus = sm.tax_status || "resident_with_threshold";
      const medicareExemption = sm.medicare_exemption || false;
      // Determine period from filtered range for annualisation
      const months = periodMode === "12months" ? 12 : periodMode === "fy" ? 12 : Math.max(1, monthData.length);
      const grossPerMonth = d.gross / Math.max(1, months);
      const deductions = calcPayPeriodDeductions(grossPerMonth, "monthly", taxStatus, medicareExemption);
      return {
        name,
        taxStatus: TAX_STATUS_LABELS[taxStatus] || taxStatus,
        gross: d.gross,
        tax: deductions.tax * months,
        medicare: deductions.medicare * months,
        super: deductions.super * months,
        net: d.gross - (deductions.tax * months) - (deductions.medicare * months) - (deductions.super * months),
        annualisedGross: deductions.annualised,
      };
    });
  }, [byStaff, staffMembers, periodMode, monthData.length]);

  const totalRevenue = filtered.reduce((a, s) => a + shiftAmount(s), 0);
  const totalHours = filtered.reduce((a, s) => a + shiftHours(s), 0);
  const totalLabour = Object.values(byStaff).reduce((a, d) => a + d.gross, 0);
  const totalTax = staffTaxRows.reduce((a, r) => a + r.tax, 0);
  const totalSuper = staffTaxRows.reduce((a, r) => a + r.super, 0);

  // Shifts with no NDIS rate (missing code and no stored rate)
  const shiftsWithNoRate = filtered.filter(s => !s.hourly_rate && !s.support_item_code);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground text-sm">BAS figures, tax summaries & accountant reports — calculated from NDIS catalogue rates</p>
        </div>
        <FinanceNav />
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={load} className="gap-2 rounded-xl"><RefreshCw size={14} /> Refresh</Button>
          <Button variant="outline" onClick={() => printHTML(buildBASHtml(monthData, periodLabel))} className="gap-2 rounded-xl border-blue-300 text-blue-700 hover:bg-blue-50">
            <FileText size={14} /> Print BAS
          </Button>
          <Button onClick={() => printHTML(buildAccountantHtml(monthData, byCode, byStaff, byParticipant, staffTaxRows, periodLabel))} className="gap-2 rounded-xl">
            <Printer size={14} /> Accountant Report
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 flex-wrap">
        <Calendar size={16} className="text-muted-foreground shrink-0" />
        <span className="text-sm font-bold">Report Period:</span>
        <Select value={periodMode} onValueChange={setPeriodMode}>
          <SelectTrigger className="w-72 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fy">Current Financial Year (Jul–Jun)</SelectItem>
            <SelectItem value="12months">Last 12 Months</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} completed shifts · {periodLabel}</span>
      </div>

      {/* Warning if some shifts have no rate */}
      {shiftsWithNoRate.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2 text-xs">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800"><strong>{shiftsWithNoRate.length} shift{shiftsWithNoRate.length !== 1 ? "s" : ""}</strong> have no hourly rate and no NDIS item code — their billable amount is $0.00. Assign an item code in Rostering to fix this.</p>
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Roster Revenue (Shifts)", value: fmt(totalRevenue), sub: `${filtered.length} completed shifts`, color: "text-emerald-600", icon: <DollarSign size={18} className="text-emerald-500" /> },
          { label: "Invoiced (G1)", value: fmt(totalInvoiced), sub: `${filteredInvoices.length} invoices raised`, color: "text-blue-600", icon: <Receipt size={18} className="text-blue-500" /> },
          { label: "Collected (Paid)", value: fmt(totalPaid), sub: fmt(totalOutstanding) + " outstanding", color: "text-emerald-600", icon: <CheckCircle size={18} className="text-emerald-500" /> },
          { label: "Est. PAYG + Super", value: fmt(totalTax + totalSuper), sub: `Tax: ${fmt(totalTax)} · Super: ${fmt(totalSuper)}`, color: "text-rose-600", icon: <FileText size={18} className="text-rose-500" /> },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center shrink-0">{k.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">{k.label}</p>
              <p className={`text-xl font-black mt-0.5 ${k.color}`}>{k.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* BAS Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm">
        <p className="font-black text-emerald-800">BAS / GST Summary — {periodLabel}</p>
        <p className="text-emerald-700 text-xs mt-1">NDIS disability supports are GST-free under s38-30 of the GST Act 1999. &nbsp;<strong>G1 (Total Sales) = {fmt(totalRevenue)}</strong> &nbsp;·&nbsp; <strong>G2 (GST-free Sales) = {fmt(totalRevenue)}</strong> &nbsp;·&nbsp; <strong>1A (GST on Sales) = $0.00</strong>. Confirm with your registered BAS agent before lodging.</p>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList className="rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="monthly" className="rounded-lg">Monthly Breakdown</TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-lg">Invoices</TabsTrigger>
          <TabsTrigger value="ndis" className="rounded-lg">By NDIS Item</TabsTrigger>
          <TabsTrigger value="participants" className="rounded-lg">By Participant</TabsTrigger>
          <TabsTrigger value="staff" className="rounded-lg">Staff Labour</TabsTrigger>
          <TabsTrigger value="tax" className="rounded-lg">Tax & Super</TabsTrigger>
          <TabsTrigger value="bas" className="rounded-lg">BAS Summary</TabsTrigger>
        </TabsList>

        {/* MONTHLY TAB */}
        <TabsContent value="monthly" className="mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <h3 className="font-black">Monthly Revenue — {periodLabel}</h3>
              <p className="text-xs text-muted-foreground">Click a row to expand shift details. Amounts use stored rate or NDIS catalogue rate.</p>
            </div>
            {monthData.length === 0 ? (
              <p className="p-10 text-center text-muted-foreground italic text-sm">No completed shifts in this period.</p>
            ) : (
              <div className="divide-y divide-border">
                {monthData.map(m => (
                  <div key={m.key}>
                    <button
                      className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/40 transition-colors text-left"
                      onClick={() => setExpandedMonth(expandedMonth === m.key ? null : m.key)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-black text-sm w-20">{m.label}</span>
                        <span className="text-xs text-muted-foreground">{m.shifts} shift{m.shifts !== 1 ? "s" : ""} · {m.hours.toFixed(2)} hrs</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-emerald-700">{fmt(m.revenue)}</span>
                        {expandedMonth === m.key ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                      </div>
                    </button>
                    {expandedMonth === m.key && (
                      <div className="bg-secondary/30 overflow-x-auto border-t border-border">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-secondary text-muted-foreground">
                            <th className="px-4 py-2 text-left font-bold">Date</th>
                            <th className="px-4 py-2 text-left font-bold">Staff</th>
                            <th className="px-4 py-2 text-left font-bold">Participant</th>
                            <th className="px-4 py-2 text-left font-bold">Item Code</th>
                            <th className="px-4 py-2 text-right font-bold">Hrs</th>
                            <th className="px-4 py-2 text-right font-bold">Rate</th>
                            <th className="px-4 py-2 text-right font-bold">Amount</th>
                            <th className="px-4 py-2 text-center font-bold">Rate Source</th>
                          </tr></thead>
                          <tbody className="divide-y divide-border">
                            {m.rows.map(s => {
                              const usedCatalogue = (!s.hourly_rate || s.hourly_rate === 0) && s.support_item_code;
                              return (
                                <tr key={s.id}>
                                  <td className="px-4 py-2">{s.date}</td>
                                  <td className="px-4 py-2">{s.staff_name}</td>
                                  <td className="px-4 py-2">{s.participant_name}</td>
                                  <td className="px-4 py-2 font-mono">{s.support_item_code || "—"}</td>
                                  <td className="px-4 py-2 text-right">{shiftHours(s).toFixed(2)}</td>
                                  <td className="px-4 py-2 text-right">{fmt(resolveRate(s))}</td>
                                  <td className="px-4 py-2 text-right font-bold">{fmt(shiftAmount(s))}</td>
                                  <td className="px-4 py-2 text-center">
                                    {usedCatalogue
                                      ? <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">NDIS Catalogue</span>
                                      : <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">Stored</span>
                                    }
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
                <div className="px-5 py-3 flex items-center justify-between bg-secondary/30 font-black text-sm">
                  <span>TOTAL — {periodLabel}</span>
                  <span className="text-emerald-700">{fmt(totalRevenue)}</span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* INVOICES TAB */}
        <TabsContent value="invoices" className="mt-4 space-y-4">
          {/* Monthly reconciliation table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <h3 className="font-black">Monthly Invoice Summary — {periodLabel}</h3>
              <p className="text-xs text-muted-foreground">All invoices raised in the period, grouped by month</p>
            </div>
            {invoiceMonthData.length === 0 ? (
              <p className="p-10 text-center text-muted-foreground italic text-sm">No invoices in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-secondary/50 text-muted-foreground text-xs">
                    <th className="px-5 py-3 text-left font-bold">Month</th>
                    <th className="px-5 py-3 text-right font-bold">Invoices</th>
                    <th className="px-5 py-3 text-right font-bold">Total Invoiced</th>
                    <th className="px-5 py-3 text-right font-bold">Paid</th>
                    <th className="px-5 py-3 text-right font-bold">Pending / Sent</th>
                    <th className="px-5 py-3 text-right font-bold">Draft</th>
                    <th className="px-5 py-3 text-right font-bold">Roster Rev.</th>
                    <th className="px-5 py-3 text-right font-bold">Variance</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {invoiceMonthData.map(m => {
                      const rosterMonth = monthData.find(r => r.key === m.key);
                      const rosterRev = rosterMonth ? rosterMonth.revenue : 0;
                      const variance = m.total - rosterRev;
                      return (
                        <tr key={m.key} className="hover:bg-secondary/30">
                          <td className="px-5 py-3 font-black">{m.key}</td>
                          <td className="px-5 py-3 text-right">{m.invoices}</td>
                          <td className="px-5 py-3 text-right font-bold text-blue-700">{fmt(m.total)}</td>
                          <td className="px-5 py-3 text-right text-emerald-700 font-bold">{fmt(m.paid)}</td>
                          <td className="px-5 py-3 text-right text-amber-700">{fmt(m.pending)}</td>
                          <td className="px-5 py-3 text-right text-muted-foreground">{fmt(m.draft)}</td>
                          <td className="px-5 py-3 text-right">{fmt(rosterRev)}</td>
                          <td className={`px-5 py-3 text-right font-bold ${variance > 0 ? "text-blue-600" : variance < 0 ? "text-rose-600" : "text-muted-foreground"}`}>
                            {variance > 0 ? "+" : ""}{fmt(variance)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-secondary/30 font-black text-sm">
                      <td className="px-5 py-3">TOTAL</td>
                      <td className="px-5 py-3 text-right">{filteredInvoices.length}</td>
                      <td className="px-5 py-3 text-right text-blue-700">{fmt(totalInvoiced)}</td>
                      <td className="px-5 py-3 text-right text-emerald-700">{fmt(totalPaid)}</td>
                      <td className="px-5 py-3 text-right text-amber-700">{fmt(totalOutstanding)}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{fmt(filteredInvoices.filter(i=>i.status==="Draft").reduce((a,i)=>a+(i.total||0),0))}</td>
                      <td className="px-5 py-3 text-right">{fmt(totalRevenue)}</td>
                      <td className={`px-5 py-3 text-right ${totalInvoiced - totalRevenue >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                        {totalInvoiced - totalRevenue >= 0 ? "+" : ""}{fmt(totalInvoiced - totalRevenue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            <p className="px-5 py-2 text-[10px] text-muted-foreground border-t border-border">Variance = Invoiced − Roster Revenue. Positive = invoiced more than shifts; Negative = shifts not yet invoiced.</p>
          </div>

          {/* Individual invoice list */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <h3 className="font-black">All Invoices — {periodLabel}</h3>
            </div>
            {filteredInvoices.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground italic text-sm">No invoices in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-secondary/50 text-muted-foreground text-xs">
                    <th className="px-5 py-3 text-left font-bold">Invoice #</th>
                    <th className="px-5 py-3 text-left font-bold">Participant</th>
                    <th className="px-5 py-3 text-left font-bold">Issue Date</th>
                    <th className="px-5 py-3 text-left font-bold">Status</th>
                    <th className="px-5 py-3 text-right font-bold">Total</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {filteredInvoices.sort((a,b) => (b.issue_date||"").localeCompare(a.issue_date||"")).map(inv => (
                      <tr key={inv.id} className="hover:bg-secondary/30">
                        <td className="px-5 py-3 font-mono text-xs">{inv.invoice_number || "—"}</td>
                        <td className="px-5 py-3 font-bold">{inv.participant_name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{inv.issue_date}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            inv.status === "Paid" ? "bg-emerald-100 text-emerald-700" :
                            inv.status === "Sent" ? "bg-blue-100 text-blue-700" :
                            inv.status === "Overdue" ? "bg-rose-100 text-rose-700" :
                            "bg-secondary text-muted-foreground"
                          }`}>{inv.status}</span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold">{fmt(inv.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* NDIS ITEM TAB */}
        <TabsContent value="ndis" className="mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <h3 className="font-black">Revenue by NDIS Support Item Code</h3>
              <p className="text-xs text-muted-foreground">NDIS catalogue rates shown for reference</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary/50 text-muted-foreground text-xs">
                  <th className="px-5 py-3 text-left font-bold">Item Code</th>
                  <th className="px-5 py-3 text-left font-bold">Description</th>
                  <th className="px-5 py-3 text-right font-bold">Shifts</th>
                  <th className="px-5 py-3 text-right font-bold">Hours</th>
                  <th className="px-5 py-3 text-right font-bold">NDIS Rate</th>
                  <th className="px-5 py-3 text-right font-bold">Revenue</th>
                  <th className="px-5 py-3 text-right font-bold">% Total</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(byCode).sort((a, b) => b[1].revenue - a[1].revenue).map(([code, d]) => (
                    <tr key={code} className="hover:bg-secondary/30">
                      <td className="px-5 py-3 font-mono text-xs">{code}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{d.desc}</td>
                      <td className="px-5 py-3 text-right">{d.shifts}</td>
                      <td className="px-5 py-3 text-right">{d.hours.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right text-blue-600 font-bold">{d.ndisRate ? fmt(d.ndisRate) : "—"}/hr</td>
                      <td className="px-5 py-3 text-right font-bold">{fmt(d.revenue)}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{totalRevenue ? ((d.revenue / totalRevenue) * 100).toFixed(1) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-secondary/30 font-black text-sm">
                    <td className="px-5 py-3" colSpan={5}>TOTAL</td>
                    <td className="px-5 py-3 text-right text-emerald-700">{fmt(totalRevenue)}</td>
                    <td className="px-5 py-3 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* PARTICIPANTS TAB */}
        <TabsContent value="participants" className="mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <h3 className="font-black">Revenue by Participant</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary/50 text-muted-foreground text-xs">
                  <th className="px-5 py-3 text-left font-bold">Participant</th>
                  <th className="px-5 py-3 text-right font-bold">Shifts</th>
                  <th className="px-5 py-3 text-right font-bold">Hours</th>
                  <th className="px-5 py-3 text-right font-bold">Revenue</th>
                  <th className="px-5 py-3 text-right font-bold">% of Total</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(byParticipant).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, d]) => (
                    <tr key={name} className="hover:bg-secondary/30">
                      <td className="px-5 py-3 font-bold">{name}</td>
                      <td className="px-5 py-3 text-right">{d.shifts}</td>
                      <td className="px-5 py-3 text-right">{d.hours.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right font-bold">{fmt(d.revenue)}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{totalRevenue ? ((d.revenue / totalRevenue) * 100).toFixed(1) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-secondary/30 font-black text-sm">
                    <td className="px-5 py-3" colSpan={3}>TOTAL</td>
                    <td className="px-5 py-3 text-right text-emerald-700">{fmt(totalRevenue)}</td>
                    <td className="px-5 py-3 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* STAFF TAB */}
        <TabsContent value="staff" className="mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <h3 className="font-black">Staff Labour Cost (Gross Pay from Completed Shifts)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary/50 text-muted-foreground text-xs">
                  <th className="px-5 py-3 text-left font-bold">Staff Member</th>
                  <th className="px-5 py-3 text-right font-bold">Shifts</th>
                  <th className="px-5 py-3 text-right font-bold">Hours</th>
                  <th className="px-5 py-3 text-right font-bold">Gross Pay</th>
                  <th className="px-5 py-3 text-right font-bold">% of Labour</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(byStaff).sort((a, b) => b[1].gross - a[1].gross).map(([name, d]) => (
                    <tr key={name} className="hover:bg-secondary/30">
                      <td className="px-5 py-3 font-bold">{name}</td>
                      <td className="px-5 py-3 text-right">{d.shifts}</td>
                      <td className="px-5 py-3 text-right">{d.hours.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right font-bold text-rose-600">{fmt(d.gross)}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{totalLabour ? ((d.gross / totalLabour) * 100).toFixed(1) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-secondary/30 font-black text-sm">
                    <td className="px-5 py-3" colSpan={3}>TOTAL LABOUR</td>
                    <td className="px-5 py-3 text-right text-rose-600">{fmt(totalLabour)}</td>
                    <td className="px-5 py-3 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAX & SUPER TAB */}
        <TabsContent value="tax" className="mt-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm">
            <p className="font-black text-blue-800">ATO 2025–26 Tax Tables</p>
            <p className="text-blue-700 text-xs mt-1">PAYG withholding and Medicare levy calculated using ATO NAT 1008 tables for each staff member's declared tax status. Superannuation at 12% SGC rate. These are estimates — verify with your payroll software or registered tax agent before remitting to the ATO.</p>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <h3 className="font-black">Staff Tax Summary — {periodLabel}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary/50 text-muted-foreground text-xs">
                  <th className="px-5 py-3 text-left font-bold">Staff Member</th>
                  <th className="px-5 py-3 text-left font-bold">Tax Status</th>
                  <th className="px-5 py-3 text-right font-bold">Gross Pay</th>
                  <th className="px-5 py-3 text-right font-bold">PAYG Tax</th>
                  <th className="px-5 py-3 text-right font-bold">Medicare</th>
                  <th className="px-5 py-3 text-right font-bold">Super (12%)</th>
                  <th className="px-5 py-3 text-right font-bold">Est. Net Pay</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {staffTaxRows.map(r => (
                    <tr key={r.name} className="hover:bg-secondary/30">
                      <td className="px-5 py-3 font-bold">{r.name}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{r.taxStatus}</td>
                      <td className="px-5 py-3 text-right font-bold text-rose-600">{fmt(r.gross)}</td>
                      <td className="px-5 py-3 text-right text-amber-700">{fmt(r.tax)}</td>
                      <td className="px-5 py-3 text-right text-amber-700">{fmt(r.medicare)}</td>
                      <td className="px-5 py-3 text-right text-violet-700">{fmt(r.super)}</td>
                      <td className="px-5 py-3 text-right font-black text-emerald-700">{fmt(r.net)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-secondary/30 font-black text-sm">
                    <td className="px-5 py-3" colSpan={2}>TOTALS</td>
                    <td className="px-5 py-3 text-right text-rose-600">{fmt(staffTaxRows.reduce((a,r) => a+r.gross, 0))}</td>
                    <td className="px-5 py-3 text-right text-amber-700">{fmt(totalTax)}</td>
                    <td className="px-5 py-3 text-right text-amber-700">{fmt(staffTaxRows.reduce((a,r) => a+r.medicare, 0))}</td>
                    <td className="px-5 py-3 text-right text-violet-700">{fmt(totalSuper)}</td>
                    <td className="px-5 py-3 text-right text-emerald-700">{fmt(staffTaxRows.reduce((a,r) => a+r.net, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="px-5 py-2 text-[10px] text-muted-foreground border-t border-border">Tax calculated by annualising period gross over {periodLabel}. Update staff tax status in the Staff module to improve accuracy.</p>
          </div>

          {/* W1/W2 PAYG Summary */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-black">PAYG Withholding — BAS Labels W1 / W2</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">W1 — Total Salary, Wages & Other Payments</p>
                <p className="text-2xl font-black text-amber-700">{fmt(staffTaxRows.reduce((a,r) => a+r.gross, 0))}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Total gross wages paid to all staff</p>
              </div>
              <div className="border border-rose-200 bg-rose-50 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">W2 — Amount Withheld from Payments at W1</p>
                <p className="text-2xl font-black text-rose-700">{fmt(totalTax + staffTaxRows.reduce((a,r) => a+r.medicare, 0))}</p>
                <p className="text-[10px] text-muted-foreground mt-1">PAYG tax + Medicare levy withheld</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* BAS TAB */}
        <TabsContent value="bas" className="mt-4">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h3 className="font-black text-lg">BAS Statement Labels — {periodLabel}</h3>
            <p className="text-xs text-muted-foreground">Calculated from completed roster shifts using NDIS support catalogue rates. Verify with your BAS agent before lodging.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "G1 — Total Sales (including GST-free sales)", value: fmt(totalInvoiced || totalRevenue), color: "border-emerald-200 bg-emerald-50", vcolor: "text-emerald-700", note: totalInvoiced ? `From ${filteredInvoices.length} invoices raised` : "From completed roster shifts (no invoices yet)" },
                { label: "G2 — GST-free Sales", value: fmt(totalInvoiced || totalRevenue), color: "border-emerald-200 bg-emerald-50", vcolor: "text-emerald-700", note: "All NDIS supports are GST-free (s38-30 GST Act)" },
                { label: "G3 — Input-taxed Sales", value: "$0.00", color: "border-border bg-secondary/30", vcolor: "text-muted-foreground", note: "Not applicable" },
                { label: "1A — GST on Sales", value: "$0.00", color: "border-border bg-secondary/30", vcolor: "text-muted-foreground", note: "No GST payable on NDIS services" },
                { label: "W1 — Total Wages (for PAYG)", value: fmt(staffTaxRows.reduce((a,r) => a+r.gross, 0)), color: "border-amber-200 bg-amber-50", vcolor: "text-amber-700", note: "Total gross wages paid to all staff this period" },
                { label: "W2 — PAYG Tax Withheld", value: fmt(totalTax + staffTaxRows.reduce((a,r) => a+r.medicare, 0)), color: "border-rose-200 bg-rose-50", vcolor: "text-rose-700", note: "Amount to remit to ATO (tax + Medicare levy)" },
                { label: "1B — GST Credits (Purchases)", value: "See accountant", color: "border-blue-200 bg-blue-50", vcolor: "text-blue-700", note: "Input tax credits — enter separately from receipts" },
                { label: "Est. Superannuation Payable", value: fmt(totalSuper), color: "border-violet-200 bg-violet-50", vcolor: "text-violet-700", note: "12% SGC — due to super funds quarterly" },
              ].map(f => (
                <div key={f.label} className={`border rounded-xl p-4 ${f.color}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{f.label}</p>
                  <p className={`text-2xl font-black ${f.vcolor}`}>{f.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{f.note}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2 flex-wrap">
              <Button onClick={() => printHTML(buildBASHtml(monthData, periodLabel))} className="gap-2 rounded-xl">
                <Printer size={14} /> Print BAS Statement
              </Button>
              <Button variant="outline" onClick={() => printHTML(buildAccountantHtml(monthData, byCode, byStaff, byParticipant, staffTaxRows, periodLabel))} className="gap-2 rounded-xl">
                <FileText size={14} /> Print Full Accountant Report
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}