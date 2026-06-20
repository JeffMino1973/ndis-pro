import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Mail, Phone, MapPin, Hash, Shield, Landmark, Trash2 } from "lucide-react";

const FIELDS = [
  { key: "businessName", label: "Legal Trading Name", placeholder: "e.g. Nexus Care Solutions", icon: Building2 },
  { key: "abn", label: "ABN Number", placeholder: "e.g. 12 345 678 910", icon: Hash },
  { key: "email", label: "Contact Email", placeholder: "e.g. admin@yourprovider.com.au", icon: Mail },
  { key: "phone", label: "Phone Number", placeholder: "e.g. 02 9999 0000", icon: Phone },
  { key: "address", label: "Business Address", placeholder: "e.g. Level 4, 100 George St, Sydney NSW 2000", icon: MapPin },
  { key: "providerNumber", label: "NDIS Provider Number", placeholder: "e.g. 40500111", icon: Shield },
];

// Legacy entity fields (pre-ABN-change)
const LEGACY_FIELDS = [
  { key: "legacyBusinessName", label: "Legacy Trading Name (old ABN)", placeholder: "e.g. SZ-Jie Wang", icon: Building2 },
  { key: "legacyAbn", label: "Legacy ABN", placeholder: "e.g. 44 833 193 250", icon: Hash },
  { key: "legacyEmail", label: "Legacy Email", placeholder: "e.g. Toby7796@gmail.com", icon: Mail },
  { key: "legacyPhone", label: "Legacy Phone", placeholder: "e.g. 0435 951 563", icon: Phone },
  { key: "abnChangeDate", label: "ABN Change Date", placeholder: "e.g. 2026-05-18", icon: Hash },
];

const BANK_FIELDS = [
  { key: "bankName", label: "Bank Name (Current Entity)", placeholder: "e.g. NAB", icon: Landmark },
  { key: "accountName", label: "Account Name (Current Entity)", placeholder: "e.g. SZ-JIE WANG JEFFREY KENNETH MINTON", icon: Building2 },
  { key: "bsb", label: "BSB (Current Entity)", placeholder: "e.g. 083-054", icon: Hash },
  { key: "accountNumber", label: "Account Number (Current Entity)", placeholder: "e.g. 42-731-9774", icon: Hash },
];

const LEGACY_BANK_FIELDS = [
  { key: "legacyBankName", label: "Bank Name (Legacy Entity)", placeholder: "e.g. NAB", icon: Landmark },
  { key: "legacyAccountName", label: "Account Name (Legacy Entity)", placeholder: "e.g. SZ-JIE WANG", icon: Building2 },
  { key: "legacyBsb", label: "BSB (Legacy Entity)", placeholder: "e.g. 083-054", icon: Hash },
  { key: "legacyAccountNumber", label: "Account Number (Legacy Entity)", placeholder: "e.g. 429014456", icon: Hash },
];

export default function SettingsPage() {
  const [config, setConfig] = useState({
    businessName: "",
    abn: "",
    email: "",
    phone: "",
    address: "",
    providerNumber: "",
    bankName: "",
    accountName: "",
    bsb: "",
    accountNumber: "",
    legacyBusinessName: "",
    legacyAbn: "",
    legacyEmail: "",
    legacyPhone: "",
    abnChangeDate: "",
    legacyBankName: "",
    legacyAccountName: "",
    legacyBsb: "",
    legacyAccountNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      if (me?.businessConfig) setConfig(me.businessConfig);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ businessConfig: config });
    toast.success("Business configuration saved!");
    setSaving(false);
  };

  const update = (field, value) => setConfig((prev) => ({ ...prev, [field]: value }));

  const handleClearFinancialRecords = async () => {
    setClearing(true);
    try {
      const [invoices, payslips] = await Promise.all([
        base44.entities.Invoice.list(),
        base44.entities.PayslipRecord.list(),
      ]);
      await Promise.all([
        ...invoices.map(i => base44.entities.Invoice.delete(i.id)),
        ...payslips.map(p => base44.entities.PayslipRecord.delete(p.id)),
      ]);
      toast.success(`Cleared ${invoices.length} invoice(s) and ${payslips.length} payslip(s).`);
    } catch (e) {
      toast.error("Something went wrong clearing records.");
    }
    setClearing(false);
    setConfirmClear(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Business Configuration</h2>
        <p className="text-muted-foreground text-sm">
          These details appear on all invoices, service agreements, and documents.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 lg:p-10 space-y-6">
        {FIELDS.map(({ key, label, placeholder, icon: Icon }) => (
          <div key={key}>
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Icon size={12} /> {label}
            </Label>
            <Input
              value={config[key] || ""}
              onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
              className="rounded-xl"
            />
          </div>
        ))}

        <div className="pt-4 mt-4 border-t border-border">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">ABN Transition (Legacy Entity)</p>
          <p className="text-xs text-muted-foreground mb-4">If your ABN changed, fill in the old details below. Documents will automatically use the correct ABN based on the shift date.</p>
          <div className="space-y-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            {LEGACY_FIELDS.map(({ key, label, placeholder, icon: Icon }) => (
              <div key={key}>
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Icon size={12} /> {label}
                </Label>
                <Input
                  value={config[key] || ""}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  className="rounded-xl"
                  type={key === "abnChangeDate" ? "date" : "text"}
                />
              </div>
            ))}
            {config.abnChangeDate && (
              <div className="text-xs text-amber-800 bg-amber-100 rounded-xl p-3">
                📋 Shifts before <strong>{config.abnChangeDate}</strong> → <strong>{config.legacyBusinessName || "Legacy Entity"}</strong> (ABN {config.legacyAbn || "—"})<br/>
                📋 Shifts from <strong>{config.abnChangeDate}</strong> onwards → <strong>{config.businessName || "Current Entity"}</strong> (ABN {config.abn || "—"})
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-border">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Bank Account Details (shown on invoices & payslips)</p>
          <div className="space-y-6">
            {BANK_FIELDS.map(({ key, label, placeholder, icon: Icon }) => (
              <div key={key}>
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Icon size={12} /> {label}
                </Label>
                <Input
                  value={config[key] || ""}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  className="rounded-xl"
                />
              </div>
            ))}
          </div>
          {config.abnChangeDate && (
            <div className="mt-6 space-y-4">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Legacy Bank Details (pre {config.abnChangeDate})</p>
              {LEGACY_BANK_FIELDS.map(({ key, label, placeholder, icon: Icon }) => (
                <div key={key}>
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Icon size={12} /> {label}
                  </Label>
                  <Input
                    value={config[key] || ""}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={placeholder}
                    className="rounded-xl"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl font-bold py-6 text-base"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border-2 border-red-200 rounded-3xl p-6">
        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Trash2 size={12} /> Danger Zone</p>
        <p className="text-sm text-muted-foreground mb-4">Permanently delete all saved invoices and payslip records. Use this to start fresh after re-entering shifts from your new start date. <strong>This cannot be undone.</strong></p>
        {!confirmClear ? (
          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 font-bold rounded-xl" onClick={() => setConfirmClear(true)}>
            <Trash2 size={15} /> Clear All Financial Records
          </Button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-bold text-red-700">⚠️ Are you sure? This will permanently delete ALL invoices and payslip records.</p>
            <div className="flex gap-3">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl" onClick={handleClearFinancialRecords} disabled={clearing}>
                {clearing ? "Clearing..." : "Yes, Delete Everything"}
              </Button>
              <Button variant="outline" className="rounded-xl font-bold" onClick={() => setConfirmClear(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Card */}
      {(config.businessName || config.abn) && (
        <div className="bg-card border border-border rounded-3xl p-6">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Document Header Preview</p>
          <div className="text-right border-l-4 border-primary pl-4">
            <p className="font-black text-foreground text-lg">{config.businessName || "Your Business Name"}</p>
            {config.abn && <p className="text-sm text-muted-foreground">ABN: {config.abn}</p>}
            {config.address && <p className="text-xs text-muted-foreground">{config.address}</p>}
            {config.email && <p className="text-xs text-muted-foreground">{config.email}</p>}
            {config.phone && <p className="text-xs text-muted-foreground">{config.phone}</p>}
          </div>
        </div>
      )}
    </div>
  );
}