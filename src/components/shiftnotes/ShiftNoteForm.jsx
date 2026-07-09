import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, ClipboardCheck, MessageSquare, Check } from "lucide-react";

const TRAVEL_TASKS = [
  "Met participant at agreed location",
  "Travelled by public transport (bus)",
  "Practiced road safety at crossings",
  "Arrived at Royal Randwick Shopping Centre",
  "Return travel completed safely",
];

const WORK_TRAVEL_TASKS = [
  "Met participant at Rainbow St, Coogee",
  "Travelled to Lord St, Botany",
  "Arrived at workplace on time",
  "Return travel to Coogee completed safely",
  "Practiced road safety at crossings",
  "Used Opal card / paid fare",
];

const LIFE_SKILLS_TASKS = [
  "Used a shopping list",
  "Located items independently",
  "Compared prices",
  "Interacted with retail staff",
  "Completed purchase at checkout",
  "Managed payment (cash/card)",
  "Practiced budgeting skills",
  "Followed multi-step instructions",
  "Demonstrated appropriate social skills",
  "Maintained personal safety awareness",
];

const ENGAGEMENT_OPTS = ["High", "Medium", "Low"];
const SUPPORT_OPTS = ["Independent", "Minimal Prompt", "Verbal Prompt", "Full Support"];
const MOOD_OPTS = ["Calm", "Positive", "Anxious", "Distracted", "Other"];
const WEATHER_OPTS = ["Fine", "Overcast", "Rainy", "Windy"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const ROUTES = {
  "Life Skills Program": "Rainbow Street → Royal Randwick Shopping Centre",
  "Travel Training": "Rainbow Street → Royal Randwick Shopping Centre",
  "Travel to/from Work": "Rainbow Street, Coogee → Lord St, Botany (return)",
  "Other": "",
};

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon size={15} className="text-primary" />
      </div>
      <h3 className="text-sm font-black text-foreground">{children}</h3>
    </div>
  );
}

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
            value === opt
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/30"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function CheckItem({ label, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-all w-full border-2 ${
        checked ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-card border-border hover:border-primary/20"
      }`}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
        checked ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
      }`}>
        {checked && <Check size={12} className="text-white" />}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default function ShiftNoteForm({ staffMembers, participants, defaultStaffName, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    staff_name: defaultStaffName || "",
    participant_name: "",
    shift_date: new Date().toISOString().split("T")[0],
    day_of_week: "",
    program_type: "Life Skills Program",
    travel_route: "Rainbow Street → Royal Randwick Shopping Centre",
    tasks_completed: [],
    participant_engagement: "",
    support_level: "",
    mood_behaviour: "",
    weather: "",
    progress_notes: "",
    safety_observations: "",
    next_session_goals: "",
    staff_signature: defaultStaffName || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const setProgramType = (val) => {
    set("program_type", val);
    set("travel_route", ROUTES[val] ?? "");
    set("tasks_completed", []);
  };

  const updateDate = (date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dow = days[new Date(date + "T00:00:00").getDay()];
    set("shift_date", date);
    set("day_of_week", DAYS.includes(dow) ? dow : "");
  };

  const toggleTask = (task) => {
    set("tasks_completed", form.tasks_completed.includes(task)
      ? form.tasks_completed.filter(t => t !== task)
      : [...form.tasks_completed, task]);
  };

  const canSubmit = form.staff_name && form.participant_name && form.shift_date && form.staff_signature;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  const inputCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm";
  const labelCls = "text-xs font-bold text-muted-foreground block mb-1";

  return (
    <div className="space-y-5">
      {/* ── Shift Details ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <SectionTitle icon={ClipboardCheck}>Shift Details</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Staff Name *</label>
            <select className={inputCls} value={form.staff_name} onChange={e => set("staff_name", e.target.value)}>
              <option value="">Select staff…</option>
              {staffMembers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Participant Name *</label>
            <select className={inputCls} value={form.participant_name} onChange={e => set("participant_name", e.target.value)}>
              <option value="">Select participant…</option>
              {participants.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Shift Date *</label>
            <input type="date" className={inputCls} value={form.shift_date} onChange={e => updateDate(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Day</label>
            <select className={inputCls} value={form.day_of_week} onChange={e => set("day_of_week", e.target.value)}>
              <option value="">Auto from date…</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Program Type</label>
            <select className={inputCls} value={form.program_type} onChange={e => setProgramType(e.target.value)}>
              <option>Life Skills Program</option>
              <option>Travel Training</option>
              <option>Travel to/from Work</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Weather</label>
            <select className={inputCls} value={form.weather} onChange={e => set("weather", e.target.value)}>
              <option value="">Select…</option>
              {WEATHER_OPTS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className={labelCls}>Travel Route</label>
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-sm font-semibold text-primary">
            <MapPin size={14} /> {form.travel_route}
          </div>
        </div>
      </div>

      {/* ── Tasks Checklist ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <SectionTitle icon={ClipboardCheck}>
          {form.program_type === "Travel to/from Work" ? "Work Travel Checklist" : "Travel Checklist"}
        </SectionTitle>
        <div className="grid sm:grid-cols-2 gap-2">
          {(form.program_type === "Travel to/from Work" ? WORK_TRAVEL_TASKS : TRAVEL_TASKS).map(task => (
            <CheckItem key={task} label={task} checked={form.tasks_completed.includes(task)} onToggle={() => toggleTask(task)} />
          ))}
        </div>

        {form.program_type !== "Travel to/from Work" && (
          <div className="mt-5">
            <SectionTitle icon={ClipboardCheck}>Life Skills — Shopping Centre Tasks</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-2">
              {LIFE_SKILLS_TASKS.map(task => (
                <CheckItem key={task} label={task} checked={form.tasks_completed.includes(task)} onToggle={() => toggleTask(task)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Assessment (radio buttons) ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <SectionTitle icon={ClipboardCheck}>Participant Assessment</SectionTitle>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Engagement Level</label>
            <RadioGroup name="engagement" options={ENGAGEMENT_OPTS} value={form.participant_engagement} onChange={v => set("participant_engagement", v)} />
          </div>
          <div>
            <label className={labelCls}>Support Level Required</label>
            <RadioGroup name="support" options={SUPPORT_OPTS} value={form.support_level} onChange={v => set("support_level", v)} />
          </div>
          <div>
            <label className={labelCls}>Mood / Behaviour</label>
            <RadioGroup name="mood" options={MOOD_OPTS} value={form.mood_behaviour} onChange={v => set("mood_behaviour", v)} />
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <SectionTitle icon={MessageSquare}>Notes</SectionTitle>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Progress Notes</label>
            <textarea className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[70px]" value={form.progress_notes} onChange={e => set("progress_notes", e.target.value)} placeholder="What progress did the participant make today?" />
          </div>
          <div>
            <label className={labelCls}>Safety Observations</label>
            <textarea className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[60px]" value={form.safety_observations} onChange={e => set("safety_observations", e.target.value)} placeholder="Any safety concerns or observations?" />
          </div>
          <div>
            <label className={labelCls}>Goals for Next Session</label>
            <textarea className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[60px]" value={form.next_session_goals} onChange={e => set("next_session_goals", e.target.value)} placeholder="What should we focus on next time?" />
          </div>
        </div>
      </div>

      {/* ── Signature ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <label className={labelCls}>Staff Signature (Name) *</label>
        <input className={inputCls} value={form.staff_signature} onChange={e => set("staff_signature", e.target.value)} placeholder="Type your full name" />
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} className="rounded-xl font-bold" disabled={saving}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || saving} className="rounded-xl font-bold gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Submit Shift Note
        </Button>
      </div>
    </div>
  );
}