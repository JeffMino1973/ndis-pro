import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Search, Loader2, Trash2, Eye, FilePlus, FileEdit, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const ACTION_ICONS = {
  create: <FilePlus size={13} className="text-emerald-500" />,
  update: <FileEdit size={13} className="text-amber-500" />,
  delete: <Trash2 size={13} className="text-rose-500" />,
  view: <Eye size={13} className="text-blue-500" />,
  export: <Download size={13} className="text-purple-500" />,
};

const ACTION_COLORS = {
  create: "bg-emerald-50 text-emerald-700 border-emerald-200",
  update: "bg-amber-50 text-amber-700 border-amber-200",
  delete: "bg-rose-50 text-rose-700 border-rose-200",
  view: "bg-blue-50 text-blue-700 border-blue-200",
  export: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    base44.entities.AuditLog.list("-created_date", 200).then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const entityTypes = [...new Set(logs.map(l => l.entity_type))].filter(Boolean);

  const filtered = logs.filter(l => {
    const matchSearch = !search ||
      l.entity_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.performed_by?.toLowerCase().includes(search.toLowerCase()) ||
      l.performed_by_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "all" || l.action === filterAction;
    const matchType = filterType === "all" || l.entity_type === filterType;
    return matchSearch && matchAction && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Shield size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Activity Audit Log</h2>
          <p className="text-muted-foreground text-sm">Track all sensitive data changes across the system</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, user, or details..."
            className="pl-9"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="export">Export</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Record Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {entityTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-16 text-center text-muted-foreground">
          <Shield size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-bold">No audit events yet</p>
          <p className="text-sm">Activity will appear here as staff use the system.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="px-6 py-3 border-b border-border bg-secondary/30 grid grid-cols-[90px_130px_160px_1fr_160px] gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <span>Action</span>
            <span>Record Type</span>
            <span>Record</span>
            <span>Details</span>
            <span>Who / When</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map(log => (
              <div key={log.id} className="grid grid-cols-[90px_130px_160px_1fr_160px] gap-3 px-6 py-3 hover:bg-secondary/20 items-start text-sm">
                <div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${ACTION_COLORS[log.action] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {ACTION_ICONS[log.action]}
                    {log.action}
                  </span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{log.entity_type}</span>
                <span className="text-xs font-bold truncate">{log.entity_name || log.entity_id || "—"}</span>
                <span className="text-xs text-muted-foreground">{log.details || "—"}</span>
                <div className="text-right">
                  <p className="text-xs font-bold truncate">{log.performed_by_name || log.performed_by || "Unknown"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {log.created_date ? format(new Date(log.created_date), "dd/MM/yy HH:mm") : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-secondary/30 border-t border-border text-[10px] text-muted-foreground font-black">
            Showing {filtered.length} of {logs.length} events
          </div>
        </div>
      )}
    </div>
  );
}