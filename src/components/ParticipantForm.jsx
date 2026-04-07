import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ParticipantForm({ onSave, initial }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      ndis_number: "",
      plan_type: "Plan Managed",
      status: "Active",
      email: "",
      phone: "",
      address: "",
      primary_disability: "",
      medical_alerts: "",
      next_review: "",
      budget_core: 0,
      budget_capacity: 0,
      budget_capital: 0,
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (initial?.id) {
      await base44.entities.Participant.update(initial.id, form);
    } else {
      await base44.entities.Participant.create(form);
    }
    setSaving(false);
    onSave();
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Enter name" />
        </div>
        <div>
          <Label>NDIS Number *</Label>
          <Input value={form.ndis_number} onChange={(e) => update("ndis_number", e.target.value)} placeholder="430 xxx xxx" />
        </div>
        <div>
          <Label>Plan Type</Label>
          <Select value={form.plan_type} onValueChange={(v) => update("plan_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Plan Managed">Plan Managed</SelectItem>
              <SelectItem value="Self Managed">Self Managed</SelectItem>
              <SelectItem value="NDIA Managed">NDIA Managed</SelectItem>
              <SelectItem value="Combination">Combination</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => update("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Review Due">Review Due</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Email</Label>
          <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@example.com" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="04xx xxx xxx" />
        </div>
        <div className="md:col-span-2">
          <Label>Address</Label>
          <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, Suburb NSW" />
        </div>
        <div>
          <Label>Primary Disability</Label>
          <Input value={form.primary_disability} onChange={(e) => update("primary_disability", e.target.value)} />
        </div>
        <div>
          <Label>Next Plan Review</Label>
          <Input type="date" value={form.next_review} onChange={(e) => update("next_review", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Medical Alerts</Label>
          <Textarea value={form.medical_alerts} onChange={(e) => update("medical_alerts", e.target.value)} placeholder="Any allergies, conditions..." />
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-foreground mb-3">Funding Budget</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Core ($)</Label>
            <Input type="number" value={form.budget_core} onChange={(e) => update("budget_core", Number(e.target.value))} />
          </div>
          <div>
            <Label>Capacity ($)</Label>
            <Input type="number" value={form.budget_capacity} onChange={(e) => update("budget_capacity", Number(e.target.value))} />
          </div>
          <div>
            <Label>Capital ($)</Label>
            <Input type="number" value={form.budget_capital} onChange={(e) => update("budget_capital", Number(e.target.value))} />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving || !form.name || !form.ndis_number} className="w-full rounded-xl font-bold">
        {saving ? "Saving..." : initial?.id ? "Update Participant" : "Create Participant"}
      </Button>
    </div>
  );
}