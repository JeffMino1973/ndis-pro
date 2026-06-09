import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Phone, MapPin, Printer, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function StaffMyProfile({ staffRecord, user }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [bio, setBio] = useState(staffRecord?.bio || "");
  const [languages, setLanguages] = useState(staffRecord?.languages || "");

  const handleSave = async () => {
    if (!staffRecord) return;
    setSaving(true);
    await base44.entities.StaffMember.update(staffRecord.id, { bio, languages });
    setSaving(false);
    setEditing(false);
  };

  const getProfileHTML = () => {
    const name = staffRecord?.name || user?.full_name || "Staff Member";
    const role = staffRecord?.role || "";
    const phone = staffRecord?.phone || "";
    const email = staffRecord?.email || user?.email || "";
    const address = staffRecord?.address || "";
    const photo = staffRecord?.photo_url || "";

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 0; color: #1e293b; }
      .hero { background: linear-gradient(135deg, #3b82f6, #1d4ed8); height: 160px; }
      .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin: 0 24px; margin-top: -60px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      h1 { font-size: 28px; font-weight: 900; margin: 0; }
      .badge { background: #eff6ff; color: #1d4ed8; font-size: 10px; font-weight: 900; padding: 3px 10px; border-radius: 999px; border: 1px solid #bfdbfe; text-transform: uppercase; letter-spacing: 0.1em; }
      .photo { width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); object-fit: cover; margin-top: -60px; }
      .section { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
      .label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
      .value { font-weight: 600; font-size: 14px; margin-top: 2px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 32px; padding-bottom: 24px; }
      @media print { .no-print { display: none; } }
      .print-btn { position: fixed; top: 16px; right: 16px; padding: 8px 16px; background: #1d4ed8; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }
    </style></head><body>
    <button class="print-btn no-print" onclick="window.print()">🖨 Print / Save PDF</button>
    <div class="hero"></div>
    <div style="padding: 0 24px 32px;">
      <div class="card">
        <div style="display:flex; align-items: flex-start; gap: 20px; flex-wrap: wrap;">
          ${photo ? `<img src="${photo}" class="photo" alt="${name}" />` : `<div style="width:120px;height:120px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;color:#1d4ed8;margin-top:-60px;border:4px solid white;">${name.charAt(0)}</div>`}
          <div style="flex:1; padding-top: 8px;">
            <div style="display:flex; align-items:center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;">
              <h1>${name}</h1>
              <span class="badge">✓ Verified Worker</span>
            </div>
            <p style="font-size:16px; color:#3b82f6; font-weight:600; margin:4px 0;">${role}</p>
            ${phone ? `<p style="font-size:13px; color:#64748b; margin:2px 0;">📞 ${phone}</p>` : ""}
            ${email ? `<p style="font-size:13px; color:#64748b; margin:2px 0;">✉️ ${email}</p>` : ""}
            ${address ? `<p style="font-size:13px; color:#64748b; margin:2px 0;">📍 ${address}</p>` : ""}
          </div>
        </div>
        ${bio ? `<div class="section"><p class="label">About</p><p style="font-size:14px; color:#475569; line-height:1.7; margin-top:8px;">${bio}</p></div>` : ""}
        ${languages ? `<div class="section"><div class="grid"><div><p class="label">Languages</p><p class="value">${languages}</p></div></div></div>` : ""}
      </div>
    </div>
    <footer>SZ-Jie Support Services &nbsp;·&nbsp; NDIS Registered Provider &nbsp;·&nbsp; Sydney NSW</footer>
    </body></html>`;
  };

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(getProfileHTML());
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  const sendProfile = async () => {
    if (!recipient) return;
    setSending(true);
    const name = staffRecord?.name || user?.full_name || "Staff Member";
    await base44.integrations.Core.SendEmail({
      to: recipient,
      subject: `Meet Your Support Worker — ${name}`,
      body: getProfileHTML(),
    });
    setSending(false);
    setSent(true);
  };

  if (!staffRecord) return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
      <p className="font-black text-amber-800">No staff profile found</p>
      <p className="text-sm text-amber-600 mt-1">Ask your admin to create your staff profile so your details appear here.</p>
    </div>
  );

  const name = staffRecord.name;
  const photo = staffRecord.photo_url;

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}
          className={`rounded-xl gap-2 font-bold text-xs ${editing ? "bg-emerald-600 hover:bg-emerald-700" : ""}`} size="sm">
          {editing ? <><Check size={13} /> {saving ? "Saving…" : "Save Changes"}</> : "✏️ Edit Bio"}
        </Button>
        <Button onClick={() => { setShowEmail(true); setSent(false); setRecipient(""); }} variant="outline" size="sm" className="rounded-xl gap-2 font-bold text-xs">
          <Mail size={13} /> Email Profile
        </Button>
        <Button onClick={handlePrint} variant="outline" size="sm" className="rounded-xl gap-2 font-bold text-xs">
          <Printer size={13} /> Print / PDF
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-32 rounded-t-2xl" />
      <div className="bg-card border border-border rounded-b-2xl p-6 -mt-10 mx-0">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {photo
            ? <img src={photo} alt={name} className="w-28 h-28 rounded-2xl object-cover border-4 border-card shadow -mt-14" />
            : <div className="w-28 h-28 rounded-2xl bg-primary/20 flex items-center justify-center text-4xl font-black text-primary border-4 border-card shadow -mt-14">{name?.charAt(0)}</div>
          }
          <div className="flex-1 pt-2">
            <h2 className="text-2xl font-black">{name}</h2>
            <p className="text-primary font-semibold text-sm">{staffRecord.role}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              {staffRecord.phone && <span className="flex items-center gap-1"><Phone size={11} /> {staffRecord.phone}</span>}
              {(staffRecord.email || user?.email) && <span className="flex items-center gap-1"><Mail size={11} /> {staffRecord.email || user?.email}</span>}
              {staffRecord.address && <span className="flex items-center gap-1"><MapPin size={11} /> {staffRecord.address}</span>}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {/* Bio */}
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">About</p>
            {editing
              ? <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="text-sm" placeholder="Write a short bio about yourself…" />
              : <p className="text-sm text-muted-foreground leading-relaxed">{bio || <span className="italic">No bio added yet.</span>}</p>
            }
          </div>

          {/* Languages */}
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Languages</p>
            {editing
              ? <Input value={languages} onChange={e => setLanguages(e.target.value)} className="text-sm max-w-xs" placeholder="e.g. English · Mandarin" />
              : <p className="text-sm font-semibold">{languages || <span className="italic text-muted-foreground">Not specified</span>}</p>
            }
          </div>

          {/* Compliance summary */}
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Credentials</p>
            <div className="flex flex-wrap gap-2">
              {staffRecord.police_check && (
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${staffRecord.police_check === "Cleared" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  Police Check: {staffRecord.police_check}
                </span>
              )}
              {staffRecord.wwcc_expiry && (
                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  WWCC Exp: {staffRecord.wwcc_expiry}
                </span>
              )}
              {staffRecord.first_aid_expiry && (
                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                  First Aid Exp: {staffRecord.first_aid_expiry}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmail} onOpenChange={setShowEmail}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Email Profile</DialogTitle></DialogHeader>
          {sent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><Send size={20} className="text-emerald-600" /></div>
              <p className="font-black">Profile sent!</p>
              <Button onClick={() => setShowEmail(false)} className="w-full rounded-xl">Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div><Label>Recipient Email</Label><Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="participant@example.com" type="email" className="mt-1" /></div>
              <Button onClick={sendProfile} disabled={!recipient || sending} className="w-full rounded-xl font-bold gap-2">
                <Mail size={15} /> {sending ? "Sending…" : "Send Profile"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}