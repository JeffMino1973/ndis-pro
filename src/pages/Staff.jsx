import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, User, CheckCircle, AlertCircle, Clock, Pencil, Trash2, Camera, Loader2, Upload, Download, FileText, Phone, Mail, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DOC_TYPES = ["Contract", "WWCC Certificate", "Police Check", "First Aid Certificate", "Training Record", "ID Document", "Other"];

const statusColors = {
  Active: "bg-emerald-100 text-emerald-700",
  "On Leave": "bg-amber-100 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

function Section({ title }) {
  return <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pt-2 pb-1 border-t border-border mt-2">{title}</p>;
}

const EMPTY_FORM = {
  name: "", role: "", email: "", phone: "", address: "", date_of_birth: "",
  wwcc_expiry: "", first_aid_expiry: "", police_check: "Cleared", training_status: "Complete", status: "Active",
  emergency_contact_name: "", emergency_contact_phone: "", emergency_contact_relationship: "",
  tfn: "", abn: "", bank_name: "", bank_account_name: "", bank_bsb: "", bank_account_number: "",
};

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    const data = await base44.entities.StaffMember.list();
    setStaff(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({ name: s.name || "", role: s.role || "", email: s.email || "", phone: s.phone || "", address: s.address || "", date_of_birth: s.date_of_birth || "", wwcc_expiry: s.wwcc_expiry || "", first_aid_expiry: s.first_aid_expiry || "", police_check: s.police_check || "Cleared", training_status: s.training_status || "Complete", status: s.status || "Active", emergency_contact_name: s.emergency_contact_name || "", emergency_contact_phone: s.emergency_contact_phone || "", emergency_contact_relationship: s.emergency_contact_relationship || "", tfn: s.tfn || "", abn: s.abn || "", bank_name: s.bank_name || "", bank_account_name: s.bank_account_name || "", bank_bsb: s.bank_bsb || "", bank_account_number: s.bank_account_number || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (editingId) {
      const updated = await base44.entities.StaffMember.update(editingId, form);
      if (selected?.id === editingId) setSelected({ ...selected, ...form });
    } else {
      await base44.entities.StaffMember.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    await base44.entities.StaffMember.delete(id);
    if (selected?.id === id) setSelected(null);
    load();
  };

  const toggleStatus = async (s) => {
    const newStatus = s.status === "Active" ? "Inactive" : "Active";
    await base44.entities.StaffMember.update(s.id, { status: newStatus });
    if (selected?.id === s.id) setSelected({ ...selected, status: newStatus });
    load();
  };

  const getComplianceIcon = (date) => {
    if (!date) return <Clock size={13} className="text-muted-foreground" />;
    return new Date(date) > new Date() ? <CheckCircle size={13} className="text-emerald-500" /> : <AlertCircle size={13} className="text-rose-500" />;
  };

  if (selected) {
    return <StaffDetail staff={selected} onBack={() => { setSelected(null); load(); }} onEdit={() => openEdit(selected)} onDelete={() => handleDelete(selected.id)} onToggleStatus={() => toggleStatus(selected)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Staff & Compliance</h2>
          <p className="text-muted-foreground text-sm">Manage verification, training, and certification records.</p>
        </div>
        <Button onClick={openAdd} className="rounded-xl font-bold gap-2"><Plus size={18} /> Add Staff</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {staff.map((s) => (
            <div key={s.id} className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all group cursor-pointer" onClick={() => setSelected(s)}>
              <div className="flex items-center gap-4 mb-4">
                {s.photo_url ? (
                  <img src={s.photo_url} alt={s.name} className="w-14 h-14 rounded-2xl object-cover" />
                ) : (
                  <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    <User size={28} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-foreground leading-none mb-1 truncate">{s.name}</h3>
                  <p className="text-xs font-medium text-primary">{s.role}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${statusColors[s.status] || "bg-slate-100 text-slate-600"}`}>{s.status}</span>
              </div>

              <div className="space-y-2">
                {[
                  { label: "WWCC", icon: getComplianceIcon(s.wwcc_expiry), val: s.wwcc_expiry || "N/A" },
                  { label: "First Aid", icon: getComplianceIcon(s.first_aid_expiry), val: s.first_aid_expiry || "N/A" },
                  { label: "Police Check", icon: s.police_check === "Cleared" ? <CheckCircle size={13} className="text-emerald-500" /> : <AlertCircle size={13} className="text-rose-500" />, val: s.police_check || "N/A" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center px-3 py-2 bg-secondary rounded-xl">
                    <div className="flex items-center gap-2">{item.icon}<p className="text-[10px] font-black text-muted-foreground uppercase">{item.label}</p></div>
                    <p className="text-[10px] font-bold text-foreground">{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center" onClick={e => e.stopPropagation()}>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${s.training_status === "Complete" ? "bg-emerald-100 text-emerald-700" : s.training_status === "Due Soon" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>Training: {s.training_status}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {staff.length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground">No staff members yet.</div>}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) setEditingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
              <div><Label>Role *</Label><Input value={form.role} onChange={e => set("role", e.target.value)} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => set("email", e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
              <div className="col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => set("address", e.target.value)} /></div>
              <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="On Leave">On Leave</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            <Section title="Compliance" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>WWCC Expiry</Label><Input type="date" value={form.wwcc_expiry} onChange={e => set("wwcc_expiry", e.target.value)} /></div>
              <div><Label>First Aid Expiry</Label><Input type="date" value={form.first_aid_expiry} onChange={e => set("first_aid_expiry", e.target.value)} /></div>
              <div>
                <Label>Police Check</Label>
                <Select value={form.police_check} onValueChange={v => set("police_check", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Cleared">Cleared</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Expired">Expired</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Training</Label>
                <Select value={form.training_status} onValueChange={v => set("training_status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Complete">Complete</SelectItem><SelectItem value="Due Soon">Due Soon</SelectItem><SelectItem value="Overdue">Overdue</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            <Section title="Emergency Contact" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.emergency_contact_name} onChange={e => set("emergency_contact_name", e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={form.emergency_contact_phone} onChange={e => set("emergency_contact_phone", e.target.value)} /></div>
              <div><Label>Relationship</Label><Input value={form.emergency_contact_relationship} onChange={e => set("emergency_contact_relationship", e.target.value)} /></div>
            </div>

            <Section title="Financial & Tax" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>TFN</Label><Input value={form.tfn} onChange={e => set("tfn", e.target.value)} placeholder="Tax File Number" /></div>
              <div><Label>ABN (if contractor)</Label><Input value={form.abn} onChange={e => set("abn", e.target.value)} /></div>
              <div><Label>Bank Name</Label><Input value={form.bank_name} onChange={e => set("bank_name", e.target.value)} /></div>
              <div><Label>Account Name</Label><Input value={form.bank_account_name} onChange={e => set("bank_account_name", e.target.value)} /></div>
              <div><Label>BSB</Label><Input value={form.bank_bsb} onChange={e => set("bank_bsb", e.target.value)} /></div>
              <div><Label>Account Number</Label><Input value={form.bank_account_number} onChange={e => set("bank_account_number", e.target.value)} /></div>
            </div>

            <Button onClick={handleSave} disabled={!form.name || !form.role} className="w-full rounded-xl font-bold mt-2">
              {editingId ? "Save Changes" : "Add Staff Member"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StaffDetail({ staff: s, onBack, onEdit, onDelete, onToggleStatus }) {
  const [member, setMember] = useState(s);
  const [documents, setDocuments] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [pendingDocFile, setPendingDocFile] = useState(null);
  const [docForm, setDocForm] = useState({ title: "", document_type: "Contract" });
  const photoRef = useRef();
  const docFileRef = useRef();

  useEffect(() => {
    base44.entities.Document.filter({ participant_id: "staff_" + s.id }, "-created_date").then(setDocuments);
  }, [s.id]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.StaffMember.update(member.id, { photo_url: file_url });
    setMember({ ...member, photo_url: file_url });
    setUploadingPhoto(false);
  };

  const handleDocUpload = async () => {
    if (!pendingDocFile || !docForm.title) return;
    setUploadingDoc(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: pendingDocFile });
    const doc = await base44.entities.Document.create({
      participant_id: "staff_" + member.id,
      participant_name: member.name,
      title: docForm.title,
      document_type: docForm.document_type,
      file_url,
    });
    setDocuments([doc, ...documents]);
    setDocForm({ title: "", document_type: "Contract" });
    setPendingDocFile(null);
    if (docFileRef.current) docFileRef.current.value = "";
    setUploadingDoc(false);
  };

  const deleteDoc = async (id) => {
    await base44.entities.Document.delete(id);
    setDocuments(documents.filter(d => d.id !== id));
  };

  const Info = ({ label, value, icon: Icon }) => {
    if (!value) return null;
    return (
      <div className="bg-secondary rounded-xl p-3">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={12} className="text-muted-foreground" />}
          <p className="text-sm font-bold text-foreground truncate">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"><ArrowLeft size={16} /> Back to Staff</button>

      {/* Header */}
      <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name} className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-3xl">{member.name?.charAt(0)}</div>
              )}
              <button onClick={() => photoRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingPhoto ? <Loader2 size={18} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div>
              <h2 className="text-2xl font-black">{member.name}</h2>
              <p className="text-sm text-primary font-semibold">{member.role}</p>
              <span className={`inline-block mt-2 text-[10px] font-black px-3 py-1 rounded-full uppercase ${statusColors[member.status] || "bg-slate-100 text-slate-600"}`}>{member.status}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={onEdit}><Pencil size={14} /> Edit</Button>
            <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => { onToggleStatus(); setMember({ ...member, status: member.status === "Active" ? "Inactive" : "Active" }); }}>
              {member.status === "Active" ? "Set Inactive" : "Set Active"}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl gap-1 text-destructive border-destructive/30" onClick={onDelete}><Trash2 size={14} /> Delete</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <Info label="Phone" value={member.phone} icon={Phone} />
          <Info label="Email" value={member.email} icon={Mail} />
          <Info label="Address" value={member.address} icon={MapPin} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          <Info label="Date of Birth" value={member.date_of_birth} />
          <Info label="WWCC Expiry" value={member.wwcc_expiry} />
          <Info label="First Aid Expiry" value={member.first_aid_expiry} />
          <Info label="Police Check" value={member.police_check} />
          <Info label="Training" value={member.training_status} />
        </div>
      </div>

      {/* Emergency Contact */}
      {(member.emergency_contact_name || member.emergency_contact_phone) && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
          <h3 className="font-black text-amber-700 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Info label="Name" value={member.emergency_contact_name} icon={User} />
            <Info label="Phone" value={member.emergency_contact_phone} icon={Phone} />
            <Info label="Relationship" value={member.emergency_contact_relationship} />
          </div>
        </div>
      )}

      {/* Financial */}
      {(member.tfn || member.bank_name || member.bank_bsb) && (
        <div className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-black mb-4">Financial & Tax Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Info label="TFN" value={member.tfn} />
            <Info label="ABN" value={member.abn} />
            <Info label="Bank Name" value={member.bank_name} />
            <Info label="Account Name" value={member.bank_account_name} />
            <Info label="BSB" value={member.bank_bsb} />
            <Info label="Account Number" value={member.bank_account_number} />
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/50 flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h3 className="font-black text-lg">Documents</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-secondary rounded-2xl space-y-3">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Upload Document</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} placeholder="Document title..." className="h-9 text-sm" />
              <select value={docForm.document_type} onChange={e => setDocForm({ ...docForm, document_type: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
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
                {uploadingDoc ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
              </Button>
            </div>
          </div>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <FileText size={16} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{doc.title}</p>
                    <p className="text-[10px] text-muted-foreground">{doc.document_type} · {doc.created_date?.split("T")[0]}</p>
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/70"><Download size={15} /></a>
                  <button onClick={() => deleteDoc(doc.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}