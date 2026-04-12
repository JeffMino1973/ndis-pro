import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Plus, Save, Loader2, Brain, Printer, Edit, Trash2,
  ChevronRight, AlertTriangle, CheckCircle, Shield, Heart, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Zone config ──
const ZONES = [
  { key: "green", label: "🟢 GREEN ZONE", sub: "Proactive — Prevent agitation", color: "border-emerald-300 bg-emerald-50", header: "bg-emerald-600 text-white", badge: "bg-emerald-100 text-emerald-800" },
  { key: "yellow", label: "🟡 YELLOW ZONE", sub: "Early Warning — De-escalate", color: "border-amber-300 bg-amber-50", header: "bg-amber-500 text-white", badge: "bg-amber-100 text-amber-800" },
  { key: "red", label: "🔴 RED ZONE", sub: "Reactive — Maintain safety", color: "border-rose-300 bg-rose-50", header: "bg-rose-600 text-white", badge: "bg-rose-100 text-rose-800" },
  { key: "blue", label: "🔵 BLUE ZONE", sub: "Post-Crisis Recovery", color: "border-blue-300 bg-blue-50", header: "bg-blue-600 text-white", badge: "bg-blue-100 text-blue-800" },
];

const COMM_CATEGORIES = ["I NEED...", "I FEEL...", "HELP ME..."];

const BLANK = {
  participant_name: "", participant_id: "", diagnosis: "",
  target_behaviour: "", primary_goal: "",
  behaviour_functions: [""],
  green_zone_environmental: [""],
  green_zone_skills: [""],
  yellow_zone_signs: [""],
  yellow_zone_responses: [""],
  red_zone_strategies: [""],
  blue_zone_recovery: [""],
  social_story_steps: [""],
  communication_board: [
    { category: "I NEED...", emoji: "💧", label: "Water" },
    { category: "I NEED...", emoji: "🍎", label: "Snack" },
    { category: "I NEED...", emoji: "🎶", label: "Music" },
    { category: "I NEED...", emoji: "🚽", label: "Toilet" },
    { category: "I FEEL...", emoji: "😡", label: "Angry / Hot" },
    { category: "I FEEL...", emoji: "😴", label: "Tired / Slow" },
    { category: "I FEEL...", emoji: "😟", label: "Scared / Nervous" },
    { category: "I FEEL...", emoji: "😵", label: "Overwhelmed" },
    { category: "HELP ME...", emoji: "🚪", label: "Quiet Room" },
    { category: "HELP ME...", emoji: "🧘", label: "Deep Breath" },
    { category: "HELP ME...", emoji: "🛌", label: "Weighted Blanket" },
    { category: "HELP ME...", emoji: "🎧", label: "Noise Mufflers" },
  ],
  review_notes: "",
  plan_created_by: "",
  review_date: "",
  status: "Active",
};

export default function PositiveBehaviourSupportPlan() {
  const [plans, setPlans] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const [p, parts] = await Promise.all([
      base44.entities.PositiveBehaviourSupportPlan.list("-created_date"),
      base44.entities.Participant.list(),
    ]);
    setPlans(p);
    setParticipants(parts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const selectParticipant = (id) => {
    const p = participants.find(x => x.id === id);
    if (!p) return;
    setF("participant_id", id);
    setF("participant_name", p.name);
    if (p.primary_disability) setF("diagnosis", p.primary_disability);
  };

  const updateList = (field, i, v) => setForm(p => ({ ...p, [field]: p[field].map((x, idx) => idx === i ? v : x) }));
  const addItem = (field) => setForm(p => ({ ...p, [field]: [...(p[field] || []), ""] }));
  const removeItem = (field, i) => setForm(p => ({ ...p, [field]: p[field].filter((_, idx) => idx !== i) }));

  const updateCommBoard = (i, k, v) => setForm(p => ({ ...p, communication_board: p.communication_board.map((x, idx) => idx === i ? { ...x, [k]: v } : x) }));
  const addCommItem = (cat) => setForm(p => ({ ...p, communication_board: [...p.communication_board, { category: cat, emoji: "", label: "" }] }));
  const removeCommItem = (i) => setForm(p => ({ ...p, communication_board: p.communication_board.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    if (editingId) {
      await base44.entities.PositiveBehaviourSupportPlan.update(editingId, form);
    } else {
      await base44.entities.PositiveBehaviourSupportPlan.create(form);
    }
    setSaving(false);
    setView("list");
    setEditingId(null);
    load();
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this PBSP?")) return;
    await base44.entities.PositiveBehaviourSupportPlan.delete(id);
    load();
  };

  const openEdit = (plan) => {
    setForm({ ...BLANK, ...plan });
    setEditingId(plan.id);
    setView("form");
  };

  const ListEditor = ({ field, label, placeholder }) => (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
        <Button variant="ghost" size="sm" onClick={() => addItem(field)} className="h-6 px-2 text-xs gap-0.5 text-primary"><Plus size={10} /></Button>
      </div>
      <div className="space-y-1.5">
        {(form[field] || []).map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="w-5 h-8 flex items-center justify-center text-xs font-black text-muted-foreground shrink-0">{i + 1}</div>
            <Input value={item} onChange={e => updateList(field, i, e.target.value)} placeholder={placeholder} className="text-sm h-8 flex-1" />
            {form[field].length > 1 && <button onClick={() => removeItem(field, i)} className="text-muted-foreground hover:text-destructive mt-1.5 shrink-0"><Trash2 size={12} /></button>}
          </div>
        ))}
      </div>
    </div>
  );

  // ── LIST ──
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Positive Behaviour Support Plans</h2>
            <p className="text-muted-foreground text-sm">PBSP — Zone-based behaviour support with communication boards & social stories.</p>
          </div>
          <Button onClick={() => { setForm(BLANK); setEditingId(null); setView("form"); }} className="rounded-xl font-bold gap-2">
            <Plus size={15} /> New PBSP
          </Button>
        </div>

        {/* Zone legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ZONES.map(z => (
            <div key={z.key} className={`border-2 rounded-2xl p-4 ${z.color}`}>
              <p className="font-black text-sm">{z.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{z.sub}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : plans.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
            <Brain size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-black text-xl mb-1">No PBSPs Yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Create a Positive Behaviour Support Plan for a participant.</p>
            <Button onClick={() => { setForm(BLANK); setEditingId(null); setView("form"); }} className="rounded-xl font-bold gap-2"><Plus size={15} /> Create PBSP</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Brain size={18} className="text-purple-600" /></div>
                    <div>
                      <p className="font-black text-foreground">{plan.participant_name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{plan.target_behaviour}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${plan.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{plan.status}</span>
                </div>
                {plan.diagnosis && <p className="text-xs text-muted-foreground mb-2">Dx: {plan.diagnosis}</p>}
                <p className="text-xs text-slate-600 italic line-clamp-2">{plan.primary_goal}</p>
                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => { setSelected(plan); setView("detail"); }} className="flex-1 rounded-lg text-xs gap-1"><ChevronRight size={12} /> View</Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(plan)} className="flex-1 rounded-lg text-xs gap-1"><Edit size={12} /> Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => deletePlan(plan.id)} className="flex-1 rounded-lg text-xs gap-1 text-destructive hover:text-destructive"><Trash2 size={12} /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── FORM ──
  if (view === "form") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => setView("list")} className="text-primary text-sm font-bold hover:underline">← Back</button>
            <h2 className="text-2xl font-black mt-1">{editingId ? "Edit" : "New"} Positive Behaviour Support Plan</h2>
          </div>
          <Button onClick={save} disabled={!form.participant_name || !form.target_behaviour || saving} className="rounded-xl font-bold gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save PBSP
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Column 1 — Overview + Assessment */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h3 className="font-black text-base">Overview</h3>
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_id} onValueChange={selectParticipant}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select participant..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Diagnosis</Label><Input value={form.diagnosis} onChange={e => setF("diagnosis", e.target.value)} placeholder="e.g. ASD, Intellectual Disability" className="mt-1" /></div>
              <div><Label className="text-xs">Target Behaviour *</Label><Input value={form.target_behaviour} onChange={e => setF("target_behaviour", e.target.value)} placeholder="e.g. Physical Aggression (Hitting)" className="mt-1 font-bold" /></div>
              <div><Label className="text-xs">Primary Goal</Label><Textarea value={form.primary_goal} onChange={e => setF("primary_goal", e.target.value)} placeholder="What is the PBSP aiming to achieve?" className="mt-1 min-h-[70px] text-sm" /></div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h3 className="font-black text-base">1. Functional Assessment — Why?</h3>
              <ListEditor field="behaviour_functions" label="Behaviour Functions" placeholder="e.g. Communication — expressing frustration" />
            </div>

            {/* Social Story */}
            <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 space-y-3">
              <h3 className="font-black text-purple-800">6. Social Story</h3>
              <p className="text-xs text-purple-600 italic">Read daily during the Green Zone</p>
              <ListEditor field="social_story_steps" label="Story Steps" placeholder="e.g. The Situation: Sometimes things feel too loud..." />
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div><Label className="text-xs">Plan Created By</Label><Input value={form.plan_created_by} onChange={e => setF("plan_created_by", e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Review Date</Label><Input type="date" value={form.review_date} onChange={e => setF("review_date", e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Review & Ethics Notes</Label><Textarea value={form.review_notes} onChange={e => setF("review_notes", e.target.value)} className="mt-1 min-h-[60px] text-sm" /></div>
            </div>
          </div>

          {/* Column 2 — Zones */}
          <div className="space-y-4">
            <div className="border-2 border-emerald-300 bg-emerald-50 rounded-3xl p-6 space-y-4">
              <div><p className="font-black text-emerald-800">🟢 GREEN ZONE — Proactive Strategies</p><p className="text-xs text-emerald-600 italic">Prevent agitation before it occurs</p></div>
              <ListEditor field="green_zone_environmental" label="Environmental Adjustments" placeholder="e.g. Visual schedule for daily transitions" />
              <ListEditor field="green_zone_skills" label="Skill Building" placeholder="e.g. FCT: Teach 'Break please' gesture" />
            </div>

            <div className="border-2 border-amber-300 bg-amber-50 rounded-3xl p-6 space-y-4">
              <div><p className="font-black text-amber-800">🟡 YELLOW ZONE — Early Warning</p><p className="text-xs text-amber-600 italic">Intervene early to de-escalate</p></div>
              <ListEditor field="yellow_zone_signs" label="Visible Warning Signs" placeholder="e.g. Pacing or rocking" />
              <ListEditor field="yellow_zone_responses" label="Staff Response" placeholder="e.g. Reduce demands immediately" />
            </div>

            <div className="border-2 border-rose-300 bg-rose-50 rounded-3xl p-6 space-y-4">
              <div><p className="font-black text-rose-800">🔴 RED ZONE — Reactive Strategies</p><p className="text-xs text-rose-600 italic">Maintain safety during episode</p></div>
              <ListEditor field="red_zone_strategies" label="When Behaviour Occurs" placeholder="e.g. Maintain safe distance — arm's length minimum" />
            </div>

            <div className="border-2 border-blue-300 bg-blue-50 rounded-3xl p-6 space-y-4">
              <div><p className="font-black text-blue-800">🔵 BLUE ZONE — Post-Crisis Recovery</p><p className="text-xs text-blue-600 italic">Re-establish rapport and monitor wellbeing</p></div>
              <ListEditor field="blue_zone_recovery" label="Recovery Steps" placeholder="e.g. Allow rest period — do not debrief immediately" />
            </div>
          </div>

          {/* Column 3 — Communication Board */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="font-black text-base">7. Visual Communication Board</h3>
                <p className="text-xs text-muted-foreground italic mt-0.5">Honor any request from "I FEEL" or "HELP ME" immediately</p>
              </div>
              {COMM_CATEGORIES.map(cat => (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-xs font-black px-2 py-0.5 rounded-full ${cat === "I NEED..." ? "bg-blue-100 text-blue-700" : cat === "I FEEL..." ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{cat}</p>
                    <Button variant="ghost" size="sm" onClick={() => addCommItem(cat)} className="h-6 px-2 text-xs gap-0.5 text-primary"><Plus size={10} /></Button>
                  </div>
                  <div className="space-y-1.5">
                    {form.communication_board.filter(x => x.category === cat).map((item) => {
                      const i = form.communication_board.indexOf(item);
                      return (
                        <div key={i} className="flex gap-2">
                          <Input value={item.emoji} onChange={e => updateCommBoard(i, "emoji", e.target.value)} className="w-14 h-8 text-center text-base" />
                          <Input value={item.label} onChange={e => updateCommBoard(i, "label", e.target.value)} className="flex-1 h-8 text-xs" placeholder="Label" />
                          <button onClick={() => removeCommItem(i)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 size={12} /></button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL ──
  if (view === "detail" && selected) {
    const ZoneCard = ({ label, sub, color, header, items, extra }) => (
      <div className={`border-2 rounded-2xl overflow-hidden ${color}`}>
        <div className={`px-5 py-3 ${header}`}>
          <p className="font-black">{label}</p>
          <p className="text-xs opacity-80">{sub}</p>
        </div>
        <div className="p-5 space-y-1.5">
          {(items || []).filter(Boolean).map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm"><span className="font-black text-muted-foreground shrink-0 mt-0.5">{i + 1}.</span><span>{item}</span></div>
          ))}
          {extra}
        </div>
      </div>
    );

    const commByCategory = COMM_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = (selected.communication_board || []).filter(x => x.category === cat);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <style>{`@media print { .no-print{display:none!important} @page{size:A4;margin:10mm} }`}</style>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 no-print">
          <div>
            <button onClick={() => setView("list")} className="text-primary text-sm font-bold hover:underline">← All PBSPs</button>
            <h2 className="text-2xl font-black mt-1">PBSP — {selected.participant_name}</h2>
            <p className="text-muted-foreground text-sm">{selected.diagnosis}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black self-start ${selected.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{selected.status}</span>
            <Button variant="outline" onClick={() => openEdit(selected)} className="rounded-xl gap-2 text-sm no-print"><Edit size={13} /> Edit</Button>
            <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2 text-sm no-print"><Printer size={13} /> Print</Button>
          </div>
        </div>

        {/* Header info */}
        <div className="bg-slate-800 text-white rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Behaviour</p><p className="font-black text-lg mt-1">{selected.target_behaviour}</p></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis</p><p className="font-semibold mt-1">{selected.diagnosis || "—"}</p></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Goal</p><p className="text-sm mt-1 text-slate-200 leading-relaxed">{selected.primary_goal}</p></div>
          </div>
        </div>

        {/* Behaviour functions */}
        {(selected.behaviour_functions || []).filter(Boolean).length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="font-black text-sm mb-3">1. Functional Assessment — Why does this behaviour occur?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selected.behaviour_functions.filter(Boolean).map((f, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-secondary rounded-xl text-sm"><CheckCircle size={14} className="text-primary shrink-0 mt-0.5" />{f}</div>
              ))}
            </div>
          </div>
        )}

        {/* 4 Zones */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ZoneCard label="🟢 GREEN ZONE — Proactive Strategies" sub="Prevent agitation before it occurs"
            color="border-emerald-300 bg-emerald-50" header="bg-emerald-600 text-white"
            items={[...(selected.green_zone_environmental || []), ...(selected.green_zone_skills || [])]} />
          <ZoneCard label="🟡 YELLOW ZONE — Early Warning Signs" sub="Intervene early to de-escalate"
            color="border-amber-300 bg-amber-50" header="bg-amber-500 text-white"
            items={[...(selected.yellow_zone_signs || []).map(s => `⚠️ ${s}`), ...(selected.yellow_zone_responses || []).map(r => `→ ${r}`)]} />
          <ZoneCard label="🔴 RED ZONE — Reactive Strategies" sub="Maintain safety during the episode"
            color="border-rose-300 bg-rose-50" header="bg-rose-600 text-white"
            items={selected.red_zone_strategies} />
          <ZoneCard label="🔵 BLUE ZONE — Post-Crisis Recovery" sub="Re-establish rapport & monitor wellbeing"
            color="border-blue-300 bg-blue-50" header="bg-blue-600 text-white"
            items={selected.blue_zone_recovery} />
        </div>

        {/* Communication Board */}
        {(selected.communication_board || []).length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="font-black text-base mb-1">7. Visual Communication Board</p>
            <p className="text-xs text-muted-foreground italic mb-4">⚡ Honor any "I FEEL" or "HELP ME" request immediately — no task needs to be finished first</p>
            <div className="grid grid-cols-3 gap-4">
              {COMM_CATEGORIES.map(cat => (
                <div key={cat}>
                  <div className={`text-center font-black text-xs py-2 rounded-xl mb-2 ${cat === "I NEED..." ? "bg-blue-100 text-blue-700" : cat === "I FEEL..." ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{cat}</div>
                  <div className="space-y-1.5">
                    {(commByCategory[cat] || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 text-sm font-semibold">
                        <span className="text-lg">{item.emoji}</span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Story */}
        {(selected.social_story_steps || []).filter(Boolean).length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
            <p className="font-black text-purple-800 mb-1">6. Social Story — "When I Feel Frustrated"</p>
            <p className="text-xs text-purple-600 italic mb-4">Read daily during the Green Zone to reinforce positive coping</p>
            <ol className="space-y-3">
              {selected.social_story_steps.filter(Boolean).map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">{i + 1}</div>
                  <p className="text-sm text-purple-900 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {selected.review_notes && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="font-black text-sm mb-2 flex items-center gap-2"><RefreshCw size={14} className="text-primary" /> Review & Ethics</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{selected.review_notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
          <span>Plan Created By: {selected.plan_created_by || "Not recorded"}</span>
          <span>Review Date: {selected.review_date || "Not set"}</span>
        </div>
      </div>
    );
  }

  return null;
}