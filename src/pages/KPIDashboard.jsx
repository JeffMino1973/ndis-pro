import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, DollarSign, Clock, Users } from "lucide-react";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function KPIDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [inv, ts, p, inc] = await Promise.all([
        base44.entities.Invoice.list(),
        base44.entities.Timesheet.list(),
        base44.entities.Participant.list(),
        base44.entities.Incident.list(),
      ]);
      setInvoices(inv); setTimesheets(ts); setParticipants(p); setIncidents(inc);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const totalRevenue = invoices.reduce((a, i) => a + (i.total || 0), 0);
  const paidRevenue = invoices.filter(i => i.status === "Paid").reduce((a, i) => a + (i.total || 0), 0);
  const totalHours = timesheets.reduce((a, t) => a + (t.hours || 0), 0);

  // Revenue by month
  const revenueByMonth = invoices.reduce((acc, inv) => {
    if (!inv.issue_date) return acc;
    const month = inv.issue_date.slice(0, 7);
    acc[month] = (acc[month] || 0) + (inv.total || 0);
    return acc;
  }, {});
  const revenueData = Object.entries(revenueByMonth).sort().slice(-6).map(([month, total]) => ({
    month: month.slice(5) + "/" + month.slice(2, 4),
    revenue: parseFloat(total.toFixed(2))
  }));

  // Hours by staff
  const hoursByStaff = timesheets.reduce((acc, t) => {
    acc[t.staff_name] = (acc[t.staff_name] || 0) + (t.hours || 0);
    return acc;
  }, {});
  const staffData = Object.entries(hoursByStaff).map(([name, hours]) => ({ name: name.split(" ")[0], hours: parseFloat(hours.toFixed(1)) }));

  // Invoice status breakdown
  const statusData = [
    { name: "Paid", value: invoices.filter(i => i.status === "Paid").length },
    { name: "Sent", value: invoices.filter(i => i.status === "Sent").length },
    { name: "Draft", value: invoices.filter(i => i.status === "Draft").length },
    { name: "Overdue", value: invoices.filter(i => i.status === "Overdue").length },
  ].filter(d => d.value > 0);

  // Participant status
  const participantStatus = [
    { name: "Active", value: participants.filter(p => p.status === "Active").length },
    { name: "Review Due", value: participants.filter(p => p.status === "Review Due").length },
    { name: "Pending", value: participants.filter(p => p.status === "Pending").length },
    { name: "Inactive", value: participants.filter(p => p.status === "Inactive").length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Revenue & KPI Dashboard</h2>
        <p className="text-muted-foreground text-sm">Billable hours, revenue performance, and operational metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "$" + totalRevenue.toLocaleString(), icon: DollarSign, color: "text-primary" },
          { label: "Collected (Paid)", value: "$" + paidRevenue.toLocaleString(), icon: TrendingUp, color: "text-emerald-600" },
          { label: "Total Billable Hours", value: totalHours.toFixed(1) + "h", icon: Clock, color: "text-amber-600" },
          { label: "Active Participants", value: participants.filter(p => p.status === "Active").length, icon: Users, color: "text-purple-600" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`mb-3 ${k.color}`}><k.icon size={20} /></div>
            <p className="text-2xl font-black text-foreground">{k.value}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue over time */}
        <div className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-black text-lg mb-6">Revenue by Month</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip formatter={v => ["$" + v.toLocaleString(), "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm py-16 italic">No invoice data yet.</p>}
        </div>

        {/* Hours by staff */}
        <div className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-black text-lg mb-6">Hours by Staff</h3>
          {staffData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={staffData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={60} />
                <Tooltip formatter={v => [v + "h", "Hours"]} />
                <Bar dataKey="hours" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm py-16 italic">No timesheet data yet.</p>}
        </div>

        {/* Invoice Status */}
        <div className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-black text-lg mb-6">Invoice Status Breakdown</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-black ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-center text-muted-foreground text-sm py-16 italic">No invoices yet.</p>}
        </div>

        {/* Participant status */}
        <div className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-black text-lg mb-6">Participant Status</h3>
          {participantStatus.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={participantStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {participantStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {participantStatus.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-black ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-center text-muted-foreground text-sm py-16 italic">No participants yet.</p>}
        </div>
      </div>
    </div>
  );
}