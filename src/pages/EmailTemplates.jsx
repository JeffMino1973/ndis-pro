import { useState } from "react";
import { Copy, Check, Mail, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const INVOICE_TEMPLATE = (vars = {}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice Attached</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1e3a5f;padding:36px 40px;text-align:center;">
              <p style="margin:0;color:#93c5fd;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">NDIS PRO</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">Invoice Attached</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Dear ${vars.participantName || "{{Participant Name}}"},</p>
              <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
                Please find attached your invoice from <strong style="color:#1e293b;">${vars.providerName || "{{Provider Name}}"}</strong> for services delivered under your NDIS plan.
              </p>

              <!-- Invoice Summary Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin:28px 0;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color:#64748b;font-size:13px;">Invoice Number</td>
                              <td align="right" style="color:#1e293b;font-size:13px;font-weight:700;">${vars.invoiceNumber || "{{Invoice Number}}"}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color:#64748b;font-size:13px;">Period</td>
                              <td align="right" style="color:#1e293b;font-size:13px;font-weight:700;">${vars.period || "{{Period}}"}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color:#64748b;font-size:13px;">Due Date</td>
                              <td align="right" style="color:#1e293b;font-size:13px;font-weight:700;">${vars.dueDate || "{{Due Date}}"}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color:#1e293b;font-size:15px;font-weight:900;">Total Amount</td>
                              <td align="right" style="color:#2563eb;font-size:22px;font-weight:900;">${vars.total || "{{$Total}}"}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
                If you are plan-managed, please forward this invoice to your plan manager. If you have any questions, don't hesitate to reach out.
              </p>
              <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.6;">
                Thank you for your continued trust in our services.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background-color:#2563eb;border-radius:8px;">
                    <a href="${vars.portalUrl || "#"}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">View Participant Portal</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                Warm regards,<br/>
                <strong style="color:#475569;">${vars.providerName || "{{Provider Name}}"}</strong><br/>
                <span>${vars.providerPhone || "{{Phone}}"} · ${vars.providerEmail || "{{Email}}"}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
                NDIS PRO · NSW Registered Provider · ABN: ${vars.abn || "{{ABN}}"}<br/>
                This email and any attachments are confidential. If you received this in error, please delete it immediately.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const WELCOME_TEMPLATE = (vars = {}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Your Participant Portal</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header with gradient -->
          <tr>
            <td style="background-color:#1e3a5f;padding:48px 40px;text-align:center;">
              <div style="width:64px;height:64px;background-color:#2563eb;border-radius:16px;margin:0 auto 20px;display:table;">
                <p style="display:table-cell;vertical-align:middle;text-align:center;margin:0;color:#ffffff;font-size:28px;font-weight:900;">✦</p>
              </div>
              <p style="margin:0 0 6px;color:#93c5fd;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">NDIS PRO</p>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Welcome to Your<br/>Participant Portal</h1>
            </td>
          </tr>

          <!-- Welcome message -->
          <tr>
            <td style="padding:40px 40px 0;">
              <p style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:900;">Hi ${vars.participantName || "{{Participant Name}}"} 👋</p>
              <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                We're excited to welcome you to your personal Participant Portal — a secure space designed just for you to access everything related to your NDIS supports.
              </p>
              <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.7;">
                Your support coordinator <strong style="color:#1e293b;">${vars.coordinatorName || "{{Coordinator Name}}"}</strong> has set up your account and your journey begins today.
              </p>
            </td>
          </tr>

          <!-- Feature highlights -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;color:#0369a1;font-size:11px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;">What you can do in your portal</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ["📋", "View your support plans and goals"],
                        ["📄", "Access and sign your service agreements"],
                        ["💰", "Review and acknowledge your invoices"],
                        ["🗂️", "Access your documents and care plans"],
                        ["⚠️", "Submit complaints or feedback"],
                        ["💊", "View your medication schedule"],
                      ].map(([icon, text]) => `
                      <tr>
                        <td style="padding:5px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:28px;font-size:16px;vertical-align:top;padding-top:1px;">${icon}</td>
                              <td style="color:#1e293b;font-size:14px;line-height:1.5;">${text}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>`).join("")}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Login details box -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 12px;color:#64748b;font-size:11px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;">Your Login Details</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;width:100px;">Portal URL</td>
                        <td style="padding:4px 0;color:#2563eb;font-size:13px;font-weight:700;">${vars.portalUrl || "{{Portal URL}}"}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Email</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;font-weight:700;">${vars.participantEmail || "{{Your Email}}"}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background-color:#2563eb;border-radius:8px;">
                    <a href="${vars.portalUrl || "#"}" style="display:inline-block;padding:16px 40px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">Access My Portal →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 32px;color:#94a3b8;font-size:12px;">If the button doesn't work, copy this link: <span style="color:#2563eb;">${vars.portalUrl || "{{Portal URL}}"}</span></p>
              <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;text-align:left;">
                If you have any questions or need assistance, please contact your support coordinator:<br/>
                <strong style="color:#1e293b;">${vars.coordinatorName || "{{Coordinator Name}}"}</strong> · ${vars.coordinatorPhone || "{{Phone}}"}<br/>
                <a href="mailto:${vars.coordinatorEmail || ""}" style="color:#2563eb;">${vars.coordinatorEmail || "{{Email}}"}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
                NDIS PRO · NSW Registered Provider · ABN: ${vars.abn || "{{ABN}}"}<br/>
                This email is confidential and intended only for ${vars.participantName || "the named recipient"}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const TEMPLATES = [
  {
    id: "invoice",
    label: "Invoice Attached",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    description: "Send when attaching an invoice for NDIS services",
    fn: INVOICE_TEMPLATE,
    vars: {
      participantName: "John Smith",
      providerName: "NDIS PRO Support Services",
      providerPhone: "02 9000 0000",
      providerEmail: "accounts@ndispro.com.au",
      invoiceNumber: "INV-2026-0042",
      period: "March 2026",
      dueDate: "30 April 2026",
      total: "$1,240.00",
      abn: "12 345 678 901",
      portalUrl: "https://your-app.base44.app/participant-portal",
    },
  },
  {
    id: "welcome",
    label: "Welcome to Participant Portal",
    icon: User,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    description: "Send when onboarding a new participant to the portal",
    fn: WELCOME_TEMPLATE,
    vars: {
      participantName: "Jane Doe",
      participantEmail: "jane.doe@email.com",
      coordinatorName: "Sarah Johnson",
      coordinatorPhone: "02 9000 0001",
      coordinatorEmail: "sarah@ndispro.com.au",
      abn: "12 345 678 901",
      portalUrl: "https://your-app.base44.app/participant-portal",
    },
  },
];

export default function EmailTemplates() {
  const [selected, setSelected] = useState("invoice");
  const [tab, setTab] = useState("preview"); // preview | html
  const [copied, setCopied] = useState(false);

  const template = TEMPLATES.find(t => t.id === selected);
  const html = template.fn(template.vars);

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Email Templates</h2>
        <p className="text-muted-foreground text-sm">HTML email templates compatible with Gmail and Outlook.</p>
      </div>

      {/* Template selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TEMPLATES.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                selected === t.id ? `${t.bg} border-opacity-100` : "bg-card border-border hover:border-primary/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected === t.id ? t.bg : "bg-secondary"}`}>
                <Icon size={20} className={selected === t.id ? t.color : "text-muted-foreground"} />
              </div>
              <div>
                <p className="font-black text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex gap-1 bg-secondary rounded-xl p-1">
            {["preview", "html"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "preview" ? "Preview" : "HTML Source"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={copyHtml} variant="outline" size="sm" className="rounded-xl gap-2 font-bold">
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy HTML"}
            </Button>
          </div>
        </div>

        {tab === "preview" ? (
          <div className="p-0">
            <iframe
              srcDoc={html}
              title="Email Preview"
              className="w-full border-0"
              style={{ height: "700px" }}
            />
          </div>
        ) : (
          <div className="p-4">
            <pre className="bg-slate-950 text-slate-300 rounded-2xl p-6 text-xs overflow-x-auto overflow-y-auto max-h-[700px] leading-relaxed whitespace-pre-wrap break-all">
              {html}
            </pre>
          </div>
        )}
      </div>

      {/* Usage instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <p className="font-black text-amber-800 mb-2 text-sm">📧 How to use these templates</p>
        <ol className="space-y-1.5 text-sm text-amber-700 list-decimal list-inside">
          <li>Click <strong>Copy HTML</strong> to copy the full email source</li>
          <li>In Gmail: compose → three dots → <em>Paste and match style</em> (or use a tool like <strong>Stripo</strong> or <strong>Mailchimp</strong> to send)</li>
          <li>In Outlook: paste into the HTML editor, or use Outlook's <em>Insert → HTML</em> option</li>
          <li>Replace placeholder values (shown in curly braces) with real data before sending</li>
        </ol>
      </div>
    </div>
  );
}