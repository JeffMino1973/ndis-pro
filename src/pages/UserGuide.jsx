import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Users, Clock, FileText, DollarSign, ShieldCheck, Activity, HelpCircle } from "lucide-react";

const SECTIONS = [
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
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed bg-secondary/20">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserGuide() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <BookOpen size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">User Guide</h2>
          <p className="text-muted-foreground text-sm">Step-by-step answers to common questions about using the portal.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <p className="font-black mb-1">💡 Tip</p>
        <p>Click any question below to reveal the answer. If you need further help, contact your administrator.</p>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((section, i) => (
          <Section key={i} section={section} />
        ))}
      </div>
    </div>
  );
}