import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PLAN_TYPES = ["Plan Managed", "Self Managed", "NDIA Managed", "Combination"];

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-xs font-bold text-slate-600">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Section({ title }) {
  return (
    <div className="col-span-2 pt-4 pb-1 border-b border-slate-200">
      <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{title}</p>
    </div>
  );
}

export default function OnboardingPublicForm() {
  const params = new URLSearchParams(window.location.search);
  const requestId = params.get("id");

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    participant_name: "",
    date_of_birth: "",
    ndis_number: "",
    phone: "",
    email: "",
    address: "",
    plan_type: "",
    primary_disability: "",
    medical_alerts: "",
    plan_coordinator_name: "",
    plan_coordinator_email: "",
    plan_coordinator_phone: "",
    parent_guardian_name: "",
    parent_guardian_phone: "",
    parent_guardian_email: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    additional_notes: "",
  });

  useEffect(() => {
    if (!requestId) { setLoading(false); return; }
    base44.entities.OnboardingRequest.filter({ id: requestId }).then((results) => {
      const req = results[0];
      if (req) {
        setRequest(req);
        if (req.status === "Completed") setSubmitted(true);
        setForm((prev) => ({ ...prev, participant_name: req.participant_name || "" }));
      }
      setLoading(false);
    });
  }, [requestId]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setSaving(true);
    await base44.entities.OnboardingRequest.update(requestId, {
      ...form,
      status: "Completed",
    });
    setSubmitted(true);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!requestId || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <p className="text-xl font-black text-slate-800">Invalid Form Link</p>
          <p className="text-slate-500 mt-2">This onboarding link is not valid or has expired.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Form Submitted!</h2>
          <p className="text-slate-500 mt-2">Thank you! Your information has been received. A team member will be in touch soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-8 text-white">
          <h1 className="text-2xl font-black mb-1">Participant Onboarding Form</h1>
          <p className="text-indigo-200 text-sm">Please fill in all sections below and submit.</p>
        </div>

        <div className="px-8 py-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Section title="Participant Details" />
            <Field label="Full Name">
              <Input value={form.participant_name} onChange={e => set("participant_name", e.target.value)} placeholder="Full legal name" />
            </Field>
            <Field label="Date of Birth">
              <Input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} />
            </Field>
            <Field label="NDIS Number">
              <Input value={form.ndis_number} onChange={e => set("ndis_number", e.target.value)} placeholder="43XXXXXXX" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="04XX XXX XXX" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
            </Field>
            <Field label="Plan Management Type">
              <select
                value={form.plan_type}
                onChange={e => set("plan_type", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Select...</option>
                {PLAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Home Address">
                <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street, Suburb, State, Postcode" />
              </Field>
            </div>

            <Section title="Health & Disability Information" />
            <div className="col-span-2">
              <Field label="Primary Disability / Diagnosis">
                <Input value={form.primary_disability} onChange={e => set("primary_disability", e.target.value)} placeholder="e.g. Autism Spectrum Disorder" />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Medical Alerts / Allergies / Medications">
                <Textarea value={form.medical_alerts} onChange={e => set("medical_alerts", e.target.value)} placeholder="List any medical alerts, allergies, or ongoing medications..." className="h-20" />
              </Field>
            </div>

            <Section title="Plan Coordinator" />
            <Field label="Plan Coordinator Name">
              <Input value={form.plan_coordinator_name} onChange={e => set("plan_coordinator_name", e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={form.plan_coordinator_phone} onChange={e => set("plan_coordinator_phone", e.target.value)} />
            </Field>
            <div className="col-span-2">
              <Field label="Email">
                <Input type="email" value={form.plan_coordinator_email} onChange={e => set("plan_coordinator_email", e.target.value)} />
              </Field>
            </div>

            <Section title="Parent / Guardian" />
            <Field label="Full Name">
              <Input value={form.parent_guardian_name} onChange={e => set("parent_guardian_name", e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={form.parent_guardian_phone} onChange={e => set("parent_guardian_phone", e.target.value)} />
            </Field>
            <div className="col-span-2">
              <Field label="Email">
                <Input type="email" value={form.parent_guardian_email} onChange={e => set("parent_guardian_email", e.target.value)} />
              </Field>
            </div>

            <Section title="Emergency Contact" />
            <Field label="Full Name">
              <Input value={form.emergency_contact_name} onChange={e => set("emergency_contact_name", e.target.value)} />
            </Field>
            <Field label="Relationship">
              <Input value={form.emergency_contact_relationship} onChange={e => set("emergency_contact_relationship", e.target.value)} placeholder="e.g. Mother, Carer" />
            </Field>
            <div className="col-span-2">
              <Field label="Phone">
                <Input value={form.emergency_contact_phone} onChange={e => set("emergency_contact_phone", e.target.value)} />
              </Field>
            </div>

            <Section title="Additional Information" />
            <div className="col-span-2">
              <Field label="Any other information we should know?">
                <Textarea value={form.additional_notes} onChange={e => set("additional_notes", e.target.value)} className="h-24" />
              </Field>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saving || !form.participant_name}
            className="w-full mt-8 rounded-xl font-bold py-6 text-base gap-2"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Submit Onboarding Form"}
          </Button>
        </div>

        <div className="bg-slate-50 px-8 py-4 text-center text-xs text-slate-400 border-t border-slate-200">
          This form is confidential. Your information is stored securely.
        </div>
      </div>
    </div>
  );
}