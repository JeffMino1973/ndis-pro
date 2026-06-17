import { useState } from "react";
import { Download, FileText, Mail, User, Printer, ArrowLeft, Loader2, Receipt, Users, CreditCard, BadgeCheck, LayoutTemplate, ScrollText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TEMPLATES = [
  {
    id: "general_email",
    label: "General Email",
    description: "General purpose SZ-JIE branded email for any correspondence",
    icon: Mail,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/df40c987a_General_Email_Template.html",
  },
  {
    id: "general_email_v2",
    label: "General Email (Updated)",
    description: "Updated general purpose SZ-JIE branded email template",
    icon: Mail,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/3e379866c_General_Email_Template.html",
  },
  {
    id: "invoice",
    label: "Invoice Email",
    description: "NDIS invoice claim email for plan managers",
    icon: Receipt,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/df36de2b3_Invoice.html",
  },
  {
    id: "invoice_v2",
    label: "Invoice Email (Updated)",
    description: "Updated NDIS invoice claim email for plan managers",
    icon: Receipt,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/1189154e2_Invoice_Email.html",
  },
  {
    id: "onboarding_client",
    label: "Client Onboarding",
    description: "Welcome email for new participants and families",
    icon: User,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/bcd281f72_Onboarding_Client.html",
  },
  {
    id: "onboarding_client_v2",
    label: "Client Onboarding (Updated)",
    description: "Updated welcome email for new participants and families",
    icon: User,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/0f5a62100_Onboarding_Client.html",
  },
  {
    id: "payslip_advice",
    label: "Payslip Advice",
    description: "Payslip notification email to send to staff members",
    icon: FileText,
    color: "bg-violet-50 text-violet-700 border-violet-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/dd239644c_Payslip_Advice.html",
  },
  {
    id: "payslip_advice_v2",
    label: "Payslip Advice (Updated)",
    description: "Updated payslip notification email to send to staff members",
    icon: FileText,
    color: "bg-violet-50 text-violet-700 border-violet-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/c23215a33_Payslip_Advice.html",
  },
  {
    id: "staff_onboarding",
    label: "Staff Onboarding",
    description: "Welcome and onboarding email for new staff members",
    icon: Users,
    color: "bg-rose-50 text-rose-700 border-rose-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/f1c350195_Staff_Onboarding.html",
  },
  {
    id: "staff_onboarding_v2",
    label: "Staff Onboarding (Updated)",
    description: "Updated welcome and onboarding email for new staff members",
    icon: Users,
    color: "bg-rose-50 text-rose-700 border-rose-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/24a55ecd5_Staff_Onboarding.html",
  },
  {
    id: "letterhead",
    label: "SZ-JIE Letterhead",
    description: "Official SZ-JIE A4 page letterhead with standard header for formal documents",
    icon: ScrollText,
    color: "bg-slate-50 text-slate-700 border-slate-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e541bebfa_SZ-JIE_A4_Page_Header_Template_CLEAN.html",
  },
  {
    id: "page_header_gradient",
    label: "Page Header – Gradient Style",
    description: "Branded page header with gradient headings and step/list layout for plans and reports",
    icon: LayoutTemplate,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/0d2180264_Header_Title_List_Gradient_Standalone.html",
  },
  {
    id: "business_card_jeffrey",
    label: "Business Card – Jeffrey Minton",
    description: "Print-ready business card for Jeffrey Minton, Principal Support Practitioner",
    icon: CreditCard,
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    isCard: true,
    person: "jeffrey",
  },
  {
    id: "business_card_toby",
    label: "Business Card – SZ-Jie Wang",
    description: "Print-ready business card for SZ-Jie Wang, Managing Director",
    icon: CreditCard,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    isCard: true,
    person: "toby",
  },
  {
    id: "lanyard_jeffrey",
    label: "Lanyard / ID Badge – Jeffrey Minton",
    description: "Print-ready lanyard ID badge for Jeffrey Minton",
    icon: BadgeCheck,
    color: "bg-teal-50 text-teal-700 border-teal-200",
    isLanyard: true,
    person: "jeffrey",
  },
  {
    id: "lanyard_toby",
    label: "Lanyard / ID Badge – SZ-Jie Wang",
    description: "Print-ready lanyard ID badge for SZ-Jie Wang",
    icon: BadgeCheck,
    color: "bg-violet-50 text-violet-700 border-violet-200",
    isLanyard: true,
    person: "toby",
  },
  {
    id: "ndis_onboarding_intake",
    label: "NDIS Client Onboarding Intake Form",
    description: "Professional client onboarding and intake form with SZ-JIE header",
    icon: FileText,
    color: "bg-sky-50 text-sky-700 border-sky-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/5670e5533_NDIS_Onboarding_Intake_Form_Professional_UPDATED_HEADER.html",
  },
  {
    id: "staff_portal_user_guide",
    label: "Staff Portal User Guide",
    description: "Printable staff portal user guide with SZ-JIE branded header",
    icon: ScrollText,
    color: "bg-slate-50 text-slate-700 border-slate-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e8d05e545_Staff_Portal_User_Guide_SZJIE_Header_Standalone.html",
  },
  {
    id: "dsw_registration",
    label: "Disability Support Worker Registration",
    description: "Staff registration form with TFN, bank account, BSB, compliance checks and signatures",
    icon: BadgeCheck,
    color: "bg-green-50 text-green-700 border-green-200",
    isLocal: true,
    localPath: "/disability_support_worker_registration.html",
  },
  {
    id: "logos",
    label: "Brand Logos & Assets",
    description: "All SZ-JIE logo variants — coloured, white, transparent, portrait and landscape",
    icon: ImageIcon,
    color: "bg-pink-50 text-pink-700 border-pink-200",
    isLogos: true,
  },
];

// Convert {{field_name}} to a readable label
function fieldLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// Extract unique {{field}} placeholders from HTML
function extractFields(html) {
  const matches = [...html.matchAll(/\{\{([^}]+)\}\}/g)];
  const seen = new Set();
  const fields = [];
  for (const m of matches) {
    const key = m[1].trim();
    if (!seen.has(key)) {
      seen.add(key);
      fields.push(key);
    }
  }
  return fields;
}

// Replace all {{field}} placeholders with values
function mergeTemplate(html, values) {
  return html.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const v = values[key.trim()];
    return v !== undefined && v !== "" ? v : match;
  });
}

const LONG_FIELDS = new Set(["custom_message", "body", "message", "notes", "description", "additional_info", "additional_notes"]);

// ── Step 1: Template Picker ───────────────────────────────────────────────────
function TemplatePicker({ onSelect }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Templates</h2>
        <p className="text-muted-foreground text-sm">Select a template, fill in the details, then download or print your document.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {TEMPLATES.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="flex items-start gap-4 p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 bg-card border-border hover:border-primary/40 group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${t.color}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-foreground text-base group-hover:text-primary transition-colors">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
                <p className="text-xs text-primary font-semibold mt-3">Use this template →</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Fill Merge Fields ─────────────────────────────────────────────────
function FieldsForm({ template, html, onBack, onPreview }) {
  const fields = extractFields(html);
  const [values, setValues] = useState({});

  const set = (key, val) => setValues(v => ({ ...v, [key]: val }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 font-bold">
          <ArrowLeft size={16} /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{template.label}</h2>
          <p className="text-muted-foreground text-xs">Fill in the fields below. Unfilled fields will remain as placeholders.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        {fields.length === 0 ? (
          <p className="text-muted-foreground text-sm">No merge fields found in this template. Click Preview to proceed.</p>
        ) : (
          fields.map(key => (
            <div key={key}>
              <Label className="text-sm font-bold mb-1 block">{fieldLabel(key)}</Label>
              {LONG_FIELDS.has(key) ? (
                <Textarea
                  value={values[key] || ""}
                  onChange={e => set(key, e.target.value)}
                  placeholder={`Enter ${fieldLabel(key).toLowerCase()}...`}
                  className="min-h-[80px]"
                />
              ) : (
                <Input
                  value={values[key] || ""}
                  onChange={e => set(key, e.target.value)}
                  placeholder={`Enter ${fieldLabel(key).toLowerCase()}...`}
                />
              )}
            </div>
          ))
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Tip:</strong> Any fields you leave blank will show the original placeholder text in the preview. You can go back and edit any time.
      </div>

      <Button
        onClick={() => onPreview(mergeTemplate(html, values))}
        className="w-full font-bold rounded-xl gap-2"
      >
        <FileText size={16} /> Preview Document →
      </Button>
    </div>
  );
}

// ── Step 3: Preview + Download ────────────────────────────────────────────────
function Preview({ template, mergedHtml, onBack }) {
  const downloadHTML = () => {
    const blob = new Blob([mergedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.label.replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    const win = window.open("", "_blank");
    win.document.write(mergedHtml);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 600);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 font-bold">
            <ArrowLeft size={16} /> Edit Fields
          </Button>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{template.label}</h2>
            <p className="text-xs text-muted-foreground">Preview of merged document</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadHTML} className="gap-2 font-bold rounded-xl">
            <Download size={15} /> Download HTML
          </Button>
          <Button onClick={printPDF} className="gap-2 font-bold rounded-xl">
            <Printer size={15} /> Print / Save as PDF
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
        <iframe
          srcDoc={mergedHtml}
          title="Template Preview"
          className="w-full border-0"
          style={{ height: "820px" }}
        />
      </div>
    </div>
  );
}

// ── Business Card / Lanyard Preview ──────────────────────────────────────────
const CARD_DATA = {
  jeffrey: {
    name: "Jeffrey Minton",
    title: "Principal Support Practitioner",
    email: "jeff@szjiesupportservices.com",
    phone: "0401 343 876",
    address: "309/12 Broome St, Waterloo NSW, 2017",
    abn: "86959042971",
    photo: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e563f2b06_Portraint_Transparent.png",
    cardImage: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e22a5ab83_jeffbusinesscard.png",
    lanyardImage: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ed925b089_JeffLanyard.png",
  },
  toby: {
    name: "SZ-Jie Wang",
    title: "Managing Director",
    email: "toby@szjiesupportservices.com",
    phone: "0435 951 563",
    address: "309/12 Broome St, Waterloo NSW, 2017",
    abn: "86959042971",
    photo: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7902e5c70_Portraint_Transparent_White.png",
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
  const isCard = template.isCard;
  const isLanyard = template.isLanyard;
  const isLogos = template.isLogos;
  const person = CARD_DATA[template.person];

  const imageUrl = isCard ? person?.cardImage : isLanyard ? person?.lanyardImage : null;

  const downloadImage = (url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.target = "_blank";
    a.click();
  };

  const printImage = (url) => {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;}img{max-width:100%;height:auto;}</style></head><body><img src="${url}" onload="window.print()"/></body></html>`);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 font-bold">
          <ArrowLeft size={16} /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{template.label}</h2>
          <p className="text-xs text-muted-foreground">{template.description}</p>
        </div>
      </div>

      {isLogos ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {LOGOS.map(logo => (
            <div key={logo.url} className={`rounded-2xl border border-border p-4 ${logo.bg} flex flex-col items-center gap-3`}>
              <img src={logo.url} alt={logo.label} className="h-24 object-contain" />
              <p className="text-xs font-bold text-center text-foreground">{logo.label}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs" onClick={() => downloadImage(logo.url, logo.label.replace(/\s+/g,"_") + ".png")}>
                  <Download size={12} /> Download
                </Button>
                <Button size="sm" className="rounded-xl gap-1 text-xs" onClick={() => printImage(logo.url)}>
                  <Printer size={12} /> Print
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-md">
            <img src={imageUrl} alt={template.label} className={`object-contain ${isLanyard ? "max-h-[600px]" : "max-h-[340px]"}`} />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => downloadImage(imageUrl, template.label.replace(/\s+/g,"_") + ".png")} className="gap-2 font-bold rounded-xl">
              <Download size={15} /> Download PNG
            </Button>
            <Button onClick={() => printImage(imageUrl)} className="gap-2 font-bold rounded-xl">
              <Printer size={15} /> Print
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Templates() {
  const [step, setStep] = useState("pick");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateHtml, setTemplateHtml] = useState("");
  const [mergedHtml, setMergedHtml] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);
    if (template.isCard || template.isLanyard || template.isLogos) {
      setStep("image");
      return;
    }
    setLoading(true);
    const fetchUrl = template.isLocal ? template.localPath : template.url;
    const res = await fetch(fetchUrl);
    const html = await res.text();
    setTemplateHtml(html);
    setLoading(false);
    setStep("fields");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-semibold">Loading template...</p>
        </div>
      </div>
    );
  }

  if (step === "image") {
    return <ImagePreview template={selectedTemplate} onBack={() => setStep("pick")} />;
  }

  if (step === "fields") {
    return (
      <FieldsForm
        template={selectedTemplate}
        html={templateHtml}
        onBack={() => setStep("pick")}
        onPreview={(merged) => { setMergedHtml(merged); setStep("preview"); }}
      />
    );
  }

  if (step === "preview") {
    return (
      <Preview
        template={selectedTemplate}
        mergedHtml={mergedHtml}
        onBack={() => setStep("fields")}
      />
    );
  }

  return <TemplatePicker onSelect={handleSelectTemplate} />;
}