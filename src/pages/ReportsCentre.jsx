import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Printer, Users, User, BarChart2, ClipboardList, DollarSign, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format, startOfWeek, addDays, parseISO, isSameDay, eachWeekOfInterval, parseISO as pi } from "date-fns";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function openReport(html) {
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 600);
}

const BASE_STYLE = `
  <style>
    @media print { @page { size: A4 portrait; margin: 12mm; } body { margin: 0; } .no-print { display: none !important; } }
    body { font-family: Arial, sans-serif; color: #1e293b; max-width: 820px; margin: 0 auto; padding: 32px; font-size: 12px; }
    h1 { color: #1e3a5f; font-size: 20px; border-bottom: 3px solid #1e3a5f; padding-bottom: 8px; margin-bottom: 6px; }
    h2 { color: #1e3a5f; font-size: 12px; margin-top: 20px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .06em; border-left: 4px solid #1e3a5f; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    th { background: #1e3a5f; color: white; padding: 7px 10px; text-align: left; font-size: 11px; }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .total td { font-weight: 900; background: #dbeafe !important; color: #1e3a5f; }
    .badge { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 10px; font-weight: 700; }
    .badge-paid { background: #dcfce7; color: #166534; }
    .badge-sent { background: #dbeafe; color: #1d4ed8; }
    .badge-draft { background: #f1f5f9; color: #475569; }
    .badge-overdue { background: #fee2e2; color: #991b1b; }
    .badge-scheduled { background: #dbeafe; color: #1d4ed8; }
    .badge-confirmed { background: #dcfce7; color: #166534; }
    .badge-completed { background: #f1f5f9; color: #475569; }
    .badge-cancelled { background: #fee2e2; color: #991b1b; }
    .meta { font-size: 12px; color: #475569; margin-bottom: 14px; line-height: 1.6; }
    .summary-box { background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin: 12px 0; }
    .summary-box p { margin: 3px 0; font-size: 12px; }
    .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; }
    .day-block { page-break-inside: avoid; margin-bottom: 16px; }
    .day-header { background: #1e3a5f; color: white; padding: 6px 12px; font-weight: 900; font-size: 12px; border-radius: 4px 4px 0 0; }
    .shift-row { display: flex; align-items: center; padding: 6px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    .shift-time { width: 100px; font-weight: 700; color: #1e3a5f; }
    .shift-staff { width: 160px; }
    .shift-part { flex: 1; }
    .shift-type { width: 140px; color: #475569; }
    .print-btn { position: fixed; top: 16px; right: 16px; padding: 8px 16px; background: #1e3a5f; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 12px; }
  </style>
`;

// ─── INVOICE SUMMARY REPORT ───────────────────────────────────────────────────
function InvoiceSummaryReport({ invoices }) {
  const [filter, setFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = invoices.filter(i => {
    const statusOk = filter === "all" || i.status === filter;
    const d = i.issue_date || "";
    const fromOk = !fromDate || d >= fromDate;
    const toOk = !toDate || d <= toDate;
    return statusOk && fromOk && toOk;
  });

  const totalInvoiced = filtered.reduce((a, i) => a + (parseFloat(i.total) || 0), 0);
  const totalPaid = filtered.filter(i => i.status === "Paid").reduce((a, i) => a + (parseFloat(i.total) || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  const byParticipant = filtered.reduce((acc, i) => {
    const n = i.participant_name || "Unknown";
    if (!acc[n]) acc[n] = { count: 0, total: 0, paid: 0 };
    acc[n].count++;
    acc[n].total += parseFloat(i.total) || 0;
    if (i.status === "Paid") acc[n].paid += parseFloat(i.total) || 0;
    return acc;
  }, {});

  const generate = () => {
    const periodLabel = fromDate || toDate ? `${fromDate || "All"} → ${toDate || "All"}` : "All dates";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>${BASE_STYLE}</head><body>
      <button class="print-btn no-print" onclick="window.print()">🖨 Print / Save PDF</button>
      <h1>Invoice Summary Report</h1>
      <p class="meta"><strong>Period:</strong> ${periodLabel} &nbsp;|&nbsp; <strong>Status Filter:</strong> ${filter === "all" ? "All" : filter} &nbsp;|&nbsp; <strong>Generated:</strong> ${new Date().toLocaleDateString("en-AU")} &nbsp;|&nbsp; <strong>Total Invoices:</strong> ${filtered.length}</p>
      <div class="summary-box">
        <p><strong>Total Invoiced:</strong> $${totalInvoiced.toFixed(2)} &nbsp;|&nbsp; <strong>Total Paid:</strong> $${totalPaid.toFixed(2)} &nbsp;|&nbsp; <strong>Outstanding:</strong> $${totalOutstanding.toFixed(2)}</p>
      </div>
      <h2>Invoice List</h2>
      <table><thead><tr><th>Invoice #</th><th>Date</th><th>Participant</th><th>Plan Manager</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>
        ${filtered.map(i => `<tr><td><strong>${i.invoice_number || "—"}</strong></td><td>${i.issue_date || "—"}</td><td>${i.participant_name || "—"}</td><td>${i.plan_manager_name || "—"}</td><td>$${parseFloat(i.total || 0).toFixed(2)}</td><td><span class="badge badge-${(i.status || "").toLowerCase()}">${i.status}</span></td></tr>`).join("")}
        ${filtered.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:#94a3b8;font-style:italic;">No invoices match the filter</td></tr>` : ""}
        <tr class="total"><td colspan="4">TOTALS</td><td>$${totalInvoiced.toFixed(2)}</td><td></td></tr>
      </tbody></table>
      <h2>By Participant</h2>
      <table><thead><tr><th>Participant</th><th>Invoices</th><th>Total Invoiced</th><th>Total Paid</th><th>Outstanding</th></tr></thead>
      <tbody>
        ${Object.entries(byParticipant).map(([name, d]) => `<tr><td>${name}</td><td>${d.count}</td><td>$${d.total.toFixed(2)}</td><td>$${d.paid.toFixed(2)}</td><td>$${(d.total - d.paid).toFixed(2)}</td></tr>`).join("")}
        <tr class="total"><td>TOTAL</td><td>${filtered.length}</td><td>$${totalInvoiced.toFixed(2)}</td><td>$${totalPaid.toFixed(2)}</td><td>$${totalOutstanding.toFixed(2)}</td></tr>
      </tbody></table>
      <div class="footer">SZ-Jie Support Services — Invoice Report generated ${new Date().toLocaleDateString("en-AU")}. GST-free NDIS supports.</div>
    </body></html>`;
    openReport(html);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Status</Label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["all","Draft","Sent","Paid","Overdue"].map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">From Date</Label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" />
        </div>
        <div>
          <Label className="text-xs">To Date</Label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" />
        </div>
        <div className="flex items-end">
          <Button onClick={generate} className="w-full rounded-xl font-bold gap-2"><Printer size={15} /> Generate PDF</Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Invoices Matched", value: filtered.length, suffix: "" },
          { label: "Total Invoiced", value: "$" + totalInvoiced.toFixed(2), suffix: "" },
          { label: "Outstanding", value: "$" + totalOutstanding.toFixed(2), suffix: "" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Calendar grid HTML builder (Sunday–Saturday, 7 columns) ─────────────────
function buildCalendarGridHtml(weekSunday, shiftsForWeek, showStaff = true, showParticipant = true) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekSunday, i));
  const DAY_COLORS = {
    Scheduled: "background:#dbeafe;color:#1d4ed8;",
    Confirmed: "background:#dcfce7;color:#166534;",
    Completed: "background:#f1f5f9;color:#475569;",
    Cancelled: "background:#fee2e2;color:#991b1b;",
    "No Show": "background:#fef3c7;color:#92400e;",
  };

  const cellStyle = "border:1px solid #cbd5e1;vertical-align:top;padding:0;width:14.28%;";
  const headerStyle = "background:#1e3a5f;color:white;padding:6px 4px;text-align:center;font-size:10px;font-weight:900;";

  return `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:6px;">
      <thead>
        <tr>
          ${days.map(d => `<th style="${headerStyle}">${format(d, "EEE")}<br/><span style="font-size:13px;">${format(d, "d")}</span><br/><span style="font-weight:400;font-size:9px;">${format(d, "MMM")}</span></th>`).join("")}
        </tr>
      </thead>
      <tbody>
        <tr>
          ${days.map(day => {
            const dayShifts = shiftsForWeek.filter(s => { try { return isSameDay(parseISO(s.date), day); } catch { return false; } }).sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
            return `<td style="${cellStyle}min-height:80px;">
              ${dayShifts.length === 0
                ? `<div style="min-height:70px;"></div>`
                : dayShifts.map(s => {
                    const colStyle = DAY_COLORS[s.status] || "background:#f1f5f9;color:#334155;";
                    const lines = [];
                    if (showStaff && s.staff_name) lines.push(`<div style="font-weight:700;font-size:9px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${s.staff_name}</div>`);
                    if (showParticipant && s.participant_name) lines.push(`<div style="font-size:9px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;opacity:0.85;">${s.participant_name}</div>`);
                    lines.push(`<div style="font-size:8px;margin-top:1px;opacity:0.75;">${s.start_time}–${s.end_time}</div>`);
                    if (s.support_type) lines.push(`<div style="font-size:8px;opacity:0.65;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${s.support_type}</div>`);
                    return `<div style="${colStyle}border-radius:3px;padding:3px 4px;margin:2px;font-family:Arial,sans-serif;">${lines.join("")}</div>`;
                  }).join("")
              }
            </td>`;
          }).join("")}
        </tr>
      </tbody>
    </table>`;
}

// ─── ROSTER PRINT — TEAM VIEW ─────────────────────────────────────────────────
function RosterTeamReport({ shifts }) {
  // Sunday-start week
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const weekFrom = format(weekStart, "yyyy-MM-dd");
  const weekTo = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const weekShifts = shifts.filter(s => {
    const d = s.date || "";
    return d >= weekFrom && d <= weekTo;
  });

  const generate = () => {
    const calHtml = buildCalendarGridHtml(weekStart, weekShifts, true, true);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <style>
        @media print { @page { size: A4 landscape; margin: 10mm; } body { margin: 0; } .no-print { display: none !important; } }
        body { font-family: Arial, sans-serif; color: #1e293b; padding: 20px; font-size: 11px; }
        h1 { color: #1e3a5f; font-size: 18px; border-bottom: 3px solid #1e3a5f; padding-bottom: 6px; margin-bottom: 6px; }
        .meta { font-size: 11px; color: #475569; margin-bottom: 12px; }
        .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; }
        .legend { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; font-size: 9px; }
        .legend-item { display: flex; align-items: center; gap: 3px; }
        .legend-dot { width: 10px; height: 10px; border-radius: 2px; }
        .print-btn { position: fixed; top: 16px; right: 16px; padding: 8px 16px; background: #1e3a5f; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 12px; }
      </style>
    </head><body>
      <button class="print-btn no-print" onclick="window.print()">🖨 Print / Save PDF</button>
      <h1>Weekly Team Roster</h1>
      <p class="meta"><strong>Week:</strong> ${format(weekStart, "d MMM")} (Sun) – ${format(addDays(weekStart, 6), "d MMM yyyy")} (Sat) &nbsp;|&nbsp; <strong>Total Shifts:</strong> ${weekShifts.length} &nbsp;|&nbsp; <strong>Generated:</strong> ${new Date().toLocaleDateString("en-AU")}</p>
      <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background:#dbeafe;"></div> Scheduled</div>
        <div class="legend-item"><div class="legend-dot" style="background:#dcfce7;"></div> Confirmed</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f1f5f9;"></div> Completed</div>
        <div class="legend-item"><div class="legend-dot" style="background:#fee2e2;"></div> Cancelled</div>
        <div class="legend-item"><div class="legend-dot" style="background:#fef3c7;"></div> No Show</div>
      </div>
      ${calHtml}
      <div class="footer">SZ-Jie Support Services — Weekly Roster generated ${new Date().toLocaleDateString("en-AU")}.</div>
    </body></html>`;
    openReport(html);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekStart(prev => addDays(prev, -7))} className="rounded-lg h-9 w-9">‹</Button>
          <span className="font-bold text-sm px-2">{format(weekStart, "d MMM")} (Sun) – {format(addDays(weekStart, 6), "d MMM yyyy")} (Sat)</span>
          <Button variant="outline" size="icon" onClick={() => setWeekStart(prev => addDays(prev, 7))} className="rounded-lg h-9 w-9">›</Button>
        </div>
        <Button onClick={generate} className="rounded-xl font-bold gap-2 ml-auto"><Printer size={15} /> Generate Team Roster PDF</Button>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <tr><th className="px-4 py-3 text-left">Day</th><th className="px-4 py-3 text-left">Staff</th><th className="px-4 py-3 text-left">Participant</th><th className="px-4 py-3 text-left">Time</th><th className="px-4 py-3 text-left">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {weekShifts.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground italic text-sm">No shifts for this week</td></tr>}
            {weekShifts.sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time)).map(s => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-bold">{s.date ? format(parseISO(s.date), "EEE d MMM") : "—"}</td>
                <td className="px-4 py-3">{s.staff_name}</td>
                <td className="px-4 py-3">{s.participant_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.start_time}–{s.end_time}</td>
                <td className="px-4 py-3"><span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : s.status === "Cancelled" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ROSTER PRINT — INDIVIDUAL VIEW ──────────────────────────────────────────
function RosterIndividualReport({ shifts, staff, participants }) {
  const [viewType, setViewType] = useState("staff"); // "staff" | "participant"
  const [selectedName, setSelectedName] = useState("");
  const [fromDate, setFromDate] = useState(format(new Date(), "yyyy-MM-01"));
  const [toDate, setToDate] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));

  const nameList = viewType === "staff"
    ? [...new Set(shifts.map(s => s.staff_name).filter(Boolean))].sort()
    : [...new Set(shifts.map(s => s.participant_name).filter(Boolean))].sort();

  const filtered = shifts.filter(s => {
    const nameOk = !selectedName || (viewType === "staff" ? s.staff_name === selectedName : s.participant_name === selectedName);
    const d = s.date || "";
    return nameOk && (!fromDate || d >= fromDate) && (!toDate || d <= toDate);
  }).sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));

  const generate = () => {
    const title = selectedName || `All ${viewType === "staff" ? "Staff" : "Participants"}`;
    // Build Sunday-starting weeks that cover the date range
    const start = fromDate ? parseISO(fromDate) : (filtered.length ? parseISO(filtered[0].date) : new Date());
    const end = toDate ? parseISO(toDate) : (filtered.length ? parseISO(filtered[filtered.length - 1].date) : new Date());
    const weekStarts = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 });

    const showStaff = viewType === "participant"; // when viewing by participant, show staff name
    const showParticipant = viewType === "staff";  // when viewing by staff, show participant name

    const weeksHtml = weekStarts.map(weekSun => {
      const wFrom = format(weekSun, "yyyy-MM-dd");
      const wTo = format(addDays(weekSun, 6), "yyyy-MM-dd");
      const weekShifts = filtered.filter(s => (s.date || "") >= wFrom && (s.date || "") <= wTo);
      return `
        <div style="margin-bottom:20px;page-break-inside:avoid;">
          <div style="background:#334155;color:white;padding:5px 10px;border-radius:4px 4px 0 0;font-size:10px;font-weight:900;margin-bottom:0;">
            Week of ${format(weekSun, "d MMM yyyy")} (Sun) – ${format(addDays(weekSun, 6), "d MMM yyyy")} (Sat) &nbsp;·&nbsp; ${weekShifts.length} shift${weekShifts.length !== 1 ? "s" : ""}
          </div>
          ${buildCalendarGridHtml(weekSun, weekShifts, showStaff, showParticipant)}
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <style>
        @media print { @page { size: A4 landscape; margin: 10mm; } body { margin: 0; } .no-print { display: none !important; } }
        body { font-family: Arial, sans-serif; color: #1e293b; padding: 20px; font-size: 11px; }
        h1 { color: #1e3a5f; font-size: 18px; border-bottom: 3px solid #1e3a5f; padding-bottom: 6px; margin-bottom: 6px; }
        .meta { font-size: 11px; color: #475569; margin-bottom: 12px; }
        .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; }
        .legend { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; font-size: 9px; }
        .legend-item { display: flex; align-items: center; gap: 3px; }
        .legend-dot { width: 10px; height: 10px; border-radius: 2px; }
        .print-btn { position: fixed; top: 16px; right: 16px; padding: 8px 16px; background: #1e3a5f; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 12px; }
      </style>
    </head><body>
      <button class="print-btn no-print" onclick="window.print()">🖨 Print / Save PDF</button>
      <h1>Individual Roster — ${viewType === "staff" ? "Staff" : "Participant"} View</h1>
      <p class="meta"><strong>${viewType === "staff" ? "Staff Member" : "Participant"}:</strong> ${title} &nbsp;|&nbsp; <strong>Period:</strong> ${fromDate || "All"} → ${toDate || "All"} &nbsp;|&nbsp; <strong>Total Shifts:</strong> ${filtered.length} &nbsp;|&nbsp; <strong>Generated:</strong> ${new Date().toLocaleDateString("en-AU")}</p>
      <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background:#dbeafe;"></div> Scheduled</div>
        <div class="legend-item"><div class="legend-dot" style="background:#dcfce7;"></div> Confirmed</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f1f5f9;"></div> Completed</div>
        <div class="legend-item"><div class="legend-dot" style="background:#fee2e2;"></div> Cancelled</div>
        <div class="legend-item"><div class="legend-dot" style="background:#fef3c7;"></div> No Show</div>
      </div>
      ${filtered.length === 0 ? `<p style="color:#94a3b8;font-style:italic;">No shifts match the selected filters.</p>` : weeksHtml}
      <div class="footer">SZ-Jie Support Services — Individual Roster generated ${new Date().toLocaleDateString("en-AU")}.</div>
    </body></html>`;
    openReport(html);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <Label className="text-xs">View By</Label>
          <Select value={viewType} onValueChange={v => { setViewType(v); setSelectedName(""); }}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="staff">Staff Member</SelectItem>
              <SelectItem value="participant">Participant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">{viewType === "staff" ? "Staff Member" : "Participant"}</Label>
          <Select value={selectedName} onValueChange={setSelectedName}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All</SelectItem>
              {nameList.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">From</Label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" />
        </div>
        <div>
          <Label className="text-xs">To</Label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" />
        </div>
        <div className="flex items-end">
          <Button onClick={generate} className="w-full rounded-xl font-bold gap-2"><Printer size={15} /> Generate PDF</Button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-3 text-sm text-muted-foreground">
        <strong className="text-foreground">{filtered.length}</strong> shifts match · {selectedName || `All ${viewType === "staff" ? "staff" : "participants"}`} · {fromDate} → {toDate}
      </div>
    </div>
  );
}

// ─── REPORT CARDS ─────────────────────────────────────────────────────────────
const REPORT_CATEGORIES = [
  {
    category: "Finance",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    reports: [
      { id: "invoice-summary", label: "Invoice Summary Report", desc: "Filter by status/date, view by participant, generate PDF" },
    ]
  },
  {
    category: "Rostering",
    icon: Calendar,
    color: "text-blue-600",
    bg: "bg-blue-50",
    reports: [
      { id: "roster-team", label: "Weekly Team Roster", desc: "Full team view for a selected week" },
      { id: "roster-individual", label: "Individual Roster", desc: "Per-staff or per-participant, any date range" },
    ]
  },
  {
    category: "Other Reports",
    icon: FileText,
    color: "text-slate-600",
    bg: "bg-slate-50",
    reports: [
      { id: "ext-finance", label: "Finance Centre (BAS / Tax)", desc: "Full BAS and Accountant reports", link: "/dashboard/finance" },
      { id: "ext-payslips", label: "Payslips & Payroll", desc: "Generate payslips and payroll reconciliation", link: "/dashboard/payslips" },
      { id: "ext-kpi", label: "KPI Dashboard", desc: "Operational performance metrics", link: "/dashboard/kpi" },
    ]
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ReportsCentre() {
  const [selected, setSelected] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Invoice.list("-issue_date", 500),
      base44.entities.Shift.list("-date", 500),
      base44.entities.StaffMember.list(),
      base44.entities.Participant.list(),
    ]).then(([inv, sh, st, pa]) => {
      setInvoices(inv);
      setShifts(sh);
      setStaff(st);
      setParticipants(pa);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Reports Centre</h2>
        <p className="text-muted-foreground text-sm">Select a report to configure and generate a printable PDF.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && !selected && (
        <div className="space-y-6">
          {REPORT_CATEGORIES.map(cat => (
            <div key={cat.category}>
              <div className={`flex items-center gap-2 mb-3`}>
                <span className={`p-1.5 rounded-lg ${cat.bg}`}><cat.icon size={16} className={cat.color} /></span>
                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">{cat.category}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.reports.map(r => (
                  r.link ? (
                    <a key={r.id} href={r.link} className="group bg-card border border-border hover:border-primary rounded-2xl p-5 flex items-start justify-between gap-3 transition-all hover:shadow-sm">
                      <div>
                        <p className="font-black text-sm">{r.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary mt-1 shrink-0" />
                    </a>
                  ) : (
                    <button key={r.id} onClick={() => setSelected(r.id)} className="group bg-card border border-border hover:border-primary rounded-2xl p-5 flex items-start justify-between gap-3 text-left transition-all hover:shadow-sm">
                      <div>
                        <p className="font-black text-sm">{r.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary mt-1 shrink-0" />
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && selected && (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="text-primary font-bold text-sm hover:underline">← Back to Reports</button>
          <div className="bg-card border border-border rounded-2xl p-6">
            {selected === "invoice-summary" && (
              <>
                <h3 className="font-black text-lg mb-4 flex items-center gap-2"><DollarSign size={18} className="text-emerald-600" /> Invoice Summary Report</h3>
                <InvoiceSummaryReport invoices={invoices} />
              </>
            )}
            {selected === "roster-team" && (
              <>
                <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Users size={18} className="text-blue-600" /> Weekly Team Roster</h3>
                <RosterTeamReport shifts={shifts} />
              </>
            )}
            {selected === "roster-individual" && (
              <>
                <h3 className="font-black text-lg mb-4 flex items-center gap-2"><User size={18} className="text-blue-600" /> Individual Roster</h3>
                <RosterIndividualReport shifts={shifts} staff={staff} participants={participants} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}