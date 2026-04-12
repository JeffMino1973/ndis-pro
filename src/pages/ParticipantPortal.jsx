import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, FileText, Receipt, ClipboardList, CheckCircle, PenLine, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Full Legal Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Type your full name to sign..."
              className="text-lg font-semibold"
              style={{ fontFamily: "cursive" }}
            />
            <p className="text-[10px] text-slate-400 mt-1">This will serve as your electronic signature.</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
            By signing, I confirm that I have read, understood and agree to the terms of this document. I understand that my typed name constitutes a legally binding electronic signature under the <em>Electronic Transactions Act 1999</em> (Cth).
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue-600" />
            <span className="text-sm text-slate-700">I have read and agree to the terms of this document.</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
            <Button
              onClick={handleSign}
              disabled={!name || !agreed || signing}
              className="flex-1 rounded-xl font-bold gap-2"
            >
              {signing ? <Loader2 size={15} className="animate-spin" /> : <PenLine size={15} />}
              Sign &amp; Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocCard({ icon: Icon, color, title, number, date, total, status, signed, signedBy, signedAt, onSign, onView, signable }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="p-5 flex items-start justify-between gap-4">
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
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
            <CheckCircle size={13} />
            <span>Signed by <strong>{signedBy}</strong> on {new Date(signedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      )}

      <div className="px-5 pb-5 flex gap-2">
        {signable && !signed && (
          <Button onClick={onSign} size="sm" className="rounded-xl gap-1.5 font-bold flex-1">
            <PenLine size={13} /> Sign &amp; Accept
          </Button>
        )}
        {signed && (
          <div className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl py-2">
            <CheckCircle size={13} /> Signed
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParticipantPortal() {
  const [ndisNumber, setNdisNumber] = useState("");
  const [participant, setParticipant] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signingDoc, setSigningDoc] = useState(null); // { type, id, label }

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

    const [agr, quo, inv] = await Promise.all([
      base44.entities.ServiceAgreement.filter({ participant_name: p.name }),
      base44.entities.Quote.filter({ participant_name: p.name }),
      base44.entities.Invoice.filter({ participant_name: p.name }),
    ]);
    setAgreements(agr);
    setQuotes(quo);
    setInvoices(inv);
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
          <p className="text-slate-500 text-sm mb-8">Enter your NDIS number to access your documents, service agreements, quotes and invoices.</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">NDIS Number</label>
              <Input
                value={ndisNumber}
                onChange={e => setNdisNumber(e.target.value)}
                placeholder="e.g. 123456789"
                onKeyDown={e => e.key === "Enter" && handleLookup()}
                className="h-12 text-lg"
              />
            </div>
            {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>}
            <Button onClick={handleLookup} disabled={!ndisNumber || loading} className="w-full h-12 rounded-xl font-bold text-base gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              Access My Documents
            </Button>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-6">Your information is protected and only accessible with your NDIS number.</p>
        </div>
      </div>
    );
  }

  const pendingAgreements = agreements.filter(a => !a.signed_by && ["Draft", "Active"].includes(a.status));
  const pendingQuotes = quotes.filter(q => !q.signed_by && ["Sent", "Draft"].includes(q.status));
  const pendingInvoices = invoices.filter(i => !i.acknowledged_by && ["Sent", "Paid", "Overdue"].includes(i.status));
  const pendingCount = pendingAgreements.length + pendingQuotes.length + pendingInvoices.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {signingDoc && (
        <SignatureModal
          docLabel={signingDoc.label}
          onSign={handleSign}
          onCancel={() => setSigningDoc(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
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
          <div className="text-right">
            <p className="font-black text-slate-900 text-sm">{participant.name}</p>
            <p className="text-[10px] text-slate-500">NDIS: {participant.ndis_number}</p>
          </div>
          <button onClick={() => { setParticipant(null); setNdisNumber(""); }} className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg">Sign Out</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 py-8">
        {/* Welcome banner */}
        <div className="bg-primary rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-black mb-1">Hello, {participant.name.split(" ")[0]}!</h2>
          <p className="text-primary-foreground/80 text-sm">
            {pendingCount > 0
              ? `You have ${pendingCount} document${pendingCount > 1 ? "s" : ""} awaiting your signature.`
              : "All your documents are up to date."}
          </p>
        </div>

        {/* Service Agreements */}
        {agreements.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-purple-600" />
              <h3 className="font-black text-slate-800">Service Agreements</h3>
              <span className="text-[10px] font-bold text-slate-400">{agreements.length}</span>
            </div>
            <div className="space-y-3">
              {agreements.map(a => (
                <DocCard
                  key={a.id}
                  icon={FileText}
                  color="bg-purple-100 text-purple-700"
                  title={`Service Agreement`}
                  number={`${a.start_date || "—"} → ${a.end_date || "Ongoing"}`}
                  date={a.start_date || ""}
                  status={a.status}
                  signed={!!a.signed_by}
                  signedBy={a.signed_by}
                  signedAt={a.signed_at}
                  signable={true}
                  onSign={() => setSigningDoc({ type: "agreement", id: a.id, label: `Service Agreement — ${a.participant_name}` })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Quotes */}
        {quotes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={16} className="text-blue-600" />
              <h3 className="font-black text-slate-800">Quotes</h3>
              <span className="text-[10px] font-bold text-slate-400">{quotes.length}</span>
            </div>
            <div className="space-y-3">
              {quotes.map(q => (
                <DocCard
                  key={q.id}
                  icon={ClipboardList}
                  color="bg-blue-100 text-blue-700"
                  title={`Quote ${q.quote_number}`}
                  number={q.quote_number}
                  date={q.issue_date}
                  total={q.total}
                  status={q.status}
                  signed={!!q.signed_by}
                  signedBy={q.signed_by}
                  signedAt={q.signed_at}
                  signable={["Sent", "Draft"].includes(q.status)}
                  onSign={() => setSigningDoc({ type: "quote", id: q.id, label: `Quote ${q.quote_number}` })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Invoices */}
        {invoices.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Receipt size={16} className="text-emerald-600" />
              <h3 className="font-black text-slate-800">Invoices</h3>
              <span className="text-[10px] font-bold text-slate-400">{invoices.length}</span>
            </div>
            <div className="space-y-3">
              {invoices.map(inv => (
                <DocCard
                  key={inv.id}
                  icon={Receipt}
                  color="bg-emerald-100 text-emerald-700"
                  title={`Invoice ${inv.invoice_number}`}
                  number={inv.invoice_number}
                  date={inv.issue_date}
                  total={inv.total}
                  status={inv.status}
                  signed={!!inv.acknowledged_by}
                  signedBy={inv.acknowledged_by}
                  signedAt={inv.acknowledged_at}
                  signable={["Sent", "Paid", "Overdue"].includes(inv.status)}
                  onSign={() => setSigningDoc({ type: "invoice", id: inv.id, label: `Invoice ${inv.invoice_number}` })}
                />
              ))}
            </div>
          </section>
        )}

        {agreements.length === 0 && quotes.length === 0 && invoices.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="font-black text-slate-800 mb-1">No Documents Yet</h3>
            <p className="text-sm text-slate-500">Your provider hasn't sent any documents yet. Check back soon.</p>
          </div>
        )}

        <p className="text-[10px] text-slate-400 text-center pb-4">
          Secured · NDIS PRO Participant Portal · Your data is encrypted and protected
        </p>
      </div>
    </div>
  );
}