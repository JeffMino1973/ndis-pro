import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EMAIL_HTML = (participantName, providerName, formUrl) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
  .header { background: #4338ca; color: white; padding: 32px 40px; }
  .header h1 { margin: 0 0 6px; font-size: 22px; }
  .header p { margin: 0; opacity: 0.85; font-size: 14px; }
  .body { padding: 32px 40px; }
  .cta { display: inline-block; background: #4338ca; color: white; padding: 16px 36px; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 16px; margin: 24px 0; }
  .footer { background: #f1f5f9; padding: 20px 40px; text-align: center; font-size: 12px; color: #94a3b8; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>${providerName} — Participant Onboarding</h1>
    <p>Please complete the online form for: <strong>${participantName}</strong></p>
  </div>
  <div class="body">
    <p>Hi there,</p>
    <p>You have been sent an onboarding form to complete for <strong>${participantName}</strong>. Please click the button below to fill it out online — it only takes a few minutes.</p>
    <div style="text-align:center">
      <a href="${formUrl}" class="cta">Complete Onboarding Form →</a>
    </div>
    <p style="font-size:13px; color:#64748b;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${formUrl}" style="color:#4338ca;">${formUrl}</a></p>
    <p style="font-size:13px; color:#64748b; margin-top:24px;">If you have any questions, please contact us directly. Thank you!</p>
  </div>
  <div class="footer">${providerName} · Confidential Participant Information</div>
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

    // Create the request first so we have an ID
    const request = await base44.entities.OnboardingRequest.create({
      participant_name: participantName,
      sent_to_email: email,
      status: "Sent",
    });

    const formUrl = `${window.location.origin}/onboarding-form?id=${request.id}`;

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Action Required: Participant Onboarding Form — ${participantName}`,
      body: EMAIL_HTML(participantName, providerName, formUrl),
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