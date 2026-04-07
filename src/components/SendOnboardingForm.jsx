import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FORM_HTML = (participantName, providerName) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 0; }
  .container { max-width: 640px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
  .header { background: #4338ca; color: white; padding: 32px 40px; }
  .header h1 { margin: 0 0 6px; font-size: 22px; }
  .header p { margin: 0; opacity: 0.85; font-size: 14px; }
  .body { padding: 32px 40px; }
  .section-title { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 28px 0 16px; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 4px; }
  .field .line { border-bottom: 1.5px solid #cbd5e1; height: 28px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
  .footer { background: #f1f5f9; padding: 20px 40px; text-align: center; font-size: 12px; color: #94a3b8; }
  .alert { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #92400e; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>${providerName || "NDIS Provider"} — Participant Onboarding</h1>
    <p>Please complete this form for: <strong>${participantName}</strong></p>
  </div>
  <div class="body">
    <div class="alert">📋 Please fill out all sections below, then reply to this email with the completed form or scan and send back.</div>

    <div class="section-title">Participant Details</div>
    <div class="grid">
      <div class="field"><label>Full Name</label><div class="line"></div></div>
      <div class="field"><label>Date of Birth</label><div class="line"></div></div>
      <div class="field"><label>NDIS Number</label><div class="line"></div></div>
      <div class="field"><label>Phone</label><div class="line"></div></div>
      <div class="field"><label>Email</label><div class="line"></div></div>
      <div class="field"><label>Plan Management Type</label><div class="line"></div></div>
    </div>
    <div class="field"><label>Home Address</label><div class="line"></div></div>

    <div class="section-title">Health & Disability Information</div>
    <div class="field"><label>Primary Disability / Diagnosis</label><div class="line"></div></div>
    <div class="field"><label>Medical Alerts / Allergies / Medications</label><div class="line"></div><div class="line" style="margin-top:8px"></div></div>

    <div class="section-title">Plan Coordinator</div>
    <div class="grid">
      <div class="field"><label>Plan Coordinator Name</label><div class="line"></div></div>
      <div class="field"><label>Organisation</label><div class="line"></div></div>
      <div class="field"><label>Phone</label><div class="line"></div></div>
      <div class="field"><label>Email</label><div class="line"></div></div>
    </div>

    <div class="section-title">Parent / Guardian Details</div>
    <div class="grid">
      <div class="field"><label>Full Name</label><div class="line"></div></div>
      <div class="field"><label>Relationship to Participant</label><div class="line"></div></div>
      <div class="field"><label>Phone</label><div class="line"></div></div>
      <div class="field"><label>Email</label><div class="line"></div></div>
    </div>

    <div class="section-title">Emergency Contact</div>
    <div class="grid">
      <div class="field"><label>Full Name</label><div class="line"></div></div>
      <div class="field"><label>Relationship</label><div class="line"></div></div>
      <div class="field"><label>Phone (Primary)</label><div class="line"></div></div>
      <div class="field"><label>Phone (Secondary)</label><div class="line"></div></div>
    </div>

    <div class="section-title">Additional Information</div>
    <div class="field"><label>Any other information we should know?</label>
      <div class="line"></div>
      <div class="line" style="margin-top:8px"></div>
      <div class="line" style="margin-top:8px"></div>
    </div>

    <p style="margin-top:28px; font-size:13px; color:#475569;">
      Once complete, please reply to this email with your filled form. A team member will be in touch to confirm your details and next steps.
    </p>
  </div>
  <div class="footer">${providerName || "NDIS Provider"} · Confidential Participant Information</div>
</div>
</body>
</html>
`;

export default function SendOnboardingForm({ participantName, onClose }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setSending(true);
    const me = await base44.auth.me();
    const providerName = me?.businessConfig?.businessName || "NDIS Provider";

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Participant Onboarding Form — ${participantName}`,
      body: FORM_HTML(participantName, providerName),
    });

    await base44.entities.OnboardingRequest.create({
      participant_name: participantName,
      sent_to_email: email,
      status: "Sent",
    });

    setSending(false);
    setSent(true);
  };

  return (
    <div className="space-y-4">
      {sent ? (
        <div className="text-center py-6 space-y-3">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Send size={24} className="text-emerald-600" />
          </div>
          <p className="font-black text-foreground">Onboarding form sent!</p>
          <p className="text-sm text-muted-foreground">A form was emailed to <strong>{email}</strong>. You can track replies in Onboarding Requests.</p>
          <Button onClick={onClose} className="rounded-xl font-bold w-full">Done</Button>
        </div>
      ) : (
        <>
          <div className="bg-primary/5 rounded-2xl p-4 text-sm text-muted-foreground">
            <p className="font-bold text-foreground mb-1">📧 What gets sent?</p>
            <p>A professional HTML onboarding form covering personal details, health info, plan coordinator, parent/guardian, and emergency contacts — ready to print and fill in.</p>
          </div>
          <div>
            <Label>Send to Email Address</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              type="email"
              className="mt-1"
            />
          </div>
          <Button onClick={handleSend} disabled={!email || sending} className="w-full rounded-xl font-bold gap-2">
            <Mail size={16} /> {sending ? "Sending..." : `Send Onboarding Form`}
          </Button>
        </>
      )}
    </div>
  );
}