import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { FileText, DollarSign, Users, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Send, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const h = (eh * 60 + em - sh * 60 - sm) / 60;
  return Math.max(0, Math.round(h * 100) / 100);
}

function formatCurrency(n) {
  return `$${(n || 0).toFixed(2)}`;
}

function printHTML(html) {
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

function buildInvoiceHTML(participant, shifts, participants) {
  const pData = participants.find(p => p.name === participant) || {};
  const total = shifts.reduce((s, sh) => s + (sh.amount || (calcHours(sh.start_time, sh.end_time) * (sh.hourly_rate || 0))), 0);
  const rows = shifts.map(sh => {
    const hrs = sh.hours || calcHours(sh.start_time, sh.end_time);
    const rate = sh.hourly_rate || 0;
    const amt = sh.amount || hrs * rate;
    return `<tr><td>${sh.date}</td><td>${sh.support_type || ""}</td><td>${sh.support_item_code || ""}</td><td>${hrs.toFixed(2)}</td><td>$${rate.toFixed(2)}</td><td>$${amt.toFixed(2)}</td></tr>`;
  }).join("");
  const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
  const today = format(new Date(), "dd/MM/yyyy");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice – ${participant}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;color:#1e293b;font-size:13px;padding:28px 36px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid #e2e8f0;}
  .logo{width:140px;}.contact{text-align:right;font-size:11px;color:#475569;line-height:1.75;}
  h1{font-size:30px;font-weight:900;color:#06b6d4;text-transform:uppercase;margin-bottom:4px;}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:16px;}
  .mc{padding:8px 14px;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;}
  .mc:nth-child(even){border-right:none;}.mc:nth-last-child(-n+2){border-bottom:none;}
  .ml{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
  .mv{font-size:13px;font-weight:bold;}
  table{width:100%;border-collapse:collapse;margin-bottom:12px;}
  thead tr{background:#1e293b;color:white;}
  thead th{padding:8px 10px;font-size:11px;text-align:left;}
  tbody tr{border-bottom:1px solid #f1f5f9;}
  tbody td{padding:8px 10px;font-size:12px;}
  .total-row{font-weight:bold;font-size:14px;text-align:right;padding:10px 10px;border-top:2px solid #1e293b;}
  .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;}
  .status-badge{display:inline-block;background:#fef9c3;color:#854d0e;font-size:10px;font-weight:bold;padding:2px 10px;border-radius:10px;margin-left:8px;}
  @media print{.no-print{display:none;}}
  </style></head><body>
  <div class="header">
    <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png" class="logo" />
    <div class="contact"><div>SZ-JIE Support Services</div><div>ABN: 86959042971</div><div>309/12 Broome St, Waterloo NSW 2017</div><div>jeff@szjiesupportservices.com</div><div>0401 343 876</div></div>
  </div>
  <h1>Invoice <span class="status-badge">Draft</span></h1>
  <p style="font-size:12px;color:#64748b;margin-bottom:16px;">${invoiceNum} · Issued: ${today}</p>
  <div class="meta">
    <div class="mc"><div class="ml">Bill To</div><div class="mv">${participant}</div></div>
    <div class="mc"><div class="ml">NDIS Number</div><div class="mv">${pData.ndis_number || "—"}</div></div>
    <div class="mc"><div class="ml">Plan Manager</div><div class="mv">${pData.plan_coordinator_name || "—"}</div></div>
    <div class="mc"><div class="ml">Plan Manager Email</div><div class="mv">${pData.plan_coordinator_email || "—"}</div></div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Description</th><th>Item Code</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total-row">Total: ${formatCurrency(total)}</div>
  <div class="footer">SZ-JIE Support Services · ABN 86959042971 · This invoice was generated from completed roster shifts.</div>
  <div class="no-print" style="text-align:center;padding:16px;">
    <button onclick="window.print()" style="background:linear-gradient(90deg,#06b6d4,#6366f1);color:white;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">🖨️ Print / Save as PDF</button>
  </div>
  </body></html>`;
}

function buildPayslipHTML(staffName, shifts, staffMembers) {
  const sm = staffMembers.find(s => s.name === staffName) || {};
  const grossPay = shifts.reduce((s, sh) => s + (sh.amount || calcHours(sh.start_time, sh.end_time) * (sh.hourly_rate || 0)), 0);
  const rows = shifts.map(sh => {
    const hrs = sh.hours || calcHours(sh.start_time, sh.end_time);
    const rate = sh.hourly_rate || 0;
    const amt = sh.amount || hrs * rate;
    return `<tr><td>${sh.date}</td><td>${sh.start_time}–${sh.end_time}</td><td>${sh.support_type || ""}</td><td>${sh.participant_name}</td><td>${hrs.toFixed(2)}</td><td>$${rate.toFixed(2)}</td><td>$${amt.toFixed(2)}</td></tr>`;
  }).join("");
  const dates = shifts.map(s => s.date).sort();
  const from = dates[0] || "";
  const to = dates[dates.length - 1] || "";
  const payslipNum = `PAY-${Date.now().toString().slice(-6)}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payslip – ${staffName}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;color:#1e293b;font-size:13px;padding:28px 36px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid #e2e8f0;}
  .logo{width:140px;}.contact{text-align:right;font-size:11px;color:#475569;line-height:1.75;}
  h1{font-size:28px;font-weight:900;color:#1e293b;text-transform:uppercase;margin-bottom:4px;}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;}
  .box{border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px;}
  .bl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;}
  .bv{font-size:13px;font-weight:bold;color:#1e293b;}
  .bv.green{color:#16a34a;font-size:20px;}
  table{width:100%;border-collapse:collapse;margin-bottom:12px;}
  thead tr{background:#1e293b;color:white;}
  thead th{padding:8px 10px;font-size:10.5px;text-align:left;}
  tbody tr{border-bottom:1px solid #f1f5f9;}
  tbody td{padding:7px 10px;font-size:12px;}
  .sec{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#64748b;margin:14px 0 6px;}
  .bank-row{display:flex;gap:8px;flex-wrap:wrap;}
  .bank-cell{flex:1;min-width:120px;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;}
  .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;}
  @media print{.no-print{display:none;}}
  </style></head><body>
  <div class="header">
    <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png" class="logo" />
    <div class="contact"><div>SZ-JIE Support Services</div><div>ABN: 86959042971</div><div>309/12 Broome St, Waterloo NSW 2017</div><div>jeff@szjiesupportservices.com</div><div>0401 343 876</div></div>
  </div>
  <h1>Payslip</h1>
  <p style="font-size:12px;color:#64748b;margin-bottom:16px;">${payslipNum} · Pay Period: ${from} to ${to}</p>
  <div class="grid2">
    <div class="box"><div class="bl">Employee</div><div class="bv">${staffName}</div></div>
    <div class="box"><div class="bl">Gross Pay</div><div class="bv green">${formatCurrency(grossPay)}</div></div>
    <div class="box"><div class="bl">Email</div><div class="bv">${sm.email || "—"}</div></div>
    <div class="box"><div class="bl">Phone</div><div class="bv">${sm.phone || "—"}</div></div>
    <div class="box"><div class="bl">TFN</div><div class="bv">${sm.tfn || "—"}</div></div>
    <div class="box"><div class="bl">ABN</div><div class="bv">${sm.abn || "—"}</div></div>
  </div>
  <div class="sec">Shift Line Items</div>
  <table>
    <thead><tr><th>Date</th><th>Time</th><th>Support Type</th><th>Participant</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="sec">Bank Details</div>
  <div class="bank-row">
    <div class="bank-cell"><div class="bl">Bank</div><div class="bv">${sm.bank_name || "—"}</div></div>
    <div class="bank-cell"><div class="bl">Account Name</div><div class="bv">${sm.bank_account_name || "—"}</div></div>
    <div class="bank-cell"><div class="bl">BSB</div><div class="bv">${sm.bank_bsb || "—"}</div></div>
    <div class="bank-cell"><div class="bl">Account Number</div><div class="bv">${sm.bank_account_number || "—"}</div></div>
  </div>
  <div class="footer">SZ-JIE Support Services · Confidential Payslip · Generated from completed roster shifts.</div>
  <div class="no-print" style="text-align:center;padding:16px;">
    <button onclick="window.print()" style="background:linear-gradient(90deg,#06b6d4,#6366f1);color:white;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">🖨️ Print / Save as PDF</button>
  </div>
  </body></html>`;
}

export default function RosterBilling() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekLabel = `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`;

  const load = async () => {
    setLoading(true);
    const [s, p, sm] = await Promise.all([
      base44.entities.Shift.list("-date"),
      base44.entities.Participant.list(),
      base44.entities.StaffMember.list(),
    ]);
    setShifts(s);
    setParticipants(p);
    setStaffMembers(sm);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const weekShifts = shifts.filter(s => {
    if (!s.date) return false;
    const d = parseISO(s.date);
    return d >= weekStart && d <= weekEnd;
  });

  const completedShifts = weekShifts.filter(s => s.status === "Completed");
  const pendingShifts = weekShifts.filter(s => s.status !== "Completed" && s.status !== "Cancelled");

  // Group completed by participant for invoices
  const byParticipant = completedShifts.reduce((acc, s) => {
    if (!acc[s.participant_name]) acc[s.participant_name] = [];
    acc[s.participant_name].push(s);
    return acc;
  }, {});

  // Group completed by staff for payslips
  const byStaff = completedShifts.reduce((acc, s) => {
    if (!acc[s.staff_name]) acc[s.staff_name] = [];
    acc[s.staff_name].push(s);
    return acc;
  }, {});

  const totalBillable = completedShifts.reduce((s, sh) => {
    return s + (sh.amount || calcHours(sh.start_time, sh.end_time) * (sh.hourly_rate || 0));
  }, 0);

  const markComplete = async (id) => {
    await base44.entities.Shift.update(id, { status: "Completed" });
    load();
  };

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
          <h2 className="text-3xl font-black tracking-tight">Roster Billing</h2>
          <p className="text-muted-foreground text-sm">Completed shifts auto-populate invoices and payslips ready to send.</p>
        </div>
        <Button variant="outline" onClick={load} className="gap-2 rounded-xl">
          <RefreshCw size={15} /> Refresh
        </Button>
      </div>

      {/* Week Selector */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}><ChevronLeft size={18} /></Button>
        <div className="font-black text-foreground">{weekLabel}</div>
        <Button variant="outline" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}><ChevronRight size={18} /></Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-primary">{weekShifts.length}</div>
          <div className="text-xs text-muted-foreground font-bold mt-1">Total Shifts</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-600">{completedShifts.length}</div>
          <div className="text-xs text-muted-foreground font-bold mt-1">Completed</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-amber-500">{pendingShifts.length}</div>
          <div className="text-xs text-muted-foreground font-bold mt-1">Pending</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-blue-600">{formatCurrency(totalBillable)}</div>
          <div className="text-xs text-muted-foreground font-bold mt-1">Billable Total</div>
        </div>
      </div>

      <Tabs defaultValue="shifts">
        <TabsList className="rounded-xl">
          <TabsTrigger value="shifts" className="rounded-lg">Shifts This Week</TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-lg">Invoices ({Object.keys(byParticipant).length})</TabsTrigger>
          <TabsTrigger value="payslips" className="rounded-lg">Payslips ({Object.keys(byStaff).length})</TabsTrigger>
        </TabsList>

        {/* SHIFTS TAB */}
        <TabsContent value="shifts" className="mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <h3 className="font-black text-sm">All Shifts – {weekLabel}</h3>
              <p className="text-xs text-muted-foreground">Mark shifts complete to include them in invoices and payslips.</p>
            </div>
            <div className="divide-y divide-border">
              {weekShifts.length === 0 && (
                <p className="p-8 text-center text-muted-foreground text-sm italic">No shifts scheduled for this week.</p>
              )}
              {weekShifts.map(s => {
                const hrs = calcHours(s.start_time, s.end_time);
                const amt = s.amount || hrs * (s.hourly_rate || 0);
                const isComplete = s.status === "Completed";
                return (
                  <div key={s.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-10 rounded-full flex-shrink-0 ${isComplete ? "bg-emerald-400" : s.status === "Cancelled" ? "bg-rose-400" : "bg-blue-400"}`} />
                      <div>
                        <p className="font-bold text-sm">{s.staff_name} → {s.participant_name}</p>
                        <p className="text-xs text-muted-foreground">{s.date} · {s.start_time}–{s.end_time} · {s.support_type}</p>
                        <p className="text-xs text-muted-foreground">{hrs.toFixed(2)} hrs {s.hourly_rate ? `· ${formatCurrency(s.hourly_rate)}/hr · ${formatCurrency(amt)}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={
                        isComplete ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        s.status === "Cancelled" ? "bg-rose-100 text-rose-700" :
                        "bg-blue-100 text-blue-700 border-blue-200"
                      }>{s.status}</Badge>
                      {!isComplete && s.status !== "Cancelled" && (
                        <Button size="sm" variant="outline" onClick={() => markComplete(s.id)} className="gap-1 rounded-lg text-xs font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                          <CheckCircle size={13} /> Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* INVOICES TAB */}
        <TabsContent value="invoices" className="mt-4">
          {Object.keys(byParticipant).length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <AlertCircle size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-bold text-muted-foreground">No completed shifts yet this week.</p>
              <p className="text-xs text-muted-foreground mt-1">Mark shifts as Completed to generate invoices here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(byParticipant).map(([participant, pShifts]) => {
                const total = pShifts.reduce((s, sh) => s + (sh.amount || calcHours(sh.start_time, sh.end_time) * (sh.hourly_rate || 0)), 0);
                const pData = participants.find(p => p.name === participant) || {};
                return (
                  <div key={participant} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FileText size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-black">{participant}</p>
                          <p className="text-xs text-muted-foreground">NDIS: {pData.ndis_number || "—"} · {pShifts.length} shift{pShifts.length !== 1 ? "s" : ""} · {formatCurrency(total)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-2 rounded-xl font-bold" onClick={() => printHTML(buildInvoiceHTML(participant, pShifts, participants))}>
                          <Printer size={14} /> Print Invoice
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-secondary/50 text-muted-foreground">
                            <th className="px-4 py-2 text-left font-bold">Date</th>
                            <th className="px-4 py-2 text-left font-bold">Staff</th>
                            <th className="px-4 py-2 text-left font-bold">Support Type</th>
                            <th className="px-4 py-2 text-left font-bold">Item Code</th>
                            <th className="px-4 py-2 text-right font-bold">Hours</th>
                            <th className="px-4 py-2 text-right font-bold">Rate</th>
                            <th className="px-4 py-2 text-right font-bold">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {pShifts.map(sh => {
                            const hrs = sh.hours || calcHours(sh.start_time, sh.end_time);
                            const rate = sh.hourly_rate || 0;
                            const amt = sh.amount || hrs * rate;
                            return (
                              <tr key={sh.id}>
                                <td className="px-4 py-2.5">{sh.date}</td>
                                <td className="px-4 py-2.5">{sh.staff_name}</td>
                                <td className="px-4 py-2.5">{sh.support_type || "—"}</td>
                                <td className="px-4 py-2.5">{sh.support_item_code || "—"}</td>
                                <td className="px-4 py-2.5 text-right">{hrs.toFixed(2)}</td>
                                <td className="px-4 py-2.5 text-right">{formatCurrency(rate)}</td>
                                <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(amt)}</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-secondary/30">
                            <td colSpan={6} className="px-4 py-2.5 text-right font-black text-sm">Total</td>
                            <td className="px-4 py-2.5 text-right font-black text-sm text-primary">{formatCurrency(total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* PAYSLIPS TAB */}
        <TabsContent value="payslips" className="mt-4">
          {Object.keys(byStaff).length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <AlertCircle size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-bold text-muted-foreground">No completed shifts yet this week.</p>
              <p className="text-xs text-muted-foreground mt-1">Mark shifts as Completed to generate payslips here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(byStaff).map(([staffName, sShifts]) => {
                const grossPay = sShifts.reduce((s, sh) => s + (sh.amount || calcHours(sh.start_time, sh.end_time) * (sh.hourly_rate || 0)), 0);
                const sm = staffMembers.find(s => s.name === staffName) || {};
                return (
                  <div key={staffName} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <DollarSign size={18} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-black">{staffName}</p>
                          <p className="text-xs text-muted-foreground">{sShifts.length} shift{sShifts.length !== 1 ? "s" : ""} · Gross: <span className="font-bold text-emerald-600">{formatCurrency(grossPay)}</span></p>
                          {sm.bank_bsb && <p className="text-xs text-muted-foreground">BSB: {sm.bank_bsb} · Acc: {sm.bank_account_number}</p>}
                        </div>
                      </div>
                      <Button size="sm" className="gap-2 rounded-xl font-bold" onClick={() => printHTML(buildPayslipHTML(staffName, sShifts, staffMembers))}>
                        <Printer size={14} /> Print Payslip
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-secondary/50 text-muted-foreground">
                            <th className="px-4 py-2 text-left font-bold">Date</th>
                            <th className="px-4 py-2 text-left font-bold">Time</th>
                            <th className="px-4 py-2 text-left font-bold">Participant</th>
                            <th className="px-4 py-2 text-left font-bold">Support Type</th>
                            <th className="px-4 py-2 text-right font-bold">Hours</th>
                            <th className="px-4 py-2 text-right font-bold">Rate</th>
                            <th className="px-4 py-2 text-right font-bold">Pay</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sShifts.map(sh => {
                            const hrs = sh.hours || calcHours(sh.start_time, sh.end_time);
                            const rate = sh.hourly_rate || 0;
                            const amt = sh.amount || hrs * rate;
                            return (
                              <tr key={sh.id}>
                                <td className="px-4 py-2.5">{sh.date}</td>
                                <td className="px-4 py-2.5">{sh.start_time}–{sh.end_time}</td>
                                <td className="px-4 py-2.5">{sh.participant_name}</td>
                                <td className="px-4 py-2.5">{sh.support_type || "—"}</td>
                                <td className="px-4 py-2.5 text-right">{hrs.toFixed(2)}</td>
                                <td className="px-4 py-2.5 text-right">{formatCurrency(rate)}</td>
                                <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(amt)}</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-secondary/30">
                            <td colSpan={6} className="px-4 py-2.5 text-right font-black text-sm">Gross Pay</td>
                            <td className="px-4 py-2.5 text-right font-black text-sm text-emerald-600">{formatCurrency(grossPay)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}