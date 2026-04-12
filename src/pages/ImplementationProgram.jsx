import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Plus, Save, Printer, ChevronDown, ChevronUp, CheckCircle, Circle,
  ClipboardList, Target, Loader2, Trash2, BarChart3, BookOpen, Edit, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BRONWYN_TEMPLATE = {
  participant_name: "Bronwyn Chau",
  ndis_number: "430117666",
  primary_goal: "Independent travel between Coogee and Botany",
  focus: "Community participation & transport independence",
  program_overview: "A phased support worker implementation program designed to build Bronwyn's confidence and independence in community travel. Staff will progressively reduce support from full guidance to supervised independence, tracking skill development at each stage.",
  session_structure: "1. Pre-journey check-in (5 min): Review route, check Opal card balance, confirm destination.\n2. Journey execution: Follow the route with agreed support level.\n3. Post-journey debrief (5–10 min): Discuss what went well, any challenges, and goals for next session.\n4. Progress note: Complete NDIS-compliant note in the app.",
  data_collection_notes: "Record support level used each session (%), skills demonstrated independently, any safety incidents, participant mood/confidence rating (1–5), and next session focus area.",
  status: "Active",
  start_date: new Date().toISOString().split("T")[0],
  phases: [
    { phase_number: 1, name: "FULL SUPPORT", weeks: "Week 1–2", goal: "Build familiarity and confidence with the route", support_level: "100%", worker_role: "Instructor + Model", completed: false },
    { phase_number: 2, name: "GUIDED PRACTICE", weeks: "Week 2–4", goal: "Build active participation and route recall", support_level: "50–70%", worker_role: "Coach", completed: false },
    { phase_number: 3, name: "SUPERVISED INDEPENDENCE", weeks: "Week 4–6", goal: "Independent execution with backup available", support_level: "10–30%", worker_role: "Observer", completed: false },
    { phase_number: 4, name: "INDEPENDENT TRIAL", weeks: "Week 6+", goal: "Confirm independence and exit support", support_level: "0–10%", worker_role: "Standby only", completed: false },
  ],
  skill_targets: [
    { skill: "Read and interpret bus timetables", achieved: false },
    { skill: "Tap on/off with Opal card correctly", achieved: false },
    { skill: "Navigate to correct bus stop independently", achieved: false },
    { skill: "Identify correct bus number and direction", achieved: false },
    { skill: "Manage delays or route changes calmly", achieved: false },
    { skill: "Use mobile phone for Opal app / Google Maps", achieved: false },
    { skill: "Communicate with driver or passengers if needed", achieved: false },
    { skill: "Arrive at destination safely and on time", achieved: false },
  ],
  required_tools: [
    "Opal Card",
    "Mobile phone with Opal App",
    "Emergency contact list",
    "Visual route guide (optional)",
  ],
  risk_strategies: [
    "Support worker carries participant's emergency contact card",
    "Agree on a 'safe word' or signal if participant feels overwhelmed",
    "Worker remains within visual range during Phase 3",
    "Participant has support worker number saved on speed dial",
    "Risk assessment completed prior to first independent trial",
  ],
  session_logs: [],
};

const PHASE_COLORS = ["bg-blue-600", "bg-amber-500", "bg-emerald-500", "bg-purple-600"];

export default function ImplementationProgram() {
  const [programs, setPrograms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("list"); // list | form | detail
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ phases: true, skills: true, logs: true });
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split("T")[0], phase: "Phase 1", support_level_used: "", skills_practiced: "", participant_response: "", incidents: "", next_session_focus: "", logged_by: "" });

  const load = async () => {
    const data = await base44.entities.ImplementationProgram.list("-created_date");
    setPrograms(data);
  };

  useEffect(() => { load(); }, []);

  const startNew = (template = null) => {
    setForm(template ? { ...template } : {
      participant_name: "", ndis_number: "", primary_goal: "", focus: "",
      program_overview: "", session_structure: "", data_collection_notes: "",
      status: "Active", start_date: new Date().toISOString().split("T")[0],
      phases: [
        { phase_number: 1, name: "FULL SUPPORT", weeks: "Week 1–2", goal: "", support_level: "100%", worker_role: "Instructor", completed: false },
        { phase_number: 2, name: "GUIDED PRACTICE", weeks: "Week 2–4", goal: "", support_level: "50–70%", worker_role: "Coach", completed: false },
        { phase_number: 3, name: "SUPERVISED INDEPENDENCE", weeks: "Week 4–6", goal: "", support_level: "10–30%", worker_role: "Observer", completed: false },
        { phase_number: 4, name: "INDEPENDENT TRIAL", weeks: "Week 6+", goal: "", support_level: "0–10%", worker_role: "Standby", completed: false },
      ],
      skill_targets: [{ skill: "", achieved: false }],
      required_tools: [""],
      risk_strategies: [""],
      session_logs: [],
    });
    setView("form");
  };

  const save = async () => {
    setSaving(true);
    const saved = await base44.entities.ImplementationProgram.create(form);
    await load();
    setSelected(saved);
    setView("detail");
    setSaving(false);
  };

  const openDetail = (prog) => { setSelected(prog); setView("detail"); };

  const addLog = async () => {
    const updated = { ...selected, session_logs: [...(selected.session_logs || []), newLog] };
    await base44.entities.ImplementationProgram.update(selected.id, { session_logs: updated.session_logs });
    setSelected(updated);
    setNewLog({ date: new Date().toISOString().split("T")[0], phase: "Phase 1", support_level_used: "", skills_practiced: "", participant_response: "", incidents: "", next_session_focus: "", logged_by: "" });
    await load();
  };

  const toggleSkill = async (i) => {
    const skills = selected.skill_targets.map((s, idx) => idx === i ? { ...s, achieved: !s.achieved } : s);
    const updated = { ...selected, skill_targets: skills };
    await base44.entities.ImplementationProgram.update(selected.id, { skill_targets: skills });
    setSelected(updated);
  };

  const togglePhase = async (i) => {
    const phases = selected.phases.map((p, idx) => idx === i ? { ...p, completed: !p.completed } : p);
    const updated = { ...selected, phases };
    await base44.entities.ImplementationProgram.update(selected.id, { phases });
    setSelected(updated);
  };

  const toggle = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const completedSkills = (p) => (p.skill_targets || []).filter(s => s.achieved).length;
  const completedPhases = (p) => (p.phases || []).filter(ph => ph.completed).length;

  // ── LIST VIEW ──
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Implementation Programs</h2>
            <p className="text-muted-foreground text-sm">Support worker phased implementation & skill tracking.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => startNew(BRONWYN_TEMPLATE)} className="rounded-xl font-bold gap-2 text-sm">
              <BookOpen size={15} /> Import Bronwyn's Program
            </Button>
            <Button onClick={() => startNew()} className="rounded-xl font-bold gap-2">
              <Plus size={15} /> New Program
            </Button>
          </div>
        </div>

        {programs.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
            <ClipboardList size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-black text-xl mb-2">No Programs Yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Create a new program or import Bronwyn's existing program from the document.</p>
            <Button onClick={() => startNew(BRONWYN_TEMPLATE)} className="rounded-xl font-bold gap-2">
              <BookOpen size={15} /> Import Bronwyn's Program
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {programs.map(prog => (
              <div key={prog.id} onClick={() => openDetail(prog)} className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-black text-foreground">{prog.participant_name}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${prog.status === "Active" ? "bg-emerald-100 text-emerald-700" : prog.status === "Completed" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{prog.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{prog.primary_goal}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary rounded-xl p-3">
                    <p className="text-xl font-black text-primary">{completedPhases(prog)}/{(prog.phases || []).length}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Phases</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-3">
                    <p className="text-xl font-black text-emerald-600">{completedSkills(prog)}/{(prog.skill_targets || []).length}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Skills</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Overall Progress</span>
                    <span>{(prog.skill_targets || []).length > 0 ? Math.round(completedSkills(prog) / (prog.skill_targets || []).length * 100) : 0}%</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(prog.skill_targets || []).length > 0 ? Math.round(completedSkills(prog) / (prog.skill_targets || []).length * 100) : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── FORM VIEW ──
  if (view === "form" && form) {
    const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => setView("list")} className="text-primary text-sm font-bold hover:underline">← Back</button>
            <h2 className="text-2xl font-black mt-1">New Implementation Program</h2>
          </div>
          <Button onClick={save} disabled={!form.participant_name || saving} className="rounded-xl font-bold gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Program
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Participant Details */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h3 className="font-black text-lg">Participant & Program Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Participant Name *</Label><Input value={form.participant_name} onChange={e => setF("participant_name", e.target.value)} className="mt-1" /></div>
              <div><Label>NDIS Number</Label><Input value={form.ndis_number} onChange={e => setF("ndis_number", e.target.value)} className="mt-1" /></div>
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setF("start_date", e.target.value)} className="mt-1" /></div>
              <div className="col-span-2"><Label>Primary Goal</Label><Input value={form.primary_goal} onChange={e => setF("primary_goal", e.target.value)} className="mt-1" /></div>
              <div className="col-span-2"><Label>Focus Area</Label><Input value={form.focus} onChange={e => setF("focus", e.target.value)} className="mt-1" /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setF("status", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Active","Draft","On Hold","Completed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Program Overview</Label><Textarea value={form.program_overview} onChange={e => setF("program_overview", e.target.value)} className="mt-1 min-h-[80px]" /></div>
            <div><Label>Session Structure</Label><Textarea value={form.session_structure} onChange={e => setF("session_structure", e.target.value)} className="mt-1 min-h-[80px]" /></div>
            <div><Label>Data Collection Notes</Label><Textarea value={form.data_collection_notes} onChange={e => setF("data_collection_notes", e.target.value)} className="mt-1 min-h-[60px]" /></div>
          </div>

          {/* Phases */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6">
              <h3 className="font-black text-lg mb-4">Implementation Phases</h3>
              <div className="space-y-3">
                {(form.phases || []).map((ph, i) => (
                  <div key={i} className="p-4 bg-secondary rounded-2xl space-y-2">
                    <div className={`inline-block text-white text-[10px] font-black px-2 py-0.5 rounded-full ${PHASE_COLORS[i] || "bg-slate-500"}`}>Phase {ph.phase_number}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[10px]">Phase Name</Label><Input value={ph.name} onChange={e => { const phases = form.phases.map((p, idx) => idx === i ? { ...p, name: e.target.value } : p); setF("phases", phases); }} className="h-8 text-xs mt-0.5" /></div>
                      <div><Label className="text-[10px]">Weeks</Label><Input value={ph.weeks} onChange={e => { const phases = form.phases.map((p, idx) => idx === i ? { ...p, weeks: e.target.value } : p); setF("phases", phases); }} className="h-8 text-xs mt-0.5" /></div>
                      <div><Label className="text-[10px]">Support Level</Label><Input value={ph.support_level} onChange={e => { const phases = form.phases.map((p, idx) => idx === i ? { ...p, support_level: e.target.value } : p); setF("phases", phases); }} className="h-8 text-xs mt-0.5" /></div>
                      <div><Label className="text-[10px]">Worker Role</Label><Input value={ph.worker_role} onChange={e => { const phases = form.phases.map((p, idx) => idx === i ? { ...p, worker_role: e.target.value } : p); setF("phases", phases); }} className="h-8 text-xs mt-0.5" /></div>
                      <div className="col-span-2"><Label className="text-[10px]">Phase Goal</Label><Input value={ph.goal} onChange={e => { const phases = form.phases.map((p, idx) => idx === i ? { ...p, goal: e.target.value } : p); setF("phases", phases); }} className="h-8 text-xs mt-0.5" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-card border border-border rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-lg">Skill Targets</h3>
                <Button variant="outline" size="sm" onClick={() => setF("skill_targets", [...(form.skill_targets || []), { skill: "", achieved: false }])} className="rounded-lg gap-1"><Plus size={12} /> Add</Button>
              </div>
              <div className="space-y-2">
                {(form.skill_targets || []).map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={s.skill} onChange={e => { const st = form.skill_targets.map((x, idx) => idx === i ? { ...x, skill: e.target.value } : x); setF("skill_targets", st); }} placeholder="Skill description..." className="text-sm h-8" />
                    <button onClick={() => setF("skill_targets", form.skill_targets.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools & Risks */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-black">Required Tools</h4>
                  <Button variant="outline" size="sm" onClick={() => setF("required_tools", [...(form.required_tools || []), ""])} className="rounded-lg gap-1"><Plus size={12} /></Button>
                </div>
                <div className="space-y-2">
                  {(form.required_tools || []).map((t, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={t} onChange={e => { const tools = form.required_tools.map((x, idx) => idx === i ? e.target.value : x); setF("required_tools", tools); }} className="text-sm h-8" />
                      <button onClick={() => setF("required_tools", form.required_tools.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-black">Risk Strategies</h4>
                  <Button variant="outline" size="sm" onClick={() => setF("risk_strategies", [...(form.risk_strategies || []), ""])} className="rounded-lg gap-1"><Plus size={12} /></Button>
                </div>
                <div className="space-y-2">
                  {(form.risk_strategies || []).map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={r} onChange={e => { const risks = form.risk_strategies.map((x, idx) => idx === i ? e.target.value : x); setF("risk_strategies", risks); }} className="text-sm h-8" />
                      <button onClick={() => setF("risk_strategies", form.risk_strategies.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ──
  if (view === "detail" && selected) {
    const skillPct = (selected.skill_targets || []).length > 0
      ? Math.round(completedSkills(selected) / (selected.skill_targets || []).length * 100)
      : 0;
    const currentPhase = (selected.phases || []).find(p => !p.completed) || selected.phases?.[selected.phases.length - 1];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <button onClick={() => setView("list")} className="text-primary text-sm font-bold hover:underline">← All Programs</button>
            <h2 className="text-2xl font-black mt-1">{selected.participant_name}</h2>
            <p className="text-muted-foreground text-sm">{selected.primary_goal}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black ${selected.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{selected.status}</span>
            <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2 font-bold text-sm no-print"><Printer size={14} /> Print</Button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Current Phase", value: currentPhase?.name || "—", color: "text-blue-600" },
            { label: "Support Level", value: currentPhase?.support_level || "—", color: "text-amber-600" },
            { label: "Skills Achieved", value: `${completedSkills(selected)}/${(selected.skill_targets || []).length}`, color: "text-emerald-600" },
            { label: "Sessions Logged", value: (selected.session_logs || []).length, color: "text-primary" },
          ].map(k => (
            <div key={k.label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>Overall Skill Progress</span><span>{skillPct}%</span>
          </div>
          <div className="h-3 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${skillPct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">

            {/* Phases */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              <button onClick={() => toggle("phases")} className="w-full flex justify-between items-center px-6 py-4 hover:bg-secondary transition-colors">
                <h3 className="font-black text-base flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Implementation Phases</h3>
                {expandedSections.phases ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.phases && (
                <div className="px-6 pb-6 space-y-3">
                  {(selected.phases || []).map((ph, i) => (
                    <div key={i} className={`border rounded-2xl overflow-hidden ${ph.completed ? "border-emerald-200" : "border-border"}`}>
                      <div className={`px-5 py-3 flex items-center justify-between ${ph.completed ? "bg-emerald-50" : "bg-secondary"}`}>
                        <div className="flex items-center gap-3">
                          <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded-full ${PHASE_COLORS[i] || "bg-slate-500"}`}>Phase {ph.phase_number}</span>
                          <div>
                            <p className="font-black text-sm">{ph.name}</p>
                            <p className="text-[10px] text-muted-foreground">{ph.weeks} · Support: {ph.support_level} · Role: {ph.worker_role}</p>
                          </div>
                        </div>
                        <button onClick={() => togglePhase(i)} className={ph.completed ? "text-emerald-600" : "text-muted-foreground hover:text-emerald-600"}>
                          {ph.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </button>
                      </div>
                      {ph.goal && (
                        <div className="px-5 py-3 text-sm text-muted-foreground">
                          <span className="font-bold text-foreground">Goal: </span>{ph.goal}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Logs */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              <button onClick={() => toggle("logs")} className="w-full flex justify-between items-center px-6 py-4 hover:bg-secondary transition-colors">
                <h3 className="font-black text-base flex items-center gap-2"><ClipboardList size={16} className="text-primary" /> Session Logs ({(selected.session_logs || []).length})</h3>
                {expandedSections.logs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.logs && (
                <div className="px-6 pb-6 space-y-4">
                  {/* New Log Form */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Log New Session</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div><Label className="text-[10px]">Date</Label><Input type="date" value={newLog.date} onChange={e => setNewLog(p => ({ ...p, date: e.target.value }))} className="h-8 text-xs mt-0.5" /></div>
                      <div><Label className="text-[10px]">Phase</Label>
                        <Select value={newLog.phase} onValueChange={v => setNewLog(p => ({ ...p, phase: v }))}>
                          <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                          <SelectContent>{(selected.phases || []).map(ph => <SelectItem key={ph.phase_number} value={`Phase ${ph.phase_number}`}>Phase {ph.phase_number} — {ph.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-[10px]">Support Level Used</Label><Input value={newLog.support_level_used} onChange={e => setNewLog(p => ({ ...p, support_level_used: e.target.value }))} placeholder="e.g. 70%" className="h-8 text-xs mt-0.5" /></div>
                      <div><Label className="text-[10px]">Logged By</Label><Input value={newLog.logged_by} onChange={e => setNewLog(p => ({ ...p, logged_by: e.target.value }))} placeholder="Staff name" className="h-8 text-xs mt-0.5" /></div>
                    </div>
                    <div><Label className="text-[10px]">Skills Practiced</Label><Textarea value={newLog.skills_practiced} onChange={e => setNewLog(p => ({ ...p, skills_practiced: e.target.value }))} placeholder="What skills did the participant practice today?" className="text-xs min-h-[50px] mt-0.5" /></div>
                    <div><Label className="text-[10px]">Participant Response</Label><Textarea value={newLog.participant_response} onChange={e => setNewLog(p => ({ ...p, participant_response: e.target.value }))} placeholder="How did the participant respond? Mood, confidence, challenges..." className="text-xs min-h-[50px] mt-0.5" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-[10px]">Incidents / Concerns</Label><Input value={newLog.incidents} onChange={e => setNewLog(p => ({ ...p, incidents: e.target.value }))} placeholder="None" className="h-8 text-xs mt-0.5" /></div>
                      <div><Label className="text-[10px]">Next Session Focus</Label><Input value={newLog.next_session_focus} onChange={e => setNewLog(p => ({ ...p, next_session_focus: e.target.value }))} className="h-8 text-xs mt-0.5" /></div>
                    </div>
                    <Button onClick={addLog} size="sm" className="rounded-xl gap-1 font-bold"><Save size={13} /> Save Session Log</Button>
                  </div>

                  {/* Existing Logs */}
                  {(selected.session_logs || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No sessions logged yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {[...(selected.session_logs || [])].reverse().map((log, i) => (
                        <div key={i} className="bg-secondary rounded-2xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-foreground">{log.date}</span>
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{log.phase}</span>
                              {log.support_level_used && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{log.support_level_used} support</span>}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{log.logged_by}</span>
                          </div>
                          {log.skills_practiced && <p className="text-xs text-foreground mb-1"><span className="font-bold">Skills: </span>{log.skills_practiced}</p>}
                          {log.participant_response && <p className="text-xs text-muted-foreground mb-1"><span className="font-bold text-foreground">Response: </span>{log.participant_response}</p>}
                          {log.next_session_focus && <p className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Next: </span>{log.next_session_focus}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Skill Targets */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              <button onClick={() => toggle("skills")} className="w-full flex justify-between items-center px-5 py-4 hover:bg-secondary">
                <h3 className="font-black flex items-center gap-2"><Target size={15} className="text-emerald-600" /> Skills ({completedSkills(selected)}/{(selected.skill_targets || []).length})</h3>
                {expandedSections.skills ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {expandedSections.skills && (
                <div className="px-5 pb-5 space-y-2">
                  {(selected.skill_targets || []).map((s, i) => (
                    <button key={i} onClick={() => toggleSkill(i)} className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors ${s.achieved ? "bg-emerald-50 border border-emerald-200" : "bg-secondary hover:bg-primary/5"}`}>
                      {s.achieved ? <CheckCircle size={16} className="text-emerald-600 shrink-0" /> : <Circle size={16} className="text-muted-foreground shrink-0" />}
                      <span className={`text-xs font-semibold ${s.achieved ? "text-emerald-700 line-through" : "text-foreground"}`}>{s.skill}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Required Tools */}
            {(selected.required_tools || []).length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h4 className="font-black text-sm mb-3">Required Tools</h4>
                <ul className="space-y-1.5">
                  {(selected.required_tools || []).map((t, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-foreground"><span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Strategies */}
            {(selected.risk_strategies || []).length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h4 className="font-black text-sm mb-3 text-amber-800">⚠️ Risk Strategies</h4>
                <ul className="space-y-1.5">
                  {(selected.risk_strategies || []).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-amber-700"><span className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Session Structure */}
            {selected.session_structure && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h4 className="font-black text-sm mb-2">Session Structure</h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{selected.session_structure}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}