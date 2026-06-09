import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Users, Clock, FileText, DollarSign, ShieldCheck, Activity, HelpCircle, Download, Lock, Pencil, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Admin Guide Sections ──────────────────────────────────────────────────────

const ADMIN_SECTIONS = [
  {
    icon: Users,
    title: "Participants",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    items: [
      { q: "How do I add a new participant?", a: "Go to Participants in the menu, then click 'Add Participant'. Fill in their name, NDIS number, plan type, and contact details, then click Save." },
      { q: "How do I view a participant's profile?", a: "Click on any participant's name or card in the Participants page to open their full profile, which includes goals, budgets, documents, and notes." },
      { q: "How do I update a participant's goals?", a: "Open the participant's profile, scroll to the Goals section, and use the edit buttons to update progress or add new milestones." },
    ],
  },
  {
    icon: Clock,
    title: "Shift Logging & Timesheets",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    items: [
      { q: "How do I log a shift?", a: "Go to Shift Logger in the menu. Select the participant, enter your start and end times, add activities and outcomes, then click 'Complete Shift'." },
      { q: "How do I submit a timesheet?", a: "Go to Timesheets, find the relevant entry, and change its status from 'Draft' to 'Submitted' using the status dropdown." },
      { q: "Can I record kilometres travelled?", a: "Yes — when logging a shift, there is a 'KM Travelled' field. Enter the distance and a travel claim amount if applicable." },
    ],
  },
  {
    icon: FileText,
    title: "Progress Notes",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    items: [
      { q: "How do I write a progress note?", a: "Go to Progress Notes in the menu, click 'Add Note', select the participant, and fill in the details about the session. You can link goals and add outcomes." },
      { q: "Can I use AI to help write notes?", a: "Yes! Go to AI Reports in the menu. Select a report type, fill in the details, and the AI will generate a professional draft you can copy or edit." },
    ],
  },
  {
    icon: DollarSign,
    title: "Finance & Receipts",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    items: [
      { q: "How do I add a tax receipt?", a: "Go to Finance in the menu, then click the 'Receipts' tab. Click 'Add Receipt', enter the date, amount, and description, select a category, and optionally upload the receipt file. Click 'Add Receipt' to save." },
      { q: "How do I track invoices?", a: "Go to Finance → Invoice Tracker. Click 'Add Invoice' to create a new one, or use the status dropdown on existing invoices to mark them as Paid, Sent, etc." },
      { q: "How do I send my tax summary to my accountant?", a: "Go to Finance → Accountant Report. Enter your accountant's email address and click 'Send Report'. A full HTML report with all invoices and deductions will be emailed automatically." },
      { q: "How does the Tax Calculator work?", a: "Go to Finance → Tax Calculator and enter your shift income amounts. The calculator uses ATO 2025–26 tax brackets to estimate your weekly take-home pay, tax withheld, and super contributions." },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Incidents & Behaviour",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    items: [
      { q: "How do I report an incident?", a: "Go to Incidents in the menu and click 'New Incident'. Fill in the participant, date, level of incident, description, and actions taken. Set the status and save." },
      { q: "How do I log a behaviour incident?", a: "Go to Behaviour Continuum in the menu. You can view the support plan and log ABC (Antecedent-Behaviour-Consequence) entries for the participant." },
      { q: "Where are the behaviour support plans?", a: "Go to Behaviour Support Plans or Positive Behaviour Support Plans in the menu to view and manage detailed plans for each participant." },
    ],
  },
  {
    icon: Activity,
    title: "Health & Medications",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    items: [
      { q: "How do I record a medication dose?", a: "Go to Medication Dashboard, find the relevant medication, and click 'Log Dose'. Enter who administered it, the dose given, and any notes." },
      { q: "How do I create a health care plan?", a: "Go to Health Care Plans in the menu and click 'New Plan'. Fill in the participant's medical details, medications, emergency response steps, and doctor information." },
      { q: "Where are epilepsy management plans?", a: "Go to Epilepsy Plans in the menu to create and manage individual seizure action plans, including emergency steps and rescue medication details." },
    ],
  },
  {
    icon: FileText,
    title: "Documents & Templates",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    items: [
      { q: "How do I upload a document for a participant?", a: "Go to Document Vault in the menu, click 'Upload Document', select the participant, choose the file, and give it a name and type." },
      { q: "How do I create a service agreement?", a: "Go to Service Agreements, click 'New Agreement', fill in participant details and support line items. You can preview and print a formatted agreement directly from the page." },
      { q: "How do I use email templates?", a: "Go to Email Templates in the menu to browse and copy pre-built HTML email layouts for invoices, welcome letters, and general correspondence." },
    ],
  },
  {
    icon: HelpCircle,
    title: "Account & Settings",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    items: [
      { q: "How do I update my business details?", a: "Go to Settings in the menu and update your business name, ABN, address, and bank account details. These appear on invoices and documents." },
      { q: "How do I control what menu items staff see?", a: "Go to Menu Permissions (admin only) to toggle which pages are visible for each staff member. Changes take effect the next time they log in." },
      { q: "How do I log out?", a: "Click the 'Logout' button at the bottom of the left sidebar." },
    ],
  },
];

// ── Staff Portal Guide Sections ───────────────────────────────────────────────

const PORTAL_SECTIONS = [
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
        a: "Yes — click 'Email Profile' to send your profile card to any recipient, or click 'Print Profile' to save it as a PDF. This is useful for sharing your credentials with participants or new clients.",
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
    icon: Clock,
    title: "My Roster & Shifts",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    items: [
      {
        q: "How do I view my shifts?",
        a: "In My Staff Portal, click the 'Roster' tab. You'll see your scheduled and completed shifts displayed in a weekly calendar view.",
        editable: false,
        readNote: "Shifts are assigned by your administrator. You cannot add or delete shifts from the portal."
      },
      {
        q: "What information is shown on each shift?",
        a: "Each shift card shows the participant name, date, start/end time, support type, location, and status (Active, Completed, or Cancelled).",
        editable: false,
      },
    ],
  },
  {
    icon: FileText,
    title: "Shift Notes & Progress Notes",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    items: [
      {
        q: "Can I write and submit shift notes?",
        a: "Yes. Go to the Shift Logger tab in your portal. Select the relevant shift, enter your activities, outcomes, progress notes, and any incidents. Click 'Complete Shift' to submit.",
        editable: true,
        editNote: "You can write and edit your own shift notes, activities, and outcomes."
      },
      {
        q: "Can I log kilometres and travel time?",
        a: "Yes — when completing a shift, fill in the 'KM Travelled' field and 'Travel Claim ($)' field. This is included in your timesheet for payroll processing.",
        editable: true,
        editNote: "Travel KM and travel claims are editable fields on your shift log."
      },
      {
        q: "Can I edit a progress note after submitting?",
        a: "No. Once a shift note is submitted ('Completed'), it is locked for audit purposes. If you need a correction, contact your administrator.",
        editable: false,
      },
    ],
  },
  {
    icon: Clock,
    title: "Timesheets",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    items: [
      {
        q: "How do I submit a timesheet?",
        a: "Go to the Timesheets tab in your portal. Find the relevant entry (status: Draft), review the details, then change the status to 'Submitted'. Your administrator will then review and approve it.",
        editable: true,
        editNote: "You can submit Draft timesheets. Once submitted, only your administrator can modify them."
      },
      {
        q: "What information is on my timesheet?",
        a: "Each timesheet shows the participant name, date, start/end time, total hours, support item code, KM travelled, travel claim amount, and current status.",
        editable: false,
      },
      {
        q: "Can I edit a submitted timesheet?",
        a: "No. Once submitted, timesheets are locked. Contact your administrator if any hours or details need correcting.",
        editable: false,
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
      {
        q: "Can I update a participant's goals or plan details?",
        a: "No. Participant goals, NDIS plans, budgets, and personal details are managed exclusively by your administrator. If you have a concern or update to recommend, contact your administrator directly.",
        editable: false,
        readNote: "All client information in the portal is read-only for support workers."
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
        a: "No. Document uploads and management are restricted to administrators. If you need a document added (e.g. your updated First Aid certificate), send it to your administrator.",
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
      {
        q: "How do I log out of the portal?",
        a: "Click the 'Logout' button at the bottom of the left sidebar. Always log out when using a shared or public device.",
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
            <p>Click any question below to reveal the answer. If you need further help, contact your administrator.</p>
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