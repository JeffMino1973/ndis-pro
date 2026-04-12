import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, FileText, MapPin, CheckCircle, Clock, Printer, Pencil, Trash2, PenLine, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TEMPLATES = {
  "Daily Support": {
    activities_delivered: "Staff provided support with daily living activities including personal hygiene, meal preparation, and household tasks.",
    participant_response: "Participant engaged positively with supports. Mood was [calm/anxious/happy]. No concerns noted.",
    outcomes: "Participant demonstrated [increased/maintained] independence with [task]. Goals 1 and 2 were addressed.",
  },
  "Community Access": {
    activities_delivered: "Participant attended [activity/venue] with staff support. Travel via [mode of transport].",
    participant_response: "Participant engaged well with community environment. Social interaction observed with [peers/community members].",
    outcomes: "Community participation goal addressed. Participant demonstrated [skill/behaviour].",
  },
  "Personal Care": {
    activities_delivered: "Staff provided personal care assistance including showering, grooming, and dressing.",
    participant_response: "Participant accepted supports. Skin integrity intact. No pressure areas noted.",
    outcomes: "Personal hygiene and dignity maintained. Independence level: [assisted/prompted/independent].",
  },
  "Therapy Support": {
    activities_delivered: "Therapy session conducted addressing [goals]. Exercises/strategies implemented as per therapy plan.",
    participant_response: "Participant [engaged well/required prompting]. Progress noted in [area].",
    outcomes: "Therapy goals progressed. Refer to therapy report for detailed outcomes.",
  },
  "Crisis/Incident": {
    activities_delivered: "Incident occurred at [time/location]. Staff responded by [actions taken].",
    participant_response: "Participant's presentation: [description]. De-escalation strategies used: [strategies].",
    outcomes: "Situation resolved at [time]. Incident report filed. Follow-up required: [yes/no].",
  },
  "Custom": { activities_delivered: "", participant_response: "", outcomes: "" },
};

const STATUS_COLOR = {
  Draft: "bg-amber-100 text-amber-700",
  Finalised: "bg-emerald-100 text-emerald-700",
};

export default function ProgressNotes() {
  const [notes, setNotes] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [filterParticipant, setFilterParticipant] = useState("All");
  const [listening, setListening] = useState(null); // field name
  const [gpsLoading, setGpsLoading] = useState(false);

  const EMPTY = {
    participant_name: "", staff_name: "", note_date: new Date().toISOString().split("T")[0],
    note_time: new Date().toTimeString().substring(0, 5), template_type: "Daily Support",
    service_location: "", gps_coordinates: "", activities_delivered: "",
    participant_response: "", goals_addressed: [], outcomes: "", concerns: "",
    client_signature: "", status: "Draft",
  };
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    const [n, p, s] = await Promise.all([
      base44.entities.ProgressNote.list("-note_date", 100),
      base44.entities.Participant.list(),
      base44.entities.StaffMember.list(),
    ]);
    setNotes(n);
    setParticipants(p);
    setStaff(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const applyTemplate = (tpl) => {
    const t = TEMPLATES[tpl] || {};
    setForm(prev => ({ ...prev, template_type: tpl, ...t }));
  };

  const getGPS = async () => {
    setGpsLoading(true);
    const coords = await new Promise(resolve => {
      if (!navigator.geolocation) { resolve("GPS unavailable"); return; }
      navigator.geolocation.getCurrentPosition(
        p => resolve(`${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`),
        () => resolve("GPS denied"), { timeout: 8000 }
      );
    });
    setForm(prev => ({ ...prev, gps_coordinates: coords }));
    setGpsLoading(false);
  };

  const startVoice = (field) => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser."); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-AU";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setForm(prev => ({ ...prev, [field]: prev[field] + (prev[field] ? " " : "") + text }));
      setListening(null);
    };
    rec.onerror = () => setListening(null);
    rec.onend = () => setListening(null);
    rec.start();
    setListening(field);
  };

  const handleSave = async (status = "Draft") => {
    const data = { ...form, status };
    if (editingId) {
      await base44.entities.ProgressNote.update(editingId, data);
    } else {
      await base44.entities.ProgressNote.create(data);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    load();
  };

  const openEdit = (n) => {
    setEditingId(n.id);
    setForm({ participant_name: n.participant_name, staff_name: n.staff_name, note_date: n.note_date, note_time: n.note_time || "", template_type: n.template_type, service_location: n.service_location || "", gps_coordinates: n.gps_coordinates || "", activities_delivered: n.activities_delivered || "", participant_response: n.participant_response || "", goals_addressed: n.goals_addressed || [], outcomes: n.outcomes || "", concerns: n.concerns || "", client_signature: n.client_signature || "", status: n.status });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this progress note?")) return;
    await base44.entities.ProgressNote.delete(id);
    load();
  };

  const TextArea = ({ field, label }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label className="text-xs">{label}</Label>
        <button onClick={() => startVoice(field)} className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all ${listening === field ? "bg-rose-100 text-rose-600 border-rose-300 animate-pulse" : "border-border text-muted-foreground hover:border-primary"}`}>
          <Mic size={10} /> {listening === field ? "Listening..." : "Voice"}
        </button>
      </div>
      <textarea value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[80px]" />
    </div>
  );

  const filtered = filterParticipant === "All" ? notes : notes.filter(n => n.participant_name === filterParticipant);

  if (preview) {
    return <NotePrint note={preview} onBack={() => setPreview(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Progress Notes</h2>
          <p className="text-muted-foreground text-sm">Audit-ready, geo-tagged, timestamped notes with templates.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(EMPTY); setShowForm(true); }} className="rounded-xl font-bold gap-2">
          <Plus size={18} /> New Note
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Notes", value: notes.length },
          { label: "Finalised", value: notes.filter(n => n.status === "Finalised").length },
          { label: "Draft", value: notes.filter(n => n.status === "Draft").length },
          { label: "With Client Sig", value: notes.filter(n => n.client_signature).length },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterParticipant("All")} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${filterParticipant === "All" ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:border-primary"}`}>All</button>
        {[...new Set(notes.map(n => n.participant_name))].map(name => (
          <button key={name} onClick={() => setFilterParticipant(name)} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${filterParticipant === name ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:border-primary"}`}>{name}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <div key={n.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-foreground">{n.participant_name}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_COLOR[n.status]}`}>{n.status}</span>
                    <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-secondary rounded-full">{n.template_type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><Clock size={11} /> {n.note_date} {n.note_time}</span>
                    {n.gps_coordinates && <span className="flex items-center gap-1"><MapPin size={11} /> {n.gps_coordinates}</span>}
                    {n.client_signature && <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={11} /> {n.client_signature}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.activities_delivered}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setPreview(n)}><Printer size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(n)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(n.id)} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-10">No progress notes found.</p>}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={o => { setShowForm(o); if (!o) setEditingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Progress Note" : "New Progress Note"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Template picker */}
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase">Template</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.keys(TEMPLATES).map(t => (
                  <button key={t} onClick={() => applyTemplate(t)} className={`text-xs px-3 py-1 rounded-full border font-bold transition-all ${form.template_type === t ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary"}`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Participant</Label>
                <Select value={form.participant_name} onValueChange={v => setForm(p => ({ ...p, participant_name: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Staff</Label>
                <Select value={form.staff_name} onValueChange={v => setForm(p => ({ ...p, staff_name: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.note_date} onChange={e => setForm(p => ({ ...p, note_date: e.target.value }))} />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={form.note_time} onChange={e => setForm(p => ({ ...p, note_time: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Service Location</Label>
                <Input value={form.service_location} onChange={e => setForm(p => ({ ...p, service_location: e.target.value }))} placeholder="e.g. Participant's home" />
              </div>
              <div>
                <Label>GPS Coordinates</Label>
                <div className="flex gap-2">
                  <Input value={form.gps_coordinates} onChange={e => setForm(p => ({ ...p, gps_coordinates: e.target.value }))} placeholder="Auto-detected" className="flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={getGPS} disabled={gpsLoading} className="shrink-0">
                    {gpsLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  </Button>
                </div>
              </div>
            </div>

            <TextArea field="activities_delivered" label="Activities Delivered" />
            <TextArea field="participant_response" label="Participant Response & Presentation" />
            <TextArea field="outcomes" label="Outcomes / Goals Addressed" />
            <TextArea field="concerns" label="Concerns / Follow-up Required" />

            <div>
              <Label className="text-xs">Client Signature (typed name)</Label>
              <Input value={form.client_signature} onChange={e => setForm(p => ({ ...p, client_signature: e.target.value }))} placeholder="Client types name here..." style={{ fontFamily: "cursive" }} />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSave("Draft")} className="flex-1 rounded-xl">Save Draft</Button>
              <Button onClick={() => handleSave("Finalised")} disabled={!form.participant_name || !form.staff_name} className="flex-1 rounded-xl font-bold">Finalise Note</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotePrint({ note, onBack }) {
  return (
    <div className="space-y-4">
      <style>{`@media print { @page { size: A4; margin: 15mm; } body * { visibility: hidden; } #note-print, #note-print * { visibility: visible; } #note-print { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none !important; } }`}</style>
      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="text-primary font-bold text-sm hover:underline">← Back</button>
        <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2"><Printer size={16} /> Print / PDF</Button>
      </div>
      <div id="note-print" className="bg-white border border-slate-200 rounded-2xl p-8 max-w-3xl mx-auto text-sm text-slate-800">
        <div className="flex justify-between items-start mb-6 pb-4 border-b">
          <div>
            <h1 className="text-2xl font-black">Progress Note</h1>
            <p className="text-xs text-slate-500 mt-1">Audit Record — NDIS Service Delivery</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold">{note.note_date} {note.note_time}</p>
            {note.gps_coordinates && <p className="flex items-center gap-1 justify-end mt-0.5"><MapPin size={10} /> {note.gps_coordinates}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: "Participant", value: note.participant_name },
            { label: "Staff Member", value: note.staff_name },
            { label: "Template", value: note.template_type },
            { label: "Service Location", value: note.service_location || "—" },
            { label: "Status", value: note.status },
          ].map(f => (
            <div key={f.label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
              <p className="font-bold text-slate-900">{f.value}</p>
            </div>
          ))}
        </div>
        {[
          { label: "Activities Delivered", value: note.activities_delivered },
          { label: "Participant Response & Presentation", value: note.participant_response },
          { label: "Outcomes / Goals Addressed", value: note.outcomes },
          { label: "Concerns / Follow-up Required", value: note.concerns },
        ].map(f => f.value ? (
          <div key={f.label} className="mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
            <p className="text-slate-700 leading-relaxed">{f.value}</p>
          </div>
        ) : null)}
        {note.client_signature && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Client Acknowledgement</p>
            <p className="text-xl" style={{ fontFamily: "cursive" }}>{note.client_signature}</p>
            <p className="text-xs text-slate-400 mt-1">Signed: {note.client_signed_at ? new Date(note.client_signed_at).toLocaleString("en-AU") : note.note_date}</p>
          </div>
        )}
        <div className="mt-8 pt-4 border-t text-[9px] text-slate-400 text-center">
          This document is an official NDIS service delivery record. Timestamp: {note.note_date} {note.note_time} · GPS: {note.gps_coordinates || "N/A"}
        </div>
      </div>
    </div>
  );
}