import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, User, Phone, Mail, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ParticipantForm from "../components/ParticipantForm";
import ParticipantDetail from "../components/ParticipantDetail";

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const data = await base44.entities.Participant.list("-created_date");
    setParticipants(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = participants.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.ndis_number?.includes(search)
  );

  if (selected) {
    return (
      <ParticipantDetail
        participant={selected}
        onBack={() => { setSelected(null); load(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Participant Hub</h2>
          <p className="text-muted-foreground text-sm">
            Full database of NDIS profiles and funding records.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold gap-2">
          <Plus size={18} /> Add Participant
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search by name or NDIS number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              className="bg-card border border-border rounded-3xl p-6 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
            >
              {/* Profile Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all font-black text-xl">
                  {p.name?.charAt(0) || <User size={22} />}
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                  p.status === "Active" ? "bg-emerald-100 text-emerald-700" :
                  p.status === "Review Due" ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-600"
                }`}>{p.status}</span>
              </div>

              <h3 className="text-lg font-extrabold text-foreground leading-tight">{p.name}</h3>
              <p className="text-[11px] font-bold text-primary mb-1">NDIS: {p.ndis_number}</p>
              {p.primary_disability && <p className="text-[10px] text-muted-foreground mb-3">{p.primary_disability}</p>}

              <div className="space-y-1.5 mb-4">
                {p.phone && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone size={11} className="shrink-0" />{p.phone}</div>}
                {p.email && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail size={11} className="shrink-0" /><span className="truncate">{p.email}</span></div>}
                {p.address && <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={11} className="shrink-0" /><span className="truncate">{p.address}</span></div>}
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <div className="bg-secondary flex-1 p-2.5 rounded-xl">
                  <p className="text-[9px] font-black text-muted-foreground uppercase">Plan</p>
                  <p className="text-xs font-bold text-foreground">{p.plan_type}</p>
                </div>
                <div className="bg-secondary flex-1 p-2.5 rounded-xl">
                  <p className="text-[9px] font-black text-muted-foreground uppercase">Review</p>
                  <p className="text-xs font-bold text-foreground">{p.next_review || "TBD"}</p>
                </div>
              </div>

              {p.emergency_contact_name && (
                <div className="mt-3 flex items-center gap-2 text-[10px] text-rose-600 font-bold">
                  <Shield size={11} /> EC: {p.emergency_contact_name} {p.emergency_contact_phone ? `· ${p.emergency_contact_phone}` : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Participant</DialogTitle>
          </DialogHeader>
          <ParticipantForm
            onSave={() => {
              setShowForm(false);
              load();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}