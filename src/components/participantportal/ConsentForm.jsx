import { useState } from "react";
import {
  FileSignature, Download, Printer, CheckCircle2, ShieldCheck, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

const INFO_OPTIONS = [
  "Personal details (name, address, contact)",
  "NDIS plan details and goals",
  "Medical and health information",
  "Assessment and progress reports",
  "Behaviour support plans",
  "Incident reports",
  "Financial and billing information",
];

const PROVIDER_OPTIONS = [
  "Support Coordinator",
  "Plan Manager",
  "Local Area Coordinator (LAC)",
  "General Practitioner (GP)",
  "Medical specialist",
  "Allied health therapist",
  "Hospital / emergency services",
  "School / education provider",
];

const PURPOSE_OPTIONS = [
  "Service delivery and coordination",
  "Care and support planning",
  "Referrals to other providers",
  "Reporting and NDIS compliance",
  "Billing and payments",
];

const METHOD_OPTIONS = [
  "Email (encrypted / secure)",
  "Phone call",
  "Secure online portal",
  "Hard copy / post",
  "In person",
];

const ACKNOWLEDGEMENTS = [
  "I can choose what information may or may not be shared.",
  "Information should only be shared for the purposes authorised by this consent and handled securely and confidentially.",
  "I may ask what information has been shared and with whom, subject to applicable legal requirements.",
  "I may change or withdraw this consent at any time by notifying SZ-JIE Support Services.",
  "Withdrawal applies to future information sharing and does not ordinarily affect information already lawfully disclosed.",
  "Information may be disclosed where required or authorised by law.",
];

function CheckboxRow({ checked, onChange, label }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer py-1.5 group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 w-4 h-4 accent-primary shrink-0"
      />
      <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
    </label>
  );
}

function SectionCard({ number, title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
        <h3 className="font-black text-slate-800 flex items-center gap-2">
          <span className="text-slate-400">{number}.</span> {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function ConsentForm({ participant }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    participant_name: participant?.name || "",
    ndis_number: participant?.ndis_number || "",
    date_of_birth: participant?.date_of_birth || "",
    form_date: today,
    info: {},
    info_other: "",
    providers: {},
    specific_provider: "",
    purposes: {},
    purpose_other: "",
    methods: {},
    method_other: "",
    must_not_share: "",
    agreed: false,
    signed_by: "",
    signed_date: today,
    witness_name: "",
  });
  const [downloading, setDownloading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const toggle = (group, key) =>
    setForm(prev => ({ ...prev, [group]: { ...prev[group], [key]: !prev[group]?.[key] } }));

  const tick = (obj, val) => (obj?.[val] ? "☒" : "☐");

  const buildWordHtml = () => {
    const checked = (obj, val) => (obj?.[val] ? "☒" : "☐");
    const row = (label, val) =>
      `<tr><td style="padding:6px 0;font-weight:bold;color:#475569;width:40%;vertical-align:top;border-bottom:1px solid #e2e8f0;">${label}</td><td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">${val || "—"}</td></tr>`;

    const infoList = INFO_OPTIONS.map(o => `<div style="margin:2px 0;">${checked(form.info, o)} ${o}</div>`).join("");
    const provList = PROVIDER_OPTIONS.map(o => `<div style="margin:2px 0;">${checked(form.providers, o)} ${o}</div>`).join("");
    const purpList = PURPOSE_OPTIONS.map(o => `<div style="margin:2px 0;">${checked(form.purposes, o)} ${o}</div>`).join("");
    const methList = METHOD_OPTIONS.map(o => `<div style="margin:2px 0;">${checked(form.methods, o)} ${o}</div>`).join("");
    const ackList = ACKNOWLEDGEMENTS.map(a => `<li style="margin:6px 0;">${a}</li>`).join("");

    return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>Consent to Share Information and Documents</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; }
  h1 { font-size: 20px; color: #1e3a5f; text-align: center; margin-bottom: 2px; }
  h2 { font-size: 14px; color: #1e3a5f; margin-top: 22px; margin-bottom: 8px; border-bottom: 2px solid #1e3a5f; padding-bottom: 4px; }
  .sub { text-align: center; font-size: 13px; font-weight: bold; color: #475569; margin-bottom: 4px; }
  .intro { font-size: 11px; color: #475569; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  .sig-table td { padding: 14px 0; vertical-align: bottom; }
  .sig-line { border-bottom: 1.5px solid #1e293b; min-height: 28px; }
  .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #cbd5e1; font-size: 9px; color: #94a3b8; text-align: center; }
</style></head><body>

<h1>CONSENT TO SHARE INFORMATION AND DOCUMENTS</h1>
<p class="sub">NDIS Participant Consent Form</p>
<p class="intro">Use this form to record informed consent for SZ-JIE Support Services to share relevant information with authorised providers involved in the participant's supports.</p>

<h2>1. Participant Details</h2>
<table>
  ${row("Participant Name", form.participant_name)}
  ${row("NDIS Number", form.ndis_number)}
  ${row("Date of Birth", form.date_of_birth ? formatDate(form.date_of_birth) : "")}
  ${row("Date of Consent", form.form_date ? formatDate(form.form_date) : "")}
</table>

<h2>2. Information That May Be Shared</h2>
<p style="font-size:11px;color:#475569;margin-bottom:6px;">Tick all that apply.</p>
${infoList}
${form.info_other ? `<div style="margin:4px 0;">☐ Other: ${form.info_other}</div>` : `<div style="margin:4px 0;">☐ Other: __________________________</div>`}

<h2>3. Provider Types That May Receive or Provide Information</h2>
<p style="font-size:11px;color:#475569;margin-bottom:6px;">Tick all provider types that may receive or provide information.</p>
${provList}
<table style="margin-top:8px;">${row("Specific provider / organisation", form.specific_provider)}</table>

<h2>4. Purpose of Sharing</h2>
<p style="font-size:11px;color:#475569;margin-bottom:6px;">Tick all that apply.</p>
${purpList}
${form.purpose_other ? `<div style="margin:4px 0;">☐ Other purpose: ${form.purpose_other}</div>` : `<div style="margin:4px 0;">☐ Other purpose: __________________________</div>`}

<h2>5. Method of Sharing</h2>
<p style="font-size:11px;color:#475569;margin-bottom:6px;">Tick all that apply.</p>
${methList}
${form.method_other ? `<div style="margin:4px 0;">☐ Other method: ${form.method_other}</div>` : `<div style="margin:4px 0;">☐ Other method: __________________________</div>`}

<h2>6. Information That Must Not Be Shared</h2>
<p style="font-size:11px;color:#475569;margin-bottom:6px;">Enter any information or documents that must not be shared:</p>
<div style="border:1px solid #cbd5e1;padding:10px;min-height:50px;white-space:pre-wrap;">${form.must_not_share || ""}</div>

<h2>7. Acknowledgement</h2>
<ul style="padding-left:18px;">${ackList}</ul>

<h2>8. Signature</h2>
<table class="sig-table">
  <tr>
    <td style="width:55%;">
      <p style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;">Participant / Guardian Signature</p>
      <div class="sig-line">${form.signed_by ? `<span style="font-family:'Brush Script MT',cursive;font-size:18px;">${form.signed_by}</span>` : ""}</div>
      <p style="font-size:9px;color:#94a3b8;margin-top:2px;">${form.signed_by ? "" : "Type name above to sign"}</p>
    </td>
    <td style="width:5%;"></td>
    <td style="width:40%;">
      <p style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;">Date</p>
      <div class="sig-line">${form.signed_date ? formatDate(form.signed_date) : ""}</div>
    </td>
  </tr>
  <tr>
    <td>
      <p style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;">Witness Name (optional)</p>
      <div class="sig-line">${form.witness_name || ""}</div>
    </td>
    <td></td>
    <td>
      <p style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;">Provider Representative</p>
      <div class="sig-line">SZ-JIE Support Services</div>
    </td>
  </tr>
</table>

<div class="footer">SZ-JIE Support Services · NDIS Registered Provider · This consent is valid until withdrawn in writing. Confidential document.</div>

</body></html>`;
  };

  const handleDownloadWord = () => {
    setDownloading(true);
    try {
      const html = buildWordHtml();
      const blob = new Blob(["\ufeff", html], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Consent_Form_${(form.participant_name || "Participant").replace(/\s+/g, "_")}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const html = buildWordHtml();
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  const canSubmit = form.participant_name && form.signed_by && form.agreed;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="bg-primary rounded-2xl p-6 text-white">
        <h2 className="text-xl font-black mb-1 flex items-center gap-2"><FileSignature size={20} /> Consent to Share Information</h2>
        <p className="text-primary-foreground/80 text-sm">
          Complete this form to give informed consent for SZ-JIE Support Services to share your information with authorised providers. Fill it out online, then download as a Word document or print.
        </p>
      </div>

      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800 font-semibold">
            Thank you! Your consent form is complete. Download the Word document below to keep a copy or return it to your provider.
          </p>
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownloadWord} disabled={downloading} className="rounded-xl font-bold gap-2 flex-1 sm:flex-none">
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Download Word Document
        </Button>
        <Button onClick={handlePrint} variant="outline" className="rounded-xl font-bold gap-2 flex-1 sm:flex-none">
          <Printer size={16} /> Print
        </Button>
      </div>

      {/* 1. Participant Details */}
      <SectionCard number="1" title="Participant Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Participant Name</Label>
            <Input value={form.participant_name} onChange={e => set("participant_name", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">NDIS Number</Label>
            <Input value={form.ndis_number} onChange={e => set("ndis_number", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Date of Birth</Label>
            <Input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Date of Consent</Label>
            <Input type="date" value={form.form_date} onChange={e => set("form_date", e.target.value)} className="mt-1" />
          </div>
        </div>
      </SectionCard>

      {/* 2. Information to share */}
      <SectionCard number="2" title="Information That May Be Shared">
        <p className="text-xs text-slate-500 mb-3">Tick all that apply.</p>
        <div className="grid sm:grid-cols-2">
          {INFO_OPTIONS.map(o => (
            <CheckboxRow key={o} checked={!!form.info[o]} onChange={() => toggle("info", o)} label={o} />
          ))}
        </div>
        <div className="mt-3">
          <Label className="text-xs">Other</Label>
          <Input value={form.info_other} onChange={e => set("info_other", e.target.value)} placeholder="Specify other information..." className="mt-1" />
        </div>
      </SectionCard>

      {/* 3. Provider types */}
      <SectionCard number="3" title="Provider Types That May Receive or Provide Information">
        <p className="text-xs text-slate-500 mb-3">Tick all provider types that may receive or provide information.</p>
        <div className="grid sm:grid-cols-2">
          {PROVIDER_OPTIONS.map(o => (
            <CheckboxRow key={o} checked={!!form.providers[o]} onChange={() => toggle("providers", o)} label={o} />
          ))}
        </div>
        <div className="mt-3">
          <Label className="text-xs">Specific provider / organisation</Label>
          <Input value={form.specific_provider} onChange={e => set("specific_provider", e.target.value)} placeholder="Name a specific provider or organisation..." className="mt-1" />
        </div>
      </SectionCard>

      {/* 4. Purpose */}
      <SectionCard number="4" title="Purpose of Sharing">
        <p className="text-xs text-slate-500 mb-3">Tick all that apply.</p>
        <div className="grid sm:grid-cols-2">
          {PURPOSE_OPTIONS.map(o => (
            <CheckboxRow key={o} checked={!!form.purposes[o]} onChange={() => toggle("purposes", o)} label={o} />
          ))}
        </div>
        <div className="mt-3">
          <Label className="text-xs">Other purpose</Label>
          <Input value={form.purpose_other} onChange={e => set("purpose_other", e.target.value)} placeholder="Specify other purpose..." className="mt-1" />
        </div>
      </SectionCard>

      {/* 5. Method */}
      <SectionCard number="5" title="Method of Sharing">
        <p className="text-xs text-slate-500 mb-3">Tick all that apply.</p>
        <div className="grid sm:grid-cols-2">
          {METHOD_OPTIONS.map(o => (
            <CheckboxRow key={o} checked={!!form.methods[o]} onChange={() => toggle("methods", o)} label={o} />
          ))}
        </div>
        <div className="mt-3">
          <Label className="text-xs">Other method</Label>
          <Input value={form.method_other} onChange={e => set("method_other", e.target.value)} placeholder="Specify other method..." className="mt-1" />
        </div>
      </SectionCard>

      {/* 6. Must not share */}
      <SectionCard number="6" title="Information That Must Not Be Shared">
        <Label className="text-xs">Enter any information or documents that must not be shared</Label>
        <Textarea value={form.must_not_share} onChange={e => set("must_not_share", e.target.value)} placeholder="List any information or documents that should not be shared..." className="mt-1 min-h-[100px]" />
      </SectionCard>

      {/* 7. Acknowledgement */}
      <SectionCard number="7" title="Acknowledgement">
        <div className="space-y-3">
          {ACKNOWLEDGEMENTS.map((a, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agreed} onChange={e => set("agreed", e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary shrink-0" />
              <span className="text-sm text-slate-700">{a}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* 8. Signature */}
      <SectionCard number="8" title="Signature">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Participant / Guardian Name</Label>
            <Input
              value={form.signed_by}
              onChange={e => set("signed_by", e.target.value)}
              placeholder="Type your full name to sign..."
              className="mt-1 font-semibold"
              style={{ fontFamily: "cursive" }}
            />
          </div>
          <div>
            <Label className="text-xs">Date</Label>
            <Input type="date" value={form.signed_date} onChange={e => set("signed_date", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Witness Name (optional)</Label>
            <Input value={form.witness_name} onChange={e => set("witness_name", e.target.value)} placeholder="Witness full name..." className="mt-1" />
          </div>
        </div>
        <div className="mt-4 bg-slate-50 rounded-xl p-4 flex items-start gap-2">
          <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600">
            By signing, I confirm I have read and understood this consent. This consent remains valid until withdrawn in writing under the <em>Electronic Transactions Act 1999</em> (Cth).
          </p>
        </div>
      </SectionCard>

      {/* Final actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => { setSubmitted(true); handleDownloadWord(); }}
          disabled={!canSubmit || downloading}
          className="rounded-xl font-bold gap-2 flex-1"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Complete & Download Word Document
        </Button>
      </div>
      {!canSubmit && (
        <p className="text-xs text-slate-500 text-center">
          Please enter your name, tick the acknowledgement, and type your signature to complete the form.
        </p>
      )}
    </div>
  );
}