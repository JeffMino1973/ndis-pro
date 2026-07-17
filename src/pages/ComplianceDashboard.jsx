import { useState, useEffect, useMemo } from "react";
import { Users, ShieldCheck, AlertTriangle, ClipboardList, Loader2, Mail, CheckCircle2, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-black leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function ComplianceDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStaff, setExpandedStaff] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.LMSEnrollment.filter({ target_type: "staff" }, "-created_date", 500),
      base44.entities.StaffMember.list(),
    ])
      .then(([enr, staff]) => {
        setEnrollments(enr || []);
        setStaffMembers(staff || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build per-staff compliance summary
  const staffCompliance = useMemo(() => {
    // Map staff member info by name (case-insensitive) and staff_id
    const staffByEmail = new Map();
    const staffByName = new Map();
    staffMembers.forEach(s => {
      if (s.email) staffByEmail.set(s.email.toLowerCase(), s);
      if (s.name) staffByName.set(s.name.toLowerCase().trim(), s);
    });

    const map = new Map();
    enrollments.forEach(e => {
      const key = (e.student_name || "Unknown Staff").toLowerCase().trim();
      if (!map.has(key)) {
        const matchedStaff = (e.staff_id && staffByEmail.get(e.staff_id.toLowerCase())) ||
          staffByName.get(key) || null;
        map.set(key, {
          name: e.student_name || "Unknown Staff",
          email: matchedStaff?.email || e.student_email || "",
          role: matchedStaff?.role || "—",
          modules: [],
        });
      }
      map.get(key).modules.push(e);
    });

    const rows = Array.from(map.values()).map(s => {
      const total = s.modules.length;
      const completed = s.modules.filter(m => (m.progress_percent || 0) >= 100 || m.status === "Completed").length;
      const overdue = s.modules.filter(m => (m.progress_percent || 0) < 100);
      const avgPct = total > 0 ? Math.round(s.modules.reduce((sum, m) => sum + (m.progress_percent || 0), 0) / total) : 0;
      return {
        ...s,
        total,
        completed,
        overdueModules: overdue,
        overdueCount: overdue.length,
        avgPct,
        isCompliant: completed === total,
      };
    });

    // Non-compliant first, then by most overdue modules
    rows.sort((a, b) => {
      if (a.isCompliant !== b.isCompliant) return a.isCompliant ? 1 : -1;
      return b.overdueCount - a.overdueCount;
    });

    return rows;
  }, [enrollments, staffMembers]);

  const stats = useMemo(() => {
    const totalStaff = staffCompliance.length;
    const compliant = staffCompliance.filter(s => s.isCompliant).length;
    const nonCompliant = totalStaff - compliant;
    const totalOverdue = staffCompliance.reduce((sum, s) => sum + s.overdueCount, 0);
    return { totalStaff, compliant, nonCompliant, totalOverdue };
  }, [staffCompliance]);

  const toggleStaff = (key) => setExpandedStaff(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="text-primary" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black">Staff Compliance Dashboard</h1>
          <p className="text-sm text-muted-foreground">Outstanding mandatory training across your workforce</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Staff" value={stats.totalStaff} sub="with assignments" accent="bg-blue-100 text-blue-700" />
        <StatCard icon={CheckCircle2} label="Fully Compliant" value={stats.compliant} sub="all modules done" accent="bg-emerald-100 text-emerald-700" />
        <StatCard icon={AlertTriangle} label="Outstanding" value={stats.nonCompliant} sub="staff behind" accent="bg-amber-100 text-amber-700" />
        <StatCard icon={ClipboardList} label="Overdue Modules" value={stats.totalOverdue} sub="need follow-up" accent="bg-rose-100 text-rose-700" />
      </div>

      {/* Follow-up list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <AlertTriangle size={18} className="text-rose-500" />
          <h2 className="font-black text-base">Follow-Up Required</h2>
          <span className="text-xs text-muted-foreground ml-1">Staff with incomplete modules — tap to expand details</span>
        </div>

        {staffCompliance.filter(s => !s.isCompliant).length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500" />
            <p className="font-black text-base text-emerald-700">All staff are fully compliant</p>
            <p className="text-sm text-muted-foreground">Every assigned training module has been completed.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {staffCompliance.filter(s => !s.isCompliant).map(s => {
              const key = s.name.toLowerCase().trim();
              const expanded = expandedStaff[key];
              return (
                <div key={key}>
                  <button
                    onClick={() => toggleStaff(key)}
                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-secondary/50 transition text-left"
                  >
                    {expanded ? <ChevronDown size={16} className="shrink-0 text-muted-foreground" /> : <ChevronRight size={16} className="shrink-0 text-muted-foreground" />}
                    <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-black flex items-center justify-center text-sm shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.role}
                        {s.email ? ` · ${s.email}` : ""}
                      </p>
                    </div>
                    <div className="hidden sm:block w-28 shrink-0">
                      <Progress value={s.avgPct} className="h-2" />
                      <p className="text-[10px] font-bold text-muted-foreground mt-0.5 text-center">{s.avgPct}% avg</p>
                    </div>
                    <span className="text-[10px] font-black text-rose-700 bg-rose-100 rounded-lg px-2.5 py-1 shrink-0">
                      {s.overdueCount} overdue
                    </span>
                    {s.email && (
                      <a
                        href={`mailto:${s.email}?subject=Mandatory Training Follow-Up`}
                        onClick={e => e.stopPropagation()}
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10 rounded-lg px-2.5 py-1.5 transition"
                      >
                        <Mail size={13} /> Follow Up
                      </a>
                    )}
                  </button>

                  {expanded && (
                    <div className="px-5 pb-4 pl-14 space-y-2">
                      {s.overdueModules.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                          <XCircle size={14} className="text-rose-500 shrink-0" />
                          <span className="text-sm font-semibold flex-1 truncate">{m.course_title || "Untitled module"}</span>
                          <span className="text-[10px] font-black text-rose-700 bg-white border border-rose-200 rounded-lg px-2 py-0.5 shrink-0">
                            {m.progress_percent || 0}%
                          </span>
                          <span className={`text-[10px] font-bold rounded-lg px-2 py-0.5 shrink-0 ${
                            (m.progress_percent || 0) === 0 ? "bg-rose-200 text-rose-800" : "bg-amber-200 text-amber-800"
                          }`}>
                            {(m.progress_percent || 0) === 0 ? "Not started" : "In progress"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fully compliant staff (collapsed summary) */}
      {stats.compliant > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-sm text-emerald-800">{stats.compliant} staff fully compliant</p>
            <p className="text-xs text-emerald-700">All assigned training modules completed.</p>
          </div>
        </div>
      )}
    </div>
  );
}