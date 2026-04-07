import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Wallet, FileText, AlertTriangle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ParticipantForm from "./ParticipantForm";

export default function ParticipantDetail({ participant, onBack }) {
  const [p, setP] = useState(participant);
  const [newNote, setNewNote] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  const addNote = async () => {
    if (!newNote.trim()) return;
    const notes = [...(p.notes || []), { text: newNote, date: new Date().toISOString().split("T")[0], by: "Admin" }];
    await base44.entities.Participant.update(p.id, { notes });
    setP({ ...p, notes });
    setNewNote("");
  };

  const budgetItems = [
    { key: "core", label: "Core Supports", budget: p.budget_core || 0, used: p.used_core || 0 },
    { key: "capacity", label: "Capacity Building", budget: p.budget_capacity || 0, used: p.used_capacity || 0 },
    { key: "capital", label: "Capital", budget: p.budget_capital || 0, used: p.used_capital || 0 },
  ];

  const totalBudget = budgetItems.reduce((a, b) => a + b.budget, 0);
  const totalUsed = budgetItems.reduce((a, b) => a + b.used, 0);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
        <ArrowLeft size={16} /> Back to Participants
      </button>

      {/* Header */}
      <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-2xl">
              {p.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">{p.name}</h2>
              <p className="text-sm text-muted-foreground">NDIS: {p.ndis_number} • {p.plan_type}</p>
              {p.medical_alerts && (
                <div className="flex items-center gap-1 mt-1 text-xs text-rose-600 font-bold">
                  <AlertTriangle size={12} /> {p.medical_alerts}
                </div>
              )}
            </div>
          </div>
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => setShowEdit(true)}>
            <Edit size={16} /> Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Status", value: p.status },
            { label: "Email", value: p.email || "N/A" },
            { label: "Phone", value: p.phone || "N/A" },
            { label: "Next Review", value: p.next_review || "TBD" },
          ].map((item) => (
            <div key={item.label} className="bg-secondary rounded-xl p-3">
              <p className="text-[9px] font-black text-muted-foreground uppercase">{item.label}</p>
              <p className="text-sm font-bold text-foreground truncate">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
        <h3 className="font-black text-lg flex items-center gap-2 mb-6">
          <Wallet className="text-primary" size={20} /> Funding Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {budgetItems.map((b) => {
            const remaining = b.budget - b.used;
            const pct = b.budget > 0 ? Math.round((b.used / b.budget) * 100) : 0;
            return (
              <div key={b.key} className="bg-secondary rounded-2xl p-5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{b.label}</p>
                <p className="text-2xl font-black text-foreground">${remaining.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">of ${b.budget.toLocaleString()} remaining</p>
                <div className="h-1.5 bg-border rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-primary/5 rounded-2xl p-5 flex justify-between items-center">
          <p className="text-sm font-bold text-muted-foreground">Total Remaining</p>
          <p className="text-2xl font-black text-primary">${(totalBudget - totalUsed).toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Notes */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/50 flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h3 className="font-black text-lg">Progress Notes</h3>
        </div>
        <div className="p-6 space-y-3">
          {(p.notes || []).length === 0 && (
            <p className="text-sm text-muted-foreground italic">No progress notes yet.</p>
          )}
          {(p.notes || []).map((note, i) => (
            <div key={i} className="p-4 bg-secondary rounded-2xl">
              <p className="text-sm text-foreground">{note.text}</p>
              <p className="text-[10px] text-muted-foreground mt-2">{note.date} • {note.by}</p>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a progress note..."
              className="rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <Button onClick={addNote} className="rounded-xl font-bold px-6">
              Save
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Participant</DialogTitle>
          </DialogHeader>
          <ParticipantForm
            initial={p}
            onSave={() => {
              setShowEdit(false);
              onBack();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}