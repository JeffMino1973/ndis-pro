import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const [config, setConfig] = useState({
    businessName: "",
    abn: "",
    address: "",
    email: "",
    phone: "",
    providerNumber: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      if (me?.businessConfig) {
        setConfig(me.businessConfig);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ businessConfig: config });
    toast.success("Configuration saved successfully");
    setSaving(false);
  };

  const update = (field, value) => setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Business Configuration</h2>
        <p className="text-muted-foreground text-sm">Manage your provider business details.</p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 lg:p-10 space-y-6">
        {[
          { key: "businessName", label: "Legal Trading Name", placeholder: "Nexus Care Solutions" },
          { key: "abn", label: "ABN Number", placeholder: "12 345 678 910" },
          { key: "address", label: "Business Address", placeholder: "Level 4, 100 George St, Sydney NSW" },
          { key: "email", label: "Contact Email", placeholder: "admin@example.com.au" },
          { key: "phone", label: "Phone Number", placeholder: "02 xxxx xxxx" },
          { key: "providerNumber", label: "NDIS Provider Number", placeholder: "40500111" },
        ].map((field) => (
          <div key={field.key}>
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
              {field.label}
            </Label>
            <Input
              value={config[field.key] || ""}
              onChange={(e) => update(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="rounded-xl"
            />
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl font-bold py-6 text-base">
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}