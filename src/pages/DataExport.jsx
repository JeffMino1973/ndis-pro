import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Loader2, Database, Users, FileText, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { logAudit } from "@/utils/auditLog";

const EXPORTS = [
  {
    id: "participants",
    label: "Participants",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    description: "All participant records including NDIS numbers, contacts, and budgets",
    entity: "Participant",
  },
  {
    id: "incidents",
    label: "Incident Reports",
    icon: AlertTriangle,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    description: "All behaviour incidents, reports and follow-up records",
    entity: "BehaviourIncident",
  },
  {
    id: "payslips",
    label: "Payroll Records",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    description: "All payslip records including gross pay, tax, super and net pay",
    entity: "PayslipRecord",
  },
  {
    id: "staff",
    label: "Staff Members",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    description: "Staff profiles, compliance status, and contact details",
    entity: "StaffMember",
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: FileText,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    description: "All NDIS invoices, line items, and payment status",
    entity: "Invoice",
  },
  {
    id: "progressnotes",
    label: "Progress Notes",
    icon: FileText,
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-200",
    description: "All participant progress notes and session records",
    entity: "ProgressNote",
  },
];

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function downloadCSV(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csvRows = [
    keys.join(","),
    ...data.map(row =>
      keys.map(k => {
        const val = row[k];
        const str = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export default function DataExport() {
  const [loading, setLoading] = useState({});
  const [lastExported, setLastExported] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Non-admins cannot access this page
  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4 max-w-md">
          <ShieldCheck size={48} className="mx-auto text-muted-foreground/30" />
          <h2 className="text-2xl font-black">Admin Access Required</h2>
          <p className="text-muted-foreground">Only administrators can export data for security reasons.</p>
        </div>
      </div>
    );
  }

  const handleExport = async (exportDef, format) => {
    setLoading(prev => ({ ...prev, [exportDef.id + format]: true }));
    const data = await base44.entities[exportDef.entity].list("-created_date", 1000);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${exportDef.id}_backup_${timestamp}.${format}`;
    if (format === "json") {
      downloadJSON(data, filename);
    } else {
      downloadCSV(data, filename);
    }
    await logAudit("export", exportDef.entity, "", exportDef.label, `Exported ${data.length} records as ${format.toUpperCase()}`);
    setLastExported(prev => ({ ...prev, [exportDef.id]: { count: data.length, time: new Date(), fmt: format } }));
    setLoading(prev => ({ ...prev, [exportDef.id + format]: false }));
  };

  const handleExportAll = async () => {
    setLoading(prev => ({ ...prev, all: true }));
    const allData = {};
    for (const exp of EXPORTS) {
      allData[exp.id] = await base44.entities[exp.entity].list("-created_date", 1000);
    }
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadJSON(allData, `full_backup_${timestamp}.json`);
    await logAudit("export", "ALL", "", "Full System Backup", `Exported all ${EXPORTS.length} entity types`);
    setLoading(prev => ({ ...prev, all: false }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Database size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Data Backup & Export</h2>
          <p className="text-muted-foreground text-sm">Download your data as a backup recovery point</p>
        </div>
      </div>

      {/* Full backup banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ShieldCheck size={28} className="text-primary shrink-0" />
          <div>
            <p className="font-black text-base">Full System Backup</p>
            <p className="text-sm text-muted-foreground">Export all data in one JSON file — store it safely offline</p>
          </div>
        </div>
        <Button onClick={handleExportAll} disabled={loading.all} className="gap-2 rounded-xl font-bold shrink-0">
          {loading.all ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          Export Everything
        </Button>
      </div>

      {/* Individual exports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPORTS.map(exp => {
          const Icon = exp.icon;
          const last = lastExported[exp.id];
          return (
            <div key={exp.id} className={`border rounded-3xl p-5 space-y-4 ${exp.bg}`}>
              <div className="flex items-start gap-3">
                <Icon size={20} className={`${exp.color} shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <p className="font-black text-sm">{exp.label}</p>
                  <p className="text-xs text-muted-foreground">{exp.description}</p>
                  {last && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Last exported: {last.count} records as {last.fmt.toUpperCase()} at {format(last.time, "HH:mm")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-xl font-bold gap-1 text-xs bg-white"
                  disabled={loading[exp.id + "json"]}
                  onClick={() => handleExport(exp, "json")}
                >
                  {loading[exp.id + "json"] ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  JSON
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-xl font-bold gap-1 text-xs bg-white"
                  disabled={loading[exp.id + "csv"]}
                  onClick={() => handleExport(exp, "csv")}
                >
                  {loading[exp.id + "csv"] ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  CSV
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        💡 Tip: Export weekly and save to a secure location (Google Drive, USB, email to yourself) as your manual backup.
      </p>
    </div>
  );
}