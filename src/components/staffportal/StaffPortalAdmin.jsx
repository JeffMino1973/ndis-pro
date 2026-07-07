import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Settings, Users, Check, Loader2, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ALL_PORTAL_FEATURES } from "@/pages/StaffPortal";
import StaffComplianceReview from "@/components/staffportal/StaffComplianceReview";

export default function StaffPortalAdmin() {
  const [staffList, setStaffList] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    async function load() {
      const [staff, parts] = await Promise.all([
        base44.entities.StaffMember.list(),
        base44.entities.Participant.list(),
      ]);
      setStaffList(staff);
      setParticipants(parts);
      setLoading(false);
    }
    load();
  }, []);

  const toggleFeature = (staffId, featureId) => {
    setStaffList(prev => prev.map(s => {
      if (s.id !== staffId) return s;
      const current = s.portal_features || [];
      const updated = current.includes(featureId)
        ? current.filter(f => f !== featureId)
        : [...current, featureId];
      return { ...s, portal_features: updated };
    }));
  };

  const toggleParticipant = (staffId, participantId) => {
    setStaffList(prev => prev.map(s => {
      if (s.id !== staffId) return s;
      const current = s.linked_participant_ids || [];
      const updated = current.includes(participantId)
        ? current.filter(id => id !== participantId)
        : [...current, participantId];
      return { ...s, linked_participant_ids: updated };
    }));
  };

  const saveStaff = async (staff) => {
    setSaving(staff.id);
    await base44.entities.StaffMember.update(staff.id, {
      portal_features: staff.portal_features || [],
      linked_participant_ids: staff.linked_participant_ids || [],
    });
    setSaving(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 size={22} className="animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-3">
      <Tabs defaultValue="access">
        <TabsList className="rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="access" className="rounded-lg gap-1"><Settings size={13} /> Access Control</TabsTrigger>
          <TabsTrigger value="compliance" className="rounded-lg gap-1"><ShieldCheck size={13} /> Compliance Review</TabsTrigger>
        </TabsList>

        <TabsContent value="access" className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={16} className="text-primary" />
            <h3 className="font-black text-base">Staff Portal Access Control</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            For each staff member, choose which portal features they can access and which participants are linked to them.
          </p>

          {staffList.map(staff => (
            <div key={staff.id} className="bg-card border border-border rounded-2xl overflow-hidden mb-3">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition"
                onClick={() => setExpanded(expanded === staff.id ? null : staff.id)}
              >
                <div className="flex items-center gap-3">
                  {staff.photo_url
                    ? <img src={staff.photo_url} alt="" className="w-9 h-9 rounded-xl object-cover" />
                    : <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">{staff.name?.charAt(0)}</div>
                  }
                  <div className="text-left">
                    <p className="font-bold text-sm">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">{staff.role} · {(staff.portal_features || []).length} features · {(staff.linked_participant_ids || []).length} participants</p>
                  </div>
                </div>
                {expanded === staff.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>

              {expanded === staff.id && (
                <div className="border-t border-border p-4 space-y-5">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Portal Features</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ALL_PORTAL_FEATURES.map(f => {
                        const enabled = (staff.portal_features || []).includes(f.id);
                        return (
                          <button
                            key={f.id}
                            onClick={() => toggleFeature(staff.id, f.id)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${enabled ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary border-transparent text-muted-foreground hover:text-foreground"}`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${enabled ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                              {enabled && <Check size={10} className="text-white" />}
                            </div>
                            <f.icon size={12} />
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                      <Users size={10} className="inline mr-1" />Linked Participants
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {participants.map(p => {
                        const linked = (staff.linked_participant_ids || []).includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => toggleParticipant(staff.id, p.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${linked ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-secondary border-transparent text-muted-foreground hover:text-foreground"}`}
                          >
                            {linked && <Check size={10} />}
                            {p.name}
                          </button>
                        );
                      })}
                      {participants.length === 0 && <p className="text-xs text-muted-foreground italic">No participants in database</p>}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => saveStaff(staff)}
                    disabled={saving === staff.id}
                    className="rounded-xl font-bold text-xs gap-2"
                  >
                    {saving === staff.id ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : <><Check size={12} /> Save Changes</>}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <StaffComplianceReview />
        </TabsContent>
      </Tabs>
    </div>
  );
}