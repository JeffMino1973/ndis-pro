import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Square, MapPin, Mic, CheckCircle, PenLine, Clock, Plus, Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NDIS_ITEMS } from "@/utils/ndisItems";

const NOTE_TEMPLATES = {
  "Daily Living": "Participant was supported with [activities]. They were [mood/engagement]. Staff assisted with [specific tasks]. Participant responded [well/with difficulty] to supports provided.",
  "Community Access": "Participant attended [location/activity] with staff support. Travel by [mode]. Participant engaged [well/with support] with community members. Goals addressed: [goals].",
  "Personal Care": "Staff provided assistance with personal care including [tasks]. Participant maintained dignity throughout. Skin integrity [intact/noted concern]. No incidents.",
  "Meal Preparation": "Staff supported participant to prepare [meal]. Participant's involvement level: [high/moderate/low]. Dietary requirements met. Participant ate [well/partially/refused].",
  "Custom": "",
};

const STATUS_COLORS = {
  Active: "bg-emerald-100 text-emerald-700",
  Completed: "bg-slate-100 text-slate-600",
  Cancelled: "bg-rose-100 text-rose-700",
};

function SignaturePad({ onSign, onCancel }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md">
        <h3 className="font-black text-lg mb-1">Client Signature</h3>
        <p className="text-xs text-slate-500 mb-4">Client types their name to confirm service was received.</p>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Client's full name..."
          className="text-xl mb-4"
          style={{ fontFamily: "cursive" }}
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
          <Button onClick={() => onSign(name)} disabled={!name} className="flex-1 rounded-xl font-bold gap-2">
            <CheckCircle size={15} /> Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ShiftLogger() {
  const [participants, setParticipants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeShift, setActiveShift] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showEndForm, setShowEndForm] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [form, setForm] = useState({ participant_name: "", staff_name: "", support_type: "Daily Living", support_item_code: "", location: "", gps_start: "" });
  const [endForm, setEndForm] = useState({ activities: "", outcomes: "", progress_note: "", km_travelled: 0, template: "Daily Living", gps_end: "" });
  const intervalRef = useRef(null);
  const [listening, setListening] = useState(false);

  const load = async () => {
    const [p, s, l] = await Promise.all([
      base44.entities.Participant.list(),
      base44.entities.StaffMember.list(),
      base44.entities.ShiftLog.list("-created_date", 30),
    ]);
    setParticipants(p);
    setStaff(s);
    setLogs(l);
    const active = l.find(x => x.status === "Active");
    if (active) {
      setActiveShift(active);
      const start = new Date(active.start_time);
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (activeShift) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [activeShift]);

  const getGPS = () => new Promise((resolve) => {
    if (!navigator.geolocation) { resolve("GPS unavailable"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve(`${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`),
      () => resolve("GPS denied"),
      { timeout: 8000 }
    );
  });

  const startShift = async () => {
    setGpsLoading(true);
    const gps = await getGPS();
    setGpsLoading(false);
    const now = new Date().toISOString();
    const shift = await base44.entities.ShiftLog.create({
      ...form,
      start_time: now,
      gps_start: gps,
      status: "Active",
    });
    setActiveShift(shift);
    setElapsed(0);
    setShowForm(false);
    setForm({ participant_name: "", staff_name: "", support_type: "Daily Living", support_item_code: "", location: "", gps_start: "" });
    load();
  };

  const endShift = async () => {
    setGpsLoading(true);
    const gps = await getGPS();
    setGpsLoading(false);
    const now = new Date().toISOString();
    const start = new Date(activeShift.start_time);
    const duration = Math.floor((new Date(now) - start) / 60000);
    await base44.entities.ShiftLog.update(activeShift.id, {
      end_time: now,
      duration_minutes: duration,
      gps_end: gps,
      activities: endForm.activities,
      outcomes: endForm.outcomes,
      progress_note: endForm.progress_note,
      km_travelled: endForm.km_travelled,
      status: "Completed",
    });

    // Auto-create progress note
    await base44.entities.ProgressNote.create({
      participant_name: activeShift.participant_name,
      staff_name: activeShift.staff_name,
      shift_log_id: activeShift.id,
      note_date: now.split("T")[0],
      note_time: now.split("T")[1].substring(0, 5),
      template_type: "Daily Support",
      service_location: activeShift.location,
      gps_coordinates: gps,
      activities_delivered: endForm.activities,
      outcomes: endForm.outcomes,
      participant_response: endForm.progress_note,
      status: "Finalised",
    });

    setActiveShift(null);
    setElapsed(0);
    setShowEndForm(false);
    setEndForm({ activities: "", outcomes: "", progress_note: "", km_travelled: 0, template: "Daily Living", gps_end: "" });
    load();
  };

  const clientSign = async (name) => {
    await base44.entities.ShiftLog.update(activeShift.id, { client_signature: name, client_signed_at: new Date().toISOString() });
    setActiveShift({ ...activeShift, client_signature: name });
    setShowSignature(false);
  };

  const useTemplate = (tpl) => {
    setEndForm(prev => ({ ...prev, progress_note: NOTE_TEMPLATES[tpl] || "", template: tpl }));
  };

  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-AU";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setEndForm(prev => ({ ...prev, progress_note: prev.progress_note + (prev.progress_note ? " " : "") + text }));
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + "h " : ""}${m}m ${sec}s`;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {showSignature && <SignaturePad onSign={clientSign} onCancel={() => setShowSignature(false)} />}

      <div>
        <h2 className="text-3xl font-black tracking-tight">Shift Logger</h2>
        <p className="text-muted-foreground text-sm">Mobile-first shift tracking with GPS, notes and client signature.</p>
      </div>

      {/* Active Shift Banner */}
      {activeShift ? (
        <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <p className="font-black text-lg">Shift In Progress</p>
          </div>
          <p className="text-2xl font-black mb-1">{activeShift.participant_name}</p>
          <p className="text-emerald-100 text-sm mb-4">{activeShift.staff_name} · {activeShift.support_type}</p>

          <div className="bg-white/20 rounded-2xl p-4 mb-4">
            <p className="text-4xl font-black text-center tracking-widest">{fmt(elapsed)}</p>
          </div>

          {activeShift.gps_start && (
            <div className="flex items-center gap-2 text-emerald-100 text-xs mb-4">
              <MapPin size={12} /> Started at: {activeShift.gps_start}
            </div>
          )}

          {activeShift.client_signature ? (
            <div className="flex items-center gap-2 text-emerald-100 text-sm mb-4">
              <CheckCircle size={14} /> Client signed: {activeShift.client_signature}
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowSignature(true)} className="w-full mb-3 rounded-xl text-emerald-700 border-white/40 bg-white/90 font-bold gap-2">
              <PenLine size={15} /> Get Client Signature
            </Button>
          )}

          <Button onClick={() => setShowEndForm(true)} className="w-full bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-black gap-2 h-12">
            <Square size={16} /> End Shift & Submit Notes
          </Button>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} className="w-full h-16 rounded-3xl font-black text-lg gap-3 shadow-xl">
          <Play size={22} /> Start New Shift
        </Button>
      )}

      {/* Recent Logs */}
      <div className="space-y-3">
        <h3 className="font-black text-lg">Recent Shifts</h3>
        {logs.filter(l => l.status !== "Active").slice(0, 10).map(log => (
          <div key={log.id} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-foreground">{log.participant_name}</p>
                <p className="text-xs text-muted-foreground">{log.staff_name} · {log.support_type}</p>
                <p className="text-xs text-muted-foreground mt-1">{log.start_time?.split("T")[0]} · {log.duration_minutes || 0} mins</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${STATUS_COLORS[log.status]}`}>{log.status}</span>
                {log.client_signature && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
                    <CheckCircle size={10} /> Signed
                  </div>
                )}
              </div>
            </div>
            {log.progress_note && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">"{log.progress_note}"</p>
            )}
          </div>
        ))}
        {logs.filter(l => l.status !== "Active").length === 0 && (
          <p className="text-sm text-muted-foreground italic text-center py-4">No completed shifts yet.</p>
        )}
      </div>

      {/* Start Shift Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Start Shift</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Participant</Label>
              <Select value={form.participant_name} onValueChange={v => setForm(p => ({ ...p, participant_name: v }))}>
                <SelectTrigger><SelectValue placeholder="Select participant..." /></SelectTrigger>
                <SelectContent>{participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Staff Member</Label>
              <Select value={form.staff_name} onValueChange={v => setForm(p => ({ ...p, staff_name: v }))}>
                <SelectTrigger><SelectValue placeholder="Select staff..." /></SelectTrigger>
                <SelectContent>{staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Support Type</Label>
              <Select value={form.support_type} onValueChange={v => setForm(p => ({ ...p, support_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Daily Living", "Community Access", "Personal Care", "Therapy", "Transport", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Participant's home, Community centre..." />
            </div>
            <Button
              onClick={startShift}
              disabled={!form.participant_name || !form.staff_name || gpsLoading}
              className="w-full rounded-xl font-black gap-2 h-12"
            >
              {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {gpsLoading ? "Getting GPS..." : "Start Shift"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={showEndForm} onOpenChange={setShowEndForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>End Shift — Submit Progress Note</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase">Note Template</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.keys(NOTE_TEMPLATES).map(t => (
                  <button key={t} onClick={() => { setEndForm(prev => ({ ...prev, progress_note: NOTE_TEMPLATES[t] || "", template: t })); }} className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-all ${endForm.template === t ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Activities Delivered</Label>
              <textarea
                value={endForm.activities}
                onChange={e => setEndForm(p => ({ ...p, activities: e.target.value }))}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[80px]"
                placeholder="What support was provided today?"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Progress Note</Label>
                <button onClick={startVoice} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all ${listening ? "bg-rose-100 text-rose-600 border-rose-300 animate-pulse" : "border-border text-muted-foreground hover:border-primary"}`}>
                  <Mic size={12} /> {listening ? "Listening..." : "Voice Input"}
                </button>
              </div>
              <textarea
                value={endForm.progress_note}
                onChange={e => setEndForm(p => ({ ...p, progress_note: e.target.value }))}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[120px]"
                placeholder="Progress note..."
              />
            </div>
            <div>
              <Label>Outcomes / Goals Addressed</Label>
              <textarea
                value={endForm.outcomes}
                onChange={e => setEndForm(p => ({ ...p, outcomes: e.target.value }))}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[60px]"
                placeholder="Link to participant goals..."
              />
            </div>
            <div>
              <Label>KM Travelled</Label>
              <Input type="number" value={endForm.km_travelled} onChange={e => setEndForm(p => ({ ...p, km_travelled: parseFloat(e.target.value) }))} />
            </div>
            <Button onClick={endShift} disabled={gpsLoading} className="w-full rounded-xl font-black gap-2 h-12">
              {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} />}
              {gpsLoading ? "Getting GPS..." : "End Shift & Save Note"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}