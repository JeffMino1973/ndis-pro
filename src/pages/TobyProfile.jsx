import { useState } from "react";
import { Printer, Mail, Phone, MapPin, Award, GraduationCap, Briefcase, Heart, Users, Home, Accessibility, Star, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const PHOTO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/9c2ede7a8_Picture1.png";

const services = [
  { icon: Home, title: "Daily Living Support", desc: "Assistance with household tasks and personal care routines." },
  { icon: Accessibility, title: "Mobility Assistance", desc: "Safe transfers, travel training, and community access support." },
  { icon: Users, title: "Social Inclusion", desc: "Engaging in community activities and social events." },
  { icon: Heart, title: "Person-Centered Care", desc: "Tailored support focused on your individual goals and needs." },
  { icon: Star, title: "Community Participation", desc: "Transport, outings, and recreational activity support." },
  { icon: Award, title: "Behaviour & Communication", desc: "Positive support strategies with patience and respect." },
];

const qualifications = [
  { icon: GraduationCap, title: "Certificate III in Individual Support", sub: "Specialisation in Disability Support" },
  { icon: Award, title: "NDIS Worker Screening Check", sub: "Cleared & Verified" },
  { icon: Award, title: "First Aid Certificate", sub: "CPR & Emergency Response" },
  { icon: Briefcase, title: "Practical Training Experience", sub: "Hands-on care training and social inclusion fostering." },
];

const PROFILE_URL = window.location.origin + "/toby";

const EMAIL_BODY = `
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:0}
.wrap{max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden}
.header{background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:32px 40px;color:white}
.header h1{margin:0 0 6px;font-size:22px}  
.body{padding:32px 40px}
.cta{display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:20px}
</style></head><body>
<div class="wrap">
  <div class="header"><h1>Meet Your Support Worker — Toby</h1><p style="margin:0;opacity:.85">Certified NDIS Disability Support Worker · Sydney NSW</p></div>
  <div class="body">
    <p>Hi there,</p>
    <p>I'd like to introduce you to <strong>Sz-Jie (Toby)</strong>, a certified Disability Support Worker based in Waterloo, NSW. Toby is compassionate, patient, and fluent in English, Mandarin, and Cantonese.</p>
    <p><strong>Services include:</strong> Daily Living Support, Mobility Assistance, Social Inclusion, Community Participation, and Person-Centered Care.</p>
    <p>View Toby's full profile below:</p>
    <a href="${PROFILE_URL}" class="cta">View Full Profile →</a>
    <p style="margin-top:24px;color:#64748b;font-size:13px">To get in touch directly: <a href="mailto:Toby7796@gmail.com">Toby7796@gmail.com</a> · 0435 951 563</p>
  </div>
</div>
</body></html>
`;

export default function TobyProfile() {
  const [showEmail, setShowEmail] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendProfile = async () => {
    if (!recipient) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: recipient,
      subject: "Meet Your Support Worker — Toby (NDIS Disability Support)",
      body: EMAIL_BODY,
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-inter">
      {/* Action buttons */}
      <div className="no-print fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">
        <p className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded shadow">Share or Print as PDF</p>
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

      {/* Hero Banner */}
      <div className="h-48 w-full bg-gradient-to-r from-sky-500 to-blue-700" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 -mt-24">
        {/* Profile Card */}
        <div className="bg-white/95 backdrop-blur border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Photo */}
            <div className="w-44 h-44 rounded-full border-4 border-white shadow-lg overflow-hidden shrink-0 -mt-24 bg-white">
              <img src={PHOTO} alt="Toby" className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-grow pt-2">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-900">Sz-Jie (Toby)</h1>
                <span className="text-[11px] font-black bg-sky-50 text-sky-700 px-3 py-1 rounded-full uppercase tracking-widest border border-sky-200">✓ Verified Provider</span>
              </div>
              <p className="text-lg text-blue-600 font-semibold mb-1">Certified Disability Support Worker</p>
              <p className="text-sm text-slate-500 mb-5 flex items-center gap-1 justify-center md:justify-start">
                <MapPin size={14} className="text-blue-400" /> Waterloo, NSW 2017 · Available across Sydney Metro
              </p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start no-print">
                <a href="mailto:Toby7796@gmail.com" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">
                  <Mail size={15} /> Email Toby
                </a>
                <a href="tel:0435951563" className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm transition">
                  <Phone size={15} /> 0435 951 563
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
              <h2 className="font-black text-base mb-4 flex items-center gap-2 text-slate-800">
                <Mail size={16} className="text-blue-500" /> Contact Details
              </h2>
              <ul className="space-y-4 text-sm">
                {[
                  { label: "Address", value: "309/12 Broome St, Waterloo NSW 2017" },
                  { label: "Phone", value: "0435 951 563" },
                  { label: "Email", value: "Toby7796@gmail.com" },
                  { label: "Languages", value: "English · Mandarin · Cantonese" },
                ].map(item => (
                  <li key={item.label}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{item.value}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Values */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-black text-base mb-4 flex items-center gap-2">
                <Star size={16} className="text-blue-500" /> Core Values
              </h2>
              <div className="flex flex-wrap gap-2">
                {["Compassion", "Dignity", "Patience", "Inclusion", "Respect", "Independence"].map(v => (
                  <span key={v} className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{v}</span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-black text-base mb-3 text-blue-800">Availability</h2>
              <div className="space-y-1 text-sm">
                {[["Mon – Fri", "7am – 8pm"], ["Saturday", "8am – 6pm"], ["Sunday", "By request"]].map(([day, time]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-slate-600 font-semibold">{day}</span>
                    <span className="text-blue-700 font-bold">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black mb-4 text-slate-900">About Toby</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Compassionate and dedicated Disability Support Worker with certification in Individual Support and practical training experience in person-centered care. Committed to empowering individuals with disabilities to live independently and with dignity.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Fluent in English, Mandarin and Cantonese — making Toby especially well-suited to support participants from culturally and linguistically diverse backgrounds. Skilled in daily living assistance, mobility support, and fostering genuine social inclusion. Known for warmth, patience, and a respectful approach tailored to each individual's needs.
              </p>
            </section>

            {/* Services */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black mb-6 text-slate-900">Services & Expertise</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg shrink-0">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Qualifications */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black mb-6 text-slate-900">Training & Qualifications</h2>
              <div className="space-y-5">
                {qualifications.map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{title}</h3>
                      <p className="text-sm text-slate-500">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-8 pb-10 text-center text-slate-400 text-xs no-print">
        © 2026 Sz-Jie (Toby) · Independent NDIS Support Worker · Sydney NSW
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