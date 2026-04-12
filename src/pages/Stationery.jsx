import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Pencil, FileText, Mail, FileCheck, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const TEMPLATE_TYPES = ["Email Template", "Letter Template", "Form Template", "Notice", "Other"];

const typeIcon = {
  "Email Template": Mail,
  "Letter Template": FileText,
  "Form Template": FileCheck,
  "Notice": FileCheck,
  "Other": FileText,
};

const typeColor = {
  "Email Template": "bg-blue-100 text-blue-700",
  "Letter Template": "bg-purple-100 text-purple-700",
  "Form Template": "bg-emerald-100 text-emerald-700",
  "Notice": "bg-amber-100 text-amber-700",
  "Other": "bg-slate-100 text-slate-600",
};

const STARTER_TEMPLATES = [
  {
    name: "Welcome Letter",
    template_type: "Letter Template",
    subject: "",
    body: `Dear [Participant Name],

Welcome to [Provider Name]. We are delighted to welcome you as a valued participant and look forward to supporting you in achieving your goals.

As part of your onboarding, your dedicated support coordinator will be in touch shortly to discuss your support plan and schedule your first session.

If you have any questions or concerns, please do not hesitate to contact us.

Kind regards,
[Your Name]
[Provider Name]
[Phone] | [Email]`,
  },
  {
    name: "Appointment Reminder Email",
    template_type: "Email Template",
    subject: "Reminder: Upcoming Support Session – [Date]",
    body: `Hi [Participant Name],

This is a friendly reminder that you have a support session scheduled for:

Date: [Date]
Time: [Time]
Location: [Location / Address]
Support Worker: [Staff Name]

Please contact us at least 24 hours in advance if you need to reschedule.

Thank you,
[Provider Name]
[Phone]`,
  },
  {
    name: "Cancellation Notice",
    template_type: "Notice",
    subject: "Notice of Cancellation – [Date]",
    body: `Dear [Participant Name],

We regret to inform you that your scheduled support session on [Date] at [Time] has been cancelled.

Reason: [Reason]

We will be in touch to reschedule at the earliest convenience.

We apologise for any inconvenience caused.

Kind regards,
[Provider Name]`,
  },
];

export default function Stationery() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ name: "", template_type: "Email Template", subject: "", body: "" });

  const load = async () => {
    const data = await base44.entities.StationeryTemplate.list("-created_date");
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editingId) {
      await base44.entities.StationeryTemplate.update(editingId, form);
    } else {
      await base44.entities.StationeryTemplate.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", template_type: "Email Template", subject: "", body: "" });
    load();
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({ name: t.name, template_type: t.template_type, subject: t.subject || "", body: t.body || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    await base44.entities.StationeryTemplate.delete(id);
    if (preview?.id === id) setPreview(null);
    load();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seedStarters = async () => {
    for (const t of STARTER_TEMPLATES) {
      await base44.entities.StationeryTemplate.create(t);
    }
    load();
  };

  const filtered = filter === "All" ? templates : templates.filter(t => t.template_type === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Stationery & Templates</h2>
          <p className="text-muted-foreground text-sm">Email templates, letter templates, forms and notices.</p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <Button variant="outline" onClick={seedStarters} className="rounded-xl font-bold gap-2">
              <FileText size={16} /> Load Starter Templates
            </Button>
          )}
          <Button onClick={() => { setEditingId(null); setForm({ name: "", template_type: "Email Template", subject: "", body: "" }); setShowForm(true); }} className="rounded-xl font-bold gap-2">
            <Plus size={18} /> New Template
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...TEMPLATE_TYPES].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${filter === t ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:border-primary"}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center">
          <FileText size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-black">No Templates Yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Create your first template or load the starter set.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => {
            const Icon = typeIcon[t.template_type] || FileText;
            return (
              <div key={t.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer" onClick={() => setPreview(t)}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor[t.template_type] || "bg-slate-100"}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-black text-foreground leading-tight">{t.name}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${typeColor[t.template_type] || "bg-slate-100 text-slate-600"}`}>{t.template_type}</span>
                    </div>
                  </div>
                </div>
                {t.subject && <p className="text-xs text-muted-foreground font-semibold mb-2 truncate">Subject: {t.subject}</p>}
                <p className="text-xs text-muted-foreground line-clamp-3">{t.body}</p>
                <div className="flex gap-2 mt-4 pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="gap-1 rounded-lg" onClick={() => setPreview(t)}><FileText size={13} /> View</Button>
                  <Button variant="ghost" size="sm" className="gap-1 rounded-lg" onClick={() => openEdit(t)}><Pencil size={13} /> Edit</Button>
                  <Button variant="ghost" size="sm" className="gap-1 rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 size={13} /> Delete</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {preview && (() => { const Icon = typeIcon[preview.template_type] || FileText; return <Icon size={18} />; })()}
              {preview?.name}
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black px-3 py-1 rounded-full ${typeColor[preview.template_type] || ""}`}>{preview.template_type}</span>
                <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => handleCopy((preview.subject ? `Subject: ${preview.subject}\n\n` : "") + preview.body)}>
                  <Copy size={14} /> {copied ? "Copied!" : "Copy to Clipboard"}
                </Button>
              </div>
              {preview.subject && (
                <div className="bg-secondary rounded-xl p-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Subject</p>
                  <p className="text-sm font-semibold">{preview.subject}</p>
                </div>
              )}
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Body</p>
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{preview.body}</pre>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setPreview(null); openEdit(preview); }}><Pencil size={14} className="mr-1" /> Edit</Button>
                <Button className="flex-1 rounded-xl" onClick={() => setPreview(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) setEditingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Template" : "New Template"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Welcome Letter" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.template_type} onValueChange={v => setForm({ ...form, template_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TEMPLATE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {(form.template_type === "Email Template" || form.template_type === "Notice") && (
              <div>
                <Label>Subject Line</Label>
                <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Email subject..." />
              </div>
            )}
            <div>
              <Label>Body / Content</Label>
              <Textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Use [Participant Name], [Date], [Provider Name] as placeholders..." className="min-h-[250px] font-mono text-sm" />
            </div>
            <Button onClick={handleSave} disabled={!form.name} className="w-full rounded-xl font-bold">
              {editingId ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}