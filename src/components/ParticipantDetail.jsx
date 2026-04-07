import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, FileText, AlertTriangle, Edit, Phone, Mail, MapPin, User, Shield, Heart, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ParticipantForm from "./ParticipantForm";

function InfoCard({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="bg-secondary rounded-xl p-3">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-muted-foreground shrink-0" />}
        <p className="text-sm font-bold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, color = "text-primary" }) {
  return (
    <h3 className={`font-black text-lg flex items-center gap-2 mb-4 ${color}`}>
      <Icon size={18} /> {title}
    </h3>
  );
}

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

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
        <ArrowLeft size={16} /> Back to Participants
      </button>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-3xl">
              {p.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">{p.name}</h2>
              <p className="text-sm text-muted-foreground font-semibold">NDIS: {p.ndis_number} · {p.plan_type}</p>
              {p.date_of_birth && <p className="text-xs text-muted-foreground mt-0.5">DOB: {p.date_of_birth}</p>}
              <span className={`inline-block mt-2 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                p.status === "Active" ? "bg-emerald-100 text-emerald-700" :
                p.status === "Review Due" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
              }`}>{p.status}</span>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => setShowEdit(true)}>
            <Edit size={16} /> Edit
          </Button>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <InfoCard label="Phone" value={p.phone} icon={Phone} />
          <InfoCard label="Email" value={p.email} icon={Mail} />
          <InfoCard label="Address" value={p.address} icon={MapPin} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mt-3">
          <InfoCard label="Next Plan Review" value={p.next_review} />
          <InfoCard label="Primary Disability" value={p.primary_disability} />
        </div>
      </div>

      {/* Health & Disability */}
      {p.medical_alerts && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6">
          <SectionHeading icon={AlertTriangle} title="Medical Alerts" color="text-rose-600" />
          <p className="text-sm text-rose-800 font-semibold">{p.medical_alerts}</p>
        </div>
      )}

      {/* Plan Coordinator */}
      {(p.plan_coordinator_name || p.plan_coordinator_email || p.plan_coordinator_phone) && (
        <div className="bg-card border border-border rounded-3xl p-6">
          <SectionHeading icon={ClipboardList} title="Plan Coordinator" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard label="Name" value={p.plan_coordinator_name} icon={User} />
            <InfoCard label="Email" value={p.plan_coordinator_email} icon={Mail} />
            <InfoCard label="Phone" value={p.plan_coordinator_phone} icon={Phone} />
          </div>
        </div>
      )}

      {/* Parent / Guardian */}
      {(p.parent_guardian_name || p.parent_guardian_email || p.parent_guardian_phone) && (
        <div className="bg-card border border-border rounded-3xl p-6">
          <SectionHeading icon={Heart} title="Parent / Guardian" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard label="Name" value={p.parent_guardian_name} icon={User} />
            <InfoCard label="Email" value={p.parent_guardian_email} icon={Mail} />
            <InfoCard label="Phone" value={p.parent_guardian_phone} icon={Phone} />
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      {(p.emergency_contact_name || p.emergency_contact_phone) && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
          <SectionHeading icon={Shield} title="Emergency Contact" color="text-amber-700" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard label="Name" value={p.emergency_contact_name} icon={User} />
            <InfoCard label="Phone" value={p.emergency_contact_phone} icon={Phone} />
            <InfoCard label="Relationship" value={p.emergency_contact_relationship} />
          </div>
        </div>
      )}

      {/* Progress Notes */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/50 flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h3 className="font-black text-lg">Progress Notes</h3>
        </div>
        <div className="p-6 space-y-3">
          {(p.notes || []).length === 0 && <p className="text-sm text-muted-foreground italic">No progress notes yet.</p>}
          {(p.notes || []).map((note, i) => (
            <div key={i} className="p-4 bg-secondary rounded-2xl">
              <p className="text-sm text-foreground">{note.text}</p>
              <p className="text-[10px] text-muted-foreground mt-2">{note.date} · {note.by}</p>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a progress note..." className="rounded-xl" onKeyDown={(e) => e.key === "Enter" && addNote()} />
            <Button onClick={addNote} className="rounded-xl font-bold px-6">Save</Button>
          </div>
        </div>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Participant</DialogTitle></DialogHeader>
          <ParticipantForm initial={p} onSave={() => { setShowEdit(false); onBack(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}