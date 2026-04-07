import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Target, Plus, CheckCircle, Circle, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GoalTracking() {
  const [participants, setParticipants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editGoals, setEditGoals] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const p = await base44.entities.Participant.list("-updated_date");
    setParticipants(p);
    if (selected) setSelected(p.find(x => x.id === selected.id) || null);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p) => {
    const goals = (p.goals || []).map(g =>
      typeof g === "string"
        ? { text: g, progress: 0, status: "In Progress", milestones: [] }
        : g
    );
    setEditGoals(goals);
    setSelected(p);
  };

  const saveGoals = async () => {
    setSaving(true);
    await base44.entities.Participant.update(selected.id, { goals: editGoals });
    setSaving(false);
    setEditGoals(null);
    load();
  };

  const updateGoal = (i, field, value) => {
    setEditGoals(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g));
  };

  const addGoal = () => {
    setEditGoals(prev => [...(prev || []), { text: "", progress: 0, status: "In Progress", milestones: [] }]);
  };

  const removeGoal = (i) => setEditGoals(prev => prev.filter((_, idx) => idx !== i));

  const getGoalObj = (g) => typeof g === "string" ? { text: g, progress: 0, status: "In Progress" } : g;

  const progressColor = (pct) => pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-primary";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Goal Tracking</h2>
        <p className="text-muted-foreground text-sm">Visual progress tracking for participant NDIS goals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participant list */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Select Participant</p>
          {participants.map(p => (
            <div
              key={p.id}
              onClick={() => startEdit(p)}
              className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all hover:border-primary/50 ${selected?.id === p.id ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black">
                  {p.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{(p.goals || []).length} goals</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Goals detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-card border border-border rounded-3xl p-16 text-center">
              <Target size={48} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-semibold">Select a participant to view and track goals</p>
            </div>
          ) : editGoals ? (
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-lg">{selected.name} — Goals</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditGoals(null)} className="rounded-lg">Cancel</Button>
                  <Button size="sm" onClick={saveGoals} disabled={saving} className="rounded-lg gap-1"><Save size={14} />{saving ? "Saving..." : "Save"}</Button>
                </div>
              </div>
              <div className="space-y-4">
                {editGoals.map((g, i) => (
                  <div key={i} className="p-4 bg-secondary rounded-2xl space-y-3">
                    <Input value={g.text} onChange={e => updateGoal(i, "text", e.target.value)} placeholder="Describe the goal..." className="font-semibold" />
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground mb-1">PROGRESS %</p>
                        <Input type="number" min={0} max={100} value={g.progress} onChange={e => updateGoal(i, "progress", Math.min(100, parseInt(e.target.value) || 0))} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground mb-1">STATUS</p>
                        <Select value={g.status} onValueChange={v => updateGoal(i, "status", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Not Started","In Progress","On Track","Achieved","Discontinued"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <button onClick={() => removeGoal(i)} className="text-muted-foreground hover:text-destructive text-xs font-bold mt-5">Remove</button>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${progressColor(g.progress)}`} style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addGoal} className="w-full rounded-xl gap-2"><Plus size={14} /> Add Goal</Button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-lg">{selected.name} — Goals</h3>
                <Button variant="outline" size="sm" onClick={() => startEdit(selected)} className="rounded-lg gap-1"><Edit2 size={14} /> Edit Goals</Button>
              </div>
              {(selected.goals || []).length === 0 ? (
                <p className="text-muted-foreground italic text-sm">No goals recorded. Click Edit to add goals.</p>
              ) : (
                <div className="space-y-4">
                  {(selected.goals || []).map((g, i) => {
                    const goal = getGoalObj(g);
                    return (
                      <div key={i} className="p-5 bg-secondary rounded-2xl space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <p className="font-semibold text-foreground">{goal.text}</p>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${
                            goal.status === "Achieved" ? "bg-emerald-100 text-emerald-700" :
                            goal.status === "On Track" ? "bg-blue-100 text-blue-700" :
                            goal.status === "Discontinued" ? "bg-rose-100 text-rose-700" :
                            "bg-amber-100 text-amber-700"}`}>{goal.status || "In Progress"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${progressColor(goal.progress || 0)}`} style={{ width: `${goal.progress || 0}%` }} />
                          </div>
                          <span className="text-sm font-black text-foreground w-10 text-right">{goal.progress || 0}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}