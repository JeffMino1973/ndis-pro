import { useState } from "react";
import { Download, FileText, Mail, User, Printer, ArrowLeft, Loader2, Receipt, Users } from "lucide-react";
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
    id: "invoice",
    label: "Invoice Email",
    description: "NDIS invoice claim email for plan managers",
    icon: Receipt,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/df36de2b3_Invoice.html",
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
    id: "payslip_advice",
    label: "Payslip Advice",
    description: "Payslip notification email to send to staff members",
    icon: FileText,
    color: "bg-violet-50 text-violet-700 border-violet-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/dd239644c_Payslip_Advice.html",
  },
  {
    id: "staff_onboarding",
    label: "Staff Onboarding",
    description: "Welcome and onboarding email for new staff members",
    icon: Users,
    color: "bg-rose-50 text-rose-700 border-rose-200",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/f1c350195_Staff_Onboarding.html",
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Templates() {
  const [step, setStep] = useState("pick");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateHtml, setTemplateHtml] = useState("");
  const [mergedHtml, setMergedHtml] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectTemplate = async (template) => {
    setLoading(true);
    setSelectedTemplate(template);
    const res = await fetch(template.url);
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