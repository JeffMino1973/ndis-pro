import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Target, Plus, Trash2, Printer } from "lucide-react";
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

  useEffect(() => {
    async function load() {
      const [data, me] = await Promise.all([base44.entities.Participant.list(), base44.auth.me()]);
      setParticipants(data);
      setConfig(me?.businessConfig || {});
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
        <Button onClick={() => setShowPreview(true)} disabled={!participant} variant="outline" className="rounded-xl font-bold gap-2">
          <Printer size={16} /> Preview / Print
        </Button>
      </div>

      {/* Select Participant */}
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <div>
          <Label>Select Participant</Label>
          <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
            <SelectTrigger className="max-w-md mt-1"><SelectValue placeholder="Choose a participant..." /></SelectTrigger>
            <SelectContent>
              {participants.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.ndis_number}</SelectItem>)}
            </SelectContent>
          </Select>
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

        {/* Funding Summary */}
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

      <div className="bg-white border border-slate-200 rounded-2xl p-8 lg:p-14 max-w-3xl mx-auto text-slate-800 text-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">NDIS Support Plan</h1>
            <p className="text-slate-500 text-sm mt-1">Individualised Support & Goal Framework</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-slate-900">{config.businessName || "NDIS PRO"}</p>
            {config.abn && <p className="text-xs text-slate-500">ABN: {config.abn}</p>}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: "Participant Name", value: participant?.name || "—" },
            { label: "Primary Goal", value: primaryGoal || "—" },
            { label: "Support Focus", value: supportFocus || "—" },
            { label: "NDIS Number", value: participant?.ndis_number || "—" },
            { label: "Date of Plan", value: new Date().toLocaleDateString("en-AU") },
            { label: "Plan Type", value: participant?.plan_type || "—" },
          ].map(f => (
            <div key={f.label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
              <p className="font-bold text-slate-900">{f.value}</p>
            </div>
          ))}
        </div>

        {/* Goals Table */}
        <section className="mb-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-primary text-white rounded text-[10px] flex items-center justify-center">1</span>
            Goal Plan & Skill Development
          </h2>
          <table className="w-full text-left text-sm border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-black text-slate-400 uppercase">
                <th className="px-4 py-3">Goal</th>
                <th className="px-4 py-3">Support Strategy</th>
                <th className="px-4 py-3">Success Criteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {goals.filter(g => g.text).map((g, i) => (
                <tr key={i}>
                  <td className="px-4 py-4 font-semibold text-slate-800">{g.text}</td>
                  <td className="px-4 py-4 text-slate-600">{g.support || g.steps || "—"}</td>
                  <td className="px-4 py-4 text-slate-600">{g.success || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Budget */}
        <section className="mb-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-primary text-white rounded text-[10px] flex items-center justify-center">2</span>
            Budget Allocation
          </h2>
          <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-black text-slate-400 uppercase">
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Provider</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgetItems.filter(b => b.category || b.amount > 0).map((b, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-semibold">{b.category}</td>
                  <td className="px-4 py-3 text-slate-500">{b.description || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{b.provider || "—"}</td>
                  <td className="px-4 py-3 text-right font-black">${Number(b.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-black text-slate-700">Total Plan Budget</td>
                <td className="px-4 py-3 text-right font-black text-primary text-base">${total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          This support plan has been developed in partnership with the participant and their support network.
        </div>
      </div>
    </div>
  );
}