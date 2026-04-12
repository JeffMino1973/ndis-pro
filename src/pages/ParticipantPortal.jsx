import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  ShieldCheck, FileText, Receipt, ClipboardList, CheckCircle, PenLine,
  Loader2, User, Target, AlertTriangle, MessageSquareWarning, Navigation,
  ChevronRight, Phone, Mail, MapPin, Edit, Save, X, Plus, Star, Bus, Train
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
  { id: "risks", label: "Risk Assessments", icon: AlertTriangle },
  { id: "reports", label: "Reports & Travel", icon: Navigation },
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signingDoc, setSigningDoc] = useState(null);
  const [activeTab, setActiveTab] = useState("documents");

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Complaint form
  const [complaintForm, setComplaintForm] = useState({ complaint_type: "Service Delivery", description: "", priority: "Medium" });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

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

    const [agr, quo, inv, plans, risks, notes, comp] = await Promise.all([
      base44.entities.ServiceAgreement.filter({ participant_name: p.name }),
      base44.entities.Quote.filter({ participant_name: p.name }),
      base44.entities.Invoice.filter({ participant_name: p.name }),
      base44.entities.SupportPlan ? base44.entities.SupportPlan.filter({ participant_name: p.name }).catch(() => []) : Promise.resolve([]),
      base44.entities.RiskAssessment.filter({ participant_name: p.name }),
      base44.entities.ProgressNote.filter({ participant_name: p.name }, "-note_date", 20),
      base44.entities.Complaint.filter({ participant_name: p.name }, "-created_date"),
    ]);
    setAgreements(agr);
    setQuotes(quo);
    setInvoices(inv);
    setSupportPlans(plans || []);
    setRiskAssessments(risks);
    setProgressNotes(notes);
    setComplaints(comp);
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

      {/* Tab Nav */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto">
        <div className="flex min-w-max px-4">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {tab.id === "documents" && pendingCount > 0 && (
                  <span className="w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-black">{pendingCount}</span>
                )}
              </button>
            );
          })}
        </div>
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

            {agreements.length === 0 && quotes.length === 0 && invoices.length === 0 && supportPlans.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                <h3 className="font-black text-slate-800 mb-1">No Documents Yet</h3>
                <p className="text-sm text-slate-500">Your provider hasn't sent any documents yet. Check back soon.</p>
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
                <div className="space-y-3">
                  {participant.goals.map((goal, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                      <div className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">{goal}</p>
                    </div>
                  ))}
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

        {/* RISK ASSESSMENTS TAB */}
        {activeTab === "risks" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs text-amber-700 font-semibold">These risk assessments are shared with you and your family for transparency. They are managed by your support provider.</p>
            </div>
            {riskAssessments.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <AlertTriangle size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No risk assessments on file.</p>
              </div>
            ) : (
              riskAssessments.map(ra => (
                <div key={ra.id} className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-slate-900">{ra.activity_description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Assessor: {ra.assessor_name}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                      ra.overall_risk_level === "Low" ? "bg-emerald-100 text-emerald-700" :
                      ra.overall_risk_level === "Medium" ? "bg-amber-100 text-amber-700" :
                      ra.overall_risk_level === "High" ? "bg-orange-100 text-orange-700" :
                      "bg-rose-100 text-rose-700"
                    }`}>{ra.overall_risk_level} Risk</span>
                  </div>
                  {(ra.hazards || []).length > 0 && (
                    <div className="space-y-2">
                      {ra.hazards.map((h, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs">
                          <p className="font-bold text-slate-800">{h.hazard}</p>
                          {h.controls && <p className="text-slate-500 mt-1">Controls: {h.controls}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
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