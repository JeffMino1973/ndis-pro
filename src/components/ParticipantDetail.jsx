import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, FileText, AlertTriangle, Edit, Phone, Mail, MapPin, User, Shield, Heart, ClipboardList, Upload, Camera, Paperclip, Trash2, Download, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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

const DOC_TYPES = ["Care Plan","NDIS Plan","Risk Assessment","Medical Report","WWCC Certificate","Police Check","First Aid Certificate","Consent Form","Emergency Plan","Other"];

export default function ParticipantDetail({ participant, onBack }) {
  const [p, setP] = useState(participant);
  const [newNote, setNewNote] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docForm, setDocForm] = useState({ title: "", document_type: "Care Plan" });
  const photoRef = useRef();
  const docFileRef = useRef();
  const [pendingDocFile, setPendingDocFile] = useState(null);

  useEffect(() => {
    base44.entities.Document.filter({ participant_id: p.id }, "-created_date").then(setDocuments);
  }, [p.id]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Participant.update(p.id, { photo_url: file_url });
    setP({ ...p, photo_url: file_url });
    setUploadingPhoto(false);
  };

  const handleDocUpload = async () => {
    if (!pendingDocFile || !docForm.title) return;
    setUploadingDoc(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: pendingDocFile });
    const doc = await base44.entities.Document.create({
      participant_id: p.id,
      participant_name: p.name,
      title: docForm.title,
      document_type: docForm.document_type,
      file_url,
    });
    setDocuments([doc, ...documents]);
    setDocForm({ title: "", document_type: "Care Plan" });
    setPendingDocFile(null);
    if (docFileRef.current) docFileRef.current.value = "";
    setUploadingDoc(false);
  };

  const deleteDoc = async (id) => {
    await base44.entities.Document.delete(id);
    setDocuments(documents.filter(d => d.id !== id));
  };

  const handleDeleteParticipant = async () => {
    setDeleting(true);
    await base44.entities.Participant.delete(p.id);
    onBack();
  };

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
            <div className="relative group">
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-3xl">
                  {p.name?.charAt(0)}
                </div>
              )}
              <button
                onClick={() => photoRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {uploadingPhoto ? <Loader2 size={18} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
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
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2" onClick={() => setShowEdit(true)}>
              <Edit size={16} /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 size={16} /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Participant?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete <strong>{p.name}</strong> and cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteParticipant} className="bg-destructive hover:bg-destructive/90" disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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

      {/* Documents */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/50 flex items-center gap-2">
          <Paperclip size={18} className="text-primary" />
          <h3 className="font-black text-lg">Documents</h3>
        </div>
        <div className="p-6 space-y-4">
          {/* Upload form */}
          <div className="p-4 bg-secondary rounded-2xl space-y-3">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Upload New Document</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={docForm.title}
                onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                placeholder="Document title..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              />
              <select
                value={docForm.document_type}
                onChange={e => setDocForm({ ...docForm, document_type: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Upload size={15} />
                {pendingDocFile ? pendingDocFile.name : "Choose file..."}
                <input ref={docFileRef} type="file" className="hidden" onChange={e => setPendingDocFile(e.target.files?.[0] || null)} />
              </label>
              <Button onClick={handleDocUpload} disabled={!pendingDocFile || !docForm.title || uploadingDoc} className="rounded-xl font-bold gap-2">
                {uploadingDoc ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload
              </Button>
            </div>
          </div>
          {/* Document list */}
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <FileText size={16} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{doc.title}</p>
                    <p className="text-[10px] text-muted-foreground">{doc.document_type} · {doc.created_date?.split("T")[0]}</p>
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/70">
                    <Download size={15} />
                  </a>
                  <button onClick={() => deleteDoc(doc.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a progress note..."
              className="flex-1 flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
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