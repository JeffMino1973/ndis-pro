import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Users, CheckCircle, Clock, AlertCircle, Calendar, ArrowRight,
  Play, FileText, Receipt, ShieldAlert, TrendingUp, Zap, Bell,
  Activity, Plus, ChevronRight, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

const today = new Date().toISOString().split("T")[0];

function Widget({ title, icon: Icon, iconColor, children, linkTo, linkLabel }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-base flex items-center gap-2">
          <Icon size={18} className={iconColor} /> {title}
        </h3>
        {linkTo && (
          <Link to={linkTo} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
            {linkLabel || "View All"} <ArrowRight size={12} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-sm text-muted-foreground italic text-center py-4">{text}</p>;
}

export default function Dashboard() {
  const [data, setData] = useState({
    participants: [], staff: [], incidents: [], invoices: [],
    shiftLogs: [], progressNotes: [], restrictive: [], loading: true,
  });

  useEffect(() => {
    async function load() {
      const [participants, staff, incidents, invoices, shiftLogs, progressNotes, restrictive] = await Promise.all([
        base44.entities.Participant.list(),
        base44.entities.StaffMember.list(),
        base44.entities.Incident.list(),
        base44.entities.Invoice.list("-created_date", 50),
        base44.entities.ShiftLog.list("-created_date", 50),
        base44.entities.ProgressNote.list("-note_date", 50),
        base44.entities.RestrictivePractice.list("-episode_date", 50),
      ]);
      setData({ participants, staff, incidents, invoices, shiftLogs, progressNotes, restrictive, loading: false });
    }
    load();
  }, []);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const { participants, staff, incidents, invoices, shiftLogs, progressNotes, restrictive } = data;

  // Computed metrics
  const activeClients = participants.filter(p => p.status === "Active").length;
  const reviewDue = participants.filter(p => p.status === "Review Due").length;
  const openIncidents = incidents.filter(i => i.status === "Open").length;
  const complianceOk = staff.filter(s => s.training_status === "Complete").length;
  const compliancePct = staff.length > 0 ? Math.round((complianceOk / staff.length) * 100) : 100;

  const todayShifts = shiftLogs.filter(s => s.start_time?.startsWith(today));
  const activeShift = shiftLogs.find(s => s.status === "Active");
  const pendingInvoices = invoices.filter(i => i.status === "Sent" || i.status === "Overdue");
  const draftNotes = progressNotes.filter(n => n.status === "Draft");
  const unreportedRP = restrictive.filter(r => !r.reported_to_commission && r.status !== "Draft");

  // Expiring soon (within 30 days)
  const alerts = [];
  staff.forEach(s => {
    if (s.wwcc_expiry) {
      const days = Math.ceil((new Date(s.wwcc_expiry) - new Date()) / 86400000);
      if (days > 0 && days <= 30) alerts.push({ type: "WWCC", name: s.name, days, color: "amber" });
      if (days <= 0) alerts.push({ type: "WWCC EXPIRED", name: s.name, days: Math.abs(days), color: "rose" });
    }
  });
  participants.forEach(p => {
    if (p.next_review) {
      const days = Math.ceil((new Date(p.next_review) - new Date()) / 86400000);
      if (days >= 0 && days <= 14) alerts.push({ type: "Plan Review", name: p.name, days, color: "amber" });
    }
  });
  restrictive.forEach(r => {
    if (r.authorisation_expiry) {
      const days = Math.ceil((new Date(r.authorisation_expiry) - new Date()) / 86400000);
      if (days >= 0 && days <= 30) alerts.push({ type: "Auth Expiry", name: r.participant_name, days, color: "rose" });
    }
  });

  const totalBilled = invoices.reduce((a, i) => a + (i.total || 0), 0);
  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((a, i) => a + (i.total || 0), 0);

  const alertColor = { amber: "bg-amber-100 text-amber-700", rose: "bg-rose-100 text-rose-700" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Control Centre</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/shift-logger">
            <Button className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Play size={15} /> {activeShift ? "View Active Shift" : "Start Shift"}
            </Button>
          </Link>
          <Link to="/progress-notes">
            <Button variant="outline" className="rounded-xl font-bold gap-2">
              <FileText size={15} /> New Note
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Participants", value: activeClients, Icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Compliance Rate", value: `${compliancePct}%`, Icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Open Incidents", value: openIncidents, Icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" },
          { label: "Revenue Billed", value: `$${(totalBilled / 1000).toFixed(1)}k`, Icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.bg}`}>
              <s.Icon size={22} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{s.value}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active shift banner */}
      {activeShift && (
        <div className="bg-emerald-600 text-white rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <div>
              <p className="font-black">Active Shift: {activeShift.participant_name}</p>
              <p className="text-emerald-100 text-xs">Staff: {activeShift.staff_name} · Started: {new Date(activeShift.start_time).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
          <Link to="/shift-logger">
            <Button size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold">Manage</Button>
          </Link>
        </div>
      )}

      {/* Alerts */}
      {(alerts.length > 0 || unreportedRP.length > 0) && (
        <Widget title="Alerts & Actions Required" icon={Bell} iconColor="text-rose-500">
          <div className="space-y-2">
            {unreportedRP.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-rose-600 shrink-0" />
                  <p className="text-sm font-bold text-rose-700">{unreportedRP.length} restrictive practice{unreportedRP.length > 1 ? "s" : ""} not reported to Commission</p>
                </div>
                <Link to="/restrictive-practices"><ChevronRight size={15} className="text-rose-400" /></Link>
              </div>
            )}
            {reviewDue > 0 && (
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-600 shrink-0" />
                  <p className="text-sm font-bold text-amber-700">{reviewDue} participant plan review{reviewDue > 1 ? "s" : ""} due</p>
                </div>
                <Link to="/participants"><ChevronRight size={15} className="text-amber-400" /></Link>
              </div>
            )}
            {alerts.slice(0, 5).map((a, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${a.color === "rose" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
                <p className={`text-sm font-bold ${a.color === "rose" ? "text-rose-700" : "text-amber-700"}`}>
                  <span className="font-black">{a.name}</span> — {a.type} {a.days === 0 ? "TODAY" : `in ${a.days}d`}
                </p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${alertColor[a.color]}`}>{a.color === "rose" ? "URGENT" : "SOON"}</span>
              </div>
            ))}
          </div>
        </Widget>
      )}

      {/* Main widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's Shifts */}
        <Widget title="Today's Activity" icon={Calendar} iconColor="text-primary" linkTo="/shift-logger" linkLabel="Shift Logger">
          {todayShifts.length === 0 ? <EmptyState text="No shifts logged today yet." /> : (
            <div className="space-y-2">
              {todayShifts.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div>
                    <p className="text-sm font-bold">{s.participant_name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.staff_name} · {s.support_type} · {s.duration_minutes || "–"} min</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
          <Link to="/shift-logger">
            <Button variant="outline" size="sm" className="w-full rounded-xl gap-1 font-bold">
              <Plus size={13} /> Log New Shift
            </Button>
          </Link>
        </Widget>

        {/* Outstanding Notes */}
        <Widget title={`Outstanding Notes ${draftNotes.length > 0 ? `(${draftNotes.length})` : ""}`} icon={FileText} iconColor="text-amber-500" linkTo="/progress-notes" linkLabel="Progress Notes">
          {draftNotes.length === 0 ? <EmptyState text="All notes are finalised. Great work!" /> : (
            <div className="space-y-2">
              {draftNotes.slice(0, 5).map(n => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-amber-900">{n.participant_name}</p>
                    <p className="text-[10px] text-amber-600">{n.note_date} · {n.staff_name} · {n.template_type}</p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">DRAFT</span>
                </div>
              ))}
            </div>
          )}
          <Link to="/progress-notes">
            <Button variant="outline" size="sm" className="w-full rounded-xl gap-1 font-bold">
              <Plus size={13} /> New Progress Note
            </Button>
          </Link>
        </Widget>

        {/* Pending Invoices */}
        <Widget title={`Pending Invoices ${pendingInvoices.length > 0 ? `(${pendingInvoices.length})` : ""}`} icon={Receipt} iconColor="text-blue-500" linkTo="/invoices" linkLabel="Invoices">
          {pendingInvoices.length === 0 ? <EmptyState text="No outstanding invoices." /> : (
            <div className="space-y-2">
              {pendingInvoices.slice(0, 5).map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div>
                    <p className="text-sm font-bold">{inv.invoice_number} — {inv.participant_name}</p>
                    <p className="text-[10px] text-muted-foreground">{inv.issue_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">${(inv.total || 0).toLocaleString()}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${inv.status === "Overdue" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Billed</p>
              <p className="font-black text-foreground">${totalBilled.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="font-black text-emerald-600">${totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </Widget>

        {/* Recent Participants */}
        <Widget title="Participant Snapshot" icon={Users} iconColor="text-primary" linkTo="/participants">
          <div className="space-y-2">
            {participants.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm shrink-0">
                  {p.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.plan_type} · NDIS {p.ndis_number}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${p.status === "Active" ? "bg-emerald-100 text-emerald-700" : p.status === "Review Due" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      {/* AI Intelligence Panel */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-black text-lg">Intelligence Layer</h3>
            <p className="text-xs text-muted-foreground">AI-powered insights · Auto-reports · Risk flags</p>
          </div>
          <Link to="/ai-reports" className="ml-auto">
            <Button className="rounded-xl font-bold gap-2">
              <Star size={15} /> Open AI Centre
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: FileText, label: "Auto-Generate Reports", desc: "Monthly summaries from session notes", to: "/ai-reports" },
            { icon: Activity, label: "Goal Progress Analytics", desc: "Track NDIS goal achievement rates", to: "/ai-reports" },
            { icon: AlertCircle, label: "Risk Flagging", desc: "Behaviour trends & support alerts", to: "/ai-reports" },
          ].map(item => (
            <Link key={item.label} to={item.to} className="bg-white/60 hover:bg-white/90 transition-all border border-primary/10 rounded-2xl p-4 block">
              <item.icon size={18} className="text-primary mb-2" />
              <p className="font-black text-sm text-foreground">{item.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "New Participant", to: "/participants", icon: Users },
            { label: "Log Incident", to: "/incidents", icon: AlertCircle },
            { label: "Create Invoice", to: "/invoices", icon: Receipt },
            { label: "Restrictive Practice", to: "/restrictive-practices", icon: ShieldAlert },
          ].map(a => (
            <Link key={a.label} to={a.to}>
              <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                <a.icon size={16} className="text-primary shrink-0" />
                <p className="text-sm font-bold text-foreground">{a.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}