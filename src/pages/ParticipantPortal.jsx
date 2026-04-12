import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  ShieldCheck, FileText, Receipt, ClipboardList, CheckCircle, PenLine,
  Loader2, User, Target, AlertTriangle, MessageSquareWarning, Navigation, Pencil,
  ChevronRight, Phone, Mail, MapPin, Edit, Save, X, Plus, Star, Bus, Train, Brain, Heart, Download, Trash2, File, Circle, Menu, Pill
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    setAgreements(agr);
    setQuotes(quo);
    setInvoices(inv);
    setSupportPlans(plans || []);
    setRiskAssessments(risks);
    setProgressNotes(notes);
    setComplaints(comp);
    setMedications(meds || []);
    setEpilepsyPlans(epilepsy || []);
    setPbsps(pbsp || []);
    setHealthPlans(hcp || []);
    setParticipantDocuments(docs || []);
    setImplementationPrograms(impPrograms || []);
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

        {/* RISK ASSESSMENTS TAB - FULL DOCUMENT */}
        {activeTab === "risks" && (
          <div className="space-y-4">
            {riskAssessments.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <AlertTriangle size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No risk assessments on file.</p>
              </div>
            ) : (
              riskAssessments.map(ra => {
                const RISK_COLORS = { Low: "bg-emerald-100 text-emerald-800", Medium: "bg-orange-100 text-orange-800", High: "bg-red-100 text-red-800", Extreme: "bg-red-900 text-white" };
                return (
                  <div key={ra.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="border-b border-slate-200">
                      <div className="bg-slate-800 text-white px-6 py-6">
                        <h1 className="text-2xl font-black text-white mb-2">Risk Assessment</h1>
                        <p className="text-slate-300 text-sm">{ra.activity_description || ra.title}</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 px-6 py-4 border-t border-slate-200">
                        {[{l: "Participant", v: ra.participant_name}, {l: "From", v: ra.home_address}, {l: "To", v: ra.destination}, {l: "Date", v: ra.assessment_date}].filter(f => f.v).map(f => (
                          <div key={f.l}>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{f.l}</p>
                            <p className="text-sm font-bold text-slate-900">{f.v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-5 h-5 bg-slate-800 text-white rounded text-[10px] flex items-center justify-center">1</span> Comprehensive Risk Assessment</h2>
                        <div className="space-y-3">
                          {(ra.hazards || []).map((h, i) => (
                            <div key={i} className="border border-slate-200 rounded-xl p-4">
                              <p className="font-bold text-slate-900 mb-2">{h.hazard}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                <div className="bg-slate-50 rounded p-2"><p className="text-[10px] font-black text-slate-400 uppercase">Initial</p><span className={`text-[10px] font-black ${RISK_COLORS[h.initial_rating]}`}>{h.initial_rating}</span></div>
                                <div className="bg-slate-50 rounded p-2"><p className="text-[10px] font-black text-slate-400 uppercase">Likelihood</p><p className="text-xs font-bold">{h.initial_likelihood}</p></div>
                                <div className="bg-slate-50 rounded p-2"><p className="text-[10px] font-black text-slate-400 uppercase">Consequence</p><p className="text-xs font-bold">{h.initial_consequence}</p></div>
                              </div>
                              {h.controls && <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs"><p className="font-black text-blue-700 mb-1">Control Measures</p><p className="text-blue-800">{h.controls}</p></div>}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                                <div className="bg-slate-50 rounded p-2"><p className="text-[10px] font-black text-slate-400 uppercase">Residual</p><span className={`text-[10px] font-black ${RISK_COLORS[h.residual_rating]}`}>{h.residual_rating}</span></div>
                                <div className="bg-slate-50 rounded p-2"><p className="text-[10px] font-black text-slate-400 uppercase">Likelihood</p><p className="text-xs font-bold">{h.residual_likelihood}</p></div>
                                <div className="bg-slate-50 rounded p-2"><p className="text-[10px] font-black text-slate-400 uppercase">Consequence</p><p className="text-xs font-bold">{h.residual_consequence}</p></div>
                                {h.person_responsible && <div className="bg-slate-50 rounded p-2"><p className="text-[10px] font-black text-slate-400 uppercase">Responsible</p><p className="text-xs font-bold text-slate-800">{h.person_responsible}</p></div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-800 text-white p-4 rounded-xl flex justify-between items-center">
                        <p className="text-xs font-black uppercase">Overall Residual Risk</p>
                        <span className={`px-4 py-2 rounded-full text-sm font-black ${RISK_COLORS[ra.overall_risk_level]}`}>{ra.overall_risk_level}</span>
                      </div>
                      {(ra.emergency_contact_1_name || ra.emergency_contact_2_name) && (
                        <div>
                          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Emergency Management</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ra.emergency_contact_1_name && <div className="bg-orange-50 border border-orange-200 rounded-xl p-4"><p className="font-black text-orange-800 text-sm">{ra.emergency_contact_1_name}</p><p className="text-xs text-orange-700">{ra.emergency_contact_1_rel} — {ra.emergency_contact_1_phone}</p></div>}
                            {ra.emergency_contact_2_name && <div className="bg-orange-50 border border-orange-200 rounded-xl p-4"><p className="font-black text-orange-800 text-sm">{ra.emergency_contact_2_name}</p><p className="text-xs text-orange-700">{ra.emergency_contact_2_rel} — {ra.emergency_contact_2_phone}</p></div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* REPORTS & TRAVEL TAB */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            {progressNotes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <Navigation size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No reports or session notes available yet.</p>
              </div>
            ) : (
              progressNotes.map(n => (
                <div key={n.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{n.template_type}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${n.status === "Finalised" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{n.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{n.note_date} · {n.staff_name}</p>
                  </div>
                  {n.activities_delivered && (
                    <div className="mt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Activities</p>
                      <p className="text-sm text-slate-700">{n.activities_delivered}</p>
                    </div>
                  )}
                  {n.outcomes && (
                    <div className="mt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outcomes</p>
                      <p className="text-sm text-slate-700">{n.outcomes}</p>
                    </div>
                  )}
                  {n.service_location && (
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><MapPin size={10} /> {n.service_location}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* HEALTH SUPPORT PLAN TAB - FULL DOCUMENT */}
        {activeTab === "health" && (
          <div className="space-y-4">
            {healthPlans.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <Heart size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No health support plan on file.</p>
              </div>
            ) : healthPlans.map(plan => (
              <div key={plan.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-emerald-700 text-white px-6 py-8">
                  <h1 className="text-2xl font-black mb-1">Individual Health Support Plan (IHSP)</h1>
                  <p className="text-emerald-200">Comprehensive health care documentation</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 px-6 py-4 border-t border-slate-200">
                  {[{l: "Participant", v: plan.participant_name}, {l: "NDIS", v: plan.ndis_number}, {l: "DOB", v: plan.date_of_birth}, {l: "Status", v: plan.status}].filter(f => f.v).map(f => (
                    <div key={f.l}><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{f.l}</p><p className="text-sm font-bold text-slate-900">{f.v}</p></div>
                  ))}
                </div>
                <div className="p-6 space-y-6">
                  {plan.health_conditions && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Health Conditions</h2><div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200">{plan.health_conditions}</div></div>}
                  {plan.doctor_name && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Healthcare Providers</h2><div className="space-y-2"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div className="bg-slate-50 rounded-xl p-4 border border-slate-200"><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Doctor / GP</p><p className="text-sm font-bold text-slate-900">{plan.doctor_name}</p>{plan.doctor_phone && <p className="text-xs text-slate-600 mt-1">{plan.doctor_phone}</p>}{plan.doctor_address && <p className="text-xs text-slate-600">{plan.doctor_address}</p>}</div>{plan.parent_carer_name && <div className="bg-slate-50 rounded-xl p-4 border border-slate-200"><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Parent / Carer</p><p className="text-sm font-bold text-slate-900">{plan.parent_carer_name}</p>{plan.parent_carer_phone && <p className="text-xs text-slate-600 mt-1">{plan.parent_carer_phone}</p>}</div>}</div></div></div>}
                  {plan.medications && plan.medications.length > 0 && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Current Medications</h2><div className="space-y-2">{plan.medications.map((m, i) => <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200"><p className="font-bold text-slate-900">{m.name} — {m.dose}</p><div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-600"><p><span className="font-black">Frequency:</span> {m.frequency}</p><p><span className="font-black">Route:</span> {m.route}</p>{m.time && <p className="col-span-2"><span className="font-black">Time:</span> {m.time}</p>}</div>{m.notes && <p className="text-xs text-slate-600 mt-2 italic">{m.notes}</p>}</div>)}</div></div>}
                  {plan.health_support_procedures && <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><p className="text-sm font-black text-blue-700 mb-2 uppercase tracking-widest">Health Support Procedures</p><p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">{plan.health_support_procedures}</p></div>}
                  {plan.emergency_response && <div className="bg-rose-50 border border-rose-200 rounded-xl p-4"><p className="text-sm font-black text-rose-700 mb-2 uppercase tracking-widest">Emergency Response Plan</p><p className="text-sm text-rose-800 leading-relaxed whitespace-pre-line">{plan.emergency_response}</p></div>}
                  {plan.emergency_alert && <div className="bg-amber-50 border border-amber-300 rounded-xl p-4"><p className="text-sm font-black text-amber-800 uppercase tracking-widest">⚠️ Medical Alerts</p><p className="text-sm text-amber-900 font-semibold mt-2">{plan.emergency_alert}</p></div>}
                  {(plan.emergency_contact_name || plan.parent_carer_name) && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Emergency Contacts</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{plan.emergency_contact_name && <div className="bg-orange-50 border border-orange-200 rounded-xl p-4"><p className="text-[10px] font-black text-orange-700 uppercase mb-1">Emergency Contact</p><p className="text-sm font-bold text-orange-900">{plan.emergency_contact_name}</p><p className="text-xs text-orange-800 mt-1">{plan.emergency_contact_relationship}</p>{plan.emergency_contact_phone && <p className="text-xs text-orange-800">{plan.emergency_contact_phone}</p>}</div>}{plan.parent_carer_name && <div className="bg-orange-50 border border-orange-200 rounded-xl p-4"><p className="text-[10px] font-black text-orange-700 uppercase mb-1">Parent / Carer</p><p className="text-sm font-bold text-orange-900">{plan.parent_carer_name}</p>{plan.parent_carer_phone && <p className="text-xs text-orange-800 mt-1">{plan.parent_carer_phone}</p>}{plan.parent_carer_email && <p className="text-xs text-orange-800">{plan.parent_carer_email}</p>}</div>}</div></div>}
                  {plan.review_date && <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center"><p className="text-sm font-black">Next Review</p><p className="text-lg font-bold">{plan.review_date}</p></div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MEDICATIONS TAB - FULL DOCUMENT */}
        {activeTab === "medications" && (
          <div className="space-y-4">
            {medications.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <Pill size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No medications on file.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map(med => (
                  <div key={med.id} className={`bg-white border rounded-2xl overflow-hidden ${med.is_rescue ? "border-rose-300 shadow-lg" : "border-slate-200"}`}>
                    <div className={`px-6 py-4 text-white ${med.is_rescue ? "bg-rose-600" : "bg-slate-700"}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-black">{med.medication_name}</h3>
                          <p className="text-xs opacity-90 mt-0.5">{med.generic_name && `(${med.generic_name})`}</p>
                        </div>
                        {med.is_rescue && <span className="bg-white text-rose-600 font-black text-[11px] px-3 py-1 rounded-full">🚨 RESCUE</span>}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-[10px] font-black text-slate-500 uppercase">Dose</p>
                          <p className="text-sm font-bold text-slate-900 mt-1">{med.dose}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-[10px] font-black text-slate-500 uppercase">Route</p>
                          <p className="text-sm font-bold text-slate-900 mt-1">{med.route}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-[10px] font-black text-slate-500 uppercase">Frequency</p>
                          <p className="text-sm font-bold text-slate-900 mt-1">{med.frequency}</p>
                        </div>
                        {med.prescriber && <div className="bg-slate-50 rounded-lg p-3"><p className="text-[10px] font-black text-slate-500 uppercase">Prescriber</p><p className="text-sm font-bold text-slate-900 mt-1">{med.prescriber}</p></div>}
                        {med.start_date && <div className="bg-slate-50 rounded-lg p-3"><p className="text-[10px] font-black text-slate-500 uppercase">Start Date</p><p className="text-sm font-bold text-slate-900 mt-1">{med.start_date}</p></div>}
                        <div className="bg-slate-50 rounded-lg p-3"><p className="text-[10px] font-black text-slate-500 uppercase">Status</p><p className={`text-sm font-bold mt-1 ${med.status === "Active" ? "text-emerald-700" : "text-slate-600"}`}>{med.status}</p></div>
                      </div>
                      {med.indication && <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Indication / Purpose</p><p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{med.indication}</p></div>}
                      {med.is_rescue && med.rescue_instructions && <div className="bg-rose-50 border border-rose-200 rounded-lg p-4"><p className="text-[10px] font-black text-rose-700 uppercase mb-2">🚨 Rescue Instructions</p><p className="text-sm text-rose-800 leading-relaxed">{med.rescue_instructions}</p></div>}
                      {med.side_effects && <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><p className="text-[10px] font-black text-amber-700 uppercase mb-2">Side Effects</p><p className="text-sm text-amber-800">{med.side_effects}</p></div>}
                      {med.storage && <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Storage</p><p className="text-sm text-slate-700">{med.storage}</p></div>}
                      {med.dose_logs && med.dose_logs.length > 0 && <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Recent Dose Log</p><div className="space-y-1 max-h-32 overflow-y-auto">{[...(med.dose_logs || [])].reverse().slice(0, 5).map((log, i) => <div key={i} className="bg-slate-50 rounded p-2 text-xs"><p className="font-bold text-slate-800">{new Date(log.given_at).toLocaleDateString("en-AU")} {new Date(log.given_at).toLocaleTimeString("en-AU", {hour: "2-digit", minute: "2-digit"})}</p><p className="text-slate-600">{log.dose_given} · {log.given_by}</p></div>)}</div></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EPILEPSY PLAN TAB - FULL DOCUMENT */}
        {activeTab === "epilepsy" && (
          <div className="space-y-6 max-w-4xl">
            {epilepsyPlans.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
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

                {/* 8. Signatures */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <h2 className="font-black text-lg mb-6 border-b pb-2">✍️ 8. APPROVAL & SIGN-OFF</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                    <div className="border-t border-slate-300 pt-2">
                      <p className="text-xs font-black text-slate-500 uppercase">Practitioner</p>
                      <div className="h-12"></div>
                    </div>
                    <div className="border-t border-slate-300 pt-2">
                      <p className="text-xs font-black text-slate-500 uppercase">Doctor / Neurologist</p>
                      <div className="h-12"></div>
                    </div>
                    <div className="border-t border-slate-300 pt-2">
                      <p className="text-xs font-black text-slate-500 uppercase">Support Worker</p>
                      <div className="h-12"></div>
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
                  {plan.social_story_steps && plan.social_story_steps.length > 0 && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Social Story</h2><div className="space-y-2">{plan.social_story_steps.map((step, i) => <div key={i} className="flex gap-3 bg-slate-50 p-3 rounded-lg"><span className="w-6 h-6 bg-slate-800 text-white rounded text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span><p className="text-sm text-slate-700">{step}</p></div>)}</div></div>}
                  {plan.review_notes && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">Review & Ethics Notes</p><p className="text-sm text-amber-800">{plan.review_notes}</p></div>}
                </div>
              </div>
            ))}
          </div>
        )}

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

        {/* IMPLEMENTATION PROGRAMS TAB - FULL DOCUMENT */}
        {activeTab === "implementation" && (
          <div className="space-y-4">
            {implementationPrograms.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <ClipboardList size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No implementation programs on file.</p>
              </div>
            ) : (
              implementationPrograms.map(program => (
                <div key={program.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-blue-700 text-white px-6 py-8">
                    <h1 className="text-2xl font-black mb-1">{program.primary_goal}</h1>
                    <p className="text-blue-200">Implementation Program</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 px-6 py-4 border-t border-slate-200">
                    {[{l: "Participant", v: program.participant_name}, {l: "Focus", v: program.focus}, {l: "Start Date", v: program.start_date}, {l: "Status", v: program.status}].filter(f => f.v).map(f => (
                      <div key={f.l}><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{f.l}</p><p className="text-sm font-bold text-slate-900">{f.v}</p></div>
                    ))}
                  </div>
                  <div className="p-6 space-y-6">
                    {program.program_overview && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Program Overview</h2><p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4">{program.program_overview}</p></div>}
                    {program.phases && program.phases.length > 0 && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Implementation Phases</h2><div className="space-y-3">{program.phases.map((phase, idx) => <div key={idx} className="border border-slate-200 rounded-xl p-4"><div className="flex items-center justify-between mb-2"><p className="font-bold text-slate-900">Phase {phase.phase_number}: {phase.name}</p>{phase.completed && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Completed</span>}</div><div className="grid grid-cols-3 gap-3 text-xs"><div className="bg-slate-50 rounded p-2"><p className="font-black text-slate-500 uppercase text-[10px]">Duration</p><p className="font-bold text-slate-800">{phase.weeks}</p></div><div className="bg-slate-50 rounded p-2"><p className="font-black text-slate-500 uppercase text-[10px]">Support Level</p><p className="font-bold text-slate-800">{phase.support_level}</p></div><div className="bg-slate-50 rounded p-2"><p className="font-black text-slate-500 uppercase text-[10px]">Worker Role</p><p className="font-bold text-slate-800">{phase.worker_role || "—"}</p></div></div>{phase.goal && <p className="text-xs text-slate-600 mt-2"><span className="font-bold">Goal:</span> {phase.goal}</p>}</div>)}</div></div>}
                    {program.skill_targets && program.skill_targets.length > 0 && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Skill Development Targets</h2><div className="space-y-1.5">{program.skill_targets.map((target, idx) => <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-lg">{target.achieved ? <CheckCircle size={14} className="text-emerald-600 shrink-0" /> : <Circle size={14} className="text-slate-400 shrink-0" />}<span className="text-sm text-slate-700">{target.skill}</span></div>)}</div></div>}
                    {program.required_tools && program.required_tools.length > 0 && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Required Tools</h2><div className="bg-slate-50 rounded-xl p-4"><ul className="space-y-1 text-sm text-slate-700">{program.required_tools.map((t, i) => <li key={i} className="flex gap-2"><span>•</span>{t}</li>)}</ul></div></div>}
                    {program.session_logs && program.session_logs.length > 0 && <div><h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Session History</h2><div className="space-y-2">{program.session_logs.slice(-5).reverse().map((log, i) => <div key={i} className="border border-slate-200 rounded-lg p-3 text-xs"><p className="font-bold text-slate-800">{log.date} — Phase {log.phase}</p>{log.participant_response && <p className="text-slate-600 mt-1"><span className="font-bold">Response:</span> {log.participant_response}</p>}{log.logged_by && <p className="text-slate-500 mt-1 text-[10px]">By {log.logged_by}</p>}</div>)}</div></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* LODGE COMPLAINT TAB */}
        {activeTab === "complaint" && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-black text-slate-900 text-lg mb-2">Lodge a Complaint</h3>
              <p className="text-sm text-slate-500 mb-5">Your feedback is important. All complaints are reviewed by our management team within 2 business days.</p>

              {complaintSubmitted && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 flex items-center gap-2 text-emerald-700">
                  <CheckCircle size={16} />
                  <p className="text-sm font-bold">Complaint submitted successfully. We'll be in touch soon.</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Type of Complaint</Label>
                  <select
                    value={complaintForm.complaint_type}
                    onChange={e => setComplaintForm({ ...complaintForm, complaint_type: e.target.value })}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {["Service Delivery", "Staff Conduct", "Communication", "Billing", "Safety", "Other"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Priority</Label>
                  <select
                    value={complaintForm.priority}
                    onChange={e => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {["Low", "Medium", "High", "Critical"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</Label>
                  <textarea
                    value={complaintForm.description}
                    onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                    placeholder="Please describe your concern in detail..."
                    className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[120px]"
                  />
                </div>
                <Button onClick={submitComplaint} disabled={!complaintForm.description || submittingComplaint} className="w-full rounded-xl font-bold gap-2">
                  {submittingComplaint ? <Loader2 size={15} className="animate-spin" /> : <MessageSquareWarning size={15} />}
                  Submit Complaint
                </Button>
              </div>
            </div>

            {complaints.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-black text-slate-900 mb-4">My Previous Complaints</h3>
                <div className="space-y-3">
                  {complaints.map(c => (
                    <div key={c.id} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-slate-800 text-sm">{c.complaint_type}</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusColor[c.status] || "bg-slate-100 text-slate-600"}`}>{c.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">{c.date_received}</p>
                      <p className="text-xs text-slate-600">{c.description}</p>
                      {c.resolution && <p className="text-xs text-emerald-700 mt-2 font-semibold">Resolution: {c.resolution}</p>}
                    </div>
                  ))}
                </div>
              </div>
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