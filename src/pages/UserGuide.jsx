import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Users, Clock, FileText, DollarSign, ShieldCheck, Activity, HelpCircle, Download, Lock, Pencil, Smartphone, Mail, Cloud, GraduationCap, ClipboardList, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Admin Guide Sections ──────────────────────────────────────────────────────

const ADMIN_SECTIONS = [
  {
    icon: BookOpen,
    title: "Navigation & Getting Around",
    color: "bg-primary/10 text-primary border-primary/20",
    items: [
      { q: "How does the sidebar work?", a: "The left sidebar shows section headings (Home, Participants, Shifts & Billing, Clinical & Support, Compliance & Safety, Tools & Resources, Admin). Click any heading to expand its menu items as a list. Click again to collapse it." },
      { q: "How do I find the page I'm looking for?", a: "Click the section heading that matches what you need (e.g. 'Shifts & Billing' for rostering and invoices). The matching section auto-expands when you're on one of its pages." },
      { q: "Can I hide menu items for certain staff?", a: "Yes — go to Menu Permissions (under Admin) and toggle which pages are visible for each staff member by email. Changes take effect the next time they log in." },
    ],
  },
  {
    icon: Users,
    title: "Participants",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    items: [
      { q: "How do I add a new participant?", a: "Go to Participants in the menu, then click 'Add Participant'. Fill in their name, NDIS number, plan type, and contact details, then click Save." },
      { q: "How do I send an onboarding form?", a: "Go to Onboarding, click 'Send Onboarding Form', and enter the participant's email. They'll receive a link to fill in their details, which are saved as an Onboarding Request for your review." },
      { q: "How do I view a participant's profile?", a: "Click on any participant's name or card in the Participants page to open their full profile, which includes goals, budgets, documents, and plans." },
    ],
  },
  {
    icon: Calendar,
    title: "Rostering & Shift Notes",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    items: [
      { q: "How do I create a shift in the roster?", a: "Go to Rostering, switch to the Weekly view, and click on a day to add a shift. Fill in the participant, staff member, date, start/end time, program type, support type, and hourly rate. Save to add it to the calendar." },
      { q: "How do I set up recurring shifts?", a: "When creating a shift, use the recurrence option to repeat it weekly. The system clones all shift metadata including program type, support type, REM code, hourly rate, and times." },
      { q: "How do shift notes work?", a: "Tap any shift in the Weekly Calendar to open its detail modal. If no note exists, click 'Complete Shift Note' to pick a template workbook. The workbook opens full-screen in the portal as an interactive HTML form. You can print or mark it as Reviewed." },
      { q: "What are the pending task reminders?", a: "The roster shows an amber 'Pending Tasks' banner listing shifts that still need shift notes. Click 'Complete Note' to open the template picker for that shift." },
      { q: "How do I update NDIS rates in bulk?", a: "In Rostering, use the 'Bulk Rate Update' option to apply new hourly rates to shifts matching a support item code or program type." },
    ],
  },
  {
    icon: DollarSign,
    title: "Invoices, Payslips & Finance",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    items: [
      { q: "How do I create an invoice?", a: "Go to Invoices & Payslips (Roster Billing) or the Invoices page. Click 'New Invoice', select the participant, choose shifts to include as line items, and the totals calculate automatically. You can preview, print, or email the invoice." },
      { q: "How do I email an invoice as a PDF?", a: "Open an invoice and click 'Send Email'. The system generates a branded PDF attachment and emails it to the plan manager. This also happens automatically when an invoice status changes to 'Sent'." },
      { q: "How do I create payslips?", a: "Go to Payslips, click 'New Payslip', select the staff member and date range, and choose shifts to include. Tax, Medicare levy, and superannuation are calculated based on the staff member's tax status." },
      { q: "How do I email a payslip?", a: "Open a payslip and click 'Send Email'. The payslip is generated as a PDF attachment and emailed to the staff member's registered email." },
      { q: "How do I track receipts and expenses?", a: "Go to Finance, then the Receipts tab. Click 'Add Receipt', enter the date, amount, category, and optionally upload the receipt file. These feed into financial reports for your accountant." },
      { q: "Where are financial reports?", a: "Go to Financial Reports for tax summaries, revenue breakdowns, and the Accountant Report — which can be emailed directly to your accountant." },
    ],
  },
  {
    icon: ClipboardList,
    title: "Clinical & Support Plans",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    items: [
      { q: "How do I create a support plan?", a: "Go to Support Plans, click 'New Plan', and fill in goals, steps, support strategies, and budget items. You can preview and print a formatted plan." },
      { q: "How do I create a service agreement?", a: "Go to Service Agreements, click 'New Agreement', fill in participant details and support line items. You can preview and print a formatted agreement." },
      { q: "What clinical plans can I manage?", a: "The Clinical & Support section covers Behaviour Support Plans, Positive Behaviour Support Plans (PBS), Epilepsy Plans, Health Care Plans, Implementation Programs, and Medications." },
      { q: "How do I log a medication dose?", a: "Go to Medications, find the relevant medication, and click 'Log Dose'. Enter who administered it, the dose given, and any notes." },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Compliance, Safety & Staff",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    items: [
      { q: "How do I manage staff compliance?", a: "Go to Staff & Compliance to view all staff members. Each profile shows WWCC expiry, First Aid expiry, Police Check status, and training status with colour-coded badges." },
      { q: "How do I upload a compliance document?", a: "Open a staff member's profile, go to the Compliance tab, and click 'Upload Document'. Select the category (WWCC, First Aid, Police Check, etc.), upload the file, and set the expiry date. Verification status syncs automatically to the staff member's record." },
      { q: "How do I report an incident?", a: "Go to Incidents and click 'New Incident'. Fill in the participant, date, level, description, and actions taken. Set the status and save." },
      { q: "Where are risk assessments?", a: "Go to Risk Assessments to create and manage workplace and activity risk assessments, including hazards, controls, and residual ratings." },
      { q: "How do I manage complaints?", a: "Go to Complaints to log, track, and resolve complaints with status tracking and resolution notes." },
    ],
  },
  {
    icon: Cloud,
    title: "Google Drive, Gmail & Integrations",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    items: [
      { q: "How do I access Google Drive files?", a: "Go to Google Drive in the Tools & Resources section. The page lists your connected Drive files and folders. Click any file to open or download it." },
      { q: "How do I send emails from the portal?", a: "Go to Gmail in the Tools & Resources section. You can compose and send emails directly from the portal using your connected Gmail account. Invoices and payslips can also be emailed with PDF attachments from their respective pages." },
      { q: "Can I read my Gmail in the portal?", a: "Yes — the Gmail page shows your inbox with message previews. Click any email to read the full message. You can also mark emails as read." },
    ],
  },
  {
    icon: GraduationCap,
    title: "Staff Training & Documents",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    items: [
      { q: "What is in the Staff Training portal?", a: "Staff Training (under Tools & Resources) contains compliance documents, educational infographics, videos, and podcasts. You can filter by category and search for specific topics." },
      { q: "How do I upload a business document?", a: "Go to Document Vault, click 'Upload Document', select the category (Insurance, Certificates, Licences, Policies, Registrations), upload the file, and set an expiry date if applicable." },
      { q: "Where are templates?", a: "Go to Templates in the Tools & Resources section. The Templates page now contains two categories: Document (letterhead, intake forms, registration forms, user guide) and Brand (business cards, ID badges, logos). Select a template to preview, edit content directly in the document, then print or download." },
      { q: "Where is the Policy Manual?", a: "Go to Policy Manual (under Admin) to browse the full policies and procedures manual with searchable, filterable sections." },
    ],
  },
  {
    icon: FileText,
    title: "Reports & Administration",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    items: [
      { q: "How do I generate reports?", a: "Go to Reports Centre for KPI summaries, participant reports, and staff reports. The AI Reports page lets you generate AI-powered analytical reports from your data." },
      { q: "What is the Audit Log?", a: "Go to Audit Log (under Admin) to view a record of all create, update, delete, view, and export actions performed in the system, including who performed them and when." },
      { q: "How do I export data?", a: "Go to Data Export (under Admin) to export entity records. Exports are restricted to administrative roles for security." },
      { q: "How do I update business details?", a: "Go to Settings to update your business name, ABN, address, and bank account details. These appear on invoices and documents." },
    ],
  },
];

// ── Staff Portal Guide Sections ───────────────────────────────────────────────

const PORTAL_SECTIONS = [
  {
    icon: BookOpen,
    title: "Getting Started & Navigation",
    color: "bg-primary/10 text-primary border-primary/20",
    items: [
      {
        q: "How does the sidebar menu work?",
        a: "The left sidebar shows section headings. Click a heading (like 'My Portal' or 'Tools') to expand its menu items. Click again to collapse. The section matching the page you're currently on stays expanded automatically.",
        editable: false,
        readNote: "Staff see a simplified menu with only the pages your administrator has enabled for you."
      },
      {
        q: "How do I log out?",
        a: "Click the 'Logout' button at the bottom of the left sidebar. Always log out when using a shared or public device.",
        editable: false,
      },
    ],
  },
  {
    icon: Users,
    title: "My Profile",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    items: [
      {
        q: "What can I see in My Profile?",
        a: "Your profile shows your name, role, contact details, bio, languages, and all compliance credentials including WWCC expiry, First Aid expiry, Police Check status, and training status.",
        editable: true,
        editNote: "You can update your Bio and Languages. All other profile fields are managed by your administrator."
      },
      {
        q: "How do I update my bio or languages?",
        a: "In the My Staff Portal tab, click 'My Profile'. You'll see an Edit button next to your Bio and Languages fields. Make your changes and click Save.",
        editable: true,
        editNote: "Bio and Languages are the only fields you can edit directly."
      },
      {
        q: "Can I share my professional profile?",
        a: "Yes — click 'Email Profile' to send your profile card to any recipient, or click 'Print Profile' to save it as a PDF.",
        editable: false,
      },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Compliance Dashboard",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    items: [
      {
        q: "What does the Compliance tab show?",
        a: "Your compliance status for WWCC, First Aid, Police Check, and Training. Colour-coded badges show if credentials are Active, Expiring Soon, or Expired.",
        editable: false,
        readNote: "Compliance data is managed by your administrator. Contact them if any details are incorrect."
      },
      {
        q: "My credential is showing as Expired — what do I do?",
        a: "Contact your administrator (Toby) at toby@szjiesupportservices.com or call 0435 951 563 to update your credential details in the system.",
        editable: false,
      },
    ],
  },
  {
    icon: Calendar,
    title: "My Roster & Shifts",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    items: [
      {
        q: "How do I view my shifts?",
        a: "In My Staff Portal, click the 'Roster' tab. You'll see your scheduled and completed shifts displayed in a weekly calendar view. Use the arrows to navigate between weeks.",
        editable: false,
        readNote: "Shifts are assigned by your administrator. You cannot add or delete shifts from the portal."
      },
      {
        q: "What information is shown on each shift?",
        a: "Each shift card shows the participant name, date, start/end time, program type, support type, and status. A badge shows if a shift note has been completed or is still pending.",
        editable: false,
      },
    ],
  },
  {
    icon: FileText,
    title: "Shift Notes & Checklists",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    items: [
      {
        q: "How do I complete a shift note?",
        a: "Tap any shift in your weekly calendar to open the shift detail. If no note exists, click 'Complete Shift Note' to pick the right template workbook. The workbook opens full-screen in the portal as an interactive HTML form you fill in directly.",
        editable: true,
        editNote: "You complete shift notes by filling in the in-portal workbook templates."
      },
      {
        q: "What types of shift note templates are available?",
        a: "Templates are matched automatically based on the day and program type — e.g. Library Learning (Mon/Wed/Fri), Travel Training (Tue/Thu), Domestic Skills (Sat), and Community Access (Sun). The system picks the best match for you.",
        editable: false,
      },
      {
        q: "Can I print a completed shift note?",
        a: "Yes — while viewing a shift note workbook, click the 'Print' button in the header bar. This lets you print or save the completed form as a PDF.",
        editable: false,
      },
      {
        q: "Can I edit a shift note after submitting?",
        a: "Once a shift note is marked as 'Reviewed', it is locked. If you need a correction before review, contact your administrator. Submitted notes can still be viewed and printed.",
        editable: false,
        readNote: "Reviewed shift notes are locked for audit purposes."
      },
    ],
  },
  {
    icon: DollarSign,
    title: "My Payslips",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    items: [
      {
        q: "Where can I view my payslips?",
        a: "Go to the Payslips tab in My Staff Portal. You'll see a list of all payslips issued to you, with the pay period, gross pay, tax, super, and net pay.",
        editable: false,
        readNote: "Payslips are generated and managed by your administrator. You cannot create or edit payslips."
      },
      {
        q: "Can I print or download a payslip?",
        a: "Yes — click the 'Print' or 'View' button on any payslip to open a formatted, print-ready version. Use your browser's print dialog to save as a PDF.",
        editable: false,
      },
      {
        q: "My payslip has an error — who do I contact?",
        a: "Contact Toby at toby@szjiesupportservices.com or 0435 951 563 to raise a payroll query.",
        editable: false,
      },
    ],
  },
  {
    icon: Users,
    title: "My Linked Participants",
    color: "bg-pink-50 text-pink-700 border-pink-200",
    items: [
      {
        q: "Which participants can I see?",
        a: "You can only see participants who have been linked to your profile by your administrator. This ensures you only access information relevant to the people you directly support.",
        editable: false,
        readNote: "Participant profiles are read-only. You cannot modify client goals, NDIS plans, budgets, or personal details."
      },
      {
        q: "What participant information can I view?",
        a: "You can view a participant's name, contact details, support type, goals, and relevant plans (e.g. behaviour support, epilepsy, health care plans). These are for reference to help you provide quality support.",
        editable: false,
      },
    ],
  },
  {
    icon: Cloud,
    title: "Google Drive & Gmail",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    items: [
      {
        q: "Can I access Google Drive files?",
        a: "If your administrator has enabled Google Drive for your portal, you can browse and download shared Drive files directly from the portal.",
        editable: false,
        readNote: "Drive access is read-only and limited to files your administrator has shared."
      },
      {
        q: "Can I send emails from the portal?",
        a: "If Gmail is enabled for your portal, you can compose and send emails. Invoices and payslips emailed to you by the system arrive in your regular Gmail inbox as well.",
        editable: false,
      },
    ],
  },
  {
    icon: GraduationCap,
    title: "Staff Training",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    items: [
      {
        q: "What training materials are available?",
        a: "The Staff Training section contains compliance documents, educational infographics, training videos, and podcasts. Use the category filters and search to find what you need.",
        editable: false,
        readNote: "Training content is managed by your administrator. You can view and read but not edit."
      },
      {
        q: "Do I need to complete mandatory training?",
        a: "Your administrator may assign required training. Check your Compliance tab for your training status — it will show as Complete, Due Soon, or Overdue.",
        editable: false,
      },
    ],
  },
  {
    icon: FileText,
    title: "Business Documents",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    items: [
      {
        q: "What documents can I access?",
        a: "You can view and download business documents that your administrator has shared with you, such as policies, training certificates, licences, and procedural guides.",
        editable: false,
        readNote: "Documents are uploaded and managed by your administrator only."
      },
      {
        q: "Can I upload my own documents?",
        a: "No. Document uploads are restricted to administrators. If you need a document added (e.g. your updated First Aid certificate), send it to your administrator.",
        editable: false,
      },
    ],
  },
  {
    icon: Activity,
    title: "Medications (View Only)",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    items: [
      {
        q: "Can I view medication plans for my participants?",
        a: "Yes — if your administrator has enabled the Medications feature for you, you can view the medication schedules and health care plans for your linked participants.",
        editable: false,
        readNote: "Medication records and health care plans are read-only. You cannot add, edit, or delete medications."
      },
      {
        q: "What if a participant's medication details look wrong?",
        a: "Do not make any changes. Contact your administrator immediately if you believe there is an error in a medication plan.",
        editable: false,
      },
    ],
  },
  {
    icon: HelpCircle,
    title: "Getting Help",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    items: [
      {
        q: "Who do I contact if I can't log in?",
        a: "Contact Toby at toby@szjiesupportservices.com or call 0435 951 563. Your admin can reset your access.",
        editable: false,
      },
      {
        q: "A feature I need isn't showing in my portal — what should I do?",
        a: "Portal features are enabled on a per-staff basis by your administrator. Contact Toby to request access to a specific feature.",
        editable: false,
      },
    ],
  },
];

// ── Shared FAQ Accordion ──────────────────────────────────────────────────────

function Section({ section }) {
  const [openIndex, setOpenIndex] = useState(null);
  const Icon = section.icon;
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className={`flex items-center gap-3 px-5 py-4 border-b border-border ${section.color} border-l-4`}>
        <Icon size={18} />
        <h3 className="font-black text-sm">{section.title}</h3>
      </div>
      <div className="divide-y divide-border">
        {section.items.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-secondary/50 transition"
            >
              <span className="text-sm font-semibold text-foreground">{item.q}</span>
              {openIndex === i ? <ChevronUp size={15} className="text-muted-foreground shrink-0 ml-3" /> : <ChevronDown size={15} className="text-muted-foreground shrink-0 ml-3" />}
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 bg-secondary/20 space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                {item.editable && (
                  <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <Pencil size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-emerald-700 font-medium">{item.editNote}</p>
                  </div>
                )}
                {item.readNote && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <Lock size={13} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">{item.readNote}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Export to HTML ────────────────────────────────────────────────────────────

function exportPortalGuideToHTML() {
  const rows = PORTAL_SECTIONS.map(section =>
    section.items.map(item => `
      <div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:12px;overflow:hidden;">
        <div style="background:#f8fafc;padding:10px 16px;font-weight:900;font-size:13px;border-bottom:1px solid #e2e8f0;">${item.q}</div>
        <div style="padding:12px 16px;font-size:13px;color:#475569;line-height:1.6;">${item.a}
          ${item.editable ? `<div style="margin-top:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px 12px;font-size:12px;color:#166534;">✏️ ${item.editNote}</div>` : ""}
          ${item.readNote ? `<div style="margin-top:8px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;font-size:12px;color:#92400e;">🔒 ${item.readNote}</div>` : ""}
        </div>
      </div>`).join("")
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>My Staff Portal – User Guide</title>
<style>
  body { font-family: 'Inter', sans-serif; max-width: 820px; margin: 40px auto; padding: 0 24px; color: #0f172a; }
  h1 { font-size: 28px; font-weight: 900; margin-bottom: 4px; }
  p.sub { color: #64748b; font-size: 14px; margin-bottom: 32px; }
  h2 { font-size: 16px; font-weight: 900; margin: 28px 0 10px; padding-bottom: 4px; border-bottom: 2px solid #e2e8f0; }
  .legend { display:flex; gap:24px; margin-bottom:24px; }
  .legend span { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; }
</style>
</head>
<body>
<h1>My Staff Portal – User Guide</h1>
<p class="sub">SZ-Jie Support Services &nbsp;|&nbsp; For support workers using the Staff Portal</p>
<div class="legend">
  <span style="color:#166534;">✏️ Editable by you</span>
  <span style="color:#92400e;">🔒 Read-only (admin only)</span>
</div>
${PORTAL_SECTIONS.map((s, i) => `<h2>${s.title}</h2>${rows[i]}`).join("")}
<p style="margin-top:40px;font-size:11px;color:#94a3b8;">Generated ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;|&nbsp; SZ-Jie Support Services</p>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Staff_Portal_User_Guide.html";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UserGuide() {
  const [tab, setTab] = useState("portal");

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <BookOpen size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">User Guide</h2>
          <p className="text-muted-foreground text-sm">Step-by-step answers to common questions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("portal")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition -mb-px ${tab === "portal" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Smartphone size={15} /> My Staff Portal
        </button>
        <button
          onClick={() => setTab("admin")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition -mb-px ${tab === "admin" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <ShieldCheck size={15} /> Admin Guide
        </button>
      </div>

      {tab === "portal" && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 flex-1 min-w-0">
              <p className="font-black mb-1">💡 How to use this guide</p>
              <p>This guide covers everything available to you in <strong>My Staff Portal</strong>. Click any question to expand the answer. Look for the badges below to understand what you can edit vs. what is read-only.</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1"><Pencil size={11} /> You can edit this</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1"><Lock size={11} /> Read-only (admin managed)</span>
              </div>
            </div>
            <Button variant="outline" onClick={exportPortalGuideToHTML} className="flex items-center gap-2 shrink-0">
              <Download size={15} /> Export to HTML
            </Button>
          </div>

          <div className="space-y-4">
            {PORTAL_SECTIONS.map((section, i) => (
              <Section key={i} section={section} />
            ))}
          </div>
        </>
      )}

      {tab === "admin" && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
            <p className="font-black mb-1">💡 Tip</p>
            <p>Click any question below to reveal the answer. The sidebar uses collapsible sections — click a heading to expand its menu items.</p>
          </div>
          <div className="space-y-4">
            {ADMIN_SECTIONS.map((section, i) => (
              <Section key={i} section={section} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}