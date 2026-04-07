import { useState } from "react";
import { Printer, Mail, Phone, MapPin, Award, GraduationCap, Briefcase, Heart, Users, Home, Accessibility, Star, Send, Pencil, Check, Plus, X, UserCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PHOTO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/9c2ede7a8_Picture1.png";

const ICON_MAP = { Home, Accessibility, Users, Heart, Star, Award, GraduationCap, Briefcase, UserCircle };
const ICON_OPTIONS = Object.keys(ICON_MAP);

const DEFAULT_DATA = {
  name: "Sz-Jie (Toby)",
  title: "Certified Disability Support Worker",
  location: "Waterloo, NSW 2017 · Available across Sydney Metro",
  phone: "0435 951 563",
  email: "Toby7796@gmail.com",
  address: "309/12 Broome St, Waterloo NSW 2017",
  languages: "English · Mandarin · Cantonese",
  bio1: "Compassionate and dedicated Disability Support Worker with certification in Individual Support and practical training experience in person-centered care. Committed to empowering individuals with disabilities to live independently and with dignity.",
  bio2: "Fluent in English, Mandarin and Cantonese — making Toby especially well-suited to support participants from culturally and linguistically diverse backgrounds. Skilled in daily living assistance, mobility support, and fostering genuine social inclusion.",
  values: ["Compassion", "Dignity", "Patience", "Inclusion", "Respect", "Independence"],
  availability: [
    { day: "Mon – Fri", time: "7am – 8pm" },
    { day: "Saturday", time: "8am – 6pm" },
    { day: "Sunday", time: "By request" },
  ],
  services: [
    { icon: "Home", title: "Daily Living Support", desc: "Assistance with household tasks and personal care routines." },
    { icon: "Accessibility", title: "Mobility Assistance", desc: "Safe transfers, travel training, and community access support." },
    { icon: "Users", title: "Social Inclusion", desc: "Engaging in community activities and social events." },
    { icon: "Heart", title: "Person-Centered Care", desc: "Tailored support focused on your individual goals and needs." },
    { icon: "Star", title: "Community Participation", desc: "Transport, outings, and recreational activity support." },
    { icon: "Award", title: "Behaviour & Communication", desc: "Positive support strategies with patience and respect." },
  ],
  qualifications: [
    { icon: "GraduationCap", title: "Certificate III in Individual Support", sub: "Specialisation in Disability Support" },
    { icon: "Award", title: "NDIS Worker Screening Check", sub: "Cleared & Verified" },
    { icon: "Award", title: "First Aid Certificate", sub: "CPR & Emergency Response" },
    { icon: "Briefcase", title: "Practical Training Experience", sub: "Hands-on care training and social inclusion fostering." },
  ],
};

function EditableText({ value, onChange, editing, multiline, className }) {
  if (!editing) return <span className={className}>{value}</span>;
  if (multiline) return <Textarea value={value} onChange={e => onChange(e.target.value)} className={`text-sm ${className}`} rows={3} />;
  return <Input value={value} onChange={e => onChange(e.target.value)} className={`h-8 text-sm ${className}`} />;
}

export default function TobyProfile() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [editing, setEditing] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  // Services
  const updateService = (i, field, val) => setData(prev => {
    const services = prev.services.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    return { ...prev, services };
  });
  const addService = () => setData(prev => ({ ...prev, services: [...prev.services, { icon: "Star", title: "New Service", desc: "Description here." }] }));
  const removeService = (i) => setData(prev => ({ ...prev, services: prev.services.filter((_, idx) => idx !== i) }));

  // Qualifications
  const updateQual = (i, field, val) => setData(prev => {
    const qualifications = prev.qualifications.map((q, idx) => idx === i ? { ...q, [field]: val } : q);
    return { ...prev, qualifications };
  });
  const addQual = () => setData(prev => ({ ...prev, qualifications: [...prev.qualifications, { icon: "Award", title: "New Qualification", sub: "Details here." }] }));
  const removeQual = (i) => setData(prev => ({ ...prev, qualifications: prev.qualifications.filter((_, idx) => idx !== i) }));

  // Values
  const updateValue = (i, val) => setData(prev => {
    const values = prev.values.map((v, idx) => idx === i ? val : v);
    return { ...prev, values };
  });
  const addValue = () => setData(prev => ({ ...prev, values: [...prev.values, "New Value"] }));
  const removeValue = (i) => setData(prev => ({ ...prev, values: prev.values.filter((_, idx) => idx !== i) }));

  // Availability
  const updateAvail = (i, field, val) => setData(prev => {
    const availability = prev.availability.map((a, idx) => idx === i ? { ...a, [field]: val } : a);
    return { ...prev, availability };
  });
  const addAvail = () => setData(prev => ({ ...prev, availability: [...prev.availability, { day: "Day", time: "Time" }] }));
  const removeAvail = (i) => setData(prev => ({ ...prev, availability: prev.availability.filter((_, idx) => idx !== i) }));

  const PROFILE_URL = window.location.origin + "/toby";
  const EMAIL_BODY = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;background:#f8fafc;margin:0}.wrap{max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden}.header{background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:32px 40px;color:white}.header h1{margin:0 0 6px;font-size:22px}.body{padding:32px 40px}.cta{display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:20px}</style></head><body><div class="wrap"><div class="header"><h1>Meet Your Support Worker — ${data.name}</h1><p style="margin:0;opacity:.85">${data.title} · Sydney NSW</p></div><div class="body"><p>Hi there,</p><p>I'd like to introduce you to <strong>${data.name}</strong>, a certified Disability Support Worker based in Waterloo, NSW.</p><p>${data.bio1}</p><a href="${PROFILE_URL}" class="cta">View Full Profile →</a><p style="margin-top:24px;color:#64748b;font-size:13px">Contact: <a href="mailto:${data.email}">${data.email}</a> · ${data.phone}</p></div></div></body></html>`;

  const sendProfile = async () => {
    if (!recipient) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({ to: recipient, subject: `Meet Your Support Worker — ${data.name}`, body: EMAIL_BODY });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Action buttons */}
      <div className="no-print fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">
        {editing && <p className="text-xs bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded shadow">Editing mode on</p>}
        <Button onClick={() => setEditing(e => !e)} className={`rounded-full shadow-xl gap-2 ${editing ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600"}`}>
          {editing ? <><Check size={16} /> Done Editing</> : <><Pencil size={16} /> Edit Profile</>}
        </Button>
        <Button onClick={() => { setShowEmail(true); setSent(false); setRecipient(""); }} className="rounded-full shadow-xl gap-2 bg-blue-600 hover:bg-blue-700">
          <Mail size={16} /> Email Profile
        </Button>
        <Button onClick={() => window.print()} className="rounded-full shadow-2xl gap-2 bg-slate-900 hover:bg-slate-800">
          <Printer size={16} /> Print / Save PDF
        </Button>
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmail} onOpenChange={setShowEmail}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Email Toby's Profile</DialogTitle></DialogHeader>
          {sent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><Send size={20} className="text-emerald-600" /></div>
              <p className="font-black">Profile sent!</p>
              <p className="text-sm text-muted-foreground">Emailed to <strong>{recipient}</strong></p>
              <Button onClick={() => setShowEmail(false)} className="w-full rounded-xl">Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div><Label>Recipient Email</Label><Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="client@example.com" type="email" className="mt-1" /></div>
              <Button onClick={sendProfile} disabled={!recipient || sending} className="w-full rounded-xl font-bold gap-2">
                <Mail size={15} /> {sending ? "Sending..." : "Send Profile"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hero */}
      <div className="h-48 w-full bg-gradient-to-r from-sky-500 to-blue-700" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 -mt-24">
        {/* Profile Card */}
        <div className="bg-white/95 border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-44 h-44 rounded-full border-4 border-white shadow-lg overflow-hidden shrink-0 -mt-24 bg-white">
              <img src={PHOTO} alt="Toby" className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left flex-grow pt-2">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-900">
                  <EditableText value={data.name} onChange={v => update("name", v)} editing={editing} />
                </h1>
                <span className="text-[11px] font-black bg-sky-50 text-sky-700 px-3 py-1 rounded-full uppercase tracking-widest border border-sky-200">✓ Verified Provider</span>
              </div>
              <p className="text-lg text-blue-600 font-semibold mb-1">
                <EditableText value={data.title} onChange={v => update("title", v)} editing={editing} />
              </p>
              <p className="text-sm text-slate-500 mb-5 flex items-center gap-1 justify-center md:justify-start">
                <MapPin size={14} className="text-blue-400 shrink-0" />
                <EditableText value={data.location} onChange={v => update("location", v)} editing={editing} />
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start no-print">
                <a href={`mailto:${data.email}`} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">
                  <Mail size={15} /> Email Toby
                </a>
                <a href={`tel:${data.phone}`} className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm transition">
                  <Phone size={15} /> {data.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-black text-base mb-4 flex items-center gap-2"><Mail size={16} className="text-blue-500" /> Contact Details</h2>
              <ul className="space-y-4 text-sm">
                {[["Address", "address"], ["Phone", "phone"], ["Email", "email"], ["Languages", "languages"]].map(([label, key]) => (
                  <li key={key}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      <EditableText value={data[key]} onChange={v => update(key, v)} editing={editing} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Values */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-black text-base mb-4 flex items-center gap-2"><Star size={16} className="text-blue-500" /> Core Values</h2>
              <div className="flex flex-wrap gap-2">
                {data.values.map((v, i) => (
                  <span key={i} className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                    {editing ? (
                      <>
                        <input value={v} onChange={e => updateValue(i, e.target.value)} className="bg-transparent w-16 outline-none text-xs" />
                        <button onClick={() => removeValue(i)} className="text-rose-400 hover:text-rose-600"><X size={10} /></button>
                      </>
                    ) : v}
                  </span>
                ))}
                {editing && (
                  <button onClick={addValue} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full hover:bg-primary/20">
                    <Plus size={10} /> Add
                  </button>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-black text-base mb-3 text-blue-800">Availability</h2>
              <div className="space-y-2">
                {data.availability.map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    {editing ? (
                      <>
                        <Input value={a.day} onChange={e => updateAvail(i, "day", e.target.value)} className="h-7 text-xs w-28" />
                        <Input value={a.time} onChange={e => updateAvail(i, "time", e.target.value)} className="h-7 text-xs w-24" />
                        <button onClick={() => removeAvail(i)} className="text-rose-400 hover:text-rose-600"><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-600 font-semibold text-sm">{a.day}</span>
                        <span className="text-blue-700 font-bold text-sm">{a.time}</span>
                      </>
                    )}
                  </div>
                ))}
                {editing && (
                  <button onClick={addAvail} className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2 hover:underline">
                    <Plus size={12} /> Add Row
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black mb-4 text-slate-900">About Toby</h2>
              <div className="text-slate-600 leading-relaxed mb-4">
                <EditableText value={data.bio1} onChange={v => update("bio1", v)} editing={editing} multiline />
              </div>
              <div className="text-slate-600 leading-relaxed">
                <EditableText value={data.bio2} onChange={v => update("bio2", v)} editing={editing} multiline />
              </div>
            </section>

            {/* Services */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black mb-6 text-slate-900">Services & Expertise</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.services.map((s, i) => {
                  const Icon = ICON_MAP[s.icon] || Star;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition relative">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg shrink-0"><Icon size={16} /></div>
                      <div className="flex-1 min-w-0">
                        {editing ? (
                          <>
                            <Input value={s.title} onChange={e => updateService(i, "title", e.target.value)} className="h-7 text-xs font-bold mb-1" />
                            <Input value={s.desc} onChange={e => updateService(i, "desc", e.target.value)} className="h-7 text-xs" />
                            <select value={s.icon} onChange={e => updateService(i, "icon", e.target.value)} className="mt-1 text-[10px] border rounded p-0.5 w-full">
                              {ICON_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </>
                        ) : (
                          <>
                            <h3 className="font-bold text-slate-800 text-sm">{s.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                          </>
                        )}
                      </div>
                      {editing && (
                        <button onClick={() => removeService(i)} className="absolute top-2 right-2 text-rose-400 hover:text-rose-600"><X size={14} /></button>
                      )}
                    </div>
                  );
                })}
                {editing && (
                  <button onClick={addService} className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary/30 text-primary font-bold text-sm hover:border-primary hover:bg-primary/5 transition">
                    <Plus size={16} /> Add Service
                  </button>
                )}
              </div>
            </section>

            {/* Qualifications */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black mb-6 text-slate-900">Training & Qualifications</h2>
              <div className="space-y-5">
                {data.qualifications.map((q, i) => {
                  const Icon = ICON_MAP[q.icon] || Award;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0"><Icon size={18} /></div>
                      <div className="flex-1">
                        {editing ? (
                          <>
                            <Input value={q.title} onChange={e => updateQual(i, "title", e.target.value)} className="h-7 text-xs font-bold mb-1" />
                            <Input value={q.sub} onChange={e => updateQual(i, "sub", e.target.value)} className="h-7 text-xs" />
                            <select value={q.icon} onChange={e => updateQual(i, "icon", e.target.value)} className="mt-1 text-[10px] border rounded p-0.5 w-full">
                              {ICON_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </>
                        ) : (
                          <>
                            <h3 className="font-bold text-slate-800">{q.title}</h3>
                            <p className="text-sm text-slate-500">{q.sub}</p>
                          </>
                        )}
                      </div>
                      {editing && (
                        <button onClick={() => removeQual(i)} className="text-rose-400 hover:text-rose-600 mt-1"><X size={14} /></button>
                      )}
                    </div>
                  );
                })}
                {editing && (
                  <button onClick={addQual} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                    <Plus size={14} /> Add Qualification
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-8 pb-10 text-center text-slate-400 text-xs no-print">
        © 2026 {data.name} · Independent NDIS Support Worker · Sydney NSW
      </footer>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}