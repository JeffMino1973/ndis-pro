import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, User, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", email: "", phone: "", wwcc_expiry: "", first_aid_expiry: "", police_check: "Cleared", training_status: "Complete", status: "Active" });

  const load = async () => {
    const data = await base44.entities.StaffMember.list();
    setStaff(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    await base44.entities.StaffMember.create(form);
    setShowForm(false);
    setForm({ name: "", role: "", email: "", phone: "", wwcc_expiry: "", first_aid_expiry: "", police_check: "Cleared", training_status: "Complete", status: "Active" });
    load();
  };

  const getStatusIcon = (date) => {
    if (!date) return <Clock size={14} className="text-muted-foreground" />;
    return new Date(date) > new Date()
      ? <CheckCircle size={14} className="text-emerald-500" />
      : <AlertCircle size={14} className="text-rose-500" />;
  };

  const getStatusText = (date) => {
    if (!date) return "N/A";
    return new Date(date) > new Date() ? "Valid" : "Expired";
  };

  if (loading) {
    return <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Staff & Compliance</h2>
          <p className="text-muted-foreground text-sm">Manage verification, training, and certification records.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2">
          <Plus size={18} /> Add Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {staff.map((s) => (
          <div key={s.id} className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                <User size={28} />
              </div>
              <div>
                <h3 className="font-black text-foreground leading-none mb-1">{s.name}</h3>
                <p className="text-xs font-medium text-primary">{s.role}</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "WWCC", value: s.wwcc_expiry, icon: getStatusIcon(s.wwcc_expiry), status: getStatusText(s.wwcc_expiry) },
                { label: "First Aid", value: s.first_aid_expiry, icon: getStatusIcon(s.first_aid_expiry), status: getStatusText(s.first_aid_expiry) },
                { label: "Police Check", value: s.police_check || "N/A", icon: <CheckCircle size={14} className="text-emerald-500" />, status: s.police_check },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-3 bg-secondary rounded-xl">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                  </div>
                  <p className="text-[10px] font-bold text-foreground">{item.value || "N/A"}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${s.training_status === "Complete" ? "bg-emerald-100 text-emerald-700" : s.training_status === "Due Soon" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                Training: {s.training_status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>Role *</Label><Input value={form.role} onChange={e => setForm({...form, role: e.target.value})} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div><Label>WWCC Expiry</Label><Input type="date" value={form.wwcc_expiry} onChange={e => setForm({...form, wwcc_expiry: e.target.value})} /></div>
              <div><Label>First Aid Expiry</Label><Input type="date" value={form.first_aid_expiry} onChange={e => setForm({...form, first_aid_expiry: e.target.value})} /></div>
              <div>
                <Label>Police Check</Label>
                <Select value={form.police_check} onValueChange={v => setForm({...form, police_check: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cleared">Cleared</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Training</Label>
                <Select value={form.training_status} onValueChange={v => setForm({...form, training_status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Due Soon">Due Soon</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSave} disabled={!form.name || !form.role} className="w-full rounded-xl font-bold">
              Add Staff Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}