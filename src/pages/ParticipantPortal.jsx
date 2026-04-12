import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  ShieldCheck, FileText, Receipt, ClipboardList, CheckCircle, PenLine,
  Loader2, User, Target, AlertTriangle, MessageSquareWarning, Navigation, Pencil,
  ChevronRight, Phone, Mail, MapPin, Edit, Save, X, Plus, Star, Bus, Train, Brain, Heart, Download, Trash2, File, Circle, Menu, Pill,
  ChevronDown, ChevronUp, BarChart3, BookOpen, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Risk Assessment constants (copied from RiskAssessments page) ──
const RA_LIKELIHOODS = ["Almost Certain", "Likely", "Possible", "Unlikely", "Rare"];
const RA_CONSEQUENCES = ["Catastrophic", "Major", "Moderate", "Minor", "Insignificant"];
const RA_RISK_MATRIX = {
  "Almost Certain": { Catastrophic: "Extreme", Major: "Extreme", Moderate: "High", Minor: "High", Insignificant: "Medium" },
  "Likely":         { Catastrophic: "Extreme", Major: "High",   Moderate: "High", Minor: "Medium", Insignificant: "Low" },
  "Possible":       { Catastrophic: "High",    Major: "High",   Moderate: "Medium", Minor: "Low", Insignificant: "Low" },
  "Unlikely":       { Catastrophic: "High",    Major: "Medium", Moderate: "Low",  Minor: "Low", Insignificant: "Low" },
  "Rare":           { Catastrophic: "Medium",  Major: "Low",    Moderate: "Low",  Minor: "Low", Insignificant: "Low" },
};
const RA_RISK_COLORS = { Low: "bg-green-100 text-green-800", Medium: "bg-orange-100 text-orange-800", High: "bg-red-100 text-red-800", Extreme: "bg-red-900 text-white" };
function raGetRating(likelihood, consequence) { return RA_RISK_MATRIX[likelihood]?.[consequence] || "Medium"; }
const RA_DEFAULT_HAZARDS = [
  { hazard: "Participant getting lost or disoriented", initial_likelihood: "Possible", initial_consequence: "Major", initial_rating: "High", controls: "", residual_likelihood: "Unlikely", residual_consequence: "Minor", residual_rating: "Low", person_responsible: "" },
  { hazard: "Traffic hazards / Crossing roads unsafely", initial_likelihood: "Unlikely", initial_consequence: "Major", initial_rating: "Medium", controls: "", residual_likelihood: "Rare", residual_consequence: "Minor", residual_rating: "Low", person_responsible: "" },
  { hazard: "Sensory overload (loud crowds/noise)", initial_likelihood: "Likely", initial_consequence: "Moderate", initial_rating: "High", controls: "", residual_likelihood: "Possible", residual_consequence: "Minor", residual_rating: "Low", person_responsible: "" },
];

// ── Implementation Program constants ──
const IP_PHASE_COLORS = ["bg-blue-600", "bg-amber-500", "bg-emerald-500", "bg-purple-600"];
const IP_BRONWYN_TEMPLATE = {
  participant_name: "Bronwyn Chau", ndis_number: "430117666",
  primary_goal: "Independent travel between Coogee and Botany",
  focus: "Community participation & transport independence",
  program_overview: "A phased support worker implementation program designed to build Bronwyn's confidence and independence in community travel. Staff will progressively reduce support from full guidance to supervised independence, tracking skill development at each stage.",
  session_structure: "1. Pre-journey check-in (5 min): Review route, check Opal card balance, confirm destination.\n2. Journey execution: Follow the route with agreed support level.\n3. Post-journey debrief (5–10 min): Discuss what went well, any challenges, and goals for next session.\n4. Progress note: Complete NDIS-compliant note in the app.",
  data_collection_notes: "Record support level used each session (%), skills demonstrated independently, any safety incidents, participant mood/confidence rating (1–5), and next session focus area.",
  status: "Active", start_date: new Date().toISOString().split("T")[0],
  phases: [
    { phase_number: 1, name: "FULL SUPPORT", weeks: "Week 1–2", goal: "Build familiarity and confidence with the route", support_level: "100%", worker_role: "Instructor + Model", completed: false },
    { phase_number: 2, name: "GUIDED PRACTICE", weeks: "Week 2–4", goal: "Build active participation and route recall", support_level: "50–70%", worker_role: "Coach", completed: false },
    { phase_number: 3, name: "SUPERVISED INDEPENDENCE", weeks: "Week 4–6", goal: "Independent execution with backup available", support_level: "10–30%", worker_role: "Observer", completed: false },
    { phase_number: 4, name: "INDEPENDENT TRIAL", weeks: "Week 6+", goal: "Confirm independence and exit support", support_level: "0–10%", worker_role: "Standby only", completed: false },
  ],
  skill_targets: [
    { skill: "Read and interpret bus timetables", achieved: false },
    { skill: "Tap on/off with Opal card correctly", achieved: false },
    { skill: "Navigate to correct bus stop independently", achieved: false },
    { skill: "Identify correct bus number and direction", achieved: false },
    { skill: "Manage delays or route changes calmly", achieved: false },
    { skill: "Use mobile phone for Opal app / Google Maps", achieved: false },
    { skill: "Communicate with driver or passengers if needed", achieved: false },
    { skill: "Arrive at destination safely and on time", achieved: false },
  ],
  required_tools: ["Opal Card", "Mobile phone with Opal App", "Emergency contact list", "Visual route guide (optional)"],
  risk_strategies: ["Support worker carries participant's emergency contact card", "Agree on a 'safe word' or signal if participant feels overwhelmed", "Worker remains within visual range during Phase 3", "Participant has support worker number saved on speed dial", "Risk assessment completed prior to first independent trial"],
  session_logs: [],
};

const statusColor = {
  Draft: "bg-slate-100 text-slate-600",
  Active: "bg-emerald-100 text-emerald-700",
  Sent: "bg-blue-100 text-blue-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Paid: "bg-emerald-100 text-emerald-700",
  Overdue: "bg-rose-100 text-rose-700",
  Expired: "bg-amber-100 text-amber-700",
  Declined: "bg-rose-100 text-rose-700",
  Terminated: "bg-rose-100 text-rose-700",
  Open: "bg-blue-100 text-blue-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Escalated: "bg-rose-100 text-rose-700",
  "Under Review": "bg-amber-100 text-amber-700",
};

function SignatureModal({ onSign, onCancel, docLabel }) {
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    if (!name || !agreed) return;
    setSigning(true);
    await onSign(name);
    setSigning(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <PenLine size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Digital Signature</h2>
            <p className="text-xs text-slate-500">{docLabel}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Full Legal Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Type your full name to sign..." className="text-lg font-semibold" style={{ fontFamily: "cursive" }} />
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
            By signing, I confirm I have read and agree to the terms of this document under the <em>Electronic Transactions Act 1999</em> (Cth).
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue-600" />
            <span className="text-sm text-slate-700">I have read and agree to the terms of this document.</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={handleSign} disabled={!name || !agreed || signing} className="flex-1 rounded-xl font-bold gap-2">
              {signing ? <Loader2 size={15} className="animate-spin" /> : <PenLine size={15} />}
              Sign & Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocCard({ icon: Icon, color, title, number, date, total, status, signed, signedBy, signedAt, onSign, signable }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="font-black text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">{number} · {date}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          {total !== undefined && <p className="font-black text-slate-900 text-lg">${(total || 0).toLocaleString()}</p>}
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusColor[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>
        </div>
      </div>
      {signed && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg mb-3">
          <CheckCircle size={13} />
          <span>Signed by <strong>{signedBy}</strong> on {new Date(signedAt).toLocaleDateString("en-AU")}</span>
        </div>
      )}
      {signable && !signed && (
        <Button onClick={onSign} size="sm" className="w-full rounded-xl gap-1.5 font-bold">
          <PenLine size={13} /> Sign & Accept
        </Button>
      )}
      {signed && (
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl py-2">
          <CheckCircle size={13} /> Signed
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "documents", label: "My Documents", icon: FileText },
  { id: "profile", label: "My Profile", icon: User },
  { id: "goals", label: "My Goals", icon: Target },
  { id: "implementation", label: "Implementation Programs", icon: ClipboardList },
  { id: "health", label: "Health Plan", icon: Heart },
  { id: "medications", label: "Medications", icon: Star },
  { id: "epilepsy", label: "Epilepsy Plan", icon: AlertTriangle },
  { id: "pbsp", label: "Behaviour Plan", icon: MessageSquareWarning },
  { id: "risks", label: "Risk Assessments", icon: AlertTriangle },
  { id: "reports", label: "Session Notes", icon: Navigation },
  { id: "travel", label: "Travel Guides", icon: Navigation },
  { id: "complaint", label: "Lodge Complaint", icon: MessageSquareWarning },
];

export default function ParticipantPortal() {
  const [ndisNumber, setNdisNumber] = useState("");
  const [participant, setParticipant] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [supportPlans, setSupportPlans] = useState([]);
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [progressNotes, setProgressNotes] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [medications, setMedications] = useState([]);
  const [epilepsyPlans, setEpilepsyPlans] = useState([]);
  const [pbsps, setPbsps] = useState([]);
  const [healthPlans, setHealthPlans] = useState([]);
  const [implementationPrograms, setImplementationPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signingDoc, setSigningDoc] = useState(null);
  const [activeTab, setActiveTab] = useState("documents");

  // Inline edit state for portal
  const [editingMed, setEditingMed] = useState(null);
  const [editingEpilepsy, setEditingEpilepsy] = useState(null);
  const [editingHealth, setEditingHealth] = useState(null);
  const [creatingMed, setCreatingMed] = useState(false);
  const [creatingEpilepsy, setCreatingEpilepsy] = useState(false);
  const [creatingHealth, setCreatingHealth] = useState(false);
  const [portalSaving, setPortalSaving] = useState(false);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Complaint form
  const [complaintForm, setComplaintForm] = useState({ complaint_type: "Service Delivery", description: "", priority: "Medium" });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  // Document upload
  const [participantDocuments, setParticipantDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  // Menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Risk Assessment tab state
  const [raAssessments, setRaAssessments] = useState([]);
  const [raLoading, setRaLoading] = useState(false);
  const [raSaving, setRaSaving] = useState(false);
  const [raPrintData, setRaPrintData] = useState(null);
  const [raRenameId, setRaRenameId] = useState(null);
  const [raRenameVal, setRaRenameVal] = useState("");
  const [raHazards, setRaHazards] = useState(RA_DEFAULT_HAZARDS.map(h => ({ ...h })));
  const [raParticipants, setRaParticipants] = useState([]);
  const [raForm, setRaForm] = useState({ title: "", participant_id: "", participant_name: "", participant_dob: "", ndis_number: "", home_address: "", destination: "", assessor_name: "", assessor_role: "", activity_description: "", assessment_date: new Date().toISOString().split("T")[0], review_date: "", emergency_contact_1_name: "", emergency_contact_1_phone: "", emergency_contact_1_rel: "", emergency_contact_2_name: "", emergency_contact_2_phone: "", emergency_contact_2_rel: "" });

  // Implementation Program tab state
  const [ipPrograms, setIpPrograms] = useState([]);
  const [ipSelected, setIpSelected] = useState(null);
  const [ipView, setIpView] = useState("list");
  const [ipForm, setIpForm] = useState(null);
  const [ipSaving, setIpSaving] = useState(false);
  const [ipExpandedSections, setIpExpandedSections] = useState({ phases: true, skills: true, logs: true });
  const [ipNewLog, setIpNewLog] = useState({ date: new Date().toISOString().split("T")[0], phase: "Phase 1", support_level_used: "", skills_practiced: "", participant_response: "", incidents: "", next_session_focus: "", logged_by: "" });

  // ── Risk Assessment helpers ──
  const raLoadAssessments = async () => {
    setRaLoading(true);
    const [data, parts] = await Promise.all([base44.entities.RiskAssessment.list("-created_date"), base44.entities.Participant.list()]);
    setRaAssessments(data); setRaParticipants(parts); setRaLoading(false);
  };
  const raSaveRename = async (id) => { await base44.entities.RiskAssessment.update(id, { title: raRenameVal }); setRaRenameId(null); raLoadAssessments(); };
  const raSet = (f, v) => setRaForm(p => ({ ...p, [f]: v }));
  const raSelectParticipant = (id) => { const p = raParticipants.find(x => x.id === id); if (!p) return; setRaForm(prev => ({ ...prev, participant_id: p.id, participant_name: p.name, participant_dob: p.date_of_birth || "", ndis_number: p.ndis_number || "", home_address: p.address || "", emergency_contact_1_name: p.emergency_contact_name || "", emergency_contact_1_phone: p.emergency_contact_phone || "", emergency_contact_1_rel: p.emergency_contact_relationship || "" })); };
  const raUpdateHazard = (i, field, value) => { setRaHazards(prev => prev.map((h, idx) => { if (idx !== i) return h; const updated = { ...h, [field]: value }; if (field === "initial_likelihood" || field === "initial_consequence") { const l = field === "initial_likelihood" ? value : h.initial_likelihood; const c = field === "initial_consequence" ? value : h.initial_consequence; updated.initial_rating = raGetRating(l, c); } if (field === "residual_likelihood" || field === "residual_consequence") { const l = field === "residual_likelihood" ? value : h.residual_likelihood; const c = field === "residual_consequence" ? value : h.residual_consequence; updated.residual_rating = raGetRating(l, c); } return updated; })); };
  const raAddHazard = () => setRaHazards(prev => [...prev, { hazard: "", initial_likelihood: "Possible", initial_consequence: "Moderate", initial_rating: "Medium", controls: "", residual_likelihood: "Unlikely", residual_consequence: "Minor", residual_rating: "Low", person_responsible: "" }]);
  const raRemoveHazard = (i) => setRaHazards(prev => prev.filter((_, idx) => idx !== i));
  const raOverallRisk = () => { const order = ["Extreme", "High", "Medium", "Low"]; for (const level of order) { if (raHazards.some(h => h.residual_rating === level)) return level; } return "Low"; };
  const raSaveAssessment = async () => { setRaSaving(true); await base44.entities.RiskAssessment.create({ ...raForm, hazards: raHazards, overall_risk_level: raOverallRisk(), status: "Draft" }); await raLoadAssessments(); setRaSaving(false); };

  // ── Implementation Program helpers ──
  const ipLoad = async () => { const data = await base44.entities.ImplementationProgram.list("-created_date"); setIpPrograms(data); };
  const ipStartNew = (template = null) => { setIpForm(template ? { ...template } : { participant_name: "", ndis_number: "", primary_goal: "", focus: "", program_overview: "", session_structure: "", data_collection_notes: "", status: "Active", start_date: new Date().toISOString().split("T")[0], phases: [{ phase_number: 1, name: "FULL SUPPORT", weeks: "Week 1–2", goal: "", support_level: "100%", worker_role: "Instructor", completed: false }, { phase_number: 2, name: "GUIDED PRACTICE", weeks: "Week 2–4", goal: "", support_level: "50–70%", worker_role: "Coach", completed: false }, { phase_number: 3, name: "SUPERVISED INDEPENDENCE", weeks: "Week 4–6", goal: "", support_level: "10–30%", worker_role: "Observer", completed: false }, { phase_number: 4, name: "INDEPENDENT TRIAL", weeks: "Week 6+", goal: "", support_level: "0–10%", worker_role: "Standby", completed: false }], skill_targets: [{ skill: "", achieved: false }], required_tools: [""], risk_strategies: [""], session_logs: [] }); setIpView("form"); };
  const ipSave = async () => { setIpSaving(true); const saved = await base44.entities.ImplementationProgram.create(ipForm); await ipLoad(); setIpSelected(saved); setIpView("detail"); setIpSaving(false); };
  const ipAddLog = async () => { const updated = { ...ipSelected, session_logs: [...(ipSelected.session_logs || []), ipNewLog] }; await base44.entities.ImplementationProgram.update(ipSelected.id, { session_logs: updated.session_logs }); setIpSelected(updated); setIpNewLog({ date: new Date().toISOString().split("T")[0], phase: "Phase 1", support_level_used: "", skills_practiced: "", participant_response: "", incidents: "", next_session_focus: "", logged_by: "" }); await ipLoad(); };
  const ipToggleSkill = async (i) => { const skills = ipSelected.skill_targets.map((s, idx) => idx === i ? { ...s, achieved: !s.achieved } : s); const updated = { ...ipSelected, skill_targets: skills }; await base44.entities.ImplementationProgram.update(ipSelected.id, { skill_targets: skills }); setIpSelected(updated); };
  const ipTogglePhase = async (i) => { const phases = ipSelected.phases.map((p, idx) => idx === i ? { ...p, completed: !p.completed } : p); const updated = { ...ipSelected, phases }; await base44.entities.ImplementationProgram.update(ipSelected.id, { phases }); setIpSelected(updated); };
  const ipToggleSection = (key) => setIpExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  const ipCompletedSkills = (p) => (p.skill_targets || []).filter(s => s.achieved).length;
  const ipCompletedPhases = (p) => (p.phases || []).filter(ph => ph.completed).length;

  const handleLookup = async () => {
    setError("");
    setLoading(true);
    const parts = await base44.entities.Participant.filter({ ndis_number: ndisNumber });
    if (!parts || parts.length === 0) {
      setError("No participant found with that NDIS number. Please check and try again.");
      setLoading(false);
      return;
    }
    const p = parts[0];
    setParticipant(p);
    setProfileForm({ phone: p.phone || "", email: p.email || "", address: p.address || "", emergency_contact_name: p.emergency_contact_name || "", emergency_contact_phone: p.emergency_contact_phone || "", emergency_contact_relationship: p.emergency_contact_relationship || "" });

    const [agr, quo, inv, plans, risks, notes, comp, meds, epilepsy, pbsp, hcp, docs, impPrograms] = await Promise.all([
      base44.entities.ServiceAgreement.filter({ participant_name: p.name }),
      base44.entities.Quote.filter({ participant_name: p.name }),
      base44.entities.Invoice.filter({ participant_name: p.name }),
      base44.entities.SupportPlan ? base44.entities.SupportPlan.filter({ participant_name: p.name }).catch(() => []) : Promise.resolve([]),
      base44.entities.RiskAssessment.filter({ participant_name: p.name }),
      base44.entities.ProgressNote.filter({ participant_name: p.name }, "-note_date", 20),
      base44.entities.Complaint.filter({ participant_name: p.name }, "-created_date"),
      base44.entities.Medication.filter({ participant_name: p.name }),
      base44.entities.EpilepsyPlan.filter({ participant_name: p.name }),
      base44.entities.PositiveBehaviourSupportPlan.filter({ participant_name: p.name }).catch(() => []),
      base44.entities.HealthCarePlan.filter({ participant_name: p.name }).catch(() => []),
      base44.entities.Document ? base44.entities.Document.filter({ participant_name: p.name }, "-created_date").catch(() => []) : Promise.resolve([]),
      base44.entities.ImplementationProgram.filter({ participant_name: p.name }).catch(() => []),
    ]);
    setAgreements(agr); setQuotes(quo); setInvoices(inv); setSupportPlans(plans || []);
    setRiskAssessments(risks); setProgressNotes(notes); setComplaints(comp);
    setMedications(meds || []); setEpilepsyPlans(epilepsy || []); setPbsps(pbsp || []);
    setHealthPlans(hcp || []); setParticipantDocuments(docs || []);
    setImplementationPrograms(impPrograms || []);
    // Pre-fill RA participants list
    const allParts = await base44.entities.Participant.list();
    setRaParticipants(allParts);
    // Pre-load RA assessments for this participant
    setRaAssessments(risks || []);
    // Pre-load IP programs for this participant
    setIpPrograms(impPrograms || []);
    setLoading(false);
  };

  const handleSign = async (typedName) => {
    const now = new Date().toISOString();
    if (signingDoc.type === "agreement") {
      await base44.entities.ServiceAgreement.update(signingDoc.id, { signed_by: typedName, signed_at: now, status: "Active" });
      setAgreements(prev => prev.map(a => a.id === signingDoc.id ? { ...a, signed_by: typedName, signed_at: now, status: "Active" } : a));
    } else if (signingDoc.type === "quote") {
      await base44.entities.Quote.update(signingDoc.id, { signed_by: typedName, signed_at: now, status: "Accepted" });
      setQuotes(prev => prev.map(q => q.id === signingDoc.id ? { ...q, signed_by: typedName, signed_at: now, status: "Accepted" } : q));
    } else if (signingDoc.type === "invoice") {
      await base44.entities.Invoice.update(signingDoc.id, { acknowledged_by: typedName, acknowledged_at: now });
      setInvoices(prev => prev.map(i => i.id === signingDoc.id ? { ...i, acknowledged_by: typedName, acknowledged_at: now } : i));
    }
    setSigningDoc(null);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    await base44.entities.Participant.update(participant.id, profileForm);
    setParticipant({ ...participant, ...profileForm });
    setEditingProfile(false);
    setSavingProfile(false);
  };

  const submitComplaint = async () => {
    setSubmittingComplaint(true);
    await base44.entities.Complaint.create({
      participant_name: participant.name,
      complainant: participant.name,
      complaint_type: complaintForm.complaint_type,
      description: complaintForm.description,
      priority: complaintForm.priority,
      date_received: new Date().toISOString().split("T")[0],
      status: "Open",
    });
    setComplaintSubmitted(true);
    setComplaintForm({ complaint_type: "Service Delivery", description: "", priority: "Medium" });
    setSubmittingComplaint(false);
    // Refresh complaints
    const comp = await base44.entities.Complaint.filter({ participant_name: participant.name }, "-created_date");
    setComplaints(comp);
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (base44.entities.Document) {
        await base44.entities.Document.create({
          participant_name: participant.name,
          participant_id: participant.id,
          document_name: file.name,
          file_url,
          document_type: file.type || "Other",
          file_size: (file.size / 1024).toFixed(2) + " KB",
          upload_date: new Date().toISOString().split("T")[0],
        });
        const docs = await base44.entities.Document.filter({ participant_name: participant.name }, "-created_date").catch(() => []);
        setParticipantDocuments(docs || []);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDeleteDocument = async (docId) => {
    if (!base44.entities.Document) return;
    await base44.entities.Document.delete(docId);
    const docs = await base44.entities.Document.filter({ participant_name: participant.name }, "-created_date").catch(() => []);
    setParticipantDocuments(docs || []);
  };

  if (!participant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">NDIS PRO</h1>
              <p className="text-xs text-primary font-bold">Participant Portal</p>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome</h2>
          <p className="text-slate-500 text-sm mb-8">Enter your NDIS number to access your profile, documents, goals, and more.</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">NDIS Number</label>
              <Input value={ndisNumber} onChange={e => setNdisNumber(e.target.value)} placeholder="e.g. 123456789" onKeyDown={e => e.key === "Enter" && handleLookup()} className="h-12 text-lg" />
            </div>
            {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>}
            <Button onClick={handleLookup} disabled={!ndisNumber || loading} className="w-full h-12 rounded-xl font-bold text-base gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              Access My Portal
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-6">Your information is protected and only accessible with your NDIS number.</p>
        </div>
      </div>
    );
  }

  const pendingCount = agreements.filter(a => !a.signed_by).length + quotes.filter(q => !q.signed_by && q.status === "Sent").length + invoices.filter(i => !i.acknowledged_by && i.status === "Sent").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {signingDoc && <SignatureModal docLabel={signingDoc.label} onSign={handleSign} onCancel={() => setSigningDoc(null)} />}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="font-black text-slate-900 leading-none text-sm">NDIS PRO</p>
            <p className="text-[10px] text-primary font-bold">Participant Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-black text-slate-900 text-sm">{participant.name}</p>
            <p className="text-[10px] text-slate-500">NDIS: {participant.ndis_number}</p>
          </div>
          <button onClick={() => { setParticipant(null); setNdisNumber(""); }} className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg">Sign Out</button>
        </div>
      </div>

      {/* Tab Nav - Hamburger */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(() => { const activeTabObj = TABS.find(t => t.id === activeTab); const Icon = activeTabObj?.icon; return Icon ? <><Icon size={16} className="text-primary" /><span className="text-sm font-bold text-slate-800">{activeTabObj.label}</span></> : null; })()}
            {pendingCount > 0 && activeTab === "documents" && (
              <span className="w-5 h-5 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-black">{pendingCount}</span>
            )}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <Menu size={18} className="text-slate-700" />
            <span className="text-sm font-bold text-slate-700">Menu</span>
          </button>
        </div>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50">
            <div className="grid grid-cols-2 gap-px bg-slate-100">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                    className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-all bg-white ${
                      isActive ? "text-primary bg-primary/5" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={15} className={isActive ? "text-primary" : "text-slate-400"} />
                    <span className="truncate">{tab.label}</span>
                    {tab.id === "documents" && pendingCount > 0 && (
                      <span className="ml-auto w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-black shrink-0">{pendingCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto p-4 py-6 space-y-4">

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="bg-primary rounded-2xl p-6 text-white">
              <h2 className="text-xl font-black mb-1">Hello, {participant.name.split(" ")[0]}!</h2>
              <p className="text-primary-foreground/80 text-sm">
                {pendingCount > 0 ? `You have ${pendingCount} document${pendingCount > 1 ? "s" : ""} awaiting your signature.` : "All your documents are up to date."}
              </p>
            </div>

            {agreements.length > 0 && (
              <section>
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-3"><FileText size={16} className="text-purple-600" /> Service Agreements</h3>
                <div className="space-y-3">
                  {agreements.map(a => (
                    <DocCard key={a.id} icon={FileText} color="bg-purple-100 text-purple-700" title="Service Agreement"
                      number={`${a.start_date || "—"} → ${a.end_date || "Ongoing"}`} date={a.start_date || ""}
                      status={a.status} signed={!!a.signed_by} signedBy={a.signed_by} signedAt={a.signed_at}
                      signable={true} onSign={() => setSigningDoc({ type: "agreement", id: a.id, label: `Service Agreement — ${a.participant_name}` })} />
                  ))}
                </div>
              </section>
            )}

            {quotes.length > 0 && (
              <section>
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-3"><ClipboardList size={16} className="text-blue-600" /> Quotes</h3>
                <div className="space-y-3">
                  {quotes.map(q => (
                    <DocCard key={q.id} icon={ClipboardList} color="bg-blue-100 text-blue-700" title={`Quote ${q.quote_number}`}
                      number={q.quote_number} date={q.issue_date} total={q.total} status={q.status}
                      signed={!!q.signed_by} signedBy={q.signed_by} signedAt={q.signed_at}
                      signable={["Sent", "Draft"].includes(q.status)}
                      onSign={() => setSigningDoc({ type: "quote", id: q.id, label: `Quote ${q.quote_number}` })} />
                  ))}
                </div>
              </section>
            )}

            {invoices.length > 0 && (
              <section>
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-3"><Receipt size={16} className="text-emerald-600" /> Invoices</h3>
                <div className="space-y-3">
                  {invoices.map(inv => (
                    <DocCard key={inv.id} icon={Receipt} color="bg-emerald-100 text-emerald-700" title={`Invoice ${inv.invoice_number}`}
                      number={inv.invoice_number} date={inv.issue_date} total={inv.total} status={inv.status}
                      signed={!!inv.acknowledged_by} signedBy={inv.acknowledged_by} signedAt={inv.acknowledged_at}
                      signable={["Sent", "Paid", "Overdue"].includes(inv.status)}
                      onSign={() => setSigningDoc({ type: "invoice", id: inv.id, label: `Invoice ${inv.invoice_number}` })} />
                  ))}
                </div>
              </section>
            )}

            {supportPlans.length > 0 && (
              <section>
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-3"><Star size={16} className="text-amber-600" /> Support Plans</h3>
                <div className="space-y-3">
                  {supportPlans.map(sp => (
                    <div key={sp.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center"><Star size={18} /></div>
                        <div>
                          <p className="font-black text-slate-900">{sp.title || "Support Plan"}</p>
                          <p className="text-xs text-slate-500">{sp.start_date || ""} {sp.end_date ? `→ ${sp.end_date}` : ""}</p>
                        </div>
                        <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${statusColor[sp.status] || "bg-slate-100 text-slate-600"}`}>{sp.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Document Upload & View */}
            <section>
              <h3 className="font-black text-slate-800 flex items-center gap-2 mb-3"><File size={16} className="text-blue-600" /> Your Documents</h3>
              <div className="space-y-3">
                {/* Upload */}
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">
                  <input type="file" onChange={handleDocumentUpload} disabled={uploading} className="hidden" id="doc-upload" />
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Plus size={18} /></div>
                      <p className="text-sm font-bold text-slate-900">Upload Document</p>
                      <p className="text-xs text-slate-500">Click to select PDF, image, or other file</p>
                      {uploading && <Loader2 size={14} className="animate-spin text-blue-600" />}
                    </div>
                  </label>
                </div>

                {/* Document Edit Modal */}
                {editingDoc && (
                  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-900">Edit Document</h2>
                        <button onClick={() => setEditingDoc(null)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Document Name</label>
                          <input value={editingDoc.document_name} onChange={e => setEditingDoc({...editingDoc, document_name: e.target.value})} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Document Type</label>
                          <input value={editingDoc.document_type} onChange={e => setEditingDoc({...editingDoc, document_type: e.target.value})} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm" />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <button onClick={() => setEditingDoc(null)} className="flex-1 border border-slate-200 rounded-xl py-2 text-sm font-bold text-slate-600">Cancel</button>
                          <button onClick={async () => { await base44.entities.Document.update(editingDoc.id, {document_name: editingDoc.document_name, document_type: editingDoc.document_type}); const docs = await base44.entities.Document.filter({participant_name: participant.name}, "-created_date").catch(() => []); setParticipantDocuments(docs || []); setEditingDoc(null); }} className="flex-1 bg-primary text-white rounded-xl py-2 text-sm font-bold">Save</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document List */}
                {participantDocuments && participantDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {participantDocuments.map(doc => (
                      <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0"><File size={18} /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{doc.document_name || "Document"}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{doc.upload_date || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-slate-600 font-semibold">{doc.file_size || "—"}</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => setEditingDoc(doc)} className="bg-slate-100 text-slate-600 hover:bg-primary hover:text-white rounded-lg p-2 transition-colors" title="Edit"><Pencil size={14} /></button>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg p-2 transition-colors"><Download size={14} /></a>
                            {base44.entities.Document && <button onClick={() => handleDeleteDocument(doc.id)} className="bg-slate-200 text-slate-600 hover:bg-rose-200 hover:text-rose-600 rounded-lg p-2 transition-colors"><Trash2 size={14} /></button>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No documents uploaded yet.</p>
                )}
              </div>
            </section>

            {agreements.length === 0 && quotes.length === 0 && invoices.length === 0 && supportPlans.length === 0 && (!participantDocuments || participantDocuments.length === 0) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                <h3 className="font-black text-slate-800 mb-1">No Documents Yet</h3>
                <p className="text-sm text-slate-500">Your provider hasn't sent any documents yet. You can upload your own documents above.</p>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-slate-900 text-lg">My Profile</h3>
                {!editingProfile ? (
                  <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)} className="rounded-xl gap-1.5"><Edit size={14} /> Edit</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)} className="rounded-xl gap-1"><X size={14} /> Cancel</Button>
                    <Button size="sm" onClick={saveProfile} disabled={savingProfile} className="rounded-xl gap-1"><Save size={14} /> {savingProfile ? "Saving..." : "Save"}</Button>
                  </div>
                )}
              </div>

              {/* Read-only fields */}
              <div className="space-y-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-sm font-bold text-slate-800">{participant.name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">NDIS Number</p>
                  <p className="text-sm font-bold text-slate-800">{participant.ndis_number}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan Type</p>
                  <p className="text-sm font-bold text-slate-800">{participant.plan_type}</p>
                </div>
                {participant.date_of_birth && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                    <p className="text-sm font-bold text-slate-800">{participant.date_of_birth}</p>
                  </div>
                )}
              </div>

              {/* Editable fields */}
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Contact Information</p>
              {editingProfile ? (
                <div className="space-y-3">
                  {[
                    { field: "phone", label: "Phone", placeholder: "Your phone number" },
                    { field: "email", label: "Email", placeholder: "Your email address" },
                    { field: "address", label: "Address", placeholder: "Your home address" },
                  ].map(({ field, label, placeholder }) => (
                    <div key={field}>
                      <Label className="text-xs">{label}</Label>
                      <Input value={profileForm[field]} onChange={e => setProfileForm({ ...profileForm, [field]: e.target.value })} placeholder={placeholder} />
                    </div>
                  ))}
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">Emergency Contact</p>
                  {[
                    { field: "emergency_contact_name", label: "Name" },
                    { field: "emergency_contact_phone", label: "Phone" },
                    { field: "emergency_contact_relationship", label: "Relationship" },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <Label className="text-xs">{label}</Label>
                      <Input value={profileForm[field]} onChange={e => setProfileForm({ ...profileForm, [field]: e.target.value })} placeholder={label} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Phone", value: participant.phone, icon: Phone },
                    { label: "Email", value: participant.email, icon: Mail },
                    { label: "Address", value: participant.address, icon: MapPin },
                    { label: "Emergency Contact", value: participant.emergency_contact_name },
                    { label: "Emergency Phone", value: participant.emergency_contact_phone },
                    { label: "Relationship", value: participant.emergency_contact_relationship },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="text-sm font-bold text-slate-800">{f.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {participant.primary_disability && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Disability</p>
                <p className="text-sm text-slate-700">{participant.primary_disability}</p>
              </div>
            )}

            {participant.medical_alerts && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertTriangle size={11} /> Medical Alerts</p>
                <p className="text-sm text-rose-800 font-semibold">{participant.medical_alerts}</p>
              </div>
            )}
          </div>
        )}

        {/* GOALS TAB */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-black text-slate-900 text-lg mb-4">My NDIS Goals</h3>
              {(!participant.goals || participant.goals.length === 0) ? (
                <p className="text-sm text-slate-500 italic">No goals have been set yet. Contact your support coordinator.</p>
              ) : (
                <div className="space-y-4">
                  {participant.goals.map((goal, i) => {
                    const g = typeof goal === "string" ? { text: goal, progress: 0, status: "In Progress" } : goal;
                    const pct = g.progress || 0;
                    const statusColor = g.status === "Achieved" ? "bg-emerald-100 text-emerald-700" : g.status === "On Track" ? "bg-blue-100 text-blue-700" : g.status === "Discontinued" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700";
                    const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-blue-500";
                    return (
                      <div key={i} className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5">{i + 1}</div>
                            <p className="text-sm text-slate-800 font-medium leading-relaxed">{g.text}</p>
                          </div>
                          {g.status && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>{g.status}</span>}
                        </div>
                        <div className="flex items-center gap-3 pl-10">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-black text-slate-600 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {progressNotes.filter(n => n.status === "Finalised").length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-black text-slate-900 text-lg mb-4">Recent Progress Notes</h3>
                <div className="space-y-3">
                  {progressNotes.filter(n => n.status === "Finalised").slice(0, 5).map(n => (
                    <div key={n.id} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-slate-500 uppercase">{n.note_date} · {n.template_type}</p>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Finalised</span>
                      </div>
                      {n.outcomes && <p className="text-sm text-slate-700"><span className="font-bold">Outcomes: </span>{n.outcomes}</p>}
                      {n.activities_delivered && <p className="text-xs text-slate-500 mt-1">{n.activities_delivered}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EPILEPSY PLAN TAB - FULL DOCUMENT */}
        {activeTab === "epilepsy" && (
          <div className="space-y-6 max-w-4xl">
            {epilepsyPlans.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <AlertTriangle size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No epilepsy management plan on file.</p>
              </div>
            ) : epilepsyPlans.map(plan => (
              <div key={plan.id} className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
                        <span>🧠</span> EPILEPSY HEALTH CARE MANAGEMENT PLAN
                      </h1>
                      <p className="text-blue-600 font-bold mt-1">NDIS / School / Support Worker Ready</p>
                    </div>
                  </div>
                </div>

                {/* 1. Participant Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
                    <h2 className="font-black text-lg flex items-center gap-2">🧍 1. PARTICIPANT DETAILS</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div className="flex justify-between border-b border-slate-100 pb-2"><span className="font-bold text-slate-600">Participant Name</span><span className="font-black">{plan.participant_name}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-2"><span className="font-bold text-slate-600">NDIS Number</span><span className="font-bold">{plan.ndis_number || "—"}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-2"><span className="font-bold text-slate-600">Date of Birth</span><span className="font-bold">{plan.date_of_birth || "—"}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-2"><span className="font-bold text-slate-600">Primary Diagnosis</span><span className="font-bold text-blue-700">{plan.diagnosis}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-2"><span className="font-bold text-slate-600">Neurologist / GP</span><span className="font-bold">{plan.neurologist || "—"}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-2"><span className="font-bold text-slate-600">Review Date</span><span className="font-bold text-rose-600">{plan.review_date || "—"}</span></div>
                  </div>
                </div>

                {/* 2. Seizure Profile */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
                    <h2 className="font-black text-lg flex items-center gap-2">⚠️ 2. SEIZURE PROFILE</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-slate-100">
                        {plan.typical_duration && <tr><td className="px-6 py-4 font-bold text-slate-600 w-1/3">Typical Duration</td><td className="px-6 py-4">{plan.typical_duration}</td></tr>}
                        {plan.known_triggers && <tr><td className="px-6 py-4 font-bold text-slate-600">Known Triggers</td><td className="px-6 py-4">{plan.known_triggers}</td></tr>}
                        {plan.warning_signs && <tr><td className="px-6 py-4 font-bold text-slate-600">Warning Signs (Aura)</td><td className="px-6 py-4 italic text-amber-700">{plan.warning_signs}</td></tr>}
                        {plan.postictal_description && <tr><td className="px-6 py-4 font-bold text-slate-600">Post-Seizure Symptoms</td><td className="px-6 py-4">{plan.postictal_description}</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Emergency Response Plan */}
                <div className="bg-white rounded-2xl shadow-md border-2 border-rose-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-600 to-rose-900 text-white px-6 py-4">
                    <h2 className="font-black text-xl flex items-center gap-2">🚨 3. EMERGENCY RESPONSE PLAN (CRITICAL)</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-rose-700 font-black uppercase tracking-wider mb-4 border-b pb-2">🔴 IF SEIZURE OCCURS:</h3>
                      <ol className="space-y-3 list-decimal list-inside font-medium text-sm">
                        {(plan.emergency_steps || []).map((step, i) => <li key={i} className="pl-2 text-slate-700">{step}</li>)}
                      </ol>
                    </div>
                    <div className="bg-rose-50 p-5 rounded-lg border border-rose-100">
                      <h3 className="text-rose-800 font-black uppercase tracking-wider mb-4 flex items-center gap-2">🚑 CALL 000 IF:</h3>
                      <ul className="space-y-2 font-bold text-rose-900 text-sm">
                        {(plan.call_000_if || []).map((cond, i) => <li key={i} className="flex gap-2"><span>•</span>{cond}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 4. Medication Management */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
                    <h2 className="font-black text-lg text-blue-900 flex items-center gap-2">💊 4. MEDICATION MANAGEMENT</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    {plan.rescue_medication_name && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                        <h3 className="font-black text-amber-800 mb-3 flex items-center gap-2">🔹 RESCUE MEDICATION (Emergency Only)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between border-b border-amber-100 pb-1"><span className="text-amber-700 font-bold">Medication</span><span className="font-black">{plan.rescue_medication_name}</span></div>
                          <div className="flex justify-between border-b border-amber-100 pb-1"><span className="text-amber-700 font-bold">Trigger</span><span className="font-black text-rose-700">{plan.rescue_when || "> 5 mins seizure"}</span></div>
                          <div className="flex justify-between border-b border-amber-100 pb-1"><span className="text-amber-700 font-bold">Dose</span><span className="font-black">{plan.rescue_dose}</span></div>
                          <div className="flex justify-between border-b border-amber-100 pb-1"><span className="text-amber-700 font-bold">Method</span><span className="font-black">{plan.rescue_route}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5 & 6. Strategies and Risk */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
                      <h2 className="font-black text-lg flex items-center gap-2">🧠 5. DAILY SUPPORT</h2>
                    </div>
                    <div className="p-6 space-y-3 text-sm text-slate-700">
                      {(plan.daily_strategies || []).slice(0, 3).map((s, i) => <p key={i}><strong>{s.split(":")[0]}:</strong> {s.split(":")[1] || s}</p>)}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
                      <h2 className="font-black text-lg flex items-center gap-2">🛡️ 6. RISK MANAGEMENT</h2>
                    </div>
                    <div className="p-6 space-y-3 text-sm text-slate-700">
                      {(plan.risk_strategies || []).slice(0, 3).map((s, i) => <p key={i}><span className="inline-block w-4 h-4 bg-amber-200 rounded mr-2"></span><strong>{s.split(":")[0]}:</strong> {s.split(":")[1] || s}</p>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PBSP TAB - FULL DOCUMENT */}
        {activeTab === "pbsp" && (
          <div className="space-y-4">
            {pbsps.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <MessageSquareWarning size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No behaviour support plan on file.</p>
              </div>
            ) : pbsps.map(plan => (
              <div key={plan.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-800 text-white px-6 py-8">
                  <h1 className="text-2xl font-black mb-1">Positive Behaviour Support Plan</h1>
                  <p className="text-slate-300">Target Behaviour: {plan.target_behaviour}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 px-6 py-4 border-t border-slate-200">
                  {[{l: "Participant", v: plan.participant_name}, {l: "Diagnosis", v: plan.diagnosis}, {l: "Primary Goal", v: plan.primary_goal}, {l: "Status", v: plan.status}].filter(f => f.v).map(f => (
                    <div key={f.l}><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{f.l}</p><p className="text-sm font-bold text-slate-900">{f.v}</p></div>
                  ))}
                </div>
                <div className="p-6 space-y-6">
                  {[{id:"green",label:"🟢 Green Zone — Proactive Strategies",items:[...(plan.green_zone_environmental||[]),...(plan.green_zone_skills||[])],cls:"bg-emerald-50 border-emerald-200 text-emerald-900"},{id:"yellow",label:"🟡 Yellow Zone — Warning Signs & Responses",items:[...(plan.yellow_zone_signs||[]),...(plan.yellow_zone_responses||[])],cls:"bg-amber-50 border-amber-200 text-amber-900"},{id:"red",label:"🔴 Red Zone — Reactive Crisis Strategies",items:plan.red_zone_strategies||[],cls:"bg-rose-50 border-rose-200 text-rose-900"},{id:"blue",label:"🔵 Blue Zone — Post-Crisis Recovery",items:plan.blue_zone_recovery||[],cls:"bg-blue-50 border-blue-200 text-blue-900"}].filter(z=>(z.items||[]).filter(Boolean).length>0).map(z => <div key={z.id}><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">{z.label}</h2><div className={`border-2 rounded-xl p-4 ${z.cls}`}><ul className="space-y-2">{z.items.filter(Boolean).map((item,i) => <li key={i} className="text-sm flex gap-2.5 font-medium"><span className="font-black">•</span>{item}</li>)}</ul></div></div>)}
                  {(plan.communication_board||[]).length > 0 && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Communication Board</h2><div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{plan.communication_board.map((item,i) => <div key={i} className="bg-slate-100 border border-slate-300 rounded-lg p-3 flex flex-col items-center justify-center text-center"><span className="text-2xl mb-1">{item.emoji}</span><p className="text-[11px] font-bold text-slate-800 leading-tight">{item.label}</p></div>)}</div></div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RISK ASSESSMENTS TAB */}
        {activeTab === "risks" && (() => {
          const RaF = ({ label, field, type = "text", placeholder = "" }) => (
            <div><Label className="text-xs">{label}</Label><Input type={type} value={raForm[field]} onChange={e => raSet(field, e.target.value)} placeholder={placeholder} className="mt-1" /></div>
          );
          if (raPrintData) return (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button onClick={() => setRaPrintData(null)} className="text-primary font-bold text-sm hover:underline">← Back</button>
                <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2"><Printer size={16} /> Print PDF</Button>
              </div>
              <div id="ra-print" className="bg-white max-w-4xl mx-auto text-slate-800 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                <div style={{ background: '#1e3a5f', color: 'white', padding: '20px 24px', borderRadius: '8px 8px 0 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><h1 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>NDIS Travel Risk Assessment</h1><p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.8 }}>{raPrintData.activity_description || ""}</p></div>
                    <div style={{ textAlign: 'right', fontSize: '11px', opacity: 0.8 }}><p>Date: {raPrintData.assessment_date}</p><p>Review: {raPrintData.review_date || "—"}</p></div>
                  </div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '20px 24px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Participant Details</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      {[{ label: "Client Full Name", value: raPrintData.participant_name }, { label: "Date of Birth", value: raPrintData.participant_dob }, { label: "NDIS Number", value: raPrintData.ndis_number }, { label: "Home Address", value: raPrintData.home_address }, { label: "Destination / Workplace", value: raPrintData.destination }, { label: "Assessor", value: `${raPrintData.assessor_name || ""}${raPrintData.assessor_role ? ` (${raPrintData.assessor_role})` : ""}` }].map(f => (
                        <div key={f.label} style={{ background: '#f8fafc', borderRadius: '6px', padding: '8px 10px' }}><p style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 3px' }}>{f.label}</p><p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{f.value || "—"}</p></div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Comprehensive Risk Assessment</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                      <thead><tr style={{ background: '#1e3a5f', color: 'white' }}><th style={{ padding: '7px 8px', textAlign: 'left' }}>Hazard / Risk</th><th style={{ padding: '7px 8px', textAlign: 'center' }}>Initial Likelihood</th><th style={{ padding: '7px 8px', textAlign: 'center' }}>Initial Consequence</th><th style={{ padding: '7px 8px', textAlign: 'center' }}>Initial Rating</th><th style={{ padding: '7px 8px', textAlign: 'left' }}>Control Measures</th><th style={{ padding: '7px 8px', textAlign: 'center' }}>Residual Likelihood</th><th style={{ padding: '7px 8px', textAlign: 'center' }}>Residual Consequence</th><th style={{ padding: '7px 8px', textAlign: 'center' }}>Residual Rating</th><th style={{ padding: '7px 8px', textAlign: 'left' }}>Responsible</th></tr></thead>
                      <tbody>{(raPrintData.hazards || []).map((h, i) => { const irBg = { Low: '#dcfce7', Medium: '#ffedd5', High: '#fee2e2', Extreme: '#7f1d1d' }[h.initial_rating] || '#f1f5f9'; const irColor = h.initial_rating === 'Extreme' ? 'white' : { Low: '#166534', Medium: '#9a3412', High: '#991b1b' }[h.initial_rating] || '#64748b'; const rrBg = { Low: '#dcfce7', Medium: '#ffedd5', High: '#fee2e2', Extreme: '#7f1d1d' }[h.residual_rating] || '#f1f5f9'; const rrColor = h.residual_rating === 'Extreme' ? 'white' : { Low: '#166534', Medium: '#9a3412', High: '#991b1b' }[h.residual_rating] || '#64748b'; return (<tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '8px', fontWeight: '600', verticalAlign: 'top' }}>{h.hazard}</td><td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>{h.initial_likelihood}</td><td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>{h.initial_consequence}</td><td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}><span style={{ background: irBg, color: irColor, padding: '2px 6px', borderRadius: '4px', fontWeight: '900', fontSize: '9px' }}>{h.initial_rating}</span></td><td style={{ padding: '8px', verticalAlign: 'top' }}>{h.controls || "—"}</td><td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>{h.residual_likelihood}</td><td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>{h.residual_consequence}</td><td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}><span style={{ background: rrBg, color: rrColor, padding: '2px 6px', borderRadius: '4px', fontWeight: '900', fontSize: '9px' }}>{h.residual_rating}</span></td><td style={{ padding: '8px', verticalAlign: 'top' }}>{h.person_responsible || "—"}</td></tr>); })}</tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}><div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 20px', display: 'flex', gap: '20px', alignItems: 'center' }}><span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>OVERALL RESIDUAL RISK:</span><span style={{ padding: '4px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '13px', background: { Low: '#dcfce7', Medium: '#ffedd5', High: '#fee2e2', Extreme: '#7f1d1d' }[raPrintData.overallRisk] || '#f1f5f9', color: raPrintData.overallRisk === 'Extreme' ? 'white' : { Low: '#166534', Medium: '#9a3412', High: '#991b1b' }[raPrintData.overallRisk] || '#64748b' }}>{raPrintData.overallRisk}</span></div></div>
                  </div>
                </div>
              </div>
            </div>
          );
          return (
            <div className="space-y-8">
              <div><h2 className="text-2xl font-black tracking-tight">Risk Assessment Builder</h2><p className="text-slate-500 text-sm">Compliant with NDIS Practice Standards for Incident and Risk Management.</p></div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                    <h3 className="font-black text-lg">Assessment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2"><Label className="text-xs">Assessment Title *</Label><Input value={raForm.title} onChange={e => raSet("title", e.target.value)} placeholder="e.g. Travel Risk Assessment — Coogee to Botany" className="mt-1 font-semibold" /></div>
                      <div className="md:col-span-2"><Label className="text-xs">Link to Participant</Label><select value={raForm.participant_id} onChange={e => raSelectParticipant(e.target.value)} className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 text-sm"><option value="">Select participant (auto-fills details)...</option>{raParticipants.map(p => <option key={p.id} value={p.id}>{p.name} — {p.ndis_number}</option>)}</select></div>
                    </div>
                    <h3 className="font-black text-lg pt-2">Participant Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RaF label="Participant Full Name" field="participant_name" /><RaF label="Date of Birth" field="participant_dob" type="date" />
                      <RaF label="NDIS Number" field="ndis_number" /><RaF label="Home Address" field="home_address" />
                      <RaF label="Destination / Workplace" field="destination" /><RaF label="Activity / Scope" field="activity_description" placeholder="e.g. Independent travel training via bus" />
                    </div>
                    <h3 className="font-black text-lg pt-2">Assessor Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RaF label="Assessor Name" field="assessor_name" /><RaF label="Assessor Role / Position" field="assessor_role" />
                      <RaF label="Assessment Date" field="assessment_date" type="date" /><RaF label="Review Date" field="review_date" type="date" />
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6">
                    <h3 className="font-black text-lg mb-4">Risk Rating Matrix</h3>
                    <div className="overflow-x-auto"><table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden"><thead className="bg-slate-100"><tr><th className="px-3 py-2 text-left text-slate-500 font-black uppercase">Likelihood \ Consequence</th>{RA_CONSEQUENCES.map(c => <th key={c} className="px-3 py-2 text-center text-slate-500 font-black uppercase">{c}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{RA_LIKELIHOODS.map(l => (<tr key={l}><td className="px-3 py-2 font-bold">{l}</td>{RA_CONSEQUENCES.map(c => { const r = raGetRating(l, c); return <td key={c} className={`px-3 py-2 text-center font-black text-[10px] ${RA_RISK_COLORS[r]}`}>{r}</td>; })}</tr>))}</tbody></table></div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6"><h3 className="font-black text-lg">Hazard Identification & Risk Assessment</h3><Button variant="outline" size="sm" onClick={raAddHazard} className="rounded-lg gap-1"><Plus size={14} /> Add Hazard</Button></div>
                    <div className="space-y-5">{raHazards.map((h, i) => (<div key={i} className="border border-slate-200 rounded-2xl overflow-hidden"><div className="bg-slate-100 px-4 py-2 flex justify-between items-center"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Hazard {i + 1}</span><button onClick={() => raRemoveHazard(i)} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button></div><div className="p-4 space-y-4"><div><Label className="text-xs">Hazard Description</Label><Input value={h.hazard} onChange={e => raUpdateHazard(i, "hazard", e.target.value)} placeholder="Describe the hazard..." className="mt-1 font-semibold" /></div><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Initial Risk (Before Controls)</p><div className="grid grid-cols-3 gap-3"><div><Label className="text-[10px]">Likelihood</Label><Select value={h.initial_likelihood} onValueChange={v => raUpdateHazard(i, "initial_likelihood", v)}><SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent>{RA_LIKELIHOODS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-[10px]">Consequence</Label><Select value={h.initial_consequence} onValueChange={v => raUpdateHazard(i, "initial_consequence", v)}><SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent>{RA_CONSEQUENCES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-[10px]">Rating</Label><div className={`mt-1 h-8 flex items-center justify-center rounded-md text-xs font-black ${RA_RISK_COLORS[h.initial_rating]}`}>{h.initial_rating}</div></div></div></div><div><Label className="text-xs">Control Measures</Label><Textarea value={h.controls} onChange={e => raUpdateHazard(i, "controls", e.target.value)} placeholder="What controls are in place to mitigate this hazard?" className="mt-1 text-sm min-h-[70px]" /></div><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Residual Risk (After Controls)</p><div className="grid grid-cols-3 gap-3"><div><Label className="text-[10px]">Likelihood</Label><Select value={h.residual_likelihood} onValueChange={v => raUpdateHazard(i, "residual_likelihood", v)}><SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent>{RA_LIKELIHOODS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-[10px]">Consequence</Label><Select value={h.residual_consequence} onValueChange={v => raUpdateHazard(i, "residual_consequence", v)}><SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent>{RA_CONSEQUENCES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-[10px]">Rating</Label><div className={`mt-1 h-8 flex items-center justify-center rounded-md text-xs font-black ${RA_RISK_COLORS[h.residual_rating]}`}>{h.residual_rating}</div></div></div></div><div><Label className="text-xs">Person Responsible</Label><Input value={h.person_responsible} onChange={e => raUpdateHazard(i, "person_responsible", e.target.value)} placeholder="Name / role responsible for controls" className="mt-1 text-sm" /></div></div></div>))}</div>
                    <div className="mt-4 p-4 bg-slate-800 text-white rounded-2xl flex justify-between items-center"><p className="text-xs font-bold uppercase tracking-widest opacity-60">Overall Residual Risk</p><span className={`px-4 py-1 rounded-full text-sm font-black ${RA_RISK_COLORS[raOverallRisk()]}`}>{raOverallRisk()}</span></div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                    <h3 className="font-black text-lg">Emergency Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <RaF label="Contact 1 Name" field="emergency_contact_1_name" /><RaF label="Contact 1 Phone" field="emergency_contact_1_phone" /><RaF label="Relationship" field="emergency_contact_1_rel" />
                      <RaF label="Contact 2 Name" field="emergency_contact_2_name" /><RaF label="Contact 2 Phone" field="emergency_contact_2_phone" /><RaF label="Relationship" field="emergency_contact_2_rel" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Button onClick={raSaveAssessment} disabled={raSaving} className="w-full rounded-xl font-bold gap-2 py-6 text-base"><Save size={18} /> {raSaving ? "Saving..." : "Save Assessment"}</Button>
                  <Button variant="outline" onClick={() => setRaPrintData({ ...raForm, hazards: raHazards, overallRisk: raOverallRisk() })} className="w-full rounded-xl font-bold gap-2"><Printer size={16} /> Preview / Print</Button>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6">
                    <h4 className="font-black mb-4">Saved Assessments</h4>
                    {raLoading ? <p className="text-sm text-slate-400">Loading...</p> : raAssessments.length === 0 ? <p className="text-sm text-slate-400 italic">No assessments yet.</p> : (
                      <div className="space-y-3">{raAssessments.slice(0, 8).map(a => (<div key={a.id} className="p-3 bg-slate-100 rounded-xl">{raRenameId === a.id ? (<div className="flex gap-1 mb-1"><input value={raRenameVal} onChange={e => setRaRenameVal(e.target.value)} onKeyDown={e => e.key === "Enter" && raSaveRename(a.id)} className="flex-1 text-xs h-7 px-2 rounded border border-blue-500 outline-none" autoFocus /><button onClick={() => raSaveRename(a.id)} className="text-xs text-blue-600 font-black px-2">Save</button><button onClick={() => setRaRenameId(null)} className="text-xs text-slate-400 px-1">✕</button></div>) : (<div className="flex items-center gap-1 mb-1"><p className="text-xs font-bold text-slate-800 truncate flex-1 cursor-pointer hover:text-blue-600" onClick={() => setRaPrintData({ ...a, overallRisk: a.overall_risk_level })}>{a.title || a.activity_description || "Untitled"}</p><button onClick={() => { setRaRenameId(a.id); setRaRenameVal(a.title || a.activity_description || ""); }} className="text-slate-400 hover:text-blue-600 shrink-0"><Pencil size={11} /></button></div>)}<div className="flex justify-between"><p className="text-[10px] text-slate-500">{a.participant_name || a.assessor_name}</p><span className={`text-[10px] font-black px-2 py-0.5 rounded ${RA_RISK_COLORS[a.overall_risk_level] || "bg-slate-100 text-slate-600"}`}>{a.overall_risk_level}</span></div></div>))}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* IMPLEMENTATION PROGRAMS TAB */}
        {activeTab === "implementation" && (() => {
          if (ipView === "form" && ipForm) {
            const ipSetF = (k, v) => setIpForm(p => ({ ...p, [k]: v }));
            return (
              <div className="space-y-6">
                <div className="flex justify-between items-center"><div><button onClick={() => setIpView("list")} className="text-blue-600 text-sm font-bold hover:underline">← Back</button><h2 className="text-2xl font-black mt-1">New Implementation Program</h2></div><Button onClick={ipSave} disabled={!ipForm.participant_name || ipSaving} className="rounded-xl font-bold gap-2">{ipSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Program</Button></div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                    <h3 className="font-black text-lg">Participant & Program Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2"><Label>Participant Name *</Label><Input value={ipForm.participant_name} onChange={e => ipSetF("participant_name", e.target.value)} className="mt-1" /></div>
                      <div><Label>NDIS Number</Label><Input value={ipForm.ndis_number} onChange={e => ipSetF("ndis_number", e.target.value)} className="mt-1" /></div>
                      <div><Label>Start Date</Label><Input type="date" value={ipForm.start_date} onChange={e => ipSetF("start_date", e.target.value)} className="mt-1" /></div>
                      <div className="col-span-2"><Label>Primary Goal</Label><Input value={ipForm.primary_goal} onChange={e => ipSetF("primary_goal", e.target.value)} className="mt-1" /></div>
                      <div className="col-span-2"><Label>Focus Area</Label><Input value={ipForm.focus} onChange={e => ipSetF("focus", e.target.value)} className="mt-1" /></div>
                      <div><Label>Status</Label><Select value={ipForm.status} onValueChange={v => ipSetF("status", v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{["Active","Draft","On Hold","Completed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div><Label>Program Overview</Label><Textarea value={ipForm.program_overview} onChange={e => ipSetF("program_overview", e.target.value)} className="mt-1 min-h-[80px]" /></div>
                    <div><Label>Session Structure</Label><Textarea value={ipForm.session_structure} onChange={e => ipSetF("session_structure", e.target.value)} className="mt-1 min-h-[80px]" /></div>
                    <div><Label>Data Collection Notes</Label><Textarea value={ipForm.data_collection_notes} onChange={e => ipSetF("data_collection_notes", e.target.value)} className="mt-1 min-h-[60px]" /></div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6">
                      <h3 className="font-black text-lg mb-4">Implementation Phases</h3>
                      <div className="space-y-3">{(ipForm.phases || []).map((ph, i) => (<div key={i} className="p-4 bg-slate-100 rounded-2xl space-y-2"><div className={`inline-block text-white text-[10px] font-black px-2 py-0.5 rounded-full ${IP_PHASE_COLORS[i] || "bg-slate-500"}`}>Phase {ph.phase_number}</div><div className="grid grid-cols-2 gap-2"><div><Label className="text-[10px]">Phase Name</Label><Input value={ph.name} onChange={e => { const phases = ipForm.phases.map((p, idx) => idx === i ? { ...p, name: e.target.value } : p); ipSetF("phases", phases); }} className="h-8 text-xs mt-0.5" /></div><div><Label className="text-[10px]">Weeks</Label><Input value={ph.weeks} onChange={e => { const phases = ipForm.phases.map((p, idx) => idx === i ? { ...p, weeks: e.target.value } : p); ipSetF("phases", phases); }} className="h-8 text-xs mt-0.5" /></div><div><Label className="text-[10px]">Support Level</Label><Input value={ph.support_level} onChange={e => { const phases = ipForm.phases.map((p, idx) => idx === i ? { ...p, support_level: e.target.value } : p); ipSetF("phases", phases); }} className="h-8 text-xs mt-0.5" /></div><div><Label className="text-[10px]">Worker Role</Label><Input value={ph.worker_role} onChange={e => { const phases = ipForm.phases.map((p, idx) => idx === i ? { ...p, worker_role: e.target.value } : p); ipSetF("phases", phases); }} className="h-8 text-xs mt-0.5" /></div><div className="col-span-2"><Label className="text-[10px]">Phase Goal</Label><Input value={ph.goal} onChange={e => { const phases = ipForm.phases.map((p, idx) => idx === i ? { ...p, goal: e.target.value } : p); ipSetF("phases", phases); }} className="h-8 text-xs mt-0.5" /></div></div></div>))}</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-3xl p-6">
                      <div className="flex justify-between items-center mb-4"><h3 className="font-black text-lg">Skill Targets</h3><Button variant="outline" size="sm" onClick={() => ipSetF("skill_targets", [...(ipForm.skill_targets || []), { skill: "", achieved: false }])} className="rounded-lg gap-1"><Plus size={12} /> Add</Button></div>
                      <div className="space-y-2">{(ipForm.skill_targets || []).map((s, i) => (<div key={i} className="flex gap-2 items-center"><Input value={s.skill} onChange={e => { const st = ipForm.skill_targets.map((x, idx) => idx === i ? { ...x, skill: e.target.value } : x); ipSetF("skill_targets", st); }} placeholder="Skill description..." className="text-sm h-8" /><button onClick={() => ipSetF("skill_targets", ipForm.skill_targets.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button></div>))}</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                      <div><div className="flex justify-between items-center mb-2"><h4 className="font-black">Required Tools</h4><Button variant="outline" size="sm" onClick={() => ipSetF("required_tools", [...(ipForm.required_tools || []), ""])} className="rounded-lg gap-1"><Plus size={12} /></Button></div><div className="space-y-2">{(ipForm.required_tools || []).map((t, i) => (<div key={i} className="flex gap-2"><Input value={t} onChange={e => { const tools = ipForm.required_tools.map((x, idx) => idx === i ? e.target.value : x); ipSetF("required_tools", tools); }} className="text-sm h-8" /><button onClick={() => ipSetF("required_tools", ipForm.required_tools.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button></div>))}</div></div>
                      <div><div className="flex justify-between items-center mb-2"><h4 className="font-black">Risk Strategies</h4><Button variant="outline" size="sm" onClick={() => ipSetF("risk_strategies", [...(ipForm.risk_strategies || []), ""])} className="rounded-lg gap-1"><Plus size={12} /></Button></div><div className="space-y-2">{(ipForm.risk_strategies || []).map((r, i) => (<div key={i} className="flex gap-2"><Input value={r} onChange={e => { const risks = ipForm.risk_strategies.map((x, idx) => idx === i ? e.target.value : x); ipSetF("risk_strategies", risks); }} className="text-sm h-8" /><button onClick={() => ipSetF("risk_strategies", ipForm.risk_strategies.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button></div>))}</div></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          if (ipView === "detail" && ipSelected) {
            const skillPct = (ipSelected.skill_targets || []).length > 0 ? Math.round(ipCompletedSkills(ipSelected) / (ipSelected.skill_targets || []).length * 100) : 0;
            const currentPhase = (ipSelected.phases || []).find(p => !p.completed) || ipSelected.phases?.[ipSelected.phases.length - 1];
            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div><button onClick={() => setIpView("list")} className="text-blue-600 text-sm font-bold hover:underline">← All Programs</button><h2 className="text-2xl font-black mt-1">{ipSelected.participant_name}</h2><p className="text-slate-500 text-sm">{ipSelected.primary_goal}</p></div>
                  <div className="flex gap-2"><span className={`px-3 py-1 rounded-full text-xs font-black ${ipSelected.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{ipSelected.status}</span></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[{ label: "Current Phase", value: currentPhase?.name || "—", color: "text-blue-600" }, { label: "Support Level", value: currentPhase?.support_level || "—", color: "text-amber-600" }, { label: "Skills Achieved", value: `${ipCompletedSkills(ipSelected)}/${(ipSelected.skill_targets || []).length}`, color: "text-emerald-600" }, { label: "Sessions Logged", value: (ipSelected.session_logs || []).length, color: "text-blue-600" }].map(k => (<div key={k.label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center"><p className={`text-2xl font-black ${k.color}`}>{k.value}</p><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{k.label}</p></div>))}</div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5"><div className="flex justify-between text-sm font-bold mb-2"><span>Overall Skill Progress</span><span>{skillPct}%</span></div><div className="h-3 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${skillPct}%` }} /></div></div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                      <button onClick={() => ipToggleSection("phases")} className="w-full flex justify-between items-center px-6 py-4 hover:bg-slate-50 transition-colors"><h3 className="font-black text-base flex items-center gap-2"><BarChart3 size={16} className="text-blue-600" /> Implementation Phases</h3>{ipExpandedSections.phases ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                      {ipExpandedSections.phases && (<div className="px-6 pb-6 space-y-3">{(ipSelected.phases || []).map((ph, i) => (<div key={i} className={`border rounded-2xl overflow-hidden ${ph.completed ? "border-emerald-200" : "border-slate-200"}`}><div className={`px-5 py-3 flex items-center justify-between ${ph.completed ? "bg-emerald-50" : "bg-slate-100"}`}><div className="flex items-center gap-3"><span className={`text-white text-[10px] font-black px-2 py-0.5 rounded-full ${IP_PHASE_COLORS[i] || "bg-slate-500"}`}>Phase {ph.phase_number}</span><div><p className="font-black text-sm">{ph.name}</p><p className="text-[10px] text-slate-500">{ph.weeks} · Support: {ph.support_level} · Role: {ph.worker_role}</p></div></div><button onClick={() => ipTogglePhase(i)} className={ph.completed ? "text-emerald-600" : "text-slate-400 hover:text-emerald-600"}>{ph.completed ? <CheckCircle size={20} /> : <Circle size={20} />}</button></div>{ph.goal && (<div className="px-5 py-3 text-sm text-slate-500"><span className="font-bold text-slate-800">Goal: </span>{ph.goal}</div>)}</div>))}</div>)}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                      <button onClick={() => ipToggleSection("logs")} className="w-full flex justify-between items-center px-6 py-4 hover:bg-slate-50 transition-colors"><h3 className="font-black text-base flex items-center gap-2"><ClipboardList size={16} className="text-blue-600" /> Session Logs ({(ipSelected.session_logs || []).length})</h3>{ipExpandedSections.logs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                      {ipExpandedSections.logs && (<div className="px-6 pb-6 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                          <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Log New Session</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3"><div><Label className="text-[10px]">Date</Label><Input type="date" value={ipNewLog.date} onChange={e => setIpNewLog(p => ({ ...p, date: e.target.value }))} className="h-8 text-xs mt-0.5" /></div><div><Label className="text-[10px]">Phase</Label><Select value={ipNewLog.phase} onValueChange={v => setIpNewLog(p => ({ ...p, phase: v }))}><SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger><SelectContent>{(ipSelected.phases || []).map(ph => <SelectItem key={ph.phase_number} value={`Phase ${ph.phase_number}`}>Phase {ph.phase_number} — {ph.name}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-[10px]">Support Level Used</Label><Input value={ipNewLog.support_level_used} onChange={e => setIpNewLog(p => ({ ...p, support_level_used: e.target.value }))} placeholder="e.g. 70%" className="h-8 text-xs mt-0.5" /></div><div><Label className="text-[10px]">Logged By</Label><Input value={ipNewLog.logged_by} onChange={e => setIpNewLog(p => ({ ...p, logged_by: e.target.value }))} placeholder="Staff name" className="h-8 text-xs mt-0.5" /></div></div>
                          <div><Label className="text-[10px]">Skills Practiced</Label><Textarea value={ipNewLog.skills_practiced} onChange={e => setIpNewLog(p => ({ ...p, skills_practiced: e.target.value }))} placeholder="What skills did the participant practice today?" className="text-xs min-h-[50px] mt-0.5" /></div>
                          <div><Label className="text-[10px]">Participant Response</Label><Textarea value={ipNewLog.participant_response} onChange={e => setIpNewLog(p => ({ ...p, participant_response: e.target.value }))} placeholder="How did the participant respond? Mood, confidence, challenges..." className="text-xs min-h-[50px] mt-0.5" /></div>
                          <div className="grid grid-cols-2 gap-3"><div><Label className="text-[10px]">Incidents / Concerns</Label><Input value={ipNewLog.incidents} onChange={e => setIpNewLog(p => ({ ...p, incidents: e.target.value }))} placeholder="None" className="h-8 text-xs mt-0.5" /></div><div><Label className="text-[10px]">Next Session Focus</Label><Input value={ipNewLog.next_session_focus} onChange={e => setIpNewLog(p => ({ ...p, next_session_focus: e.target.value }))} className="h-8 text-xs mt-0.5" /></div></div>
                          <Button onClick={ipAddLog} size="sm" className="rounded-xl gap-1 font-bold"><Save size={13} /> Save Session Log</Button>
                        </div>
                        {(ipSelected.session_logs || []).length === 0 ? <p className="text-sm text-slate-400 italic text-center py-4">No sessions logged yet.</p> : (<div className="space-y-3">{[...(ipSelected.session_logs || [])].reverse().map((log, i) => (<div key={i} className="bg-slate-100 rounded-2xl p-4"><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><span className="text-xs font-black text-slate-800">{log.date}</span><span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{log.phase}</span>{log.support_level_used && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{log.support_level_used} support</span>}</div><span className="text-[10px] text-slate-500">{log.logged_by}</span></div>{log.skills_practiced && <p className="text-xs text-slate-800 mb-1"><span className="font-bold">Skills: </span>{log.skills_practiced}</p>}{log.participant_response && <p className="text-xs text-slate-500 mb-1"><span className="font-bold text-slate-700">Response: </span>{log.participant_response}</p>}{log.next_session_focus && <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Next: </span>{log.next_session_focus}</p>}</div>))}</div>)}
                      </div>)}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                      <button onClick={() => ipToggleSection("skills")} className="w-full flex justify-between items-center px-5 py-4 hover:bg-slate-50"><h3 className="font-black flex items-center gap-2"><Target size={15} className="text-emerald-600" /> Skills ({ipCompletedSkills(ipSelected)}/{(ipSelected.skill_targets || []).length})</h3>{ipExpandedSections.skills ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
                      {ipExpandedSections.skills && (<div className="px-5 pb-5 space-y-2">{(ipSelected.skill_targets || []).map((s, i) => (<button key={i} onClick={() => ipToggleSkill(i)} className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors ${s.achieved ? "bg-emerald-50 border border-emerald-200" : "bg-slate-100 hover:bg-blue-50"}`}>{s.achieved ? <CheckCircle size={16} className="text-emerald-600 shrink-0" /> : <Circle size={16} className="text-slate-400 shrink-0" />}<span className={`text-xs font-semibold ${s.achieved ? "text-emerald-700 line-through" : "text-slate-800"}`}>{s.skill}</span></button>))}</div>)}
                    </div>
                    {(ipSelected.required_tools || []).length > 0 && (<div className="bg-white border border-slate-200 rounded-2xl p-5"><h4 className="font-black text-sm mb-3">Required Tools</h4><ul className="space-y-1.5">{(ipSelected.required_tools || []).map((t, i) => (<li key={i} className="flex items-center gap-2 text-xs text-slate-800"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />{t}</li>))}</ul></div>)}
                    {(ipSelected.risk_strategies || []).length > 0 && (<div className="bg-amber-50 border border-amber-200 rounded-2xl p-5"><h4 className="font-black text-sm mb-3 text-amber-800">⚠️ Risk Strategies</h4><ul className="space-y-1.5">{(ipSelected.risk_strategies || []).map((r, i) => (<li key={i} className="flex items-start gap-2 text-xs text-amber-700"><span className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />{r}</li>))}</ul></div>)}
                    {ipSelected.session_structure && (<div className="bg-white border border-slate-200 rounded-2xl p-5"><h4 className="font-black text-sm mb-2">Session Structure</h4><p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{ipSelected.session_structure}</p></div>)}
                  </div>
                </div>
              </div>
            );
          }
          // LIST VIEW
          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div><h2 className="text-2xl font-black tracking-tight">Implementation Programs</h2><p className="text-slate-500 text-sm">Support worker phased implementation & skill tracking.</p></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => ipStartNew(IP_BRONWYN_TEMPLATE)} className="rounded-xl font-bold gap-2 text-sm"><BookOpen size={15} /> Import Bronwyn's Program</Button>
                  <Button onClick={() => ipStartNew()} className="rounded-xl font-bold gap-2"><Plus size={15} /> New Program</Button>
                </div>
              </div>
              {ipPrograms.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center"><ClipboardList size={48} className="text-slate-300 mx-auto mb-4" /><h3 className="font-black text-xl mb-2">No Programs Yet</h3><p className="text-slate-500 text-sm mb-6">Create a new program or import Bronwyn's existing program.</p><Button onClick={() => ipStartNew(IP_BRONWYN_TEMPLATE)} className="rounded-xl font-bold gap-2"><BookOpen size={15} /> Import Bronwyn's Program</Button></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{ipPrograms.map(prog => (<div key={prog.id} onClick={() => { setIpSelected(prog); setIpView("detail"); }} className="bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all"><div className="flex items-start justify-between gap-2 mb-3"><h3 className="font-black text-slate-900">{prog.participant_name}</h3><span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${prog.status === "Active" ? "bg-emerald-100 text-emerald-700" : prog.status === "Completed" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{prog.status}</span></div><p className="text-xs text-slate-500 mb-4 line-clamp-2">{prog.primary_goal}</p><div className="grid grid-cols-2 gap-3"><div className="bg-slate-100 rounded-xl p-3"><p className="text-xl font-black text-blue-600">{ipCompletedPhases(prog)}/{(prog.phases || []).length}</p><p className="text-[10px] font-bold text-slate-500 uppercase">Phases</p></div><div className="bg-slate-100 rounded-xl p-3"><p className="text-xl font-black text-emerald-600">{ipCompletedSkills(prog)}/{(prog.skill_targets || []).length}</p><p className="text-[10px] font-bold text-slate-500 uppercase">Skills</p></div></div><div className="mt-4"><div className="flex justify-between text-xs text-slate-500 mb-1"><span>Overall Progress</span><span>{(prog.skill_targets || []).length > 0 ? Math.round(ipCompletedSkills(prog) / (prog.skill_targets || []).length * 100) : 0}%</span></div><div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(prog.skill_targets || []).length > 0 ? Math.round(ipCompletedSkills(prog) / (prog.skill_targets || []).length * 100) : 0}%` }} /></div></div></div>))}</div>
              )}
            </div>
          );
        })()}

        {/* TRAVEL GUIDES TAB */}
        {activeTab === "travel" && (
          <div className="space-y-4">
            {(!participant.travel_itineraries || participant.travel_itineraries.length === 0) ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <Navigation size={36} className="text-slate-300 mx-auto mb-3" />
                <h3 className="font-black text-slate-800 mb-1">No Travel Guides Yet</h3>
                <p className="text-sm text-slate-500">Your support worker hasn't saved any travel guides to your profile yet.</p>
              </div>
            ) : (
              [...participant.travel_itineraries].reverse().map((guide, gi) => (
                <div key={gi} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-800 text-white px-5 py-4">
                    <h3 className="font-black">{guide.title || `${guide.origin} → ${guide.destination}`}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{guide.summary}</p>
                    <div className="flex gap-3 mt-2 text-xs text-slate-400">
                      <span>📅 Saved: {guide.saved_date ? new Date(guide.saved_date).toLocaleDateString("en-AU") : guide.generated_date}</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    {(guide.routes || []).map((route, ri) => (
                      <div key={ri} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="font-black text-sm text-slate-800">{route.label}</p>
                          <div className="flex gap-2 text-xs">
                            <span className="bg-slate-200 rounded px-2 py-0.5 font-bold">⏱ {route.total_time}</span>
                            <span className="bg-slate-200 rounded px-2 py-0.5 font-bold">💳 {route.total_cost}</span>
                          </div>
                        </div>
                        <div className="px-4 py-3 space-y-2">
                          {(route.steps || []).map((step, si) => (
                            <div key={si} className="flex gap-3 items-start">
                              <div className="w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{si + 1}</div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                  {step.line && <span className="text-[10px] font-black text-white px-1.5 py-0.5 rounded" style={{backgroundColor: step.type === "bus" ? "#002664" : step.type === "train" ? "#F0521F" : "#555"}}>{step.line}</span>}
                                  <p className="text-xs font-bold text-slate-800">{step.instruction}</p>
                                </div>
                                {step.detail && <p className="text-xs text-slate-500">{step.detail}</p>}
                              </div>
                              {step.duration && <span className="text-[10px] text-slate-400 shrink-0">⏱ {step.duration}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {guide.emergency_info && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                        <p className="text-xs font-black text-rose-700 mb-1">🆘 If You Need Help</p>
                        <p className="text-xs text-rose-600">{guide.emergency_info}</p>
                      </div>
                    )}
                    {guide.opal_info && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <p className="text-xs font-black text-slate-700 mb-1">💳 Opal Card</p>
                        <p className="text-xs text-slate-600">{guide.opal_info}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <p className="text-[10px] text-slate-400 text-center pb-4">
          Secured · NDIS PRO Participant Portal · Your data is encrypted and protected
        </p>
      </div>
    </div>
  );
}