import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, FileText, ExternalLink, Loader2, Trash2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

const CATEGORIES = ["WWCC", "First Aid", "Police Check", "Driver Licence", "Qualifications", "Insurance", "Other"];

export default function StaffComplianceDocs({ staffRecord }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: "", category: "WWCC", expiry_date: "", notes: "", file_url: "" });

  const load = async () => {
    if (!staffRecord) { setLoading(false); return; }
    setLoading(true);
    const all = await base44.entities.StaffComplianceDoc.list("-created_date");
    setDocs(all.filter(d => d.staff_name === staffRecord.name || d.staff_id === staffRecord.id));
    setLoading(false);
  };

  useEffect(() => { load(); }, [staffRecord?.id]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewDoc(d => ({ ...d, file_url }));
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    await base44.entities.StaffComplianceDoc.create({
      staff_name: staffRecord.name,
      staff_id: staffRecord.id,
      title: newDoc.title,
      category: newDoc.category,
      file_url: newDoc.file_url,
      expiry_date: newDoc.expiry_date,
      status: "Pending",
      notes: newDoc.notes,
    });
    setSaving(false);
    setNewDoc({ title: "", category: "WWCC", expiry_date: "", notes: "", file_url: "" });
    setShowAdd(false);
    load();
  };

  const remove = async (id) => {
    await base44.entities.StaffComplianceDoc.delete(id);
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  if (loading) return (
    <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Upload your compliance documents (WWCC, First Aid, Police Check, etc.). Admin will verify them.</p>
        </div>
        <Button onClick={() => setShowAdd(v => !v)} className="rounded-xl font-bold gap-2 text-xs" size="sm">
          <Upload size={13} /> Upload Document
        </Button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <h3 className="font-black text-sm">New Compliance Document</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground">Title *</label>
              <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                value={newDoc.title} onChange={e => setNewDoc(d => ({ ...d, title: e.target.value }))} placeholder="e.g. WWCC Certificate" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Category</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                value={newDoc.category} onChange={e => setNewDoc(d => ({ ...d, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Expiry Date</label>
              <input type="date" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                value={newDoc.expiry_date} onChange={e => setNewDoc(d => ({ ...d, expiry_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">File Upload</label>
            <input type="file" className="mt-1 block text-sm text-muted-foreground" onChange={handleFile} />
            {uploading && <p className="text-xs text-primary mt-1 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading…</p>}
            {newDoc.file_url && <p className="text-xs text-emerald-600 mt-1">✓ File uploaded</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Notes</label>
            <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
              value={newDoc.notes} onChange={e => setNewDoc(d => ({ ...d, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={save} disabled={!newDoc.title || !newDoc.file_url || saving} className="rounded-xl font-bold text-xs gap-2">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Save Document
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl font-bold text-xs">Cancel</Button>
          </div>
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground italic text-sm bg-card border border-border rounded-2xl">
          No compliance documents uploaded yet. Click "Upload Document" to add your WWCC, First Aid, Police Check, etc.
        </div>
      ) : (
        <div className="space-y-2">
          {CATEGORIES.map(cat => {
            const catDocs = docs.filter(d => d.category === cat);
            if (catDocs.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{cat}</p>
                {catDocs.map(doc => {
                  const days = doc.expiry_date ? Math.ceil((new Date(doc.expiry_date) - new Date()) / 86400000) : null;
                  const expired = days !== null && days < 0;
                  const expiring = days !== null && days >= 0 && days <= 30;
                  return (
                    <div key={doc.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText size={18} className="text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{doc.title}</p>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            {doc.status === "Verified" && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                                <CheckCircle size={9} /> Verified
                              </span>
                            )}
                            {doc.status === "Pending" && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-0.5">
                                <AlertTriangle size={9} /> Pending Review
                              </span>
                            )}
                            {doc.status === "Rejected" && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-0.5">
                                <XCircle size={9} /> Rejected
                              </span>
                            )}
                            {doc.expiry_date && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${expired ? "bg-rose-100 text-rose-700" : expiring ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {expired ? "EXPIRED" : expiring ? `${days}d left` : `Exp ${doc.expiry_date}`}
                              </span>
                            )}
                          </div>
                          {doc.notes && <p className="text-xs text-muted-foreground mt-0.5">{doc.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {doc.file_url && (
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs font-bold h-7 px-2">
                              <ExternalLink size={11} /> View
                            </Button>
                          </a>
                        )}
                        {doc.status !== "Verified" && (
                          <Button size="sm" variant="ghost" className="rounded-xl text-xs text-rose-500 hover:text-rose-700 h-7 px-2"
                            onClick={() => remove(doc.id)}><Trash2 size={11} /></Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}