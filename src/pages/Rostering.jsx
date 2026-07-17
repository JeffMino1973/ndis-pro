import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, ChevronLeft, ChevronRight, Calendar, Pencil, Trash2, Copy, RefreshCw, Loader2, Wrench, CheckCircle2, LayoutGrid, List, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval } from "date-fns";
import { NDIS_ITEMS } from "@/utils/ndisItems";
import ShiftNoteReminder from "@/components/rostering/ShiftNoteReminder";

const STATUS_COLORS = {
  Scheduled: "bg-blue-100 text-blue-700",
  Confirmed: "bg-emerald-100 text-emerald-700",
  Completed: "bg-slate-100 text-slate-600",
  Cancelled: "bg-rose-100 text-rose-700",
  "No Show": "bg-amber-100 text-amber-700",
};

function buildPrintHTML(title, shifts) {
  const sorted = [...shifts].sort((a, b) => (a.date || "") < (b.date || "") ? -1 : 1);
  const rows = sorted.map((s, i) => {
    const bg = i % 2 === 0 ? "#f8fafc" : "#fff";
    const statusColors = { Completed: "#dcfce7", Scheduled: "#dbeafe", Confirmed: "#d1fae5", Cancelled: "#fee2e2", "No Show": "#fef9c3" };
    const statusBg = statusColors[s.status] || "#f1f5f9";
    return `<tr style="background:${bg}">
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;">${s.date||""}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;">${s.start_time||""}–${s.end_time||""}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:bold;">${s.staff_name||""}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;">${s.participant_name||""}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;">${s.support_type||""}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;"><span style="background:${statusBg};padding:2px 7px;border-radius:9999px;font-size:10px;">${s.status||""}</span></td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;text-align:right;">${s.hourly_rate ? "$"+Number(s.hourly_rate).toFixed(2)+"/hr" : ""}</td>
    </tr>`;
  }).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;color:#1a2e4a;font-size:12px;padding:36px 48px;background:#fff;}
h1{font-size:20px;font-weight:900;color:#1a2e4a;margin-bottom:4px;}
table{width:100%;border-collapse:collapse;margin-top:12px;}
thead tr{background:#1a2e4a;color:#fff;}thead th{padding:8px 10px;font-size:11px;font-weight:bold;text-align:left;color:#fff;}
@media print{.no-print{display:none;}}</style></head><body>
<img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png" style="width:150px;margin-bottom:16px;"/>
<h1>${title}</h1>
<p style="color:#64748b;font-size:12px;margin-bottom:4px;">${shifts.length} shift${shifts.length!==1?"s":""} · Generated: ${format(new Date(), "dd/MM/yyyy")}</p>
<table><thead><tr><th>Date</th><th>Time</th><th>Staff</th><th>Participant</th><th>Support Type</th><th>Status</th><th style="text-align:right">Rate</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="no-print" style="text-align:center;padding:24px;"><button onclick="window.print()" style="background:#1a2e4a;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">🖨️ Print / Save as PDF</button></div>
</body></html>`;
}

function PrintRoster({ shifts, weekStart, calendarMonth }) {
  const weekEnd = addDays(weekStart, 6);
  const prevWeekStart = subWeeks(weekStart, 1);
  const prevWeekEnd = addDays(prevWeekStart, 6);
  const mStart = startOfMonth(calendarMonth);
  const mEnd = endOfMonth(calendarMonth);

  const weekShifts = shifts.filter(s => s.date && s.date >= format(weekStart, "yyyy-MM-dd") && s.date <= format(weekEnd, "yyyy-MM-dd"));
  const prevWeekShifts = shifts.filter(s => s.date && s.date >= format(prevWeekStart, "yyyy-MM-dd") && s.date <= format(prevWeekEnd, "yyyy-MM-dd"));
  const monthShifts = shifts.filter(s => s.date && s.date >= format(mStart, "yyyy-MM-dd") && s.date <= format(mEnd, "yyyy-MM-dd"));

  const print = (title, data) => {
    const html = buildPrintHTML(title, data);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  const options = [
    { label: "Current Week Roster", sub: `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`, data: weekShifts, color: "border-blue-300 bg-blue-50 hover:bg-blue-100" },
    { label: "Previous Week Roster", sub: `${format(prevWeekStart, "d MMM")} – ${format(prevWeekEnd, "d MMM yyyy")}`, data: prevWeekShifts, color: "border-violet-300 bg-violet-50 hover:bg-violet-100" },
    { label: "Monthly Roster", sub: format(calendarMonth, "MMMM yyyy"), data: monthShifts, color: "border-emerald-300 bg-emerald-50 hover:bg-emerald-100" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="font-black mb-1">Print Roster</p>
        <p className="text-sm text-muted-foreground">Select a period to generate a print-ready PDF roster. Filtered staff/participant selections are respected.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map(opt => (
          <button key={opt.label} onClick={() => print(opt.label, opt.data)}
            className={`text-left p-5 rounded-2xl border-2 transition-all ${opt.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <Printer size={18} className="text-foreground" />
              <p className="font-black text-sm">{opt.label}</p>
            </div>
            <p className="text-xs text-muted-foreground">{opt.sub}</p>
            <p className="text-xs font-bold mt-2 text-foreground">{opt.data.length} shift{opt.data.length !== 1 ? "s" : ""}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Rostering() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copySource, setCopySource] = useState(null);
  const [copyMode, setCopyMode] = useState("date"); // "date" | "nextweek" | "recurring"
  const [copyDate, setCopyDate] = useState("");
  const [recurWeeks, setRecurWeeks] = useState(4);
  const [copying, setCopying] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [participantFilter, setParticipantFilter] = useState("all");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [form, setForm] = useState({ participant_name: "", staff_name: "", date: "", start_time: "09:00", end_time: "11:00", support_type: "", support_item_code: "", hourly_rate: "", program_type: "Life Skills Program", status: "Scheduled", notes: "" });

  const load = async () => {
    const [s, p, st] = await Promise.all([
      base44.entities.Shift.list("-date"),
      base44.entities.Participant.list(),
      base44.entities.StaffMember.list(),
    ]);
    setShifts(s);
    setParticipants(p);
    setStaff(st);
  };

  useEffect(() => { load(); }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const PROGRAM_TYPES = ["Life Skills Program", "Travel Training", "Travel to/from Work", "Community Program", "Domestic Skills", "Weekly Shopping", "Other"];
  const EMPTY_FORM = { participant_name: "", staff_name: "", date: "", start_time: "09:00", end_time: "11:00", support_type: "", support_item_code: "", hourly_rate: "", program_type: "Life Skills Program", status: "Scheduled", notes: "" };

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (s) => { setEditingId(s.id); setForm({ participant_name: s.participant_name, staff_name: s.staff_name, date: s.date, start_time: s.start_time, end_time: s.end_time, support_type: s.support_type || "", support_item_code: s.support_item_code || "", hourly_rate: s.hourly_rate || "", program_type: s.program_type || "Life Skills Program", status: s.status, notes: s.notes || "" }); setShowForm(true); };

  const save = async () => {
    if (editingId) {
      await base44.entities.Shift.update(editingId, form);
    } else {
      await base44.entities.Shift.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    load();
  };

  const deleteShift = async (id) => {
    if (!window.confirm("Delete this shift?")) return;
    await base44.entities.Shift.delete(id);
    load();
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const openCopy = (shift) => {
    setCopySource(shift);
    setCopyMode("nextweek");
    setCopyDate("");
    setRecurWeeks(4);
    setShowCopyDialog(true);
  };

  const executeCopy = async () => {
    if (!copySource) return;
    setCopying(true);
    const base = { participant_name: copySource.participant_name, staff_name: copySource.staff_name, start_time: copySource.start_time, end_time: copySource.end_time, support_type: copySource.support_type || "", support_item_code: copySource.support_item_code || "", hourly_rate: copySource.hourly_rate || 0, hours: copySource.hours || 0, amount: copySource.amount || 0, program_type: copySource.program_type || "Life Skills Program", status: "Scheduled", notes: copySource.notes || "" };
    if (copyMode === "date") {
      await base44.entities.Shift.create({ ...base, date: copyDate });
    } else if (copyMode === "nextweek") {
      const next = addDays(parseISO(copySource.date), 7);
      await base44.entities.Shift.create({ ...base, date: format(next, "yyyy-MM-dd") });
    } else if (copyMode === "recurring") {
      const creates = [];
      for (let w = 1; w <= recurWeeks; w++) {
        const d = addDays(parseISO(copySource.date), w * 7);
        creates.push(base44.entities.Shift.create({ ...base, date: format(d, "yyyy-MM-dd") }));
      }
      await Promise.all(creates);
    }
    setCopying(false);
    setShowCopyDialog(false);
    setCopySource(null);
    load();
  };

  const getShiftsForDay = (day) => shifts.filter(s => {
    try { return isSameDay(parseISO(s.date), day); } catch { return false; }
  });

  const runBulkUpdate = async () => {
    setBulkUpdating(true);
    setBulkResult(null);
    const ndisMap = Object.fromEntries(NDIS_ITEMS.map(i => [i.code, i]));
    let updated = 0;
    let skipped = 0;
    const updates = shifts
      .filter(s => s.support_item_code && ndisMap[s.support_item_code])
      .map(s => {
        const item = ndisMap[s.support_item_code];
        const hrs = (() => {
          if (!s.start_time || !s.end_time) return s.hours || 0;
          const [sh, sm] = s.start_time.split(":").map(Number);
          const [eh, em] = s.end_time.split(":").map(Number);
          return Math.max(0, Math.round(((eh * 60 + em - sh * 60 - sm) / 60) * 100) / 100);
        })();
        const amount = Math.round(hrs * item.rate * 100) / 100;
        return base44.entities.Shift.update(s.id, {
          support_type: item.name,
          hourly_rate: item.rate,
          hours: hrs,
          amount,
        }).then(() => updated++);
      });
    skipped = shifts.filter(s => !s.support_item_code || !ndisMap[s.support_item_code]).length;
    await Promise.all(updates);
    setBulkUpdating(false);
    setBulkResult({ updated, skipped });
    load();
  };

  // Filtered shifts for calendar and list
  const filteredShifts = shifts.filter(s => {
    if (staffFilter !== "all" && s.staff_name !== staffFilter) return false;
    if (participantFilter !== "all" && s.participant_name !== participantFilter) return false;
    return true;
  });

  // Month calendar helpers
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Rostering</h2>
          <p className="text-muted-foreground text-sm">Weekly shift scheduling for staff and participants.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setBulkResult(null); setShowBulkDialog(true); }} className="rounded-xl font-bold gap-2 border-amber-300 text-amber-700 hover:bg-amber-50">
            <Wrench size={16} /> Bulk Update Rates
          </Button>
          <Button onClick={openAdd} className="rounded-xl font-bold gap-2">
            <Plus size={18} /> Add Shift
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Filter by Staff</Label>
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Filter by Participant</Label>
          <Select value={participantFilter} onValueChange={setParticipantFilter}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Participants</SelectItem>
              {participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {(staffFilter !== "all" || participantFilter !== "all") && (
          <Button variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground" onClick={() => { setStaffFilter("all"); setParticipantFilter("all"); }}>
            Clear filters
          </Button>
        )}
      </div>

      <ShiftNoteReminder shifts={filteredShifts} weekStart={weekStart} />

      <Tabs defaultValue="week">
        <TabsList className="rounded-xl">
          <TabsTrigger value="week" className="gap-1.5 rounded-lg"><Calendar size={14} /> Week</TabsTrigger>
          <TabsTrigger value="month" className="gap-1.5 rounded-lg"><LayoutGrid size={14} /> Month</TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5 rounded-lg"><List size={14} /> List</TabsTrigger>
          <TabsTrigger value="print" className="gap-1.5 rounded-lg"><Printer size={14} /> Print Roster</TabsTrigger>
        </TabsList>

        {/* WEEK TAB */}
        <TabsContent value="week" className="mt-4 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}><ChevronLeft size={18} /></Button>
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Calendar size={18} className="text-primary" />
              {format(weekStart, "d MMM")} – {format(addDays(weekStart, 6), "d MMM yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}><ChevronRight size={18} /></Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayShifts = filteredShifts.filter(s => { try { return isSameDay(parseISO(s.date), day); } catch { return false; } }).sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={`bg-card border rounded-2xl p-3 min-h-[160px] ${isToday ? "border-primary" : "border-border"}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? "text-primary" : "text-muted-foreground"}`}>{format(day, "EEE")}</p>
                  <p className={`text-lg font-black mb-3 ${isToday ? "text-primary" : "text-foreground"}`}>{format(day, "d")}</p>
                  <div className="space-y-1.5">
                    {dayShifts.map((s) => (
                      <div key={s.id} className={`text-[10px] font-bold px-2 py-1.5 rounded-lg group relative ${STATUS_COLORS[s.status] || "bg-slate-100 text-slate-600"}`}>
                        {s.program_type && <p className="text-[8px] font-black opacity-90 truncate mb-0.5">{s.program_type}</p>}
                        <p className="truncate">{s.staff_name}</p>
                        <p className="truncate opacity-75">{s.participant_name}</p>
                        <p>{s.start_time}–{s.end_time}</p>
                        <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                          <button onClick={e => { e.stopPropagation(); openCopy(s); }} className="p-0.5 bg-white/70 rounded hover:bg-white text-blue-600"><Copy size={10} /></button>
                          <button onClick={e => { e.stopPropagation(); openEdit(s); }} className="p-0.5 bg-white/70 rounded hover:bg-white"><Pencil size={10} /></button>
                          <button onClick={e => { e.stopPropagation(); deleteShift(s.id); }} className="p-0.5 bg-white/70 rounded hover:bg-white text-rose-600"><Trash2 size={10} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* MONTH TAB */}
        <TabsContent value="month" className="mt-4 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}><ChevronLeft size={18} /></Button>
            <div className="font-black text-foreground text-lg">{format(calendarMonth, "MMMM yyyy")}</div>
            <Button variant="outline" size="icon" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}><ChevronRight size={18} /></Button>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} className="px-2 py-2 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest border-r border-border last:border-r-0">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calDays.map((day, i) => {
                const dayShifts = filteredShifts.filter(s => { try { return isSameDay(parseISO(s.date), day); } catch { return false; } }).sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                return (
                  <div key={day.toISOString()} className={`min-h-[110px] p-1.5 border-r border-b border-border last:border-r-0 ${!isCurrentMonth ? "bg-secondary/30" : ""} ${i % 7 === 6 ? "border-r-0" : ""}`}>
                    <p className={`text-xs font-black mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : isCurrentMonth ? "text-foreground" : "text-muted-foreground/50"}`}>
                      {format(day, "d")}
                    </p>
                    <div className="space-y-0.5">
                      {dayShifts.slice(0, 3).map(s => (
                        <div key={s.id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate cursor-pointer group relative ${STATUS_COLORS[s.status] || "bg-slate-100 text-slate-600"}`}
                          title={`${s.staff_name} → ${s.participant_name} · ${s.start_time}–${s.end_time}`}
                          onClick={() => openEdit(s)}>
                          {s.staff_name} → {s.participant_name}
                        </div>
                      ))}
                      {dayShifts.length > 3 && (
                        <p className="text-[9px] text-muted-foreground font-bold pl-1">+{dayShifts.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 px-1">
            {Object.entries(STATUS_COLORS).map(([status, cls]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${cls.split(" ")[0]}`} />
                <span className="text-xs text-muted-foreground font-semibold">{status}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* LIST TAB */}
        <TabsContent value="list" className="mt-4">
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-border bg-secondary/50 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-black">All Shifts {staffFilter !== "all" || participantFilter !== "all" ? "(filtered)" : ""}</h3>
              <div className="flex flex-wrap gap-2">
                {["all", "Scheduled", "Confirmed", "Completed", "Cancelled", "No Show"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`text-[10px] font-black px-3 py-1 rounded-full border transition-all ${
                      statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    }`}>
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-border">
              {filteredShifts.filter(s => statusFilter === "all" || s.status === statusFilter).slice(0, 100).map((s) => (
                <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs">{s.date?.slice(5)}</div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{s.staff_name} → {s.participant_name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.date} · {s.start_time}–{s.end_time} · {s.support_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                    <button onClick={() => openCopy(s)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-blue-600"><Copy size={14} /></button>
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                    <button onClick={() => deleteShift(s.id)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-rose-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {filteredShifts.filter(s => statusFilter === "all" || s.status === statusFilter).length === 0 && (
                <p className="p-8 text-center text-muted-foreground text-sm italic">No shifts found.</p>
              )}
            </div>
          </div>
        </TabsContent>
        {/* PRINT ROSTER TAB */}
        <TabsContent value="print" className="mt-4">
          <PrintRoster shifts={filteredShifts} weekStart={weekStart} calendarMonth={calendarMonth} />
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit Shift" : "New Shift"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Staff Member</Label>
                <Select value={form.staff_name} onValueChange={(v) => update("staff_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_name} onValueChange={(v) => update("participant_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => update("date", e.target.value)} />
              </div>
              <div>
                <Label>Program Type</Label>
                <Select value={form.program_type} onValueChange={(v) => update("program_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{PROGRAM_TYPES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Support Type</Label>
                <Input value={form.support_type} onChange={e => update("support_type", e.target.value)} placeholder="Auto-filled from item code, or type manually" />
              </div>
              <div>
                <Label>Support Item Code</Label>
                <Select value={form.support_item_code} onValueChange={(v) => {
                  const item = NDIS_ITEMS.find(i => i.code === v);
                  setForm(p => ({ ...p, support_item_code: v, support_type: item ? item.name : p.support_type, hourly_rate: item ? item.rate : p.hourly_rate }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select item code..." /></SelectTrigger>
                  <SelectContent>
                    {NDIS_ITEMS.map(i => (
                      <SelectItem key={i.code} value={i.code}>
                        <span className="font-mono text-xs">{i.code}</span> — {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hourly Rate ($)</Label>
                <Input type="number" step="0.01" value={form.hourly_rate} onChange={e => update("hourly_rate", parseFloat(e.target.value) || "")} placeholder="e.g. 70.23" />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input type="time" value={form.start_time} onChange={e => update("start_time", e.target.value)} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" value={form.end_time} onChange={e => update("end_time", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Scheduled","Confirmed","Completed","Cancelled","No Show"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={save} disabled={!form.staff_name || !form.participant_name || !form.date} className="w-full rounded-xl font-bold">Save Shift</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wrench size={16} /> Bulk Update All Shifts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-2">
              <p className="font-black">What this does:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Reads the item code on every shift</li>
                <li>Sets the correct hourly rate from NDIS price guide</li>
                <li>Sets the support type description to match the code</li>
                <li>Recalculates hours and total amount</li>
                <li>Invoices &amp; payslips will auto-reflect the updated figures</li>
              </ul>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-xs space-y-1">
              <p className="font-black text-foreground mb-2">Current NDIS rates:</p>
              {NDIS_ITEMS.map(i => (
                <div key={i.code} className="flex justify-between">
                  <span className="text-muted-foreground font-mono">{i.code}</span>
                  <span className="font-bold text-foreground">${i.rate.toFixed(2)}/hr</span>
                </div>
              ))}
            </div>
            {bulkResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div className="text-sm">
                  <p className="font-black text-emerald-800">Update complete!</p>
                  <p className="text-emerald-700">{bulkResult.updated} shifts updated · {bulkResult.skipped} skipped (no item code)</p>
                </div>
              </div>
            )}
            <Button
              onClick={runBulkUpdate}
              disabled={bulkUpdating}
              className="w-full rounded-xl font-bold gap-2 bg-amber-600 hover:bg-amber-700"
            >
              {bulkUpdating ? <Loader2 size={15} className="animate-spin" /> : <Wrench size={15} />}
              {bulkUpdating ? `Updating ${shifts.length} shifts...` : `Update All ${shifts.length} Shifts`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy / Recurring Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Copy size={16} /> Copy / Repeat Shift</DialogTitle>
          </DialogHeader>
          {copySource && (
            <div className="space-y-4">
              <div className="bg-secondary rounded-xl p-3 text-sm">
                <p className="font-black">{copySource.staff_name} → {copySource.participant_name}</p>
                <p className="text-muted-foreground text-xs">{copySource.date} · {copySource.start_time}–{copySource.end_time}</p>
              </div>

              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Copy Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "nextweek", label: "Next Week", icon: ChevronRight },
                    { id: "date", label: "Specific Date", icon: Calendar },
                    { id: "recurring", label: "Recurring", icon: RefreshCw },
                  ].map(m => (
                    <button key={m.id} onClick={() => setCopyMode(m.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border font-bold text-xs transition-all ${
                        copyMode === m.id ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"
                      }`}>
                      <m.icon size={16} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {copyMode === "date" && (
                <div>
                  <Label>Copy to Date</Label>
                  <Input type="date" value={copyDate} onChange={e => setCopyDate(e.target.value)} />
                </div>
              )}

              {copyMode === "nextweek" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                  Will create 1 copy on <strong>{copySource.date ? format(addDays(parseISO(copySource.date), 7), "EEEE d MMM yyyy") : "next week"}</strong>
                </div>
              )}

              {copyMode === "recurring" && (
                <div className="space-y-3">
                  <div>
                    <Label>Repeat for how many weeks?</Label>
                    <Input type="number" min={1} max={52} value={recurWeeks} onChange={e => setRecurWeeks(parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                    Will create <strong>{recurWeeks} shifts</strong> every week on the same day/time.
                  </div>
                </div>
              )}

              <Button
                onClick={executeCopy}
                disabled={copying || (copyMode === "date" && !copyDate)}
                className="w-full rounded-xl font-bold gap-2"
              >
                {copying ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
                {copying ? "Creating shifts..." : `Create ${copyMode === "recurring" ? recurWeeks + " Shifts" : "1 Copy"}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}