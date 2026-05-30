import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, addDays, parseISO, isSameDay } from "date-fns";
import {
  Calendar, Banknote, ShieldCheck, ChevronLeft, ChevronRight,
  CheckCircle, AlertTriangle, XCircle, Clock, Download, Loader2, User
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Compliance Badge ──────────────────────────────────────────────────────────
function ComplianceBadge({ label, value, isDate }) {
  if (!value) return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Not Set</span>
    </div>
  );

  if (!isDate) {
    const colorMap = {
      Complete: "bg-emerald-100 text-emerald-700",
      "Due Soon": "bg-amber-100 text-amber-700",
      Overdue: "bg-rose-100 text-rose-700",
      Cleared: "bg-emerald-100 text-emerald-700",
      Pending: "bg-amber-100 text-amber-700",
      Expired: "bg-rose-100 text-rose-700",
      Active: "bg-emerald-100 text-emerald-700",
      "On Leave": "bg-amber-100 text-amber-700",
      Inactive: "bg-slate-100 text-slate-500",
    };
    const cls = colorMap[value] || "bg-slate-100 text-slate-600";
    return (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cls}`}>{value}</span>
      </div>
    );
  }

  // Date-based expiry check
  const days = Math.ceil((new Date(value) - new Date()) / 86400000);
  let icon, cls, note;
  if (days < 0) {
    icon = <XCircle size={14} className="text-rose-500" />;
    cls = "text-rose-600 font-black";
    note = "EXPIRED";
  } else if (days <= 30) {
    icon = <AlertTriangle size={14} className="text-amber-500" />;
    cls = "text-amber-600 font-black";
    note = `${days}d left`;
  } else {
    icon = <CheckCircle size={14} className="text-emerald-500" />;
    cls = "text-emerald-600 font-bold";
    note = `Valid`;
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className={`text-xs ${cls}`}>{format(parseISO(value), "d MMM yyyy")}</span>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${days < 0 ? "bg-rose-100 text-rose-700" : days <= 30 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{note}</span>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function StaffPortal() {
  const [user, setUser] = useState(null);
  const [staffRecord, setStaffRecord] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [tab, setTab] = useState("roster"); // roster | payslips | compliance

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);

      const [allStaff, allShifts, allPayslips] = await Promise.all([
        base44.entities.StaffMember.list(),
        base44.entities.Shift.list("-date", 500),
        base44.entities.PayslipRecord.list("-date_from", 200),
      ]);

      // Match staff record by name or email
      const myName = me?.full_name || "";
      const myEmail = me?.email || "";
      const matched = allStaff.find(
        s => s.name?.toLowerCase() === myName?.toLowerCase() || s.email?.toLowerCase() === myEmail?.toLowerCase()
      );

      setStaffRecord(matched || null);

      // Filter shifts and payslips to this staff member
      if (matched) {
        setShifts(allShifts.filter(s => s.staff_name === matched.name));
        setPayslips(allPayslips.filter(p => p.staff_name === matched.name));
      } else {
        // fallback: try matching by user's full_name directly in shift records
        setShifts(allShifts.filter(s => s.staff_name === myName));
        setPayslips(allPayslips.filter(p => p.staff_name === myName));
      }

      setLoading(false);
    }
    load();
  }, []);

  // Week roster
  const weekFrom = format(weekStart, "yyyy-MM-dd");
  const weekTo = format(addDays(weekStart, 6), "yyyy-MM-dd");
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekShifts = shifts.filter(s => (s.date || "") >= weekFrom && (s.date || "") <= weekTo);

  const statusColor = {
    Scheduled: "bg-blue-100 text-blue-700",
    Confirmed: "bg-emerald-100 text-emerald-700",
    Completed: "bg-slate-100 text-slate-600",
    Cancelled: "bg-rose-100 text-rose-700",
    "No Show": "bg-amber-100 text-amber-700",
  };

  const printPayslip = (p) => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <style>
        @media print { @page { size: A4; margin: 15mm; } .no-print { display: none !important; } }
        body { font-family: Arial, sans-serif; color: #1e293b; max-width: 700px; margin: 0 auto; padding: 28px; font-size: 12px; }
        h1 { color: #1e3a5f; font-size: 20px; border-bottom: 3px solid #1e3a5f; padding-bottom: 6px; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th { background: #1e3a5f; color: white; padding: 6px 10px; text-align: left; font-size: 11px; }
        td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        .total-row td { font-weight: 900; background: #dbeafe !important; }
        .meta { color: #475569; font-size: 11px; margin-bottom: 10px; }
        .print-btn { position: fixed; top: 16px; right: 16px; padding: 8px 16px; background: #1e3a5f; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }
      </style>
    </head><body>
      <button class="print-btn no-print" onclick="window.print()">🖨 Download / Print</button>
      <h1>Payslip — ${p.payslip_number || ""}</h1>
      <p class="meta"><strong>${p.staff_name}</strong> &nbsp;|&nbsp; Period: ${p.date_from} → ${p.date_to} &nbsp;|&nbsp; Pay: ${p.pay_period || "Weekly"}</p>
      <table><thead><tr><th>Date</th><th>Description</th><th>Code</th><th>Hrs</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>
        ${(p.line_items || []).map(l => `<tr><td>${l.date || ""}</td><td>${l.description || ""}</td><td>${l.item_code || ""}</td><td>${l.qty || ""}</td><td>$${(l.unit_price || 0).toFixed(2)}</td><td>$${(l.total || 0).toFixed(2)}</td></tr>`).join("")}
        <tr class="total-row"><td colspan="5">Gross Pay</td><td>$${(p.gross_pay || 0).toFixed(2)}</td></tr>
        <tr><td colspan="5">Tax Withheld</td><td>-$${(p.tax || 0).toFixed(2)}</td></tr>
        <tr><td colspan="5">Medicare Levy</td><td>-$${(p.medicare || 0).toFixed(2)}</td></tr>
        <tr><td colspan="5">Superannuation</td><td>$${(p.super_amount || 0).toFixed(2)}</td></tr>
        <tr class="total-row"><td colspan="5">NET PAY</td><td>$${(p.net_pay || 0).toFixed(2)}</td></tr>
      </tbody></table>
      ${p.bank_name ? `<p class="meta"><strong>Payment to:</strong> ${p.bank_account_name} &nbsp;|&nbsp; BSB: ${p.bank_bsb} &nbsp;|&nbsp; Acc: ${p.bank_account_number} (${p.bank_name})</p>` : ""}
      <p style="margin-top:20px;font-size:10px;color:#94a3b8;">SZ-Jie Support Services &nbsp;·&nbsp; Generated ${new Date().toLocaleDateString("en-AU")}</p>
    </body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
    </div>
  );

  const tabs = [
    { id: "roster", label: "My Roster", icon: Calendar },
    { id: "payslips", label: "My Payslips", icon: Banknote },
    { id: "compliance", label: "My Compliance", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl">
          {user?.full_name?.charAt(0) || <User size={24} />}
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">My Staff Portal</h2>
          <p className="text-muted-foreground text-sm">
            {user?.full_name || "Staff Member"} &nbsp;·&nbsp;
            {staffRecord ? <span className="text-emerald-600 font-bold">{staffRecord.role}</span> : <span className="text-amber-600 font-bold">Profile not matched — contact admin</span>}
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 bg-secondary p-1 rounded-2xl">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── ROSTER TAB ─────────────────────────────────────────────────────────── */}
      {tab === "roster" && (
        <div className="space-y-4">
          {/* Week nav */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setWeekStart(d => addDays(d, -7))} className="rounded-xl"><ChevronLeft size={16} /></Button>
            <span className="font-bold text-sm flex-1 text-center">
              {format(weekStart, "d MMM")} (Sun) – {format(addDays(weekStart, 6), "d MMM yyyy")} (Sat)
            </span>
            <Button variant="outline" size="icon" onClick={() => setWeekStart(d => addDays(d, 7))} className="rounded-xl"><ChevronRight size={16} /></Button>
          </div>

          {/* Day cards */}
          <div className="grid grid-cols-1 gap-3">
            {weekDays.map(day => {
              const dayShifts = weekShifts
                .filter(s => { try { return isSameDay(parseISO(s.date), day); } catch { return false; } })
                .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={`border rounded-2xl overflow-hidden ${isToday ? "border-primary shadow-sm" : "border-border"}`}>
                  <div className={`px-4 py-2 flex items-center justify-between ${isToday ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    <span className="font-black text-sm">{format(day, "EEEE, d MMMM")}</span>
                    {isToday && <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">TODAY</span>}
                    {dayShifts.length > 0 && !isToday && <span className="text-[10px] font-black text-muted-foreground">{dayShifts.length} shift{dayShifts.length > 1 ? "s" : ""}</span>}
                  </div>
                  {dayShifts.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground italic">No shifts</div>
                  ) : (
                    <div className="divide-y divide-border">
                      {dayShifts.map(s => (
                        <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Clock size={14} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{s.participant_name}</p>
                              <p className="text-xs text-muted-foreground">{s.start_time} – {s.end_time} &nbsp;·&nbsp; {s.support_type || "—"}</p>
                              {s.location && <p className="text-xs text-muted-foreground">{s.location}</p>}
                            </div>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${statusColor[s.status] || "bg-slate-100 text-slate-600"}`}>{s.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {weekShifts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground italic text-sm">No shifts rostered for this week.</div>
          )}
        </div>
      )}

      {/* ── PAYSLIPS TAB ───────────────────────────────────────────────────────── */}
      {tab === "payslips" && (
        <div className="space-y-4">
          {payslips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground italic text-sm bg-card border border-border rounded-2xl">No payslips found for your account.</div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <tr>
                    <th className="px-5 py-3 text-left">Payslip #</th>
                    <th className="px-5 py-3 text-left">Period</th>
                    <th className="px-5 py-3 text-right">Gross</th>
                    <th className="px-5 py-3 text-right">Tax</th>
                    <th className="px-5 py-3 text-right">Net Pay</th>
                    <th className="px-5 py-3 text-right">Super</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payslips.map(p => (
                    <tr key={p.id} className="hover:bg-secondary/40">
                      <td className="px-5 py-3 font-bold">{p.payslip_number || "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{p.date_from} → {p.date_to}</td>
                      <td className="px-5 py-3 text-right font-bold">${(p.gross_pay || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-right text-rose-600 text-xs">-${(p.tax || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-right font-black text-emerald-600">${(p.net_pay || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-right text-blue-600 text-xs">${(p.super_amount || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => printPayslip(p)} className="rounded-xl gap-1 text-xs font-bold">
                          <Download size={12} /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Totals summary */}
          {payslips.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Gross", value: payslips.reduce((a, p) => a + (p.gross_pay || 0), 0), color: "text-foreground" },
                { label: "Total Tax Paid", value: payslips.reduce((a, p) => a + (p.tax || 0), 0), color: "text-rose-600" },
                { label: "Total Net", value: payslips.reduce((a, p) => a + (p.net_pay || 0), 0), color: "text-emerald-600" },
                { label: "Total Super", value: payslips.reduce((a, p) => a + (p.super_amount || 0), 0), color: "text-blue-600" },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                  <p className={`text-lg font-black ${s.color}`}>${s.value.toFixed(2)}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── COMPLIANCE TAB ─────────────────────────────────────────────────────── */}
      {tab === "compliance" && (
        <div className="space-y-4">
          {!staffRecord ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <AlertTriangle size={32} className="text-amber-500 mx-auto mb-2" />
              <p className="font-black text-amber-800">Staff profile not matched</p>
              <p className="text-sm text-amber-600 mt-1">Your name or email doesn't match a staff record. Ask your admin to update your staff profile.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-1">
              <h3 className="font-black text-base mb-4">Compliance & Credentials</h3>
              <ComplianceBadge label="Employment Status" value={staffRecord.status} />
              <ComplianceBadge label="Training Status" value={staffRecord.training_status} />
              <ComplianceBadge label="Police Check" value={staffRecord.police_check} />
              <ComplianceBadge label="WWCC Expiry" value={staffRecord.wwcc_expiry} isDate />
              <ComplianceBadge label="First Aid Expiry" value={staffRecord.first_aid_expiry} isDate />

              <div className="pt-4 mt-4 border-t border-border space-y-1">
                <h3 className="font-black text-sm text-muted-foreground uppercase tracking-widest mb-3">Contact & Emergency</h3>
                {staffRecord.phone && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm font-bold">{staffRecord.phone}</span>
                  </div>
                )}
                {staffRecord.email && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-bold">{staffRecord.email}</span>
                  </div>
                )}
                {staffRecord.emergency_contact_name && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">Emergency Contact</span>
                    <span className="text-sm font-bold">{staffRecord.emergency_contact_name} · {staffRecord.emergency_contact_phone}</span>
                  </div>
                )}
              </div>

              {(staffRecord.bank_name || staffRecord.bank_bsb) && (
                <div className="pt-4 mt-2 border-t border-border space-y-1">
                  <h3 className="font-black text-sm text-muted-foreground uppercase tracking-widest mb-3">Banking on File</h3>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">Bank</span>
                    <span className="text-sm font-bold">{staffRecord.bank_name}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">BSB / Account</span>
                    <span className="text-sm font-bold">{staffRecord.bank_bsb} / {staffRecord.bank_account_number}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overall status summary */}
          {staffRecord && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "WWCC",
                  ok: staffRecord.wwcc_expiry && Math.ceil((new Date(staffRecord.wwcc_expiry) - new Date()) / 86400000) > 30,
                  warn: staffRecord.wwcc_expiry && Math.ceil((new Date(staffRecord.wwcc_expiry) - new Date()) / 86400000) <= 30,
                },
                {
                  label: "First Aid",
                  ok: staffRecord.first_aid_expiry && Math.ceil((new Date(staffRecord.first_aid_expiry) - new Date()) / 86400000) > 30,
                  warn: staffRecord.first_aid_expiry && Math.ceil((new Date(staffRecord.first_aid_expiry) - new Date()) / 86400000) <= 30,
                },
                {
                  label: "Police Check",
                  ok: staffRecord.police_check === "Cleared",
                  warn: staffRecord.police_check === "Pending",
                },
              ].map(item => (
                <div key={item.label} className={`rounded-2xl p-4 text-center border ${item.ok ? "bg-emerald-50 border-emerald-200" : item.warn ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200"}`}>
                  {item.ok ? <CheckCircle size={20} className="text-emerald-500 mx-auto mb-1" /> : item.warn ? <AlertTriangle size={20} className="text-amber-500 mx-auto mb-1" /> : <XCircle size={20} className="text-rose-500 mx-auto mb-1" />}
                  <p className="text-xs font-black">{item.label}</p>
                  <p className={`text-[10px] mt-0.5 ${item.ok ? "text-emerald-600" : item.warn ? "text-amber-600" : "text-rose-600"}`}>{item.ok ? "Valid" : item.warn ? "Action Needed" : "Missing"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}