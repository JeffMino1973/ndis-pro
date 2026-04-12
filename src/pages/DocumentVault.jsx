import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Upload, FileText, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { differenceInDays, parseISO } from "date-fns";

const DOC_TYPES = ["Care Plan","NDIS Plan","Risk Assessment","Medical Report","WWCC Certificate","Police Check","First Aid Certificate","Consent Form","Emergency Plan","Other"];

export default function DocumentVault() {
  const [docs, setDocs] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", document_type: "Care Plan", participant_name: "", participant_id: "", expiry_date: "", notes: "", file_url: "" });
  const [fileInput, setFileInput] = useState(null);
  const [filter, setFilter] = useState("All");

  const load = async () => {
    const [d, p] = await Promise.all([base44.entities.Document.list("-created_date"), base44.entities.Participant.list()]);
    setDocs(d); setParticipants(p);
  };

  useEffect(() => { load(); }, []);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("file_url", file_url);
    setUploading(false);
  };

  const save = async () => {
    await base44.entities.Document.create(form);
    setShowForm(false);
    setForm({ title: "", document_type: "Care Plan", participant_name: "", participant_id: "", expiry_date: "", notes: "", file_url: "" });
    load();
  };

  const deleteDoc = async (id) => {
    await base44.entities.Document.delete(id);
    load();
  };

  const getExpiryStatus = (expiry) => {
    if (!expiry) return null;
    const days = differenceInDays(parseISO(expiry), new Date());
    if (days < 0) return { label: "Expired", cls: "bg-rose-100 text-rose-700" };
    if (days <= 30) return { label: `${days}d left`, cls: "bg-amber-100 text-amber-700" };
    return { label: `${days}d left`, cls: "bg-emerald-100 text-emerald-700" };
  };

  const filtered = filter === "All" ? docs : docs.filter(d => d.document_type === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Document Vault</h2>
          <p className="text-muted-foreground text-sm">Securely store care plans, certificates, and compliance documents.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2"><Plus size={18} /> Upload Document</Button>
      </div>

      {/* Expiry Alerts */}
      {docs.filter(d => {
        if (!d.expiry_date) return false;
        const days = differenceInDays(parseISO(d.expiry_date), new Date());
        return days <= 30;
      }).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 text-sm">Expiry Alerts</p>
            <div className="space-y-1 mt-1">
              {docs.filter(d => {
                if (!d.expiry_date) return false;
                return differenceInDays(parseISO(d.expiry_date), new Date()) <= 30;
              }).map(d => (
                <p key={d.id} className="text-xs text-amber-700">
                  <span className="font-bold">{d.title}</span> ({d.participant_name}) — expires {d.expiry_date}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...DOC_TYPES].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`text-[10px] font-black px-3 py-1.5 rounded-full transition-all ${filter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(d => {
          const expiry = getExpiryStatus(d.expiry_date);
          return (
            <div key={d.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <FileText size={20} />
                </div>
                <div className="flex items-center gap-2">
                  {expiry && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${expiry.cls}`}>{expiry.label}</span>}
                  <button onClick={() => deleteDoc(d.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="font-bold text-foreground">{d.title}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{d.document_type}</p>
              {d.participant_name && <p className="text-xs text-muted-foreground mt-1">👤 {d.participant_name}</p>}
              {d.file_url && (
                <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline mt-2 block">
                  View Document →
                </a>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="md:col-span-3 bg-card border border-border rounded-3xl p-12 text-center">
            <FileText size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground italic text-sm">No documents yet. Upload your first document.</p>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Title</Label>
              <Input value={form.title} onChange={e => update("title", e.target.value)} placeholder="e.g. John's NDIS Plan 2025" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Document Type</Label>
                <Select value={form.document_type} onValueChange={v => update("document_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Participant (optional)</Label>
                <Select value={form.participant_name} onValueChange={v => update("participant_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Expiry Date (optional)</Label>
              <Input type="date" value={form.expiry_date} onChange={e => update("expiry_date", e.target.value)} />
            </div>
            <div>
              <Label>Upload File</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <input type="file" onChange={handleFile} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  ) : form.file_url ? (
                    <p className="text-sm text-emerald-600 font-bold">✓ File uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      <Upload size={24} className="text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to upload a file</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <Button onClick={save} disabled={!form.title || !form.file_url || uploading} className="w-full rounded-xl font-bold">Save Document</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}