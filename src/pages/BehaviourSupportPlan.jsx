import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Save, Loader2, Brain, CheckCircle, Target, Shield, Users, Printer, Edit, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TIER_CONFIG = {
  "Tier 1 – Universal": { color: "bg-emerald-100 border-emerald-300 text-emerald-800", badge: "bg-emerald-100 text-emerald-700", desc: "All participants — positive behaviour supports, environmental design" },
  "Tier 2 – Targeted": { color: "bg-amber-50 border-amber-300 text-amber-800", badge: "bg-amber-100 text-amber-700", desc: "At-risk individuals — additional strategies and monitoring" },
  "Tier 3 – Intensive": { color: "bg-rose-50 border-rose-300 text-rose-900", badge: "bg-rose-100 text-rose-700", desc: "Complex needs — individual behaviour support plan, specialist involvement" },
};

const BSP_ENTITY = "BehaviourSupportPlan";

// We'll store BSPs in SupportPlan entity with a type flag, or create a separate entity via schema
// Using base44 generic approach - store in a dedicated JSON-friendly way

export default function BehaviourSupportPlan() {
  const [plans, setPlans] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const blankForm = () => ({
    participant_name: "", participant_id: "", ndis_number: "",
    primary_goal: "", presenting_behaviours: "", function_of_behaviour: "",
    tier: "Tier 1 – Universal",
    antecedent_strategies: [""],
    skill_teaching: [""],
    consequence_strategies: [""],
    reinforcement_strategies: [""],
    crisis_plan: "",
    support_team: [{ name: "", role: "", phone: "" }],
    review_date: "", plan_author: "",
    classroom_flow: ["Reminder / Prompt", "Reflection Time-Out", "Buddy / Buddy Activity", "Supervisor Referral"],
    outdoor_flow: ["Verbal Correction / Prompt", "Restorative Chat", "Supervisor Referral", "Incident Report"],
    pbl_values: "",
    anti_bullying: "",
    status: "Active",
  });

  const [form, setForm] = useState(blankForm());
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const [parts] = await Promise.all([base44.entities.Participant.list()]);
    setParticipants(parts);
    // Load from SupportPlan entity with type tag
    const allPlans = await base44.entities.SupportPlan.filter({ support_focus: "Behaviour Support Plan" }).catch(() => []);
    setPlans(allPlans);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const selectParticipant = (id) => {
    const p = participants.find(x => x.id === id);
    if (!p) return;
    setF("participant_id", id);
    setF("participant_name", p.name);
    setF("ndis_number", p.ndis_number || "");
  };

  const updateList = (field, i, v) => setForm(p => ({ ...p, [field]: p[field].map((x, idx) => idx === i ? v : x) }));
  const addItem = (field) => setForm(p => ({ ...p, [field]: [...p[field], ""] }));
  const removeItem = (field, i) => setForm(p => ({ ...p, [field]: p[field].filter((_, idx) => idx !== i) }));

  const updateTeam = (i, k, v) => setForm(p => ({ ...p, support_team: p.support_team.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }));

  const save = async () => {
    setSaving(true);
    // Serialize BSP as a SupportPlan with JSON in primary_goal and support_focus flag
    const payload = {
      participant_name: form.participant_name,
      participant_id: form.participant_id,
      title: `BSP — ${form.participant_name}`,
      primary_goal: form.primary_goal,
      support_focus: "Behaviour Support Plan",
      status: form.status,
      goals: [
        { text: `Tier: ${form.tier}`, steps: JSON.stringify({
          presenting_behaviours: form.presenting_behaviours,
          function_of_behaviour: form.function_of_behaviour,
          antecedent_strategies: form.antecedent_strategies,
          skill_teaching: form.skill_teaching,
          consequence_strategies: form.consequence_strategies,
          reinforcement_strategies: form.reinforcement_strategies,
          crisis_plan: form.crisis_plan,
          support_team: form.support_team,
          classroom_flow: form.classroom_flow,
          outdoor_flow: form.outdoor_flow,
          pbl_values: form.pbl_values,
          anti_bullying: form.anti_bullying,
          plan_author: form.plan_author,
          review_date: form.review_date,
          ndis_number: form.ndis_number,
        }), support: "", success: "" }
      ],
    };
    if (editingId) {
      await base44.entities.SupportPlan.update(editingId, payload);
    } else {
      await base44.entities.SupportPlan.create(payload);
    }
    setSaving(false);
    setView("list");
    setEditingId(null);
    load();
  };

  const parseDetails = (plan) => {
    try {
      return JSON.parse(plan.goals?.[0]?.steps || "{}");
    } catch { return {}; }
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this behaviour support plan?")) return;
    await base44.entities.SupportPlan.delete(id);
    load();
  };

  const openEdit = (plan) => {
    const d = parseDetails(plan);
    const tier = plan.goals?.[0]?.text?.replace("Tier: ", "") || "Tier 1 – Universal";
    setForm({
      participant_name: plan.participant_name || "",
      participant_id: plan.participant_id || "",
      ndis_number: d.ndis_number || "",
      primary_goal: plan.primary_goal || "",
      presenting_behaviours: d.presenting_behaviours || "",
      function_of_behaviour: d.function_of_behaviour || "",
      tier,
      antecedent_strategies: d.antecedent_strategies || [""],
      skill_teaching: d.skill_teaching || [""],
      consequence_strategies: d.consequence_strategies || [""],
      reinforcement_strategies: d.reinforcement_strategies || [""],
      crisis_plan: d.crisis_plan || "",
      support_team: d.support_team || [{ name: "", role: "", phone: "" }],
      review_date: d.review_date || "",
      plan_author: d.plan_author || "",
      classroom_flow: d.classroom_flow || blankForm().classroom_flow,
      outdoor_flow: d.outdoor_flow || blankForm().outdoor_flow,
      pbl_values: d.pbl_values || "",
      anti_bullying: d.anti_bullying || "",
      status: plan.status || "Active",
    });
    setEditingId(plan.id);
    setView("form");
  };

  const ListEditor = ({ field, label }) => (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <Label className="text-xs font-black">{label}</Label>
        <Button variant="ghost" size="sm" onClick={() => addItem(field)} className="h-6 px-2 text-xs gap-0.5"><Plus size={10} /></Button>
      </div>
      <div className="space-y-1.5">
        {(form[field] || []).map((item, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-5 h-8 flex items-center justify-center text-xs font-black text-muted-foreground shrink-0">{i + 1}</div>
            <Input value={item} onChange={e => updateList(field, i, e.target.value)} className="text-xs h-8" />
            {form[field].length > 1 && <button onClick={() => removeItem(field, i)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 size={12} /></button>}
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
            <h2 className="text-3xl font-black tracking-tight">Behaviour Support Plans</h2>
            <p className="text-muted-foreground text-sm">Tiered positive behaviour support framework & individual plans.</p>
          </div>
          <Button onClick={() => { setForm(blankForm()); setEditingId(null); setView("form"); }} className="rounded-xl font-bold gap-2"><Plus size={15} /> New Plan</Button>
        </div>

        {/* Tier overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
            <div key={tier} className={`border-2 rounded-2xl p-5 ${cfg.color}`}>
              <p className="font-black text-sm">{tier}</p>
              <p className="text-xs mt-1 opacity-80">{cfg.desc}</p>
              <p className="font-black text-2xl mt-3">{plans.filter(p => p.goals?.[0]?.text?.includes(tier.split("–")[0].trim())).length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Plans</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : plans.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
            <Brain size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-black text-xl mb-1">No Behaviour Support Plans</h3>
            <p className="text-muted-foreground text-sm mb-6">Create a behaviour support plan for a participant.</p>
            <Button onClick={() => { setForm(blankForm()); setEditingId(null); setView("form"); }} className="rounded-xl font-bold gap-2"><Plus size={15} /> Create Plan</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map(plan => {
              const tier = plan.goals?.[0]?.text?.replace("Tier: ", "") || "Tier 1 – Universal";
              const cfg = TIER_CONFIG[tier] || TIER_CONFIG["Tier 1 – Universal"];
              return (
                <div key={plan.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Brain size={18} className="text-purple-600" /></div>
                      <div>
                        <p className="font-black text-foreground">{plan.participant_name}</p>
                        <p className="text-xs text-muted-foreground">{plan.primary_goal || "No goal set"}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${plan.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{plan.status}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${cfg.badge}`}>{tier}</span>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => { setSelected(plan); setView("detail"); }} className="flex-1 rounded-lg text-xs gap-1"><ChevronRight size={12} /> View</Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(plan)} className="flex-1 rounded-lg text-xs gap-1"><Edit size={12} /> Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => deletePlan(plan.id)} className="flex-1 rounded-lg text-xs gap-1 text-destructive hover:text-destructive"><Trash2 size={12} /> Delete</Button>
                  </div>
                </div>
              );
            })}
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
            <h2 className="text-2xl font-black mt-1">{editingId ? "Edit" : "New"} Behaviour Support Plan</h2>
          </div>
          <Button onClick={save} disabled={!form.participant_name || saving} className="rounded-xl font-bold gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h3 className="font-black">Participant & Plan Details</h3>
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_id} onValueChange={selectParticipant}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select participant..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Primary Goal</Label><Input value={form.primary_goal} onChange={e => setF("primary_goal", e.target.value)} placeholder="e.g. Reduce physical aggression and increase self-regulation" className="mt-1" /></div>
              <div>
                <Label className="text-xs">Intervention Tier</Label>
                <Select value={form.tier} onValueChange={v => setF("tier", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.keys(TIER_CONFIG).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Presenting Behaviours of Concern</Label><Textarea value={form.presenting_behaviours} onChange={e => setF("presenting_behaviours", e.target.value)} className="mt-1 min-h-[70px] text-sm" /></div>
              <div><Label className="text-xs">Hypothesised Function of Behaviour</Label><Input value={form.function_of_behaviour} onChange={e => setF("function_of_behaviour", e.target.value)} placeholder="e.g. Escape task, sensory, attention-seeking" className="mt-1" /></div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <h3 className="font-black">Strategy Toolkit</h3>
              <ListEditor field="antecedent_strategies" label="Antecedent / Proactive Strategies" />
              <ListEditor field="skill_teaching" label="Skill Teaching Targets" />
              <ListEditor field="consequence_strategies" label="Consequence Strategies" />
              <ListEditor field="reinforcement_strategies" label="Reinforcement Strategies" />
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6">
              <h3 className="font-black text-rose-800 mb-3">🚨 Crisis Plan</h3>
              <Textarea value={form.crisis_plan} onChange={e => setF("crisis_plan", e.target.value)} placeholder="What to do if behaviour escalates to crisis level..." className="min-h-[80px] text-sm border-rose-300" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <h3 className="font-black">Intervention Flowcharts</h3>
              <ListEditor field="classroom_flow" label="Indoors / Session Setting" />
              <ListEditor field="outdoor_flow" label="Outdoors / Community Setting" />
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h3 className="font-black flex items-center gap-2"><Users size={15} className="text-primary" /> Support Team</h3>
              {form.support_team.map((m, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 p-3 bg-secondary rounded-xl">
                  <Input value={m.name} onChange={e => updateTeam(i, "name", e.target.value)} placeholder="Name" className="text-xs h-8" />
                  <Input value={m.role} onChange={e => updateTeam(i, "role", e.target.value)} placeholder="Role" className="text-xs h-8" />
                  <div className="flex gap-1">
                    <Input value={m.phone} onChange={e => updateTeam(i, "phone", e.target.value)} placeholder="Phone" className="text-xs h-8" />
                    {form.support_team.length > 1 && <button onClick={() => setForm(p => ({ ...p, support_team: p.support_team.filter((_, idx) => idx !== i) }))} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 size={12} /></button>}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setForm(p => ({ ...p, support_team: [...p.support_team, { name: "", role: "", phone: "" }] }))} className="w-full rounded-xl gap-1 text-xs"><Plus size={12} /> Add Member</Button>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 space-y-3">
              <h3 className="font-black">PBL & Whole-Org Approach</h3>
              <div><Label className="text-xs">PBL Values / Core Expectations</Label><Input value={form.pbl_values} onChange={e => setF("pbl_values", e.target.value)} placeholder="e.g. Respectful, Responsible, Safe" className="mt-1" /></div>
              <div><Label className="text-xs">Anti-Bullying Strategy</Label><Textarea value={form.anti_bullying} onChange={e => setF("anti_bullying", e.target.value)} placeholder="Outline anti-bullying approach..." className="mt-1 min-h-[60px] text-sm" /></div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Plan Author</Label><Input value={form.plan_author} onChange={e => setF("plan_author", e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Review Date</Label><Input type="date" value={form.review_date} onChange={e => setF("review_date", e.target.value)} className="mt-1" /></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL ──
  if (view === "detail" && selected) {
    const d = parseDetails(selected);
    const tier = selected.goals?.[0]?.text?.replace("Tier: ", "") || "Tier 1 – Universal";
    const cfg = TIER_CONFIG[tier] || TIER_CONFIG["Tier 1 – Universal"];

    return (
      <div className="space-y-6">
        <style>{`@media print { .no-print{display:none!important} @page{size:A4;margin:12mm} }`}</style>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 no-print">
          <div>
            <button onClick={() => setView("list")} className="text-primary text-sm font-bold hover:underline">← All Plans</button>
            <h2 className="text-2xl font-black mt-1">Behaviour Support Plan — {selected.participant_name}</h2>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black self-start ${cfg.badge}`}>{tier}</span>
            <Button variant="outline" onClick={() => openEdit(selected)} className="rounded-xl gap-2 text-sm no-print"><Edit size={13} /> Edit</Button>
            <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2 text-sm no-print"><Printer size={13} /> Print</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Primary Goal", value: selected.primary_goal },
            { label: "Tier", value: tier },
            { label: "Review Date", value: d.review_date || "Not set" },
            { label: "Plan Author", value: d.plan_author || "—" },
          ].map(k => (
            <div key={k.label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className="font-black text-sm text-foreground truncate">{k.value || "—"}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {d.presenting_behaviours && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Presenting Behaviours of Concern</p>
            <p className="text-sm text-amber-900">{d.presenting_behaviours}</p>
            {d.function_of_behaviour && <p className="text-xs text-amber-700 mt-2"><span className="font-black">Hypothesised Function:</span> {d.function_of_behaviour}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[
            { label: "🛡️ Antecedent / Proactive Strategies", field: "antecedent_strategies", color: "border-blue-100 bg-blue-50" },
            { label: "🎯 Skill Teaching", field: "skill_teaching", color: "border-purple-100 bg-purple-50" },
            { label: "📋 Consequence Strategies", field: "consequence_strategies", color: "border-amber-50 bg-amber-50" },
            { label: "⭐ Reinforcement Strategies", field: "reinforcement_strategies", color: "border-emerald-100 bg-emerald-50" },
          ].map(s => (
            <div key={s.label} className={`border rounded-2xl p-5 ${s.color}`}>
              <p className="font-black text-sm mb-3">{s.label}</p>
              <ol className="space-y-1.5">
                {(d[s.field] || []).filter(Boolean).map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm"><span className="font-black text-muted-foreground shrink-0">{i + 1}.</span>{item}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {d.crisis_plan && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5">
            <p className="font-black text-rose-700 mb-2">🚨 Crisis Response Plan</p>
            <p className="text-sm text-rose-800 leading-relaxed whitespace-pre-wrap">{d.crisis_plan}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[
            { label: "🏢 Indoors / Session Flowchart", field: "classroom_flow" },
            { label: "☀️ Outdoors / Community Flowchart", field: "outdoor_flow" },
          ].map(f => (
            <div key={f.label} className="bg-card border border-border rounded-2xl p-5">
              <p className="font-black text-sm mb-3">{f.label}</p>
              <div className="space-y-2">
                {(d[f.field] || []).filter(Boolean).map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-black shrink-0">{i + 1}</div>
                    <div className="flex-1 bg-secondary rounded-lg px-3 py-1.5 text-xs font-semibold">{step}</div>
                    {i < (d[f.field] || []).length - 1 && <ChevronRight size={12} className="text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {(d.support_team || []).filter(m => m.name).length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="font-black text-sm mb-3 flex items-center gap-2"><Users size={14} className="text-primary" /> Support Team</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {d.support_team.filter(m => m.name).map((m, i) => (
                <div key={i} className="flex items-center justify-between bg-secondary rounded-xl px-4 py-2.5">
                  <div>
                    <p className="font-bold text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                  {m.phone && <a href={`tel:${m.phone}`} className="text-primary font-black text-xs">{m.phone}</a>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}