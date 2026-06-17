import { useState } from "react";
import { Download, FileText, Mail, User, Printer, ArrowLeft, Loader2, Receipt, Users, CreditCard, BadgeCheck, LayoutTemplate, ScrollText, ImageIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TEMPLATES = [
  // Email
  { id: "general_email", label: "General Email", category: "Email", description: "General purpose SZ-JIE branded email for any correspondence", icon: Mail, color: "bg-blue-50 text-blue-700 border-blue-200", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/3e379866c_General_Email_Template.html" },
  { id: "invoice_email", label: "Invoice Email", category: "Email", description: "NDIS invoice claim email for plan managers", icon: Receipt, color: "bg-amber-50 text-amber-700 border-amber-200", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/1189154e2_Invoice_Email.html" },
  { id: "onboarding_client", label: "Client Onboarding Email", category: "Email", description: "Welcome email for new participants and families", icon: User, color: "bg-emerald-50 text-emerald-700 border-emerald-200", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/0f5a62100_Onboarding_Client.html" },
  { id: "payslip_advice", label: "Payslip Advice Email", category: "Email", description: "Payslip notification email for staff members", icon: FileText, color: "bg-violet-50 text-violet-700 border-violet-200", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/c23215a33_Payslip_Advice.html" },
  { id: "staff_onboarding", label: "Staff Onboarding Email", category: "Email", description: "Welcome and onboarding email for new staff members", icon: Users, color: "bg-rose-50 text-rose-700 border-rose-200", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/24a55ecd5_Staff_Onboarding.html" },
  // Documents
  { id: "letterhead", label: "SZ-JIE Letterhead", category: "Document", description: "Official A4 letterhead with standard header for formal documents", icon: ScrollText, color: "bg-slate-50 text-slate-700 border-slate-200", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e541bebfa_SZ-JIE_A4_Page_Header_Template_CLEAN.html" },
  { id: "ndis_onboarding_intake", label: "NDIS Client Intake Form", category: "Document", description: "Professional client onboarding and intake form with SZ-JIE header", icon: FileText, color: "bg-sky-50 text-sky-700 border-sky-200", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/5670e5533_NDIS_Onboarding_Intake_Form_Professional_UPDATED_HEADER.html" },
  { id: "staff_portal_user_guide", label: "Staff Portal User Guide", category: "Document", description: "Printable staff portal user guide with SZ-JIE branded header", icon: ScrollText, color: "bg-slate-50 text-slate-700 border-slate-200", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e8d05e545_Staff_Portal_User_Guide_SZJIE_Header_Standalone.html" },
  { id: "dsw_registration", label: "DSW Registration Form", category: "Document", description: "Staff registration form with TFN, bank account, BSB, compliance checks and signatures", icon: BadgeCheck, color: "bg-green-50 text-green-700 border-green-200", isLocal: true, localPath: "/disability_support_worker_registration.html" },
  // Clinical
  { id: "goal_setting", label: "Goal Setting & Support Justification", category: "Clinical", description: "NDIS goal setting plan with weekly schedule, 8 goal areas and authorised sign-off", icon: ScrollText, color: "bg-emerald-50 text-emerald-700 border-emerald-200", isLocal: true, localPath: "/goal_setting_justification.html" },
  { id: "support_plan", label: "Support Plan", category: "Clinical", description: "Full NDIS support plan with journey overview, skill development, community access and endorsements", icon: FileText, color: "bg-cyan-50 text-cyan-700 border-cyan-200", isLocal: true, localPath: "/support_plan.html" },
  { id: "service_agreement", label: "Service Agreement", category: "Clinical", description: "NDIS service agreement with supports schedule, costing, responsibilities and signature section", icon: FileText, color: "bg-blue-50 text-blue-700 border-blue-200", isLocal: true, localPath: "/service_agreement.html" },
  { id: "behaviour_support_plan", label: "Behavioural Support Strategy", category: "Clinical", description: "Full PBS framework with clinical formulation, crisis phases, tactical toolbox and ABC log", icon: FileText, color: "bg-purple-50 text-purple-700 border-purple-200", isLocal: true, localPath: "/behaviour_support_plan.html" },
  { id: "epilepsy_plan", label: "Epilepsy Management Plan", category: "Clinical", description: "Participant epilepsy plan with seizure table, triggers, during/after steps and physician endorsement", icon: FileText, color: "bg-red-50 text-red-700 border-red-200", isLocal: true, localPath: "/epilepsy_management_plan.html" },
  { id: "crisis_plan", label: "Crisis Management & Safety Plan", category: "Clinical", description: "Full 2-page crisis protocol — NSW contacts, immediate response, support services and NDIS safeguarding steps", icon: BadgeCheck, color: "bg-red-50 text-red-700 border-red-200", isMultiPage: true, pages: ["/crisis_management_plan.html", "/crisis_management_plan_p2.html"] },
  // Brand
  { id: "business_card_jeffrey", label: "Business Card – Jeffrey Minton", category: "Brand", description: "Print-ready business card for Jeffrey Minton, Principal Support Practitioner", icon: CreditCard, color: "bg-cyan-50 text-cyan-700 border-cyan-200", isCard: true, person: "jeffrey" },
  { id: "business_card_toby", label: "Business Card – SZ-Jie Wang", category: "Brand", description: "Print-ready business card for SZ-Jie Wang, Managing Director", icon: CreditCard, color: "bg-purple-50 text-purple-700 border-purple-200", isCard: true, person: "toby" },
  { id: "lanyard_jeffrey", label: "ID Badge – Jeffrey Minton", category: "Brand", description: "Print-ready lanyard ID badge for Jeffrey Minton", icon: BadgeCheck, color: "bg-teal-50 text-teal-700 border-teal-200", isLanyard: true, person: "jeffrey" },
  { id: "lanyard_toby", label: "ID Badge – SZ-Jie Wang", category: "Brand", description: "Print-ready lanyard ID badge for SZ-Jie Wang", icon: BadgeCheck, color: "bg-violet-50 text-violet-700 border-violet-200", isLanyard: true, person: "toby" },
  { id: "logos", label: "Brand Logos & Assets", category: "Brand", description: "All SZ-JIE logo variants — coloured, white, transparent, portrait and landscape", icon: ImageIcon, color: "bg-pink-50 text-pink-700 border-pink-200", isLogos: true },
];

const CATEGORIES = ["All", "Email", "Document", "Clinical", "Brand"];

function fieldLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function extractFields(html) {
  const matches = [...html.matchAll(/\{\{([^}]+)\}\}/g)];
  const seen = new Set();
  const fields = [];
  for (const m of matches) {
    const key = m[1].trim();
    if (!seen.has(key)) { seen.add(key); fields.push(key); }
  }
  return fields;
}

function mergeTemplate(html, values) {
  return html.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const v = values[key.trim()];
    return v !== undefined && v !== "" ? v : match;
  });
}

const LONG_FIELDS = new Set(["custom_message", "body", "message", "notes", "description", "additional_info", "additional_notes"]);

function TemplatePicker({ onSelect }) {
  const [cat, setCat] = useState("All");
  const visible = cat === "All" ? TEMPLATES : TEMPLATES.filter(t => t.category === cat);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Templates</h2>
        <p className="text-muted-foreground text-sm">Select a template to preview, fill in details, then print or download.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => onSelect(t)} className="flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 bg-card border-border hover:border-primary/40 group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${t.color}`}><Icon size={20} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-foreground text-sm group-hover:text-primary transition-colors">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 ${t.color}`}>{t.category}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FieldsForm({ template, htmlPages, onBack, onPreview }) {
  const allFields = [];
  const seen = new Set();
  htmlPages.forEach(html => extractFields(html).forEach(k => { if (!seen.has(k)) { seen.add(k); allFields.push(k); } }));
  const [values, setValues] = useState({});
  const set = (key, val) => setValues(v => ({ ...v, [key]: val }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 font-bold"><ArrowLeft size={16} /> Back</Button>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{template.label}</h2>
          <p className="text-muted-foreground text-xs">Fill in the fields below, then click Preview.</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        {allFields.map(key => (
          <div key={key}>
            <Label className="text-sm font-bold mb-1 block">{fieldLabel(key)}</Label>
            {LONG_FIELDS.has(key) ? (
              <Textarea value={values[key] || ""} onChange={e => set(key, e.target.value)} placeholder={`Enter ${fieldLabel(key).toLowerCase()}...`} className="min-h-[80px]" />
            ) : (
              <Input value={values[key] || ""} onChange={e => set(key, e.target.value)} placeholder={`Enter ${fieldLabel(key).toLowerCase()}...`} />
            )}
          </div>
        ))}
      </div>
      <Button onClick={() => onPreview(htmlPages.map(html => mergeTemplate(html, values)))} className="w-full font-bold rounded-xl gap-2">
        <Eye size={16} /> Preview Document →
      </Button>
    </div>
  );
}

function Preview({ template, mergedPages, onBack, hasFields }) {
  const [activePage, setActivePage] = useState(0);

  const downloadHTML = () => {
    const combined = mergedPages.join('\n<div style="page-break-before:always"></div>\n');
    const blob = new Blob([combined], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${template.label.replace(/\s+/g, "_")}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    const combined = mergedPages.join('\n<div style="page-break-before:always"></div>\n');
    const win = window.open("", "_blank");
    win.document.write(combined);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 font-bold"><ArrowLeft size={16} /> {hasFields ? "Edit Fields" : "Back"}</Button>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{template.label}</h2>
            <p className="text-xs text-muted-foreground">Preview — ready to print or download</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadHTML} className="gap-2 font-bold rounded-xl"><Download size={15} /> Download HTML</Button>
          <Button onClick={printPDF} className="gap-2 font-bold rounded-xl"><Printer size={15} /> Print / Save PDF</Button>
        </div>
      </div>
      {mergedPages.length > 1 && (
        <div className="flex gap-2">
          {mergedPages.map((_, i) => (
            <button key={i} onClick={() => setActivePage(i)} className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${activePage === i ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"}`}>
              Page {i + 1}
            </button>
          ))}
        </div>
      )}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
        <iframe srcDoc={mergedPages[activePage]} title="Template Preview" className="w-full border-0" style={{ height: "820px" }} />
      </div>
    </div>
  );
}

const CARD_DATA = {
  jeffrey: {
    cardImage: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e22a5ab83_jeffbusinesscard.png",
    lanyardImage: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ed925b089_JeffLanyard.png",
  },
  toby: {
    cardImage: "https://media.base44.com/images/public/69d54775d9a169daad84a133/cb1c261a8_tobybusinesscard.png",
    lanyardImage: "https://media.base44.com/images/public/69d54775d9a169daad84a133/91b3f1130_TobyLanyard.png",
  },
};

const LOGOS = [
  { label: "Main Logo (Coloured)", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png", bg: "bg-white" },
  { label: "Main Logo (Full)", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/38e1d867e_Main_logo.png", bg: "bg-white" },
  { label: "Logo (Transparent BG)", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/482155c83_logo.png", bg: "bg-white" },
  { label: "Portrait Logo (Transparent)", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e563f2b06_Portraint_Transparent.png", bg: "bg-white" },
  { label: "White Logo (Dark BG)", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/a20f3b7db_White_transparent.png", bg: "bg-slate-800" },
  { label: "Portrait White (Dark BG)", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7902e5c70_Portraint_Transparent_White.png", bg: "bg-slate-800" },
];

function ImagePreview({ template, onBack }) {
  const person = CARD_DATA[template.person];
  const imageUrl = template.isCard ? person?.cardImage : person?.lanyardImage;
  const downloadImage = (url, name) => { const a = document.createElement("a"); a.href = url; a.download = name; a.target = "_blank"; a.click(); };
  const printImage = (url) => {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;}img{max-width:100%;height:auto;}</style></head><body><img src="${url}" onload="window.print()"/></body></html>`);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 font-bold"><ArrowLeft size={16} /> Back</Button>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{template.label}</h2>
          <p className="text-xs text-muted-foreground">{template.description}</p>
        </div>
      </div>
      {template.isLogos ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {LOGOS.map(logo => (
            <div key={logo.url} className={`rounded-2xl border border-border p-4 ${logo.bg} flex flex-col items-center gap-3`}>
              <img src={logo.url} alt={logo.label} className="h-24 object-contain" />
              <p className="text-xs font-bold text-center text-foreground">{logo.label}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs" onClick={() => downloadImage(logo.url, logo.label.replace(/\s+/g,"_") + ".png")}><Download size={12} /> Download</Button>
                <Button size="sm" className="rounded-xl gap-1 text-xs" onClick={() => printImage(logo.url)}><Printer size={12} /> Print</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-md">
            <img src={imageUrl} alt={template.label} className={`object-contain ${template.isLanyard ? "max-h-[600px]" : "max-h-[340px]"}`} />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => downloadImage(imageUrl, template.label.replace(/\s+/g,"_") + ".png")} className="gap-2 font-bold rounded-xl"><Download size={15} /> Download PNG</Button>
            <Button onClick={() => printImage(imageUrl)} className="gap-2 font-bold rounded-xl"><Printer size={15} /> Print</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Templates() {
  const [step, setStep] = useState("pick");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [htmlPages, setHtmlPages] = useState([]);
  const [mergedPages, setMergedPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFields, setHasFields] = useState(false);

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);
    if (template.isCard || template.isLanyard || template.isLogos) { setStep("image"); return; }
    setLoading(true);
    try {
      let pages = [];
      if (template.isMultiPage) {
        pages = await Promise.all(template.pages.map(p => fetch(p).then(r => r.text())));
      } else {
        const html = await fetch(template.isLocal ? template.localPath : template.url).then(r => r.text());
        pages = [html];
      }
      setHtmlPages(pages);
      const allFields = new Set();
      pages.forEach(html => extractFields(html).forEach(k => allFields.add(k)));
      if (allFields.size > 0) {
        setHasFields(true); setStep("fields");
      } else {
        setHasFields(false); setMergedPages(pages); setStep("preview");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-semibold">Loading template...</p>
      </div>
    </div>
  );

  if (step === "image") return <ImagePreview template={selectedTemplate} onBack={() => setStep("pick")} />;
  if (step === "fields") return <FieldsForm template={selectedTemplate} htmlPages={htmlPages} onBack={() => setStep("pick")} onPreview={(merged) => { setMergedPages(merged); setStep("preview"); }} />;
  if (step === "preview") return <Preview template={selectedTemplate} mergedPages={mergedPages} hasFields={hasFields} onBack={() => hasFields ? setStep("fields") : setStep("pick")} />;

  return <TemplatePicker onSelect={handleSelectTemplate} />;
}