import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Users, CheckCircle, Clock, AlertCircle, Calendar, Activity, ArrowRight } from "lucide-react";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [participants, setParticipants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [p, s, i] = await Promise.all([
        base44.entities.Participant.list(),
        base44.entities.StaffMember.list(),
        base44.entities.Incident.list(),
      ]);
      setParticipants(p);
      setStaff(s);
      setIncidents(i);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const activeClients = participants.filter((p) => p.status === "Active").length;
  const reviewDue = participants.filter((p) => p.status === "Review Due").length;
  const openIncidents = incidents.filter((i) => i.status === "Open").length;
  const compliancePercent = staff.length > 0
    ? Math.round((staff.filter((s) => s.training_status === "Complete").length / staff.length) * 100)
    : 100;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-foreground">
          Executive Overview
        </h2>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          Monitoring compliance and service delivery across {participants.length} participants
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard icon={Users} label="Active Clients" value={activeClients} color="primary" />
        <StatCard icon={CheckCircle} label="Compliance Rate" value={`${compliancePercent}%`} color="emerald" />
        <StatCard icon={Clock} label="Reviews Due" value={reviewDue} color="amber" />
        <StatCard icon={AlertCircle} label="Open Incidents" value={openIncidents} color="rose" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Expiries */}
        <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg flex items-center gap-2">
              <Calendar className="text-primary" size={20} /> Staff Compliance
            </h3>
            <Link to="/staff" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {staff.slice(0, 4).map((s) => {
              const wwccOk = s.wwcc_expiry && new Date(s.wwcc_expiry) > new Date();
              return (
                <div key={s.id} className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-foreground">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">
                      WWCC: {s.wwcc_expiry || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-full ${
                      wwccOk
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {wwccOk ? "VALID" : "EXPIRING"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Participants */}
        <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg flex items-center gap-2">
              <Activity className="text-primary" size={20} /> Recent Participants
            </h3>
            <Link to="/participants" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {participants.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm">
                    {p.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">
                      NDIS: {p.ndis_number} • {p.plan_type}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-black px-3 py-1 rounded-full ${
                    p.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : p.status === "Review Due"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {p.status?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}