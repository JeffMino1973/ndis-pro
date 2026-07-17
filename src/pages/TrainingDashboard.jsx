import { useState, useEffect, useMemo } from "react";
import { Users, GraduationCap, TrendingUp, CheckCircle2, AlertTriangle, Loader2, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import TeamHeatmap from "@/components/training/TeamHeatmap";

const CHART_HEIGHT = 420;

function getBarColor(pct) {
  if (pct < 25) return "#ef4444";   // red
  if (pct < 50) return "#f59e0b";  // amber
  if (pct < 75) return "#eab308";  // yellow
  return "#22c55e";                // green
}

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

export default function TrainingDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.LMSEnrollment.filter({ target_type: "staff" }, "-created_date", 500),
      base44.entities.StaffMember.list(),
    ])
      .then(([enr, staff]) => {
        setEnrollments(enr || []);
        setStaffMembers(staff || []);
      })
      .catch(() => { setEnrollments([]); setStaffMembers([]); })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = enrollments.length;
    const avgPct = total > 0
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / total)
      : 0;
    const completed = enrollments.filter(e => e.status === "Completed" || (e.progress_percent || 0) >= 100).length;
    const inProgress = enrollments.filter(e => e.status === "In Progress" || ((e.progress_percent || 0) > 0 && (e.progress_percent || 0) < 100)).length;
    const notStarted = enrollments.filter(e => (e.progress_percent || 0) === 0).length;
    return { total, avgPct, completed, inProgress, notStarted };
  }, [enrollments]);

  // Group by course — lowest completion first
  const courseData = useMemo(() => {
    const map = new Map();
    enrollments.forEach(e => {
      const key = e.course_title || "Unassigned";
      if (!map.has(key)) map.set(key, { course: key, total: 0, sumPct: 0, completed: 0 });
      const row = map.get(key);
      row.total += 1;
      row.sumPct += e.progress_percent || 0;
      if ((e.progress_percent || 0) >= 100 || e.status === "Completed") row.completed += 1;
    });
    const rows = Array.from(map.values()).map(r => ({
      course: r.course,
      avgPct: r.total > 0 ? Math.round(r.sumPct / r.total) : 0,
      enrolled: r.total,
      completed: r.completed,
    }));
    rows.sort((a, b) => a.avgPct - b.avgPct); // lowest first
    return rows;
  }, [enrollments]);

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
          <GraduationCap className="text-primary" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black">Staff Training Dashboard</h1>
          <p className="text-sm text-muted-foreground">Completion rates across all assigned staff training modules</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Avg Completion" value={`${stats.avgPct}%`} sub="across all modules" accent="bg-primary/10 text-primary" />
        <StatCard icon={Users} label="Total Enrolments" value={stats.total} sub="staff assignments" accent="bg-blue-100 text-blue-700" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} sub="100% finished" accent="bg-emerald-100 text-emerald-700" />
        <StatCard icon={AlertTriangle} label="Not Started" value={stats.notStarted} sub="0% progress" accent="bg-rose-100 text-rose-700" />
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h2 className="font-black text-base">Course Completion Rates</h2>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">Sorted: lowest first</span>
        </div>

        {courseData.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-bold">No staff training assignments yet</p>
            <p className="text-sm">Assign courses to staff from the Learning Hub (LMS) to see completion data.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(CHART_HEIGHT, courseData.length * 52)}>
            <BarChart data={courseData} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}%`} />
              <YAxis
                type="category"
                dataKey="course"
                width={200}
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                }}
                formatter={(val, _name, props) => [`${val}% (${props.payload.completed}/${props.payload.enrolled} done)`, "Avg Completion"]}
              />
              <Bar dataKey="avgPct" radius={[0, 6, 6, 0]} maxBarSize={34}>
                {courseData.map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry.avgPct)} />
                ))}
                <LabelList dataKey="avgPct" position="right" formatter={v => `${v}%`} style={{ fontSize: 11, fontWeight: 800 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" />Under 25%</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" />25–49%</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500" />50–74%</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" />75%+</span>
        </div>
      </div>

      {/* Team Heat-Map */}
      <TeamHeatmap enrollments={enrollments} staffMembers={staffMembers} />
    </div>
  );
}