import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Target, Plus, Trash2, Printer, Save, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SupportPlans() {
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [goals, setGoals] = useState([{ text: "", steps: "", support: "", success: "" }]);
  const [budgetItems, setBudgetItems] = useState([
    { category: "Core: Daily Life", description: "", provider: "", amount: 0 },
    { category: "Core: Community", description: "", provider: "", amount: 0 },
    { category: "CB: Health/Therapy", description: "", provider: "", amount: 0 },
  ]);
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [supportFocus, setSupportFocus] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [config, setConfig] = useState({});
  const [savedPlans, setSavedPlans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const [data, me, plans] = await Promise.all([base44.entities.Participant.list(), base44.auth.me(), base44.entities.SupportPlan.list("-created_date")]);
      setParticipants(data);
      setConfig(me?.businessConfig || {});
      setSavedPlans(plans);
      setLoading(false);
    }
    load();
  }, []);

  const addGoal = () => setGoals([...goals, { text: "", steps: "", support: "", success: "" }]);
  const removeGoal = (i) => setGoals(goals.filter((_, idx) => idx !== i));
  const updateGoal = (i, field, val) => setGoals(goals.map((g, idx) => idx === i ? { ...g, [field]: val } : g));

  const addBudgetItem = () => setBudgetItems([...budgetItems, { category: "", description: "", provider: "", amount: 0 }]);
  const updateBudgetItem = (i, field, val) => setBudgetItems(budgetItems.map((b, idx) => idx === i ? { ...b, [field]: val } : b));

  const totalBudget = budgetItems.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

  const savePlan = async () => {
    if (!participant || !planTitle) return;
    setSaving(true);
    await base44.entities.SupportPlan.create({
      title: planTitle,
      participant_id: selectedParticipant,
      participant_name: participant.name,
      primary_goal: primaryGoal,
      support_focus: supportFocus,
      goals,
      budget_items: budgetItems,
      total_budget: totalBudget,
      status: "Draft",
      date_created: new Date().toISOString().split("T")[0],
    });
    const plans = await base44.entities.SupportPlan.list("-created_date");
    setSavedPlans(plans);
    setSaving(false);
  };

  const deletePlan = async (planId, planTitle) => {
    if (!window.confirm(`Delete "${planTitle}"?`)) return;
    setDeleting(true);
    await base44.entities.SupportPlan.delete(planId);
    const plans = await base44.entities.SupportPlan.list("-created_date");
    setSavedPlans(plans);
    setDeleting(false);
  };

  const loadPlan = (plan) => {
    setSelectedParticipant(plan.participant_id || "");
    setPrimaryGoal(plan.primary_goal || "");
    setSupportFocus(plan.support_focus || "");
    setGoals(plan.goals?.length ? plan.goals : [{ text: "", steps: "", support: "", success: "" }]);
    setBudgetItems(plan.budget_items?.length ? plan.budget_items : [{ category: "", description: "", provider: "", amount: 0 }]);
    setPlanTitle(plan.title || "");
  };

  const participant = participants.find((p) => p.id === selectedParticipant);

  if (showPreview) {
    return <SupportPlanPrint participant={participant} goals={goals} budgetItems={budgetItems} primaryGoal={primaryGoal} supportFocus={supportFocus} config={config} onBack={() => setShowPreview(false)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Support Plan Builder</h2>
          <p className="text-muted-foreground text-sm">Goal-focused strategy and budget allocation.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={savePlan} disabled={!participant || !planTitle || saving} className="rounded-xl font-bold gap-2">
            <Save size={15} /> {saving ? "Saving..." : "Save Plan"}
          </Button>
          <Button onClick={() => setShowPreview(true)} disabled={!participant} variant="outline" className="rounded-xl font-bold gap-2">
            <Printer size={16} /> Preview / Print
          </Button>
        </div>
      </div>

      {/* Select Participant */}
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Plan Title *</Label>
            <Input value={planTitle} onChange={e => setPlanTitle(e.target.value)} placeholder="e.g. 2026 Support Plan — John Smith" className="mt-1" />
          </div>
          <div>
            <Label>Select Participant</Label>
            <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a participant..." /></SelectTrigger>
              <SelectContent>
                {participants.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.ndis_number}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <div>
            <Label>Primary Goal</Label>
            <Input value={primaryGoal} onChange={e => setPrimaryGoal(e.target.value)} placeholder="e.g. Increase independence in daily life" />
          </div>
          <div>
            <Label>Support Focus</Label>
            <Input value={supportFocus} onChange={e => setSupportFocus(e.target.value)} placeholder="e.g. Community participation & transport" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Goals */}
          <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Target className="text-primary" size={20} /> Goals & Outcomes
              </h3>
              <Button variant="outline" size="sm" onClick={addGoal} className="rounded-lg gap-1">
                <Plus size={14} /> Add Goal
              </Button>
            </div>
            <div className="space-y-4">
              {goals.map((g, i) => (
                <div key={i} className="p-5 bg-secondary rounded-2xl space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <Input value={g.text} onChange={(e) => updateGoal(i, "text", e.target.value)} placeholder="e.g., In 12 months, I will be able to travel independently by bus..." className="font-semibold" />
                    {goals.length > 1 && (
                      <button onClick={() => removeGoal(i)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={16} /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[10px]">Action Steps</Label>
                      <Textarea value={g.steps} onChange={(e) => updateGoal(i, "steps", e.target.value)} placeholder="How to achieve this goal..." className="h-16 text-sm" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Support Required</Label>
                      <Textarea value={g.support} onChange={(e) => updateGoal(i, "support", e.target.value)} placeholder="What support is needed..." className="h-16 text-sm" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Success Criteria</Label>
                      <Textarea value={g.success} onChange={(e) => updateGoal(i, "success", e.target.value)} placeholder="How will success be measured..." className="h-16 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg">Budget Allocation</h3>
              <Button variant="outline" size="sm" onClick={addBudgetItem} className="rounded-lg gap-1">
                <Plus size={14} /> Add Item
              </Button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3 px-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden md:grid">
                <div>Category</div>
                <div>Description</div>
                <div>Provider</div>
                <div className="text-right">Amount ($)</div>
              </div>
              {budgetItems.map((b, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-secondary rounded-xl items-center">
                  <Input value={b.category} onChange={(e) => updateBudgetItem(i, "category", e.target.value)} placeholder="Category" className="text-sm font-semibold" />
                  <Input value={b.description} onChange={(e) => updateBudgetItem(i, "description", e.target.value)} placeholder="Support description" className="text-sm" />
                  <Input value={b.provider} onChange={(e) => updateBudgetItem(i, "provider", e.target.value)} placeholder="Provider" className="text-sm" />
                  <Input type="number" value={b.amount} onChange={(e) => updateBudgetItem(i, "amount", e.target.value)} className="text-sm text-right font-bold" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funding Summary + Saved Plans */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 sticky top-4">
            <h4 className="font-black text-lg mb-6">Funding Summary</h4>
            {participant && (
              <div className="mb-6 p-4 bg-primary/5 rounded-2xl">
                <p className="text-xs font-bold text-primary">{participant.name}</p>
                <p className="text-[10px] text-muted-foreground">NDIS: {participant.ndis_number}</p>
              </div>
            )}
            <div className="space-y-4">
              {budgetItems.filter(b => b.amount > 0).map((b, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-muted-foreground">{b.category || "Item"}</span>
                    <span className="text-foreground">${Number(b.amount).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${totalBudget > 0 ? (Number(b.amount) / totalBudget * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 mt-6 border-t border-border">
              <p className="text-3xl font-black text-foreground">${totalBudget.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Plan Budget</p>
            </div>
          </div>

          {savedPlans.length > 0 && (
            <div className="bg-card border border-border rounded-3xl p-6">
              <h4 className="font-black mb-4 flex items-center gap-2"><FolderOpen size={16} className="text-primary" /> Saved Plans</h4>
              <div className="space-y-2">
                {savedPlans.slice(0, 8).map(plan => (
                        <div key={plan.id} className="p-3 bg-secondary rounded-xl flex items-center justify-between group hover:bg-primary/5 transition-colors">
                          <div onClick={() => loadPlan(plan)} className="cursor-pointer flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{plan.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{plan.participant_name} · {plan.date_created}</p>
                          </div>
                          <button onClick={() => deletePlan(plan.id, plan.title)} disabled={deleting} className="text-muted-foreground hover:text-destructive shrink-0 ml-2 p-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SupportPlanPrint({ participant, goals, budgetItems, primaryGoal, supportFocus, config, onBack }) {
  const total = budgetItems.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="text-primary font-bold text-sm hover:underline">← Back to Builder</button>
        <Button onClick={() => window.print()} variant="outline" className="rounded-xl gap-2">
          <Printer size={16} /> Download / Print PDF
        </Button>
      </div>

      <div className="bg-white max-w-4xl mx-auto shadow-xl rounded-b-xl overflow-hidden text-slate-800 text-sm">
        {/* Gradient Header */}
        <div style={{background:"linear-gradient(90deg,#3b82f6 0%,#2563eb 40%,#9333ea 100%)"}} className="p-7 flex items-center justify-between">
          <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/09e12d07c_LOGO_LANDSCAPE.png" alt="SZ-JIE WANG" className="h-14 rounded-xl bg-white px-3 py-2 object-contain" />
          <div className="text-right text-white">
            <h1 className="text-2xl font-black tracking-tight">Support Plan</h1>
            <p className="text-blue-100 text-xs mt-1">SZ-JIE WANG Support Services · NDIS Registered Provider</p>
          </div>
        </div>

        <div className="p-8 space-y-7">
          {/* Section 1 - General Info */}
          <section>
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="opacity-60">1.</span> General Information
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Participant Name", value: participant?.name || "—", accent: true },
                { label: "NDIS Number", value: participant?.ndis_number || "—" },
                { label: "Plan Date", value: new Date().toLocaleDateString("en-AU") },
                { label: "Primary Goal", value: primaryGoal || "—", accent: true },
              ].map(f => (
                <div key={f.label} className={`border-l-4 pl-3 ${f.accent ? "border-blue-500 bg-blue-50/50 pr-2 rounded-r-lg" : "border-slate-200"}`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                  <p className={`font-black text-sm ${f.accent ? "text-blue-800" : "text-slate-800"}`}>{f.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2 & 3 - Focus & Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="opacity-60">2.</span> Support Focus
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <ul className="space-y-2 text-sm font-semibold text-slate-700">
                  {(supportFocus || "—").split(",").map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-600 rounded-full shrink-0"></span>{f.trim()}</li>
                  ))}
                </ul>
              </div>
            </section>
            <section>
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="opacity-60">3.</span> Plan Type &amp; Management
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 italic text-sm text-slate-600 leading-relaxed">
                "{participant?.plan_type || "Plan Managed"} — This plan has been developed in partnership with the participant and their support network to achieve meaningful outcomes."
              </div>
            </section>
          </div>

          {/* Section 4 - Goals Table */}
          <section>
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="opacity-60">4.</span> Goal Plan &amp; Skill Development
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Goal</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Support Strategy</th>
                    <th className="p-4 text-[10px] font-black text-purple-600 uppercase tracking-widest text-right">Success Criteria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {goals.filter(g => g.text).map((g, i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-slate-50/30" : ""}>
                      <td className="p-4 font-bold text-slate-800 align-top w-1/4">{g.text}</td>
                      <td className="p-4 text-slate-500 font-medium align-top w-2/4">{g.support || g.steps || "—"}</td>
                      <td className="p-4 text-purple-700 italic text-right align-top w-1/4">{g.success || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 - Budget */}
          <section>
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="opacity-60">5.</span> Budget Allocation
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Provider</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {budgetItems.filter(b => b.category || b.amount > 0).map((b, i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-slate-50/30" : ""}>
                      <td className="p-4 font-semibold text-slate-800">{b.category}</td>
                      <td className="p-4 text-slate-500">{b.description || "—"}</td>
                      <td className="p-4 text-slate-500">{b.provider || "—"}</td>
                      <td className="p-4 font-black text-right">${Number(b.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white">
                    <td colSpan={3} className="p-4 font-black text-right">Total Plan Budget</td>
                    <td className="p-4 font-black text-right text-base">${total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Endorsements */}
          <section>
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="opacity-60">6.</span> Plan Endorsements
            </div>
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
              <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assessor</p><p className="font-black text-slate-800">SZ-Jie Wang</p></div>
              <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p><p className="font-black text-slate-800">{new Date().toLocaleDateString("en-AU")}</p></div>
            </div>
          </section>

          <p className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">SZ-JIE WANG Support Services · NDIS Registered Provider · This document is confidential.</p>
        </div>
      </div>
    </div>
  );
}