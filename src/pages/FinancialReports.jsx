import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { Printer, RefreshCw, TrendingUp, DollarSign, FileText, Users, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NDIS_ITEMS } from "@/utils/ndisItems";

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, Math.round(((eh * 60 + em - sh * 60 - sm) / 60) * 100) / 100);
}

function fmt(n) { return `$${(n || 0).toFixed(2)}`; }

function shiftAmount(s) {
  const hrs = s.hours || calcHours(s.start_time, s.end_time);
  return s.amount || hrs * (s.hourly_rate || 0);
}

function shiftHours(s) {
  return s.hours || calcHours(s.start_time, s.end_time);
}

function printHTML(html) {
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

// ─── Print templates ──────────────────────────────────────────────────────────

function buildBASHtml(monthData, period) {
  const totalRevenue = monthData.reduce((a, m) => a + m.revenue, 0);
  const totalHours = monthData.reduce((a, m) => a + m.hours, 0);
  const rows = monthData.map(m =>
    `<tr><td>${m.label}</td><td style="text-align:right">${m.shifts}</td><td style="text-align:right">${m.hours.toFixed(2)}</td><td style="text-align:right;font-weight:bold;color:#16a34a">${fmt(m.revenue)}</td><td style="text-align:right;color:#94a3b8">$0.00</td><td style="text-align:right;font-weight:bold">${fmt(m.revenue)}</td></tr>`
  ).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BAS Statement – ${period}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:32px 40px;}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1e293b;padding-bottom:14px;margin-bottom:20px;}
  .logo{width:140px;}.co{text-align:right;font-size:11px;color:#475569;line-height:1.8;}
  h1{font-size:26px;font-weight:900;margin-bottom:4px;}p.sub{font-size:12px;color:#64748b;margin-bottom:20px;}
  .bas-box{border:2px solid #1e293b;border-radius:8px;padding:16px 20px;margin-bottom:20px;}
  .bas-box h2{font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;color:#1e293b;}
  .bas-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .bas-field{border:1px solid #cbd5e1;border-radius:4px;padding:8px 12px;}
  .bl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
  .bv{font-size:16px;font-weight:900;}
  .bv.green{color:#16a34a;}.bv.blue{color:#2563eb;}
  .note{background:#fef9c3;border:1px solid #fde68a;border-radius:6px;padding:10px 14px;font-size:11px;color:#854d0e;margin-bottom:16px;}
  table{width:100%;border-collapse:collapse;margin-bottom:16px;}
  thead tr{background:#1e293b;color:white;}thead th{padding:8px 10px;font-size:11px;text-align:left;}
  tbody tr{border-bottom:1px solid #f1f5f9;}tbody td{padding:7px 10px;font-size:12px;}
  tfoot td{padding:8px 10px;font-weight:900;font-size:13px;border-top:2px solid #1e293b;}
  .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;}
  @media print{.no-print{display:none;}}</style></head><body>
  <div class="hdr">
    <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png" class="logo"/>
    <div class="co"><div><strong>SZ-JIE Support Services</strong></div><div>ABN: 86 959 042 971</div><div>309/12 Broome St, Waterloo NSW 2017</div><div>jeff@szjiesupportservices.com</div></div>
  </div>
  <h1>Business Activity Statement (BAS)</h1>
  <p class="sub">Period: ${period} · Generated: ${format(new Date(), "dd/MM/yyyy")}</p>
  <div class="note">⚠️ NDIS disability supports are GST-free under s38-30 of the A New Tax System (Goods and Services Tax) Act 1999. All revenue below is GST-free. G1 = Total Sales, G2 = GST-free sales (equals G1). Net GST payable = $0.00. Verify with your registered BAS agent before lodging.</div>
  <div class="bas-box">
    <h2>GST Amounts — Labels G1 / G2</h2>
    <div class="bas-grid">
      <div class="bas-field"><div class="bl">G1 — Total Sales (incl. GST-free)</div><div class="bv green">${fmt(totalRevenue)}</div></div>
      <div class="bas-field"><div class="bl">G2 — GST-free Sales</div><div class="bv green">${fmt(totalRevenue)}</div></div>
      <div class="bas-field"><div class="bl">G3 — Input-taxed Sales</div><div class="bv">$0.00</div></div>
      <div class="bas-field"><div class="bl">1A — GST on Sales</div><div class="bv">$0.00</div></div>
    </div>
  </div>
  <h2 style="font-size:14px;font-weight:900;margin:16px 0 8px;">Monthly Revenue Breakdown</h2>
  <table>
    <thead><tr><th>Month</th><th style="text-align:right">Shifts</th><th style="text-align:right">Hours</th><th style="text-align:right">Revenue (G1)</th><th style="text-align:right">GST (G2)</th><th style="text-align:right">Net Payable</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td>TOTAL</td><td style="text-align:right">${monthData.reduce((a, m) => a + m.shifts, 0)}</td><td style="text-align:right">${totalHours.toFixed(2)}</td><td style="text-align:right;color:#16a34a">${fmt(totalRevenue)}</td><td style="text-align:right">$0.00</td><td style="text-align:right">${fmt(totalRevenue)}</td></tr></tfoot>
  </table>
  <div class="footer">SZ-JIE Support Services · ABN 86 959 042 971 · CONFIDENTIAL – For BAS Agent / Accountant Use Only</div>
  <div class="no-print" style="text-align:center;padding:20px;"><button onclick="window.print()" style="background:#1e293b;color:white;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">🖨️ Print / Save PDF</button></div>
  </body></html>`;
}

function buildAccountantHtml(monthData, byCode, byStaff, byParticipant, period) {
  const totalRevenue = monthData.reduce((a, m) => a + m.revenue, 0);
  const totalHours = monthData.reduce((a, m) => a + m.hours, 0);
  const totalShifts = monthData.reduce((a, m) => a + m.shifts, 0);
  const monthRows = monthData.map(m =>
    `<tr><td>${m.label}</td><td style="text-align:right">${m.shifts}</td><td style="text-align:right">${m.hours.toFixed(2)}</td><td style="text-align:right;font-weight:bold;color:#16a34a">${fmt(m.revenue)}</td></tr>`).join("");
  const codeRows = Object.entries(byCode).sort((a, b) => b[1].revenue - a[1].revenue).map(([code, d]) =>
    `<tr><td style="font-family:monospace">${code}</td><td>${d.desc}</td><td style="text-align:right">${d.shifts}</td><td style="text-align:right">${d.hours.toFixed(2)}</td><td style="text-align:right;font-weight:bold">${fmt(d.revenue)}</td></tr>`).join("");
  const staffRows = Object.entries(byStaff).sort((a, b) => b[1].gross - a[1].gross).map(([name, d]) =>
    `<tr><td>${name}</td><td style="text-align:right">${d.shifts}</td><td style="text-align:right">${d.hours.toFixed(2)}</td><td style="text-align:right;font-weight:bold;color:#dc2626">${fmt(d.gross)}</td></tr>`).join("");
  const partRows = Object.entries(byParticipant).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, d]) =>
    `<tr><td>${name}</td><td style="text-align:right">${d.shifts}</td><td style="text-align:right">${d.hours.toFixed(2)}</td><td style="text-align:right;font-weight:bold">${fmt(d.revenue)}</td></tr>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Accountant Report – ${period}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:32px 40px;}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1e293b;padding-bottom:14px;margin-bottom:20px;}
  .logo{width:140px;}.co{text-align:right;font-size:11px;color:#475569;line-height:1.8;}
  h1{font-size:26px;font-weight:900;margin-bottom:4px;}h2{font-size:14px;font-weight:900;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;}
  p.sub{font-size:12px;color:#64748b;margin-bottom:16px;}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
  .kcard{border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px;}
  .kl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
  .kv{font-size:18px;font-weight:900;}.kv.green{color:#16a34a;}.kv.blue{color:#2563eb;}
  table{width:100%;border-collapse:collapse;margin-bottom:8px;}
  thead tr{background:#1e293b;color:white;}thead th{padding:8px 10px;font-size:11px;text-align:left;}
  tbody tr{border-bottom:1px solid #f1f5f9;}tbody td{padding:7px 10px;font-size:12px;}
  tfoot td{padding:8px 10px;font-weight:900;border-top:2px solid #1e293b;}
  .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;}
  @media print{.no-print{display:none;}.page-break{page-break-before:always;}}</style></head><body>
  <div class="hdr">
    <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png" class="logo"/>
    <div class="co"><div><strong>SZ-JIE Support Services</strong></div><div>ABN: 86 959 042 971</div><div>309/12 Broome St, Waterloo NSW 2017</div><div>jeff@szjiesupportservices.com</div></div>
  </div>
  <h1>Accountant Financial Report</h1>
  <p class="sub">Period: ${period} · Generated: ${format(new Date(), "dd/MM/yyyy")}</p>
  <div class="kpi">
    <div class="kcard"><div class="kl">Total Revenue</div><div class="kv green">${fmt(totalRevenue)}</div></div>
    <div class="kcard"><div class="kl">Completed Shifts</div><div class="kv blue">${totalShifts}</div></div>
    <div class="kcard"><div class="kl">Total Hours</div><div class="kv">${totalHours.toFixed(2)}</div></div>
    <div class="kcard"><div class="kl">Avg / Shift</div><div class="kv">${totalShifts ? fmt(totalRevenue / totalShifts) : "$0.00"}</div></div>
  </div>
  <h2>Monthly Revenue Summary</h2>
  <table><thead><tr><th>Month</th><th style="text-align:right">Shifts</th><th style="text-align:right">Hours</th><th style="text-align:right">Revenue</th></tr></thead>
  <tbody>${monthRows}</tbody>
  <tfoot><tr><td>TOTAL</td><td style="text-align:right">${totalShifts}</td><td style="text-align:right">${totalHours.toFixed(2)}</td><td style="text-align:right;color:#16a34a">${fmt(totalRevenue)}</td></tr></tfoot></table>
  <div class="page-break"></div>
  <h2>Revenue by NDIS Support Item Code</h2>
  <table><thead><tr><th>Item Code</th><th>Description</th><th style="text-align:right">Shifts</th><th style="text-align:right">Hours</th><th style="text-align:right">Revenue</th></tr></thead>
  <tbody>${codeRows}</tbody></table>
  <h2>Revenue by Participant</h2>
  <table><thead><tr><th>Participant</th><th style="text-align:right">Shifts</th><th style="text-align:right">Hours</th><th style="text-align:right">Revenue</th></tr></thead>
  <tbody>${partRows}</tbody></table>
  <h2>Staff Labour Cost (Gross Pay)</h2>
  <table><thead><tr><th>Staff Member</th><th style="text-align:right">Shifts</th><th style="text-align:right">Hours</th><th style="text-align:right">Gross Pay</th></tr></thead>
  <tbody>${staffRows}</tbody>
  <tfoot><tr><td>TOTAL LABOUR</td><td></td><td></td><td style="text-align:right;color:#dc2626">${fmt(Object.values(byStaff).reduce((a, d) => a + d.gross, 0))}</td></tr></tfoot></table>
  <div class="footer">SZ-JIE Support Services · ABN 86 959 042 971 · CONFIDENTIAL – For Accountant Use Only</div>
  <div class="no-print" style="text-align:center;padding:20px;"><button onclick="window.print()" style="background:#1e293b;color:white;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">🖨️ Print / Save PDF</button></div>
  </body></html>`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FinancialReports() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodMode, setPeriodMode] = useState("12months"); // "12months" | "fy" | "all"
  const [expandedMonth, setExpandedMonth] = useState(null);

  const load = async () => {
    setLoading(true);
    const s = await base44.entities.Shift.list("-date");
    setShifts(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Filter to completed shifts only
  const completed = useMemo(() => shifts.filter(s => s.status === "Completed"), [shifts]);

  // Apply period filter
  const filtered = useMemo(() => {
    const now = new Date();
    if (periodMode === "12months") {
      const cutoff = subMonths(startOfMonth(now), 11);
      return completed.filter(s => s.date && parseISO(s.date) >= cutoff);
    }
    if (periodMode === "fy") {
      // Australian FY: 1 Jul – 30 Jun
      const fyStart = now.getMonth() >= 6
        ? new Date(now.getFullYear(), 6, 1)
        : new Date(now.getFullYear() - 1, 6, 1);
      return completed.filter(s => s.date && parseISO(s.date) >= fyStart);
    }
    return completed;
  }, [completed, periodMode]);

  const periodLabel = periodMode === "12months" ? "Last 12 Months"
    : periodMode === "fy" ? "Current Financial Year (Jul–Jun)"
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

  // By NDIS code
  const byCode = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      const code = s.support_item_code || "No Code";
      if (!map[code]) map[code] = { desc: s.support_type || code, shifts: 0, hours: 0, revenue: 0 };
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

  const totalRevenue = filtered.reduce((a, s) => a + shiftAmount(s), 0);
  const totalHours = filtered.reduce((a, s) => a + shiftHours(s), 0);

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
          <p className="text-muted-foreground text-sm">Tax summaries, BAS figures & accountant-ready reports from roster data</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={load} className="gap-2 rounded-xl"><RefreshCw size={14} /> Refresh</Button>
          <Button variant="outline" onClick={() => printHTML(buildBASHtml(monthData, periodLabel))} className="gap-2 rounded-xl border-blue-300 text-blue-700 hover:bg-blue-50">
            <FileText size={14} /> Print BAS
          </Button>
          <Button onClick={() => printHTML(buildAccountantHtml(monthData, byCode, byStaff, byParticipant, periodLabel))} className="gap-2 rounded-xl">
            <Printer size={14} /> Accountant Report
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
        <Calendar size={16} className="text-muted-foreground shrink-0" />
        <span className="text-sm font-bold">Report Period:</span>
        <Select value={periodMode} onValueChange={setPeriodMode}>
          <SelectTrigger className="w-60 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="12months">Last 12 Months</SelectItem>
            <SelectItem value="fy">Current Financial Year (Jul–Jun)</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} completed shifts</span>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: fmt(totalRevenue), color: "text-emerald-600", icon: <DollarSign size={18} className="text-emerald-500" /> },
          { label: "Completed Shifts", value: filtered.length, color: "text-blue-600", icon: <TrendingUp size={18} className="text-blue-500" /> },
          { label: "Total Hours", value: totalHours.toFixed(1) + " hrs", color: "text-violet-600", icon: <Calendar size={18} className="text-violet-500" /> },
          { label: "Avg Revenue / Shift", value: filtered.length ? fmt(totalRevenue / filtered.length) : "$0.00", color: "text-primary", icon: <FileText size={18} className="text-primary" /> },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center shrink-0">{k.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">{k.label}</p>
              <p className={`text-xl font-black mt-0.5 ${k.color}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* BAS Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
        <p className="font-black text-amber-800">BAS / GST Note</p>
        <p className="text-amber-700 text-xs mt-1">NDIS disability supports are GST-free under s38-30 of the GST Act 1999. <strong>G1 (Total Sales) = {fmt(totalRevenue)}</strong> · <strong>G2 (GST-free Sales) = {fmt(totalRevenue)}</strong> · <strong>1A (GST on Sales) = $0.00</strong>. Confirm with your registered BAS agent before lodging.</p>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList className="rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="monthly" className="rounded-lg">Monthly Breakdown</TabsTrigger>
          <TabsTrigger value="ndis" className="rounded-lg">By NDIS Item</TabsTrigger>
          <TabsTrigger value="participants" className="rounded-lg">By Participant</TabsTrigger>
          <TabsTrigger value="staff" className="rounded-lg">Staff Labour</TabsTrigger>
          <TabsTrigger value="bas" className="rounded-lg">BAS Summary</TabsTrigger>
        </TabsList>

        {/* MONTHLY TAB */}
        <TabsContent value="monthly" className="mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <h3 className="font-black">Monthly Revenue — {periodLabel}</h3>
              <p className="text-xs text-muted-foreground">Click a row to expand shift details</p>
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
                            <th className="px-4 py-2 text-right font-bold">Hours</th>
                            <th className="px-4 py-2 text-right font-bold">Rate</th>
                            <th className="px-4 py-2 text-right font-bold">Amount</th>
                          </tr></thead>
                          <tbody className="divide-y divide-border">
                            {m.rows.map(s => (
                              <tr key={s.id}>
                                <td className="px-4 py-2">{s.date}</td>
                                <td className="px-4 py-2">{s.staff_name}</td>
                                <td className="px-4 py-2">{s.participant_name}</td>
                                <td className="px-4 py-2 font-mono">{s.support_item_code || "—"}</td>
                                <td className="px-4 py-2 text-right">{shiftHours(s).toFixed(2)}</td>
                                <td className="px-4 py-2 text-right">{fmt(s.hourly_rate)}</td>
                                <td className="px-4 py-2 text-right font-bold">{fmt(shiftAmount(s))}</td>
                              </tr>
                            ))}
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

        {/* NDIS ITEM TAB */}
        <TabsContent value="ndis" className="mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <h3 className="font-black">Revenue by NDIS Support Item Code</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary/50 text-muted-foreground text-xs">
                  <th className="px-5 py-3 text-left font-bold">Item Code</th>
                  <th className="px-5 py-3 text-left font-bold">Description</th>
                  <th className="px-5 py-3 text-right font-bold">Shifts</th>
                  <th className="px-5 py-3 text-right font-bold">Hours</th>
                  <th className="px-5 py-3 text-right font-bold">Revenue</th>
                  <th className="px-5 py-3 text-right font-bold">% of Total</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(byCode).sort((a, b) => b[1].revenue - a[1].revenue).map(([code, d]) => (
                    <tr key={code} className="hover:bg-secondary/30">
                      <td className="px-5 py-3 font-mono text-xs">{code}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{d.desc}</td>
                      <td className="px-5 py-3 text-right">{d.shifts}</td>
                      <td className="px-5 py-3 text-right">{d.hours.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right font-bold">{fmt(d.revenue)}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{totalRevenue ? ((d.revenue / totalRevenue) * 100).toFixed(1) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-secondary/30 font-black text-sm">
                    <td className="px-5 py-3" colSpan={4}>TOTAL</td>
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
                  {Object.entries(byStaff).sort((a, b) => b[1].gross - a[1].gross).map(([name, d]) => {
                    const totalLabour = Object.values(byStaff).reduce((a, x) => a + x.gross, 0);
                    return (
                      <tr key={name} className="hover:bg-secondary/30">
                        <td className="px-5 py-3 font-bold">{name}</td>
                        <td className="px-5 py-3 text-right">{d.shifts}</td>
                        <td className="px-5 py-3 text-right">{d.hours.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right font-bold text-rose-600">{fmt(d.gross)}</td>
                        <td className="px-5 py-3 text-right text-muted-foreground">{totalLabour ? ((d.gross / totalLabour) * 100).toFixed(1) + "%" : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-secondary/30 font-black text-sm">
                    <td className="px-5 py-3" colSpan={3}>TOTAL LABOUR</td>
                    <td className="px-5 py-3 text-right text-rose-600">{fmt(Object.values(byStaff).reduce((a, d) => a + d.gross, 0))}</td>
                    <td className="px-5 py-3 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* BAS TAB */}
        <TabsContent value="bas" className="mt-4">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <h3 className="font-black text-lg">BAS Statement Labels</h3>
              <p className="text-xs text-muted-foreground">These figures are calculated from completed roster shifts for the selected period. NDIS supports are GST-free. Verify with your BAS agent before lodging.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "G1 — Total Sales (including GST-free sales)", value: fmt(totalRevenue), color: "border-emerald-200 bg-emerald-50", vcolor: "text-emerald-700", note: "All NDIS service revenue" },
                  { label: "G2 — GST-free Sales", value: fmt(totalRevenue), color: "border-emerald-200 bg-emerald-50", vcolor: "text-emerald-700", note: "All NDIS supports are GST-free (s38-30)" },
                  { label: "G3 — Input-taxed Sales", value: "$0.00", color: "border-border bg-secondary/30", vcolor: "text-muted-foreground", note: "Not applicable" },
                  { label: "1A — GST on Sales", value: "$0.00", color: "border-blue-200 bg-blue-50", vcolor: "text-blue-700", note: "No GST payable on NDIS services" },
                  { label: "1B — GST Credits (Purchases)", value: "See accountant", color: "border-amber-200 bg-amber-50", vcolor: "text-amber-700", note: "Input tax credits from business purchases — enter separately" },
                  { label: "Net GST Payable (1A − 1B)", value: "$0.00 (before credits)", color: "border-border bg-secondary/30", vcolor: "text-muted-foreground", note: "May be a refund if you have input tax credits" },
                ].map(f => (
                  <div key={f.label} className={`border rounded-xl p-4 ${f.color}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{f.label}</p>
                    <p className={`text-2xl font-black ${f.vcolor}`}>{f.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{f.note}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => printHTML(buildBASHtml(monthData, periodLabel))} className="gap-2 rounded-xl">
                  <Printer size={14} /> Print BAS Statement
                </Button>
                <Button variant="outline" onClick={() => printHTML(buildAccountantHtml(monthData, byCode, byStaff, byParticipant, periodLabel))} className="gap-2 rounded-xl">
                  <FileText size={14} /> Print Full Accountant Report
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}