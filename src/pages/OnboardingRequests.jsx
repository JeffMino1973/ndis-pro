import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, CheckCircle, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_COLORS = {
  Sent: "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

export default function OnboardingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

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

  const importToParticipants = async (req) => {
    await base44.entities.Participant.create({
      name: req.participant_name,
      ndis_number: req.ndis_number || "",
      date_of_birth: req.date_of_birth || "",
      plan_type: req.plan_type || "Plan Managed",
      status: "Active",
      email: req.email || "",
      phone: req.phone || "",
      address: req.address || "",
      primary_disability: req.primary_disability || "",
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Onboarding Requests</h2>
        <p className="text-muted-foreground text-sm">Track participant onboarding forms sent to families.</p>
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
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(r)} className="gap-1">
                      <Eye size={14} /> View
                    </Button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground italic text-sm">No onboarding requests sent yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Onboarding Submission — {selected?.participant_name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              {[
                ["Participant Name", selected.participant_name],
                ["NDIS Number", selected.ndis_number],
                ["Date of Birth", selected.date_of_birth],
                ["Address", selected.address],
                ["Phone", selected.phone],
                ["Email", selected.email],
                ["Primary Disability", selected.primary_disability],
                ["Medical Alerts", selected.medical_alerts],
                ["Plan Type", selected.plan_type],
                ["Plan Coordinator", selected.plan_coordinator_name],
                ["Coordinator Email", selected.plan_coordinator_email],
                ["Coordinator Phone", selected.plan_coordinator_phone],
                ["Parent/Guardian", selected.parent_guardian_name],
                ["Parent Phone", selected.parent_guardian_phone],
                ["Parent Email", selected.parent_guardian_email],
                ["Emergency Contact", selected.emergency_contact_name],
                ["Emergency Phone", selected.emergency_contact_phone],
                ["Relationship", selected.emergency_contact_relationship],
                ["Additional Notes", selected.additional_notes],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="bg-secondary rounded-xl p-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                  <p className="font-semibold">{value}</p>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => markComplete(selected.id)} className="flex-1 rounded-xl">Mark Complete</Button>
                <Button onClick={() => importToParticipants(selected)} className="flex-1 rounded-xl font-bold">Import as Participant</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}