import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import {
  Calendar, Banknote, ShieldCheck,
  CheckCircle, AlertTriangle, XCircle, Loader2, User, FileText, ExternalLink, Upload,
  ClipboardList, Pill, Brain, Heart, Activity, BarChart3, Shield, BookOpen, UserCircle
} from "lucide-react";
import PolicyManualViewer from "@/components/PolicyManualViewer";
import { Button } from "@/components/ui/button";
import WeeklyCalendar from "@/components/staffportal/WeeklyCalendar";
import StaffMyProfile from "@/components/staffportal/StaffMyProfile";
import StaffComplianceDocs from "@/components/staffportal/StaffComplianceDocs";
import JeffreyProfile from "@/pages/JeffreyProfile";
import TobyProfile from "@/pages/TobyProfile";

// ─── All possible portal feature tabs ──────────────────────────────────────────
export const ALL_PORTAL_FEATURES = [
  { id: "progress_notes",   label: "Progress Notes",        icon: FileText,      path: "/dashboard/progress-notes" },
  { id: "medications",      label: "Medication Dashboard",  icon: Pill,          path: "/dashboard/medications" },
  { id: "medication_hub",   label: "Medication Forms Hub",  icon: ClipboardList, path: "/dashboard/medication-hub" },
  { id: "epilepsy_plans",   label: "Epilepsy Plans",        icon: Brain,         path: "/dashboard/epilepsy-plans" },
  { id: "health_plans",     label: "Health Support Plans",  icon: Heart,         path: "/dashboard/health-care-plans" },
  { id: "impl_programs",    label: "Implementation Programs", icon: Activity,    path: "/dashboard/implementation-programs" },
  { id: "behaviour_continuum", label: "Behaviour Continuum", icon: BarChart3,    path: "/dashboard/behaviour-continuum" },
  { id: "behaviour_support", label: "Behaviour Support Plans", icon: Brain,      path: "/dashboard/behaviour-support-plans" },
  { id: "pbs_plans",        label: "PBS Plans",             icon: Heart,         path: "/dashboard/positive-behaviour-support-plans" },
  { id: "staff_compliance", label: "Staff & Compliance",    icon: ShieldCheck,   path: "/dashboard/staff" },
  { id: "risk_assessments", label: "Risk Assessments",      icon: AlertTriangle, path: "/dashboard/risk-assessments" },
  { id: "incidents",        label: "Incidents",             icon: Shield,        path: "/dashboard/incidents" },
  { id: "policy_manual",    label: "Policy & Compliance Manual", icon: BookOpen, path: "/dashboard/policy-manual" },
];

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

  const days = Math.ceil((new Date(value) - new Date()) / 86400000);
  let icon, cls, note;
  if (days < 0) {
    // expired
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
    note = "Valid";
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
  const [linkedParticipants, setLinkedParticipants] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [bizDocs, setBizDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("roster");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: "", category: "Other", issued_by: "", expiry_date: "", notes: "" });
  const [showAddDoc, setShowAddDoc] = useState(false);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);

      const [allStaff, allShifts, allPayslips, allBizDocs, allParticipants] = await Promise.all([
        base44.entities.StaffMember.list(),
        base44.entities.Shift.list("-date", 500),
        base44.entities.PayslipRecord.list("-date_from", 200),
        base44.entities.BusinessDocument.list("-created_date"),
        base44.entities.Participant.list(),
      ]);
      setBizDocs(allBizDocs);

      const myName = me?.full_name || "";
      const myEmail = me?.email || "";
      const matched = allStaff.find(
        s => s.name?.toLowerCase() === myName?.toLowerCase() || s.email?.toLowerCase() === myEmail?.toLowerCase()
      );
      setStaffRecord(matched || null);

      // Linked participants
      if (matched?.linked_participant_ids?.length) {
        setLinkedParticipants(allParticipants.filter(p => matched.linked_participant_ids.includes(p.id)));
      }

      const matchName = (matched?.name || myName || "").toLowerCase().trim();
      const ci = (a, b) => (a || "").toLowerCase().trim() === b;
      if (matched) {
        setShifts(allShifts.filter(s => ci(s.staff_name, matchName)));
        setPayslips(allPayslips.filter(p => ci(p.staff_name, matchName)));
      } else {
        setShifts(allShifts.filter(s => ci(s.staff_name, matchName)));
        setPayslips(allPayslips.filter(p => ci(p.staff_name, matchName)));
      }

      setLoading(false);
    }
    load();
  }, []);

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

  const handleDocFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewDoc(d => ({ ...d, file_url }));
    setUploadingDoc(false);
  };

  const saveDoc = async () => {
    await base44.entities.BusinessDocument.create(newDoc);
    const updated = await base44.entities.BusinessDocument.list("-created_date");
    setBizDocs(updated);
    setNewDoc({ title: "", category: "Other", issued_by: "", expiry_date: "", notes: "" });
    setShowAddDoc(false);
  };

  const deleteDoc = async (id) => {
    await base44.entities.BusinessDocument.delete(id);
    setBizDocs(prev => prev.filter(d => d.id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
    </div>
  );

  // Build tab list: always show core tabs, then add enabled feature tabs, then profile
  const enabledFeatures = staffRecord?.portal_features || [];
  const featureTabs = ALL_PORTAL_FEATURES.filter(f => enabledFeatures.includes(f.id));

  const coreTabs = [
    { id: "roster",     label: "My Roster",    icon: Calendar },
    { id: "payslips",   label: "My Payslips",  icon: Banknote },
    { id: "compliance", label: "Compliance",   icon: ShieldCheck },
    { id: "documents",  label: "Business Docs", icon: FileText },
    { id: "policy",     label: "Policy Manual", icon: BookOpen },
  ];

  const allTabs = [
    ...coreTabs,
    ...featureTabs,
    { id: "profile", label: "My Profile", icon: UserCircle },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        {staffRecord?.photo_url ? (
          <img src={staffRecord.photo_url} alt="" className="w-14 h-14 rounded-2xl object-cover" />
        ) : (
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl">
            {user?.full_name?.charAt(0) || <User size={24} />}
          </div>
        )}
        <div>
          <h2 className="text-3xl font-black tracking-tight">My Staff Portal</h2>
          <p className="text-muted-foreground text-sm">
            {user?.full_name || "Staff Member"} &nbsp;·&nbsp;
            {staffRecord
              ? <span className="text-emerald-600 font-bold">{staffRecord.role}</span>
              : <span className="text-amber-600 font-bold">Profile not matched — contact admin</span>
            }
          </p>
        </div>
      </div>

      {/* Linked Participants */}
      {linkedParticipants.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">My Participants</p>
          <div className="flex flex-wrap gap-2">
            {linkedParticipants.map(p => (
              <a key={p.id} href={`/dashboard/participants`}
                className="flex items-center gap-2 bg-secondary hover:bg-primary/10 rounded-xl px-3 py-2 transition">
                {p.photo_url
                  ? <img src={p.photo_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                  : <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-black">{p.name?.charAt(0)}</div>
                }
                <div>
                  <p className="text-xs font-bold">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.status}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar — scrollable on mobile */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 bg-secondary p-1 rounded-2xl min-w-max">
          {allTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${tab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── ROSTER TAB ─────────────────────────────────────────────────────────── */}
      {tab === "roster" && <WeeklyCalendar shifts={shifts} />}

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
                          <FileText size={12} /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            <>
              <div className="bg-card border border-border rounded-2xl p-6 space-y-1">
                <h3 className="font-black text-base mb-4">Compliance & Credentials</h3>
                <ComplianceBadge label="Employment Status" value={staffRecord.status} />
                <ComplianceBadge label="Training Status" value={staffRecord.training_status} />
                <ComplianceBadge label="Police Check" value={staffRecord.police_check} />
                <ComplianceBadge label="WWCC Expiry" value={staffRecord.wwcc_expiry} isDate />
                <ComplianceBadge label="First Aid Expiry" value={staffRecord.first_aid_expiry} isDate />
                {staffRecord.phone && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm font-bold">{staffRecord.phone}</span>
                  </div>
                )}
                {staffRecord.emergency_contact_name && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Emergency Contact</span>
                    <span className="text-sm font-bold">{staffRecord.emergency_contact_name} · {staffRecord.emergency_contact_phone}</span>
                  </div>
                )}
                {staffRecord.bank_name && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Bank / BSB</span>
                    <span className="text-sm font-bold">{staffRecord.bank_name} · {staffRecord.bank_bsb}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "WWCC", ok: staffRecord.wwcc_expiry && Math.ceil((new Date(staffRecord.wwcc_expiry) - new Date()) / 86400000) > 30, warn: staffRecord.wwcc_expiry && Math.ceil((new Date(staffRecord.wwcc_expiry) - new Date()) / 86400000) <= 30 },
                  { label: "First Aid", ok: staffRecord.first_aid_expiry && Math.ceil((new Date(staffRecord.first_aid_expiry) - new Date()) / 86400000) > 30, warn: staffRecord.first_aid_expiry && Math.ceil((new Date(staffRecord.first_aid_expiry) - new Date()) / 86400000) <= 30 },
                  { label: "Police Check", ok: staffRecord.police_check === "Cleared", warn: staffRecord.police_check === "Pending" },
                ].map(item => (
                  <div key={item.label} className={`rounded-2xl p-4 text-center border ${item.ok ? "bg-emerald-50 border-emerald-200" : item.warn ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200"}`}>
                    {item.ok ? <CheckCircle size={20} className="text-emerald-500 mx-auto mb-1" /> : item.warn ? <AlertTriangle size={20} className="text-amber-500 mx-auto mb-1" /> : <XCircle size={20} className="text-rose-500 mx-auto mb-1" />}
                    <p className="text-xs font-black">{item.label}</p>
                    <p className={`text-[10px] mt-0.5 ${item.ok ? "text-emerald-600" : item.warn ? "text-amber-600" : "text-rose-600"}`}>{item.ok ? "Valid" : item.warn ? "Action Needed" : "Missing"}</p>
                  </div>
                ))}
              </div>
              </>
              )}

              {/* Document upload */}
              <StaffComplianceDocs staffRecord={staffRecord} />
              </div>
              )}

      {/* ── DOCUMENTS TAB ──────────────────────────────────────────────────────── */}
      {tab === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Insurance certificates, licences, registrations and other business documents.</p>
            <Button onClick={() => setShowAddDoc(v => !v)} className="rounded-xl font-bold gap-2 text-xs" size="sm">
              <Upload size={13} /> Upload Document
            </Button>
          </div>
          {showAddDoc && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-sm">New Business Document</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Title *</label>
                  <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                    value={newDoc.title} onChange={e => setNewDoc(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Public Liability Insurance" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Category</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                    value={newDoc.category} onChange={e => setNewDoc(d => ({ ...d, category: e.target.value }))}>
                    {["Insurance","Certificates","Licences","Policies","Registrations","Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Issued By</label>
                  <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                    value={newDoc.issued_by} onChange={e => setNewDoc(d => ({ ...d, issued_by: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Expiry Date</label>
                  <input type="date" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                    value={newDoc.expiry_date} onChange={e => setNewDoc(d => ({ ...d, expiry_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">File Upload</label>
                <input type="file" className="mt-1 block text-sm text-muted-foreground" onChange={handleDocFileUpload} />
                {uploadingDoc && <p className="text-xs text-primary mt-1 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading…</p>}
                {newDoc.file_url && <p className="text-xs text-emerald-600 mt-1">✓ File uploaded</p>}
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={saveDoc} disabled={!newDoc.title || uploadingDoc} className="rounded-xl font-bold text-xs">Save Document</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddDoc(false)} className="rounded-xl font-bold text-xs">Cancel</Button>
              </div>
            </div>
          )}
          {bizDocs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground italic text-sm bg-card border border-border rounded-2xl">No business documents uploaded yet.</div>
          ) : (
            <div className="space-y-2">
              {["Insurance","Certificates","Licences","Policies","Registrations","Other"].map(cat => {
                const catDocs = bizDocs.filter(d => d.category === cat);
                if (catDocs.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{cat}</p>
                    {catDocs.map(doc => {
                      const days = doc.expiry_date ? Math.ceil((new Date(doc.expiry_date) - new Date()) / 86400000) : null;
                      const expired = days !== null && days < 0;
                      const expiring = days !== null && days >= 0 && days <= 30;
                      return (
                        <div key={doc.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText size={18} className="text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">{doc.issued_by || "—"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {doc.expiry_date && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${expired ? "bg-rose-100 text-rose-700" : expiring ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {expired ? "EXPIRED" : expiring ? `${days}d left` : `Exp ${doc.expiry_date}`}
                              </span>
                            )}
                            {doc.file_url && (
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs font-bold h-7 px-2">
                                  <ExternalLink size={11} /> View
                                </Button>
                              </a>
                            )}
                            <Button size="sm" variant="ghost" className="rounded-xl text-xs text-rose-500 hover:text-rose-700 h-7 px-2"
                              onClick={() => deleteDoc(doc.id)}>✕</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── POLICY MANUAL TAB ─────────────────────────────────────────────────── */}
      {tab === "policy" && <PolicyManualViewer compact />}

      {/* ── FEATURE TABS — linked pages ────────────────────────────────────────── */}
      {featureTabs.map(ft => tab === ft.id && (
        <div key={ft.id} className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
          <ft.icon size={36} className="text-primary mx-auto" />
          <h3 className="font-black text-lg">{ft.label}</h3>
          <p className="text-muted-foreground text-sm">This feature is available in the main portal.</p>
          <a href={ft.path}>
            <Button className="rounded-xl gap-2 font-bold">
              Open {ft.label} <ExternalLink size={14} />
            </Button>
          </a>
          {linkedParticipants.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Your Linked Participants</p>
              <div className="flex flex-wrap gap-2">
                {linkedParticipants.map(p => (
                  <span key={p.id} className="bg-secondary text-xs font-bold px-3 py-1 rounded-full">{p.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* ── MY PROFILE TAB ─────────────────────────────────────────────────────── */}
      {tab === "profile" && (
        (() => {
          const nm = (staffRecord?.name || user?.full_name || "").toLowerCase();
          if (nm.includes("jeffrey")) return <JeffreyProfile embedded />;
          if (nm.includes("toby")) return <TobyProfile embedded />;
          return <StaffMyProfile staffRecord={staffRecord} user={user} />;
        })()
      )}
    </div>
  );
}