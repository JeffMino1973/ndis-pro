import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Mail, Phone, MapPin, Hash, Shield } from "lucide-react";

const FIELDS = [
  { key: "businessName", label: "Legal Trading Name", placeholder: "e.g. Nexus Care Solutions", icon: Building2 },
  { key: "abn", label: "ABN Number", placeholder: "e.g. 12 345 678 910", icon: Hash },
  { key: "email", label: "Contact Email", placeholder: "e.g. admin@yourprovider.com.au", icon: Mail },
  { key: "phone", label: "Phone Number", placeholder: "e.g. 02 9999 0000", icon: Phone },
  { key: "address", label: "Business Address", placeholder: "e.g. Level 4, 100 George St, Sydney NSW 2000", icon: MapPin },
  { key: "providerNumber", label: "NDIS Provider Number", placeholder: "e.g. 40500111", icon: Shield },
];

export default function SettingsPage() {
  const [config, setConfig] = useState({
    businessName: "",
    abn: "",
    email: "",
    phone: "",
    address: "",
    providerNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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