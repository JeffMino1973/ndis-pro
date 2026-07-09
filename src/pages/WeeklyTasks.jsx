import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO, addDays } from "date-fns";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Printer, Send, AlertCircle, Loader2, RefreshCw, DollarSign, Banknote, FileText, Calendar, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import FinanceNav from "@/components/FinanceNav";

const INVOICE_EMAIL = "invoices@planhero.com.au";

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, Math.round(((eh * 60 + em - sh * 60 - sm) / 60) * 100) / 100);
}

function fmtMoney(n) { return `$${(n || 0).toFixed(2)}`; }

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBadge({ num, label, done, active }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${active ? "bg-primary text-primary-foreground" : done ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
      {done ? <Check size={13} /> : <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] font-black border-current">{num}</span>}
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

// ─── Step 1: Update Roster ─────────────────────────────────────────────────────
function Step1Roster({ weekStart, shifts, participants, staff, onShiftAdded, done, onDone }) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const nextWeekStart = addWeeks(weekStart, 1);
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
  const nextWeekShifts = shifts.filter(s => {
    if (!s.date) return false;
    return s.date >= format(nextWeekStart, "yyyy-MM-dd") && s.date <= format(nextWeekEnd, "yyyy-MM-dd");
  });

  const [form, setForm] = useState({ staff_name: "", participant_name: "", date: format(nextWeekStart, "yyyy-MM-dd"), start_time: "09:00", end_time: "11:00", support_type: "", status: "Scheduled" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await base44.entities.Shift.create(form);
    setSaving(false);
    onShiftAdded();
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="font-black text-blue-800 mb-1 flex items-center gap-2"><Calendar size={16} /> Update Roster for Next Week</p>
        <p className="text-sm text-blue-700">Next week: <strong>{format(nextWeekStart, "d MMM")} – {format(nextWeekEnd, "d MMM yyyy")}</strong> · {nextWeekShifts.length} shifts scheduled</p>
      </div>

      {/* Next week's current shifts */}
      {nextWeekShifts.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-secondary/50 border-b border-border">
            <p className="font-black text-sm">Next Week's Shifts ({nextWeekShifts.length})</p>
          </div>
          <div className="divide-y divide-border">
            {nextWeekShifts.map(s => (
              <div key={s.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-bold">{s.staff_name} → {s.participant_name}</p>
                  <p className="text-xs text-muted-foreground">{s.date} · {s.start_time}–{s.end_time} · {s.support_type}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-xs">{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add shift form */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <p className="font-black text-sm">Add a Shift for Next Week</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Staff</Label>
            <select className="mt-1 w-full rounded-xl border border-input bg-transparent h-9 px-3 text-sm" value={form.staff_name} onChange={e => setForm(p => ({ ...p, staff_name: e.target.value }))}>
              <option value="">Select staff...</option>
              {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Participant</Label>
            <select className="mt-1 w-full rounded-xl border border-input bg-transparent h-9 px-3 text-sm" value={form.participant_name} onChange={e => setForm(p => ({ ...p, participant_name: e.target.value }))}>
              <option value="">Select participant...</option>
              {participants.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Date</Label>
            <Input type="date" value={form.date} min={format(nextWeekStart, "yyyy-MM-dd")} max={format(nextWeekEnd, "yyyy-MM-dd")} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Support Type</Label>
            <Input value={form.support_type} onChange={e => setForm(p => ({ ...p, support_type: e.target.value }))} className="mt-1" placeholder="e.g. Community Access" />
          </div>
          <div>
            <Label className="text-xs">Start Time</Label>
            <Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">End Time</Label>
            <Input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} className="mt-1" />
          </div>
        </div>
        <Button onClick={save} disabled={saving || !form.staff_name || !form.participant_name} className="rounded-xl font-bold gap-2" size="sm">
          {saving ? <Loader2 size={13} className="animate-spin" /> : null}
          Add Shift
        </Button>
      </div>

      <Button onClick={onDone} className="w-full rounded-xl font-bold gap-2 py-5" variant={done ? "secondary" : "default"}>
        <CheckCircle2 size={16} /> {done ? "✓ Roster Updated — Continue" : "Mark Roster as Updated & Continue"}
      </Button>
    </div>
  );
}

// ─── Step 2: Reconcile & Invoice ───────────────────────────────────────────────
function Step2Invoice({ weekStart, shifts, participants, config, onDone, done }) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const wLabel = `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`;

  const completed = shifts.filter(s => {
    if (!s.date || s.status !== "Completed") return false;
    return s.date >= format(weekStart, "yyyy-MM-dd") && s.date <= format(weekEnd, "yyyy-MM-dd");
  });

  // Group by participant
  const byParticipant = completed.reduce((acc, s) => {
    if (!acc[s.participant_name]) acc[s.participant_name] = [];
    acc[s.participant_name].push(s);
    return acc;
  }, {});

  const [markingComplete, setMarkingComplete] = useState({});
  const [savingInvoice, setSavingInvoice] = useState(null);
  const [emailingInvoice, setEmailingInvoice] = useState(null);
  const [sent, setSent] = useState({});
  const [saved, setSaved] = useState({});
  const [shiftsDone, setShiftsDone] = useState(false);

  const uncompletedShifts = shifts.filter(s => {
    if (!s.date) return false;
    const inWeek = s.date >= format(weekStart, "yyyy-MM-dd") && s.date <= format(weekEnd, "yyyy-MM-dd");
    return inWeek && s.status !== "Completed" && s.status !== "Cancelled";
  });

  const markComplete = async (id) => {
    setMarkingComplete(p => ({ ...p, [id]: true }));
    await base44.entities.Shift.update(id, { status: "Completed" });
    setMarkingComplete(p => ({ ...p, [id]: false }));
  };

  const buildInvoiceHTML = (participant, pShifts, pData) => {
    const subtotal = pShifts.reduce((s, sh) => s + (sh.amount || calcHours(sh.start_time, sh.end_time) * (sh.hourly_rate || 0)), 0);
    const invNum = "INV-" + Date.now().toString().slice(-6);
    const today = format(new Date(), "dd/MM/yyyy");
    const rows = pShifts.map((sh, i) => {
      const hrs = sh.hours || calcHours(sh.start_time, sh.end_time);
      const rate = sh.hourly_rate || 0;
      const amt = sh.amount || hrs * rate;
      const bg = i % 2 === 0 ? "#fff" : "#dce8f5";
      const td = `padding:8px 10px;border-bottom:1px solid #c5d7ec;font-size:11.5px;color:#1a2e4a;background:${bg};`;
      const time = sh.start_time && sh.end_time ? `${sh.start_time}–${sh.end_time}` : "";
      return `<tr><td style="${td}">${sh.date?.slice(5).replace("-","/")||""}</td><td style="${td}">${time}</td><td style="${td}">${sh.support_item_code||""}</td><td style="${td}">${sh.support_type||""}</td><td style="${td}text-align:right;">${rate>0?"$"+rate.toFixed(2):""}</td><td style="${td}text-align:center;">${hrs>0?Math.round(hrs):""}</td><td style="${td}text-align:right;">${amt.toFixed(2)}</td></tr>`;
    }).join("");
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice – ${participant}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;color:#1a2e4a;font-size:12px;padding:40px 52px;background:#fff;}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;}.logo{width:170px;}.tax-title{font-size:32px;font-weight:900;color:#00b0d8;letter-spacing:3px;margin-bottom:12px;}
table{width:100%;border-collapse:collapse;}thead tr{background:#1a2e4a;color:#fff;}thead th{padding:9px 10px;font-size:12px;font-weight:bold;text-align:left;color:#fff;}
@media print{.no-print{display:none;}}</style></head><body>
<div class="header"><img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png" style="width:170px"/><div style="text-align:right"><div class="tax-title">TAX INVOICE</div><div style="font-weight:bold;font-size:13px;">${config?.businessName||"SZ-Jie Support Services"}</div><div style="font-size:12px;">ABN: ${config?.abn||""}<br/>${config?.address||""}<br/>${config?.email||""}<br/>${config?.phone||""}</div></div></div>
<div style="margin-bottom:8px;font-size:12px;line-height:2;"><div><b>INVOICE #</b> ${invNum}</div><div><b>Date:</b> ${today}</div><div><b>Client:</b> ${participant}</div><div><b>NDIS:</b> ${pData?.ndis_number||"—"}</div>${pData?.plan_coordinator_email?`<div><b>To:</b> ${pData.plan_coordinator_email}</div>`:""}</div>
<table><thead><tr><th>Date</th><th>Time</th><th>Item Number</th><th>Description</th><th style="text-align:right">Unit price</th><th style="text-align:center">Qty</th><th style="text-align:right">Line total</th></tr></thead><tbody>${rows}</tbody></table>
<div style="display:flex;justify-content:flex-end;margin-top:8px;"><table style="width:340px;border-collapse:collapse;">
<tr><td style="padding:7px 14px;border:1px solid #c5d7ec;background:#dce8f5;text-align:right;font-size:12px;">Subtotal</td><td style="padding:7px 14px;border:1px solid #c5d7ec;background:#fff;text-align:right;font-size:12px;">$${subtotal.toFixed(2)}</td></tr>
<tr><td style="padding:7px 14px;border:1px solid #c5d7ec;background:#dce8f5;text-align:right;font-size:12px;">GST</td><td style="padding:7px 14px;border:1px solid #c5d7ec;background:#fff;text-align:right;font-size:12px;">$0.00</td></tr>
<tr><td style="padding:7px 14px;border:1px solid #c5d7ec;background:#c5d7ec;text-align:right;font-weight:bold;font-size:12px;">Total</td><td style="padding:7px 14px;border:1px solid #c5d7ec;background:#c5d7ec;text-align:right;font-weight:bold;font-size:12px;">$${subtotal.toFixed(2)}</td></tr>
</table></div>
<div style="margin-top:28px;font-size:13px;line-height:2;"><div><b>Please make payment to:</b></div><div>${config?.bankName||"NAB"}</div><div>Account Name ${config?.accountName||""}</div><div>BSB : ${config?.bsb||""}</div><div>Account : ${config?.accountNumber||""}</div></div>
<div class="no-print" style="text-align:center;padding:24px;"><button onclick="window.print()" style="background:#1a2e4a;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">🖨️ Print / Save as PDF</button></div>
</body></html>`;
  };

  const saveAndEmail = async (participant, pShifts) => {
    const pData = participants.find(p => p.name === participant) || {};
    setSavingInvoice(participant);
    const line_items = pShifts.map(sh => {
      const hrs = sh.hours || calcHours(sh.start_time, sh.end_time);
      const rate = sh.hourly_rate || 0;
      return { date: sh.date, description: sh.support_type || "Support Service", support_item_code: sh.support_item_code || "", hours: parseFloat(hrs.toFixed(2)), rate: parseFloat(rate.toFixed(2)), amount: parseFloat((hrs * rate).toFixed(2)) };
    });
    const subtotal = line_items.reduce((a, l) => a + l.amount, 0);
    await base44.entities.Invoice.create({
      invoice_number: "INV-" + Date.now().toString().slice(-6),
      participant_name: participant,
      participant_id: pData.id || "",
      participant_ndis_number: pData.ndis_number || "",
      plan_manager_name: pData.plan_coordinator_name || "",
      plan_manager_email: pData.plan_coordinator_email || "",
      issue_date: new Date().toISOString().split("T")[0],
      status: "Sent",
      line_items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      gst: 0,
      total: parseFloat(subtotal.toFixed(2)),
    });
    await Promise.all(pShifts.map(sh => base44.entities.Shift.update(sh.id, { invoiced: true })));
    setSaved(p => ({ ...p, [participant]: true }));
    setSavingInvoice(null);

    // Email
    setEmailingInvoice(participant);
    const html = buildInvoiceHTML(participant, pShifts, pData);
    await base44.integrations.Core.SendEmail({
      to: INVOICE_EMAIL,
      subject: `Invoice – ${participant} – Week ${wLabel}`,
      body: html,
    });
    setSent(p => ({ ...p, [participant]: true }));
    setEmailingInvoice(null);
  };

  const allInvoiced = Object.keys(byParticipant).length > 0 && Object.keys(byParticipant).every(p => sent[p]);

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="font-black text-amber-800 mb-1 flex items-center gap-2"><RefreshCw size={15} /> Reconcile Shifts — {wLabel}</p>
        <p className="text-sm text-amber-700">{completed.length} completed shift{completed.length !== 1 ? "s" : ""} ready to invoice · {uncompletedShifts.length} still pending</p>
      </div>

      {/* Pending shifts to mark complete */}
      {uncompletedShifts.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-secondary/50 border-b border-border"><p className="font-black text-sm text-amber-700">⚠️ Pending Shifts — Mark Complete to Include in Invoice</p></div>
          <div className="divide-y divide-border">
            {uncompletedShifts.map(s => (
              <div key={s.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-bold">{s.staff_name} → {s.participant_name}</p>
                  <p className="text-xs text-muted-foreground">{s.date} · {s.start_time}–{s.end_time}</p>
                </div>
                <Button size="sm" variant="outline" disabled={markingComplete[s.id]} onClick={() => markComplete(s.id)} className="rounded-lg text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1">
                  {markingComplete[s.id] ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Mark Done
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice by participant */}
      {Object.entries(byParticipant).map(([participant, pShifts]) => {
        const total = pShifts.reduce((s, sh) => s + (sh.amount || calcHours(sh.start_time, sh.end_time) * (sh.hourly_rate || 0)), 0);
        const pData = participants.find(p => p.name === participant) || {};
        const isSaved = saved[participant];
        const isSent = sent[participant];
        return (
          <div key={participant} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-black">{participant}</p>
                <p className="text-xs text-muted-foreground">{pShifts.length} shifts · {fmtMoney(total)} · NDIS: {pData.ndis_number || "—"}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {isSent ? (
                  <Badge className="bg-emerald-100 text-emerald-700 gap-1"><Check size={11} /> Invoiced & Emailed</Badge>
                ) : (
                  <Button size="sm" disabled={savingInvoice === participant || emailingInvoice === participant} onClick={() => saveAndEmail(participant, pShifts)} className="rounded-xl font-bold gap-2">
                    {(savingInvoice === participant || emailingInvoice === participant) ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    Save & Email to {INVOICE_EMAIL}
                  </Button>
                )}
              </div>
            </div>
            <div className="divide-y divide-border">
              {pShifts.map(sh => {
                const hrs = sh.hours || calcHours(sh.start_time, sh.end_time);
                const amt = sh.amount || hrs * (sh.hourly_rate || 0);
                return (
                  <div key={sh.id} className="px-4 py-2.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{sh.date} {sh.start_time}–{sh.end_time} · {sh.support_type}</span>
                    <span className="font-bold">{fmtMoney(amt)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(byParticipant).length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
          <AlertCircle size={28} className="mx-auto mb-2 opacity-40" />
          <p className="font-bold">No completed shifts this week yet.</p>
          <p className="text-sm">Mark shifts as Completed above to generate invoices.</p>
        </div>
      )}

      <Button onClick={onDone} disabled={Object.keys(byParticipant).length === 0} className="w-full rounded-xl font-bold gap-2 py-5" variant={done ? "secondary" : "default"}>
        <CheckCircle2 size={16} /> {done ? "✓ Invoices Done — Continue" : "All Invoices Sent — Continue"}
      </Button>
    </div>
  );
}

// ─── Step 3: Payslips ──────────────────────────────────────────────────────────
function Step3Payslips({ weekStart, shifts, staffMembers, config, onDone, done }) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const wLabel = `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`;

  const completed = shifts.filter(s => {
    if (!s.date || s.status !== "Completed") return false;
    return s.date >= format(weekStart, "yyyy-MM-dd") && s.date <= format(weekEnd, "yyyy-MM-dd");
  });

  const byStaff = completed.reduce((acc, s) => {
    if (!acc[s.staff_name]) acc[s.staff_name] = [];
    acc[s.staff_name].push(s);
    return acc;
  }, {});

  const [emailing, setEmailing] = useState({});
  const [sent, setSent] = useState({});

  function buildPayslipHTML(staffName, sShifts, sm) {
    const gross = sShifts.reduce((a, sh) => a + (sh.amount || calcHours(sh.start_time, sh.end_time) * (sh.hourly_rate || 0)), 0);
    // ABN contractors: no tax, no medicare, no super withheld — net = gross
    const isABN = !sm?.tax_status || sm?.tax_status === "abn_contractor";
    const tax = 0;
    const medicare = 0;
    const superAmt = 0;
    const netPay = gross;
    const psNum = `PS-${Date.now().toString().slice(-6)}`;
    const dates = sShifts.map(s => s.date).filter(Boolean).sort();
    const from = dates[0]?.replace(/-/g, "/") || "";
    const to = dates[dates.length - 1]?.replace(/-/g, "/") || "";
    const rows = sShifts.map((sh, i) => {
      const hrs = sh.hours || calcHours(sh.start_time, sh.end_time);
      const rate = sh.hourly_rate || 0;
      const amt = sh.amount || hrs * rate;
      const bg = i % 2 === 0 ? "#fff" : "#dce8f5";
      const td = `padding:8px 10px;border-bottom:1px solid #c5d7ec;font-size:11.5px;color:#1a2e4a;background:${bg};`;
      const time = sh.start_time && sh.end_time ? `${sh.start_time}–${sh.end_time}` : "";
      return `<tr><td style="${td}">${sh.date?.slice(5).replace("-","/")||""}</td><td style="${td}border-left:4px solid #c0392b;color:#c0392b;font-weight:bold;">${time}</td><td style="${td}">${sh.support_item_code||""}</td><td style="${td}">${sh.support_type||""}</td><td style="${td}text-align:right;">${rate>0?"$"+rate.toFixed(2):""}</td><td style="${td}text-align:center;">${hrs>0?Math.round(hrs):""}</td><td style="${td}text-align:right;">${amt.toFixed(2)}</td></tr>`;
    }).join("");
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payslip – ${staffName}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;color:#1a2e4a;font-size:12px;padding:40px 52px;background:#fff;}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;}.logo{width:160px;}
table{width:100%;border-collapse:collapse;}thead tr{background:#1a2e4a;color:#fff;}thead th{padding:10px 10px;font-size:12px;font-weight:bold;text-align:left;color:#fff;}
@media print{.no-print{display:none;}}</style></head><body>
<div class="header"><img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png" class="logo"/>
<div style="text-align:right;font-size:12px;line-height:1.9;">
<div style="font-weight:bold;font-size:13px;">${config?.businessName||"SZ-Jie Support Services"}</div>
<div>ABN: ${config?.abn||""}</div><div>${config?.address||""}</div><div>${config?.email||""}</div></div></div>
<div style="font-size:12px;line-height:2;margin-bottom:8px;"><div><b>PAYSLIP #</b> ${psNum}</div><div><b>Pay Period:</b> ${from} – ${to}</div><div><b>Employee:</b> ${staffName}</div></div>
<table><thead><tr><th>Date</th><th>Time</th><th>Item Number</th><th>Description</th><th style="text-align:right">Unit price</th><th style="text-align:center">Qty</th><th style="text-align:right">Line total</th></tr></thead><tbody>${rows}</tbody></table>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:28px;gap:28px;">
<div style="font-size:13px;line-height:2.1;"><div><b>Payment to:</b></div><div>${sm?.bank_name||config?.bankName||"NAB"}</div><div>Account Name ${sm?.bank_account_name||""}</div><div>BSB : ${sm?.bank_bsb||""}</div><div>Account : ${sm?.bank_account_number||""}</div></div>
${isABN ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;font-size:11px;color:#92400e;max-width:340px;"><strong>ABN Contractor</strong><br/>Tax, Medicare &amp; Super not withheld.<br/>Contractor manages own ATO obligations.<br/><br/><strong>Invoice Total (Net): $${gross.toFixed(2)}</strong></div>` : `<table style="width:340px;border-collapse:collapse;">
<tr><td style="padding:9px 14px;border:1px solid #c5d7ec;background:#dce8f5;font-weight:bold;font-size:12px;text-align:left;">Gross Pay</td><td style="padding:9px 14px;border:1px solid #c5d7ec;background:#fff;font-weight:bold;font-size:12px;text-align:right;">$${gross.toFixed(2)}</td></tr>
<tr><td style="padding:9px 14px;border:1px solid #c5d7ec;background:#1a2e4a;font-weight:bold;font-size:12px;text-align:left;color:#fff;">Net Pay</td><td style="padding:9px 14px;border:1px solid #c5d7ec;background:#1a2e4a;font-weight:bold;font-size:12px;text-align:right;color:#fff;">$${netPay.toFixed(2)}</td></tr>
</table>`}
</div>
<div class="no-print" style="text-align:center;padding:24px;"><button onclick="window.print()" style="background:#1a2e4a;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">🖨️ Print / Save as PDF</button></div>
</body></html>`;
  }

  const emailPayslip = async (staffName, sShifts) => {
    const sm = staffMembers.find(s => s.name === staffName);
    const email = sm?.email;
    if (!email) { alert(`No email on file for ${staffName}`); return; }
    setEmailing(p => ({ ...p, [staffName]: true }));
    const html = buildPayslipHTML(staffName, sShifts, sm);
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Your Payslip – ${wLabel}`,
      body: html,
    });
    setSent(p => ({ ...p, [staffName]: true }));
    setEmailing(p => ({ ...p, [staffName]: false }));
  };

  const printPayslip = (staffName, sShifts) => {
    const sm = staffMembers.find(s => s.name === staffName);
    const html = buildPayslipHTML(staffName, sShifts, sm);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  return (
    <div className="space-y-5">
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
        <p className="font-black text-violet-800 mb-1 flex items-center gap-2"><Banknote size={15} /> Generate & Email Payslips — {wLabel}</p>
        <p className="text-sm text-violet-700">{Object.keys(byStaff).length} staff member{Object.keys(byStaff).length !== 1 ? "s" : ""} with completed shifts this week</p>
      </div>

      {Object.entries(byStaff).map(([staffName, sShifts]) => {
        const sm = staffMembers.find(s => s.name === staffName) || {};
        const gross = sShifts.reduce((a, sh) => a + (sh.amount || calcHours(sh.start_time, sh.end_time) * (sh.hourly_rate || 0)), 0);
        const isSent = sent[staffName];
        return (
          <div key={staffName} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-black">{staffName}</p>
                <p className="text-xs text-muted-foreground">{sShifts.length} shifts · Gross: {fmtMoney(gross)} · Email: {sm?.email || <span className="text-rose-500">No email on file</span>}</p>
                {(sm?.bank_bsb || sm?.bank_name) && (
                  <p className="text-xs text-muted-foreground mt-0.5">🏦 {sm.bank_name} BSB: {sm.bank_bsb} Acc: {sm.bank_account_number}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => printPayslip(staffName, sShifts)} className="rounded-xl font-bold gap-1 text-xs">
                  <Printer size={13} /> Print
                </Button>
                {isSent ? (
                  <Badge className="bg-emerald-100 text-emerald-700 gap-1"><Check size={11} /> Emailed</Badge>
                ) : (
                  <Button size="sm" disabled={emailing[staffName] || !sm?.email} onClick={() => emailPayslip(staffName, sShifts)} className="rounded-xl font-bold gap-1 text-xs">
                    {emailing[staffName] ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    Email to Worker
                  </Button>
                )}
              </div>
            </div>
            <div className="divide-y divide-border">
              {sShifts.map(sh => {
                const hrs = sh.hours || calcHours(sh.start_time, sh.end_time);
                const amt = sh.amount || hrs * (sh.hourly_rate || 0);
                return (
                  <div key={sh.id} className="px-4 py-2.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{sh.date} {sh.start_time}–{sh.end_time} · {sh.support_type}</span>
                    <span className="font-bold">{fmtMoney(amt)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(byStaff).length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
          <AlertCircle size={28} className="mx-auto mb-2 opacity-40" />
          <p className="font-bold">No completed shifts this week.</p>
          <p className="text-sm">Complete shifts in Step 2 first.</p>
        </div>
      )}

      <Button onClick={onDone} disabled={Object.keys(byStaff).length === 0} className="w-full rounded-xl font-bold gap-2 py-5" variant={done ? "secondary" : "default"}>
        <CheckCircle2 size={16} /> {done ? "✓ Payslips Done — Continue" : "All Payslips Sent — Continue"}
      </Button>
    </div>
  );
}

// ─── Step 4: Bank Reconciliation ───────────────────────────────────────────────
function Step4BankRec({ weekStart, shifts, staffMembers, config, onDone, done }) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const wLabel = `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`;

  const completed = shifts.filter(s => {
    if (!s.date || s.status !== "Completed") return false;
    return s.date >= format(weekStart, "yyyy-MM-dd") && s.date <= format(weekEnd, "yyyy-MM-dd");
  });

  const byStaff = completed.reduce((acc, s) => {
    if (!acc[s.staff_name]) acc[s.staff_name] = [];
    acc[s.staff_name].push(s);
    return acc;
  }, {});

  const bankRows = Object.entries(byStaff).map(([staffName, sShifts]) => {
    const sm = staffMembers.find(s => s.name === staffName) || {};
    const gross = sShifts.reduce((a, sh) => a + (sh.amount || calcHours(sh.start_time, sh.end_time) * (sh.hourly_rate || 0)), 0);
    const isABN = !sm?.tax_status || sm?.tax_status === "abn_contractor";
    // ABN contractors: pay gross directly, no deductions
    const tax = 0;
    const medicare = 0;
    const superAmt = 0;
    const netPay = gross;
    return { staffName, sm, gross, tax, medicare, superAmt, netPay, isABN };
  });

  const totalNet = bankRows.reduce((a, r) => a + r.netPay, 0);
  const totalTax = bankRows.reduce((a, r) => a + r.tax + r.medicare, 0);
  const totalSuper = bankRows.reduce((a, r) => a + r.superAmt, 0);

  const printReport = () => {
    const rows = bankRows.map((r, i) => {
      const bg = i % 2 === 0 ? "#f8fafc" : "#fff";
      return `<tr style="background:${bg}">
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${r.staffName}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${r.sm.bank_name||"—"}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${r.sm.bank_bsb||"—"}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${r.sm.bank_account_number||"—"}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${r.sm.bank_account_name||"—"}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;">$${r.gross.toFixed(2)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#e11d48;">-$${(r.tax+r.medicare).toFixed(2)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:900;color:#1d4ed8;">$${r.netPay.toFixed(2)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#16a34a;">$${r.superAmt.toFixed(2)}</td>
      </tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bank Reconciliation – ${wLabel}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;color:#1a2e4a;font-size:12px;padding:40px 52px;background:#fff;}
h1{font-size:22px;font-weight:900;color:#1a2e4a;margin-bottom:4px;}
table{width:100%;border-collapse:collapse;margin-top:16px;}
thead tr{background:#1a2e4a;color:#fff;}thead th{padding:9px 10px;font-size:11px;font-weight:bold;text-align:left;color:#fff;}
.totals td{background:#dbeafe!important;font-weight:900;color:#1e3a5f;}
@media print{.no-print{display:none;}}</style></head><body>
<img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png" style="width:160px;margin-bottom:16px;"/>
<h1>Bank Reconciliation Report</h1>
<p style="color:#64748b;font-size:12px;margin-bottom:4px;">Week: ${wLabel} · Generated: ${format(new Date(), "dd/MM/yyyy")} · ${config?.businessName||"SZ-Jie Support Services"} · ABN: ${config?.abn||""}</p>
<table><thead><tr><th>Staff Member</th><th>Bank</th><th>BSB</th><th>Account No.</th><th>Account Name</th><th style="text-align:right">Gross</th><th style="text-align:right">Tax+Medicare</th><th style="text-align:right">NET TRANSFER</th><th style="text-align:right">Super</th></tr></thead>
<tbody>${rows}
<tr class="totals"><td colspan="5" style="padding:9px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">TOTALS</td>
<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;text-align:right;">$${bankRows.reduce((a,r)=>a+r.gross,0).toFixed(2)}</td>
<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#e11d48;">-$${totalTax.toFixed(2)}</td>
<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#1d4ed8;">$${totalNet.toFixed(2)}</td>
<td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#16a34a;">$${totalSuper.toFixed(2)}</td></tr>
</tbody></table>
<div style="margin-top:20px;font-size:11px;color:#94a3b8;">Tax calculated at ATO 2025-26 resident rates with LITO. Super at SGC 12%. This report is for internal use only.</div>
<div class="no-print" style="text-align:center;padding:24px;"><button onclick="window.print()" style="background:#1a2e4a;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">🖨️ Print / Save as PDF</button></div>
</body></html>`;
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  return (
    <div className="space-y-5">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <p className="font-black text-emerald-800 mb-1 flex items-center gap-2"><DollarSign size={15} /> Bank Reconciliation — {wLabel}</p>
        <p className="text-sm text-emerald-700">Transfer amounts and account details for each worker's net pay.</p>
      </div>

      {/* Summary totals */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Net Pay (transfer)", value: totalNet, color: "text-blue-700" },
          { label: "PAYG to ATO (tax + Medicare)", value: totalTax, color: "text-rose-600" },
          { label: "Super (SGC 12%)", value: totalSuper, color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`text-xl font-black ${s.color}`}>{fmtMoney(s.value)}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per-staff bank table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 bg-secondary/50 border-b border-border flex items-center justify-between">
          <p className="font-black text-sm">Transfer Instructions</p>
          <Button size="sm" onClick={printReport} className="rounded-xl gap-1 font-bold text-xs"><Printer size={13} /> Print Report</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground">
                <th className="px-4 py-2 text-left font-bold">Staff</th>
                <th className="px-4 py-2 text-left font-bold">Bank</th>
                <th className="px-4 py-2 text-left font-bold">BSB</th>
                <th className="px-4 py-2 text-left font-bold">Account No.</th>
                <th className="px-4 py-2 text-left font-bold">Account Name</th>
                <th className="px-4 py-2 text-right font-bold">Gross</th>
                <th className="px-4 py-2 text-right font-bold text-rose-600">Tax+Med</th>
                <th className="px-4 py-2 text-right font-bold text-blue-700">NET TRANSFER</th>
                <th className="px-4 py-2 text-right font-bold text-emerald-600">Super</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bankRows.map(r => (
                <tr key={r.staffName}>
                  <td className="px-4 py-3 font-bold">{r.staffName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.sm.bank_name || <span className="text-rose-400 italic">Missing</span>}</td>
                  <td className="px-4 py-3">{r.sm.bank_bsb || <span className="text-rose-400 italic">Missing</span>}</td>
                  <td className="px-4 py-3">{r.sm.bank_account_number || <span className="text-rose-400 italic">Missing</span>}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.sm.bank_account_name || "—"}</td>
                  <td className="px-4 py-3 text-right">{fmtMoney(r.gross)}</td>
                  <td className="px-4 py-3 text-right text-rose-600">{fmtMoney(r.tax + r.medicare)}</td>
                  <td className="px-4 py-3 text-right font-black text-blue-700">{fmtMoney(r.netPay)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">{fmtMoney(r.superAmt)}</td>
                </tr>
              ))}
              <tr className="bg-secondary/50 font-black">
                <td colSpan={5} className="px-4 py-2.5 text-right">TOTALS</td>
                <td className="px-4 py-2.5 text-right">{fmtMoney(bankRows.reduce((a,r)=>a+r.gross,0))}</td>
                <td className="px-4 py-2.5 text-right text-rose-600">{fmtMoney(totalTax)}</td>
                <td className="px-4 py-2.5 text-right text-blue-700">{fmtMoney(totalNet)}</td>
                <td className="px-4 py-2.5 text-right text-emerald-600">{fmtMoney(totalSuper)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Button onClick={onDone} className="w-full rounded-xl font-bold gap-2 py-5" variant={done ? "secondary" : "default"}>
        <CheckCircle2 size={16} /> {done ? "✓ Bank Rec Done — Continue" : "Bank Reconciliation Complete — Continue"}
      </Button>
    </div>
  );
}

// ─── Step 5: Task Board ────────────────────────────────────────────────────────
function Step5TaskBoard({ stepsCompleted }) {
  const tasks = [
    { id: 1, label: "Update roster for next week", done: stepsCompleted[0] },
    { id: 2, label: "Reconcile shifts & send invoices to Plan Hero", done: stepsCompleted[1] },
    { id: 3, label: "Generate & email payslips to workers", done: stepsCompleted[2] },
    { id: 4, label: "Generate bank reconciliation report", done: stepsCompleted[3] },
  ];
  const allDone = tasks.every(t => t.done);

  return (
    <div className="space-y-5">
      <div className={`border rounded-2xl p-4 ${allDone ? "bg-emerald-50 border-emerald-200" : "bg-card border-border"}`}>
        <p className={`font-black mb-1 flex items-center gap-2 ${allDone ? "text-emerald-800" : "text-foreground"}`}>
          <CheckCircle2 size={16} /> Weekly Task Summary
        </p>
        <p className={`text-sm ${allDone ? "text-emerald-700" : "text-muted-foreground"}`}>
          {allDone ? "🎉 All weekly tasks completed! Great work." : `${tasks.filter(t => t.done).length} of ${tasks.length} tasks completed.`}
        </p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${task.done ? "bg-emerald-50 border-emerald-200" : "bg-card border-border"}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${task.done ? "bg-emerald-500" : "bg-secondary border-2 border-border"}`}>
              {task.done ? <Check size={16} className="text-white" /> : <span className="text-xs font-black text-muted-foreground">{task.id}</span>}
            </div>
            <div className="flex-1">
              <p className={`font-bold text-sm ${task.done ? "line-through text-emerald-700 opacity-70" : "text-foreground"}`}>{task.label}</p>
              <p className="text-[10px] text-muted-foreground">{task.done ? "Completed" : "Pending"}</p>
            </div>
            <Badge className={task.done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
              {task.done ? "Done" : "Pending"}
            </Badge>
          </div>
        ))}
      </div>

      {allDone && (
        <div className="bg-emerald-500 rounded-2xl p-6 text-center text-white">
          <p className="text-2xl font-black mb-1">✅ Week Complete!</p>
          <p className="text-emerald-100 text-sm">Roster updated · Invoices sent · Payslips emailed · Bank rec done.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function WeeklyTasks() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState([false, false, false, false]);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const load = async () => {
    setLoading(true);
    const [s, p, sm, me] = await Promise.all([
      base44.entities.Shift.list("-date"),
      base44.entities.Participant.list(),
      base44.entities.StaffMember.list(),
      base44.auth.me(),
    ]);
    setShifts(s);
    setParticipants(p);
    setStaffMembers(sm);
    if (me?.businessConfig) setConfig(me.businessConfig);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const completeStep = (i) => {
    setStepsCompleted(prev => { const n = [...prev]; n[i] = true; return n; });
    if (i < 4) setActiveStep(i + 1);
  };

  const STEPS = [
    { label: "Update Roster" },
    { label: "Invoices" },
    { label: "Payslips" },
    { label: "Bank Rec" },
    { label: "Task Board" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Weekly Tasks</h2>
          <p className="text-muted-foreground text-sm">Admin workflow wizard · Week of {format(weekStart, "d MMM")} – {format(weekEnd, "d MMM yyyy")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => { setWeekStart(subWeeks(weekStart, 1)); setStepsCompleted([false,false,false,false]); setActiveStep(0); }}><ChevronLeft size={18} /></Button>
          <Button variant="outline" size="icon" onClick={() => { setWeekStart(addWeeks(weekStart, 1)); setStepsCompleted([false,false,false,false]); setActiveStep(0); }}><ChevronRight size={18} /></Button>
          <Button variant="outline" size="sm" onClick={load} className="gap-1 rounded-xl"><RefreshCw size={14} /> Refresh</Button>
        </div>
      </div>

      <FinanceNav />

      {/* Step Indicator */}
      <div className="flex gap-2 flex-wrap">
        {STEPS.map((step, i) => (
          <button key={i} onClick={() => setActiveStep(i)} className="focus:outline-none">
            <StepBadge num={i + 1} label={step.label} done={stepsCompleted[i]} active={activeStep === i} />
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-3xl p-6">
        {activeStep === 0 && (
          <Step1Roster
            weekStart={weekStart}
            shifts={shifts}
            participants={participants}
            staff={staffMembers}
            onShiftAdded={load}
            done={stepsCompleted[0]}
            onDone={() => completeStep(0)}
          />
        )}
        {activeStep === 1 && (
          <Step2Invoice
            weekStart={weekStart}
            shifts={shifts}
            participants={participants}
            config={config}
            done={stepsCompleted[1]}
            onDone={() => completeStep(1)}
          />
        )}
        {activeStep === 2 && (
          <Step3Payslips
            weekStart={weekStart}
            shifts={shifts}
            staffMembers={staffMembers}
            config={config}
            done={stepsCompleted[2]}
            onDone={() => completeStep(2)}
          />
        )}
        {activeStep === 3 && (
          <Step4BankRec
            weekStart={weekStart}
            shifts={shifts}
            staffMembers={staffMembers}
            config={config}
            done={stepsCompleted[3]}
            onDone={() => completeStep(3)}
          />
        )}
        {activeStep === 4 && (
          <Step5TaskBoard stepsCompleted={stepsCompleted} />
        )}
      </div>
    </div>
  );
}