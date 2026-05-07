import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, CheckCircle, Clock, Eye, Trash2, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_COLORS = {
  Sent: "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const EMPTY_FORM = {
  participant_name: "", sent_to_email: "", status: "Sent",
  date_of_birth: "", ndis_number: "", address: "", phone: "", email: "",
  primary_disability: "", medical_alerts: "", plan_type: "Plan Managed",
  plan_coordinator_name: "", plan_coordinator_email: "", plan_coordinator_phone: "",
  parent_guardian_name: "", parent_guardian_phone: "", parent_guardian_email: "",
  emergency_contact_name: "", emergency_contact_phone: "", emergency_contact_relationship: "",
  additional_notes: "",
};

export default function OnboardingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    const data = await base44.entities.OnboardingRequest.list("-created_date");
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markComplete = async (id) => {
    await base44.entities.OnboardingRequest.update(id, { status: "Completed" });
    load();
  };

  const cancelRequest = async (id) => {
    await base44.entities.OnboardingRequest.update(id, { status: "Cancelled" });
    load();
  };

  const deleteRequest = async (id) => {
    if (!window.confirm("Delete this onboarding request?")) return;
    await base44.entities.OnboardingRequest.delete(id);
    setSelected(null);
    load();
  };

  const openEdit = (r) => {
    setEditingId(r.id);
    setForm({ ...EMPTY_FORM, ...r });
    setShowForm(true);
    setSelected(null);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const save = async () => {
    if (editingId) {
      await base44.entities.OnboardingRequest.update(editingId, form);
    } else {
      await base44.entities.OnboardingRequest.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    load();
  };

  const importToParticipants = async (req) => {
    await base44.entities.Participant.create({
      name: req.participant_name, ndis_number: req.ndis_number || "",
      date_of_birth: req.date_of_birth || "", plan_type: req.plan_type || "Plan Managed",
      status: "Active", email: req.email || "", phone: req.phone || "",
      address: req.address || "", primary_disability: req.primary_disability || "",
      medical_alerts: req.medical_alerts || "",
      plan_coordinator_name: req.plan_coordinator_name || "",
      plan_coordinator_email: req.plan_coordinator_email || "",
      plan_coordinator_phone: req.plan_coordinator_phone || "",
      parent_guardian_name: req.parent_guardian_name || "",
      parent_guardian_phone: req.parent_guardian_phone || "",
      parent_guardian_email: req.parent_guardian_email || "",
      emergency_contact_name: req.emergency_contact_name || "",
      emergency_contact_phone: req.emergency_contact_phone || "",
      emergency_contact_relationship: req.emergency_contact_relationship || "",
    });
    await base44.entities.OnboardingRequest.update(req.id, { status: "Completed" });
    setSelected(null);
    load();
  };

  const F = ({ label, field, type = "text" }) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={form[field] || ""} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} className="mt-1" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Onboarding Requests</h2>
          <p className="text-muted-foreground text-sm">Track participant onboarding forms sent to families.</p>
        </div>
        <Button onClick={openNew} className="rounded-xl font-bold gap-2"><Plus size={18} /> New Request</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Sent", value: requests.length, icon: Mail },
          { label: "Pending", value: requests.filter(r => r.status === "Sent").length, icon: Clock },
          { label: "Completed", value: requests.filter(r => r.status === "Completed").length, icon: CheckCircle },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <s.icon size={20} className="text-primary" />
            <div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-secondary text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Sent To</th>
                <th className="px-6 py-4">Date Sent</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map(r => (
                <tr key={r.id} className="hover:bg-secondary/50">
                  <td className="px-6 py-4 font-bold">{r.participant_name}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{r.sent_to_email}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{r.created_date?.split("T")[0]}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${STATUS_COLORS[r.status] || "bg-slate-100 text-slate-600"}`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(r)} className="gap-1"><Eye size={14} /> View</Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)} className="gap-1"><Pencil size={14} /> Edit</Button>
                      {r.status === "Sent" && <Button variant="ghost" size="sm" onClick={() => cancelRequest(r.id)} className="gap-1 text-amber-600"><X size={14} /> Cancel</Button>}
                      <Button variant="ghost" size="sm" onClick={() => deleteRequest(r.id)} className="gap-1 text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground italic text-sm">No onboarding requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Onboarding — {selected?.participant_name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {[
                ["Participant Name", selected.participant_name], ["NDIS Number", selected.ndis_number],
                ["Date of Birth", selected.date_of_birth], ["Address", selected.address],
                ["Phone", selected.phone], ["Email", selected.email],
                ["Primary Disability", selected.primary_disability], ["Medical Alerts", selected.medical_alerts],
                ["Plan Type", selected.plan_type], ["Plan Coordinator", selected.plan_coordinator_name],
                ["Coordinator Email", selected.plan_coordinator_email], ["Emergency Contact", selected.emergency_contact_name],
                ["Emergency Phone", selected.emergency_contact_phone], ["Additional Notes", selected.additional_notes],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="bg-secondary rounded-xl p-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                  <p className="font-semibold">{value}</p>
                </div>
              ))}
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => openEdit(selected)} className="gap-1 rounded-xl"><Pencil size={13} /> Edit</Button>
                <Button variant="outline" size="sm" onClick={() => markComplete(selected.id)} className="rounded-xl">Mark Complete</Button>
                <Button size="sm" onClick={() => importToParticipants(selected)} className="rounded-xl font-bold">Import as Participant</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteRequest(selected.id)} className="rounded-xl gap-1"><Trash2 size={13} /> Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Onboarding Request" : "New Onboarding Request"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F label="Participant Name *" field="participant_name" />
              <F label="Sent To Email" field="sent_to_email" type="email" />
              <F label="NDIS Number" field="ndis_number" />
              <F label="Date of Birth" field="date_of_birth" type="date" />
              <F label="Phone" field="phone" />
              <F label="Email" field="email" type="email" />
              <div className="sm:col-span-2"><F label="Address" field="address" /></div>
              <F label="Primary Disability" field="primary_disability" />
              <F label="Medical Alerts" field="medical_alerts" />
              <div>
                <Label className="text-xs">Plan Type</Label>
                <Select value={form.plan_type} onValueChange={v => setForm(p => ({ ...p, plan_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Plan Managed","Self Managed","NDIA Managed","Combination"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Sent","Completed","Cancelled"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <F label="Plan Coordinator Name" field="plan_coordinator_name" />
              <F label="Plan Coordinator Email" field="plan_coordinator_email" />
              <F label="Emergency Contact Name" field="emergency_contact_name" />
              <F label="Emergency Contact Phone" field="emergency_contact_phone" />
            </div>
            <Button onClick={save} disabled={!form.participant_name} className="w-full rounded-xl font-bold">
              {editingId ? "Save Changes" : "Create Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}