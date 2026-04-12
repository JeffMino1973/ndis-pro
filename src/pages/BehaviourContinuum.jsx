import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Save, Loader2, AlertTriangle, CheckCircle, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LEVELS = {
  Low: {
    color: "bg-emerald-100 border-emerald-300 text-emerald-800",
    header: "bg-emerald-500 text-white",
    badge: "bg-emerald-100 text-emerald-700",
    label: "LOW LEVEL",
    desc: "Point-in-time managed",
    action: "Monitor and recognise positive behaviour",
    behaviours: [
      { emoji: "✅", text: "Compliance" },
      { emoji: "👀", text: "On-task" },
      { emoji: "👂", text: "Listening" },
      { emoji: "😊", text: "Following instructions" },
      { emoji: "🤝", text: "Playing/engaging nicely" },
      { emoji: "➕", text: "Positive Language" },
    ],
  },
  Minor: {
    color: "bg-blue-50 border-blue-200 text-blue-900",
    header: "bg-blue-500 text-white",
    badge: "bg-blue-100 text-blue-700",
    label: "MINOR LEVEL",
    desc: "Point-in-time managed",
    action: "Verbal reminder, monitor and document if repeated",
    behaviours: [
      { emoji: "🙇", text: "Off-task" },
      { emoji: "🏃", text: "Running / unsafe movement" },
      { emoji: "🗨️", text: "Speaking out of turn" },
      { emoji: "📒", text: "Work avoidance" },
      { emoji: "🔊", text: "Speaking loudly / screaming" },
      { emoji: "🤪", text: "Silliness" },
      { emoji: "😥", text: "Crying / upset" },
    ],
  },
  Major: {
    color: "bg-amber-50 border-amber-200 text-amber-900",
    header: "bg-amber-500 text-white",
    badge: "bg-amber-100 text-amber-700",
    label: "MAJOR LEVEL",
    desc: "Record in incident log",
    action: "Record incident, notify supervisor, implement support strategies",
    behaviours: [
      { emoji: "🏃", text: "Absconding / Elopement" },
      { emoji: "🙇", text: "Defiance / Refusal" },
      { emoji: "💬", text: "Disruption" },
      { emoji: "🤬", text: "Excessive Swearing" },
      { emoji: "😛", text: "Intimidation" },
      { emoji: "🤼", text: "Rough Play" },
      { emoji: "💦", text: "Spitting" },
      { emoji: "👉", text: "Teasing" },
    ],
  },
  Extreme: {
    color: "bg-orange-50 border-orange-300 text-orange-900",
    header: "bg-orange-600 text-white",
    badge: "bg-orange-100 text-orange-700",
    label: "EXTREME LEVEL",
    desc: "Referral to supervisor",
    action: "Immediate supervisor notification, detailed incident report required",
    behaviours: [
      { emoji: "🤬", text: "Abusive Language" },
      { emoji: "🤜", text: "Aggressive Behaviour (no injury)" },
      { emoji: "👊", text: "Bullying" },
      { emoji: "💻", text: "Cyber-Bullying" },
      { emoji: "👉", text: "Harassment" },
      { emoji: "💥", text: "Property Damage / Vandalism" },
      { emoji: "🚓", text: "Discrimination (first instance)" },
      { emoji: "💏", text: "Sexualised Behaviours" },
      { emoji: "🗣️", text: "Verbal Abuse" },
    ],
  },
  Crisis: {
    color: "bg-rose-50 border-rose-400 text-rose-900",
    header: "bg-rose-700 text-white",
    badge: "bg-rose-100 text-rose-700",
    label: "🚨 CRISIS",
    desc: "Immediate escalation required",
    action: "CALL FOR HELP IMMEDIATELY — do not manage alone",
    behaviours: [
      { emoji: "👊", text: "Assault" },
      { emoji: "🛑", text: "Persistent dangerous behaviour" },
      { emoji: "⚠️", text: "Physical Violence" },
      { emoji: "💥", text: "Destruction of property" },
      { emoji: "🧠", text: "Psychological Abuse" },
      { emoji: "🔫", text: "Weapon / dangerous implement" },
      { emoji: "☠️", text: "Substance use / supply" },
      { emoji: "🚨", text: "Serious criminal behaviour" },
    ],
  },
};

const RESTORATIVE = [
  { emoji: "💬", key: "ENGAGE", question: "Tell me what happened. Why?" },
  { emoji: "🧑", key: "EXPLAIN", question: "Did we hear your side of the story? Are you clear on what went wrong and how it affected others?" },
  { emoji: "👍", key: "EXPECTATION", question: "Are you clear on the expected behaviour and any consequences for not meeting that standard?" },
];

export default function BehaviourContinuum() {
  const [participants, setParticipants] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("continuum"); // continuum | log | history
  const [filterLevel, setFilterLevel] = useState("all");

  // Log form
  const [form, setForm] = useState({
    participant_name: "", staff_name: "", incident_date: new Date().toISOString().split("T")[0],
    incident_time: new Date().toTimeString().slice(0, 5), location: "",
    level: "", behaviours: [], antecedent: "", description: "",
    action_taken: "", restorative_notes: "", outcome: "",
    follow_up_required: false, notified_supervisor: false, status: "Open",
  });
  const [saving, setSaving] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const load = async () => {
    const [parts, inc] = await Promise.all([
      base44.entities.Participant.list(),
      base44.entities.BehaviourIncident.list("-incident_date", 100),
    ]);
    setParticipants(parts);
    setIncidents(inc);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleBehaviour = (text) => {
    setForm(p => ({
      ...p,
      behaviours: p.behaviours.includes(text) ? p.behaviours.filter(b => b !== text) : [...p.behaviours, text],
    }));
  };

  const selectLevel = (level) => {
    setSelectedLevel(level);
    setF("level", level);
    setF("behaviours", []);
  };

  const save = async () => {
    setSaving(true);
    await base44.entities.BehaviourIncident.create(form);
    setSaving(false);
    setView("history");
    setForm(p => ({ ...p, level: "", behaviours: [], description: "", action_taken: "", restorative_notes: "", outcome: "" }));
    load();
  };

  const LEVEL_ORDER = ["Low", "Minor", "Major", "Extreme", "Crisis"];
  const filteredIncidents = filterLevel === "all" ? incidents : incidents.filter(i => i.level === filterLevel);

  // ── CONTINUUM OVERVIEW ──
  const renderContinuum = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Behaviour Continuum</h2>
          <p className="text-muted-foreground text-sm">Interactive behaviour level guide — click a level to log an incident.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setView("log")} className="rounded-xl font-bold gap-2"><Plus size={15} /> Log Incident</Button>
          <Button variant="outline" onClick={() => setView("history")} className="rounded-xl font-bold gap-2">History ({incidents.length})</Button>
        </div>
      </div>

      {/* Continuum grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {LEVEL_ORDER.map(level => {
          const L = LEVELS[level];
          return (
            <div key={level} className={`border-2 rounded-2xl overflow-hidden ${L.color}`}>
              <div className={`px-4 py-3 ${L.header}`}>
                <p className="font-black text-sm">{L.label}</p>
                <p className="text-xs opacity-80">{L.desc}</p>
              </div>
              <div className="p-3 space-y-1.5">
                {L.behaviours.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => { selectLevel(level); setView("log"); }}
                    className="w-full text-left text-xs flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/10 transition-colors"
                  >
                    <span>{b.emoji}</span> <span>{b.text}</span>
                  </button>
                ))}
              </div>
              <div className="px-3 pb-3">
                <button
                  onClick={() => { selectLevel(level); setView("log"); }}
                  className={`w-full text-[10px] font-black py-1.5 rounded-lg ${L.header} opacity-80 hover:opacity-100 transition-opacity`}
                >
                  + Log {level} Incident
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restorative prompts */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <h3 className="font-black text-base mb-4 flex items-center gap-2"><MessageSquare size={16} className="text-primary" /> Restorative Conversation Prompts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {RESTORATIVE.map(r => (
            <div key={r.key} className="bg-secondary rounded-2xl p-4">
              <p className="text-2xl mb-2">{r.emoji}</p>
              <p className="font-black text-sm text-primary mb-1">{r.key}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.question}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Crisis response */}
      <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6">
        <h3 className="font-black text-rose-700 mb-4">🚨 Crisis Response Protocol</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-rose-200 rounded-2xl p-4">
            <p className="font-black text-sm mb-2">🏢 INDOORS</p>
            <ol className="space-y-1 text-sm text-rose-800">
              <li>1. Call supervisor and state CRISIS is occurring</li>
              <li>2. Monitor participant and keep others safe</li>
              <li>3. Supervisor/delegate responds immediately</li>
            </ol>
          </div>
          <div className="bg-white border border-rose-200 rounded-2xl p-4">
            <p className="font-black text-sm mb-2">☀️ OUTDOORS</p>
            <ol className="space-y-1 text-sm text-rose-800">
              <li>1. Send another staff member for help immediately</li>
              <li>2. Monitor participant and keep others safe</li>
              <li>3. Do not leave participant alone</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );

  // ── LOG FORM ──
  const renderLog = () => {
    const levelData = selectedLevel ? LEVELS[selectedLevel] : null;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => setView("continuum")} className="text-primary text-sm font-bold hover:underline">← Back to Continuum</button>
            <h2 className="text-2xl font-black mt-1">Log Behaviour Incident</h2>
          </div>
          <Button onClick={save} disabled={!form.participant_name || !form.level || saving} className="rounded-xl font-bold gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Incident
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h3 className="font-black text-base">Incident Details</h3>
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_name} onValueChange={v => setF("participant_name", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select participant..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Staff Name</Label><Input value={form.staff_name} onChange={e => setF("staff_name", e.target.value)} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Date</Label><Input type="date" value={form.incident_date} onChange={e => setF("incident_date", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Time</Label><Input type="time" value={form.incident_time} onChange={e => setF("incident_time", e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Location</Label><Input value={form.location} onChange={e => setF("location", e.target.value)} placeholder="e.g. Day program, community, home" className="mt-1" /></div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h3 className="font-black text-base">Behaviour Level</h3>
              <div className="grid grid-cols-5 gap-1.5">
                {LEVEL_ORDER.map(level => (
                  <button
                    key={level}
                    onClick={() => selectLevel(level)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-black transition-all border-2 ${
                      form.level === level ? LEVELS[level].header + " border-transparent" : "bg-secondary text-muted-foreground border-transparent hover:border-primary/30"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              {form.level && (
                <div className="mt-2">
                  <p className="text-xs font-black text-muted-foreground mb-2">Select behaviours observed:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LEVELS[form.level].behaviours.map((b, i) => (
                      <button
                        key={i}
                        onClick={() => toggleBehaviour(b.text)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl border font-semibold transition-all ${
                          form.behaviours.includes(b.text) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border hover:border-primary/50"
                        }`}
                      >
                        {b.emoji} {b.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {levelData && (
                <div className={`p-3 rounded-xl text-xs font-bold ${levelData.badge}`}>
                  📋 {levelData.action}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h3 className="font-black text-base">Description & Actions</h3>
              <div><Label className="text-xs">Antecedent / Trigger</Label><Input value={form.antecedent} onChange={e => setF("antecedent", e.target.value)} placeholder="What happened before the behaviour?" className="mt-1" /></div>
              <div><Label className="text-xs">Description of Behaviour</Label><Textarea value={form.description} onChange={e => setF("description", e.target.value)} placeholder="Describe what happened in detail..." className="mt-1 min-h-[80px] text-sm" /></div>
              <div><Label className="text-xs">Action Taken</Label><Textarea value={form.action_taken} onChange={e => setF("action_taken", e.target.value)} placeholder="What did you do in response?" className="mt-1 min-h-[70px] text-sm" /></div>
              <div><Label className="text-xs">Outcome</Label><Input value={form.outcome} onChange={e => setF("outcome", e.target.value)} className="mt-1" /></div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h3 className="font-black text-base flex items-center gap-2"><MessageSquare size={15} className="text-primary" /> Restorative Conversation</h3>
              {RESTORATIVE.map(r => (
                <div key={r.key} className="bg-secondary rounded-xl p-3">
                  <p className="text-xs font-black text-primary mb-1">{r.emoji} {r.key}</p>
                  <p className="text-xs text-muted-foreground mb-2 italic">"{r.question}"</p>
                  <Textarea value={form.restorative_notes?.split("||")[RESTORATIVE.indexOf(r)] || ""} onChange={e => {
                    const parts = (form.restorative_notes || "||").split("||");
                    parts[RESTORATIVE.indexOf(r)] = e.target.value;
                    setF("restorative_notes", parts.join("||"));
                  }} placeholder="Notes..." className="min-h-[50px] text-xs" />
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="followup" checked={form.follow_up_required} onChange={e => setF("follow_up_required", e.target.checked)} className="w-4 h-4 accent-primary" />
                <label htmlFor="followup" className="text-sm font-bold cursor-pointer">Follow-up required</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="supervisor" checked={form.notified_supervisor} onChange={e => setF("notified_supervisor", e.target.checked)} className="w-4 h-4 accent-primary" />
                <label htmlFor="supervisor" className="text-sm font-bold cursor-pointer">Supervisor notified</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── HISTORY ──
  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => setView("continuum")} className="text-primary text-sm font-bold hover:underline">← Continuum</button>
          <h2 className="text-2xl font-black mt-1">Incident History</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Filter level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {LEVEL_ORDER.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setView("log")} className="rounded-xl font-bold gap-2"><Plus size={14} /> Log New</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {LEVEL_ORDER.map(level => {
          const count = incidents.filter(i => i.level === level).length;
          const L = LEVELS[level];
          return (
            <div key={level} className={`rounded-2xl p-3 text-center border-2 ${L.color}`}>
              <p className="text-2xl font-black">{count}</p>
              <p className="text-[10px] font-black">{level}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : filteredIncidents.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
          <p className="text-muted-foreground">No incidents recorded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map(inc => {
            const L = LEVELS[inc.level] || LEVELS.Minor;
            return (
              <div key={inc.id} className={`border-l-4 bg-card border border-border rounded-2xl p-4 ${
                inc.level === "Crisis" ? "border-l-rose-600" :
                inc.level === "Extreme" ? "border-l-orange-500" :
                inc.level === "Major" ? "border-l-amber-500" :
                inc.level === "Minor" ? "border-l-blue-400" : "border-l-emerald-500"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${L.badge}`}>{inc.level}</span>
                      <p className="font-black text-foreground text-sm">{inc.participant_name}</p>
                      <p className="text-xs text-muted-foreground">{inc.incident_date} {inc.incident_time}</p>
                    </div>
                    {inc.behaviours?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {inc.behaviours.map((b, i) => <span key={i} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-foreground">{b}</span>)}
                      </div>
                    )}
                    {inc.description && <p className="text-xs text-muted-foreground mt-1">{inc.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${inc.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : inc.status === "Escalated" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{inc.status}</span>
                    {inc.follow_up_required && <p className="text-[10px] text-rose-600 font-bold mt-1">⚠ Follow-up required</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (view === "log") return renderLog();
  if (view === "history") return renderHistory();
  return renderContinuum();
}