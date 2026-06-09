import { Phone, Mail, MapPin, Heart, Users, Shield, Zap, ExternalLink, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const LOGO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/3aff76fe9_ChatGPTImageMay31202609_02_19AM.png";
const HERO_IMG = "https://media.base44.com/images/public/69d54775d9a169daad84a133/d61ac5d59_generated_image.png";

const POLICIES = [
  {
    num: "01",
    title: "NDIS Code of Conduct",
    subtitle: "Ethical Service Standards",
    content: (
      <div className="space-y-4">
        <p className="text-slate-500 text-sm">As a registered NDIS provider, SZ-JIE WANG and all associated staff are bound by the NDIS Code of Conduct to ensure integrity and safety in every interaction.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Respect", desc: "We act with respect for individual rights to freedom of expression, self-determination, and decision-making." },
            { label: "Safety", desc: "We provide supports and services in a safe and competent manner with care and skill." },
            { label: "Integrity", desc: "We act with integrity, honesty, and transparency, ensuring no conflict of interest impacts support quality." },
            { label: "Zero Tolerance", desc: "We take all reasonable steps to prevent and respond to all forms of violence, exploitation, neglect, and abuse." },
          ].map((c, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest mb-1">Commitment {i + 1}: {c.label}</p>
              <p className="text-xs text-slate-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "02",
    title: "Participant Rights",
    subtitle: "Individual Values and Beliefs",
    content: (
      <div className="space-y-4">
        <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-500 text-sm">"Each participant has the right to be treated with dignity and respect, and to have their individual values and beliefs acknowledged and respected."</blockquote>
        <div className="space-y-3">
          {[
            { n: 1, title: "Person-Centred Support", desc: "Every support plan is co-designed with the participant to reflect their goals, culture, and identity." },
            { n: 2, title: "Dignity of Risk", desc: "We support the participant's right to take calculated risks and make choices, provided they understand the potential outcomes." },
            { n: 3, title: "Advocacy Access", desc: "Participants are informed of their right to an independent advocate to assist them in decision-making or communication." },
          ].map((item) => (
            <div key={item.n} className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-xs font-black flex items-center justify-center shrink-0">{item.n}</span>
              <div><p className="font-bold text-sm text-[#0F172A]">{item.title}</p><p className="text-xs text-slate-500">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "03",
    title: "Privacy & Confidentiality",
    subtitle: "Data Protection & Privacy Policy",
    content: (
      <div className="space-y-4 text-sm text-slate-500">
        <p>Compliant with the <em>Privacy Act 1988 (Cth)</em> and the 13 Australian Privacy Principles (APPs).</p>
        <div className="space-y-2">
          {[
            { label: "Collection & Use", desc: "We only collect personal and health information necessary to provide high-quality support. Written consent is required before collecting or sharing data." },
            { label: "Digital Records", desc: "Stored on encrypted servers with multi-factor authentication." },
            { label: "Physical Records", desc: "Kept in locked, fireproof cabinets accessible only to authorized personnel." },
            { label: "Data Breach", desc: "Treated as a Reportable Incident and notified to the OAIC within 72 hours if serious harm is likely." },
            { label: "Participant Access", desc: "Participants have a legal right to request access to their personal records. Requests processed within 14 days." },
          ].map((item, i) => (
            <div key={i} className="flex gap-2"><span className="font-bold text-[#0F172A] shrink-0">{item.label}:</span><span>{item.desc}</span></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "04",
    title: "Complaints & Feedback",
    subtitle: "Complaints Management System",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">We view complaints as opportunities for service improvement. Participants can raise concerns without fear of retribution.</p>
        <div className="space-y-2">
          {["Acknowledge within 48 hours", "Investigate & Assess within 10 days", "Provide Resolution within 21 days", "Record in Quality Register"].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-400 w-5">0{i + 1}</span>
              <p className="text-sm text-slate-700">{step}</p>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-bold text-[#0F172A] mb-1">External Escalation: NDIS Quality and Safeguards Commission</p>
          <p className="text-xs text-slate-500">Call <strong>1800 035 544</strong> or visit <a href="https://www.ndiscommission.gov.au" target="_blank" rel="noopener noreferrer" className="underline">ndiscommission.gov.au</a></p>
        </div>
      </div>
    ),
  },
  {
    num: "05",
    title: "Incident Management",
    subtitle: "Incident Identification & Reporting",
    content: (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-red-50 border border-red-100 rounded-lg p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Reportable Incidents (24h)</p>
            {["Death of a participant", "Serious physical/psychological injury", "Abuse, neglect, or exploitation", "Unlawful sexual/physical contact"].map((x, i) => <p key={i} className="text-xs text-red-700 mb-1">• {x}</p>)}
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Internal Incidents</p>
            {["Near misses", "Property damage", "Minor injury/medication error", "Behavioral outbursts"].map((x, i) => <p key={i} className="text-xs text-slate-600 mb-1">• {x}</p>)}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-[#0F172A] mb-2">Mandatory Action Steps</p>
          {[["Immediate", "Ensure the safety of all involved. Call 000 if needed."], ["Report", "Staff must notify management immediately."], ["Document", "Complete the Incident Report Form before end of shift."], ["Investigate", "Conduct root cause analysis and update Risk Register."]].map(([label, desc], i) => (
            <div key={i} className="flex gap-2 mb-1 text-sm"><span className="font-bold text-[#0F172A] shrink-0">{i + 1}. {label}:</span><span className="text-slate-500">{desc}</span></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "06",
    title: "Work Health & Safety",
    subtitle: "Safe Workplace Policy",
    content: (
      <div className="space-y-3 text-sm text-slate-500">
        <p>Committed to health, safety, and wellbeing under the <em>Work Health and Safety Act 2011</em>.</p>
        <div>
          <p className="font-bold text-[#0F172A] text-xs mb-1">Worker Obligations</p>
          {["Take reasonable care of their own health and safety.", "Ensure their actions do not adversely affect others.", "Follow all safe work procedures (SWPs).", "Report all hazards and near misses immediately."].map((x, i) => <p key={i} className="mb-1">• {x}</p>)}
        </div>
        <div>
          <p className="font-bold text-[#0F172A] text-xs mb-1">Risk Control</p>
          {[["Manual Handling", "No-lift policy; use hoists and slides."], ["Environment", "Conduct Home Risk Assessments for all outreach services."], ["Lone Work", "Mandatory Check-In protocol via mobile app."]].map(([label, desc], i) => (
            <p key={i} className="mb-1"><strong className="text-[#0F172A]">{label}:</strong> {desc}</p>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "07",
    title: "Infection Control",
    subtitle: "Standard Precautions Protocol",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">Compliance with the <em>Australian Guidelines for the Prevention and Control of Infection in Healthcare</em> is mandatory for all staff.</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[["PPE", "Gloves, Masks, Gowns"], ["Hygiene", "Hand Wash/Sanitise"], ["Waste", "Sharps/Clinical Bins"]].map(([label, sub]) => (
            <div key={label} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="font-black text-sm text-[#0F172A]">{label}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{sub}</p>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-bold text-[#0F172A] mb-1">Respiratory Outbreak Plan</p>
          <p className="text-xs text-slate-500">In the event of a suspected outbreak (COVID-19, Flu), the affected participant will be supported in isolation, and all staff must switch to Tier 3 PPE (N95 masks and full gowns).</p>
        </div>
      </div>
    ),
  },
  {
    num: "08",
    title: "Medication Management",
    subtitle: "Safe Administration of Medication",
    content: (
      <div className="space-y-4">
        <div className="bg-[#0F172A] rounded-lg p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">The 6 Rights of Administration</p>
          <div className="grid grid-cols-2 gap-2">
            {["Right Participant", "Right Medication", "Right Dose", "Right Route", "Right Time", "Right Documentation"].map((r, i) => (
              <p key={i} className="text-white text-xs font-bold">{i + 1}. {r}</p>
            ))}
          </div>
        </div>
        <div className="space-y-1 text-sm text-slate-500">
          {[["Training", "Only staff who have completed 'Assist with Medication' training can administer."], ["Storage", "Locked medication cabinet required in all settings."], ["MARS", "Every dose must be recorded on the Medication Administration Record Sheet immediately."], ["Errors", "Any error must be reported as a High-Priority Incident within 2 hours."]].map(([label, desc], i) => (
            <p key={i}><strong className="text-[#0F172A]">{label}:</strong> {desc}</p>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "09",
    title: "Emergency Management",
    subtitle: "Emergency & Disaster Continuity",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">Ensuring the safety of participants and staff during natural disasters, fires, or pandemics while maintaining critical supports.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] mb-2">Preparedness</p>
            {["Maintain up-to-date Emergency Contact Lists.", "Every participant home must have a 'Go-Bag'.", "Quarterly fire drills and evacuation tests."].map((x, i) => <p key={i} className="text-xs text-slate-500 mb-1">• {x}</p>)}
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] mb-2">Continuity</p>
            {["Critical Priority List for life-sustaining supports.", "Redundant communication (Mobile, UHF, Landline).", "Remote access to records for decision-making."].map((x, i) => <p key={i} className="text-xs text-slate-500 mb-1">• {x}</p>)}
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "10",
    title: "Worker Screening",
    subtitle: "Recruitment & Screening Policy",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">We ensure all workers are suitable to support people with disability through rigorous background checks.</p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] mb-2">Minimum Mandatory Checks</p>
          {["NDIS Worker Screening Check (NWSC)", "100 Points of Identity", "Current First Aid & CPR", "NDIS Worker Orientation Module Certificate", "Two professional references"].map((x, i) => (
            <div key={i} className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 shrink-0" /><p className="text-sm text-slate-600">{x}</p></div>
          ))}
        </div>
      </div>
    ),
  },
];

function PoliciesSection() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section className="py-16 bg-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#0F172A] mb-3">Policies & Compliance</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">SZ-Jie Support Services operates under the NDIS Quality and Safeguards Framework. Click any policy to read more.</p>
        </div>
        <div className="space-y-2">
          {POLICIES.map((policy, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-400 w-5">{policy.num}</span>
                  <div>
                    <p className="font-black text-[#0F172A] text-sm">{policy.title}</p>
                    <p className="text-xs text-slate-500">{policy.subtitle}</p>
                  </div>
                </div>
                {openIndex === i ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100">
                  {policy.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PublicWebsite() {
  return (
    <div className="min-h-screen bg-white font-inter text-slate-900">

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/50cfec215_ChatGPTImageMay31202609_02_19AM.png" alt="SZ-JIE Logo" className="h-14" />
          <div className="flex items-center gap-8">
            <a href="mailto:toby@szjiesupportservices.com" className="text-sm font-semibold text-slate-700 hover:text-[#0F172A] transition">
              Contact Us
            </a>
            <a href="/participant-portal" className="text-sm font-semibold text-slate-700 hover:text-[#0F172A] transition">
              Participant Portal
            </a>
            <a href="/dashboard/" className="text-sm font-bold px-5 py-2.5 rounded-lg bg-[#0F172A] text-white hover:bg-slate-800 transition">
              Staff Login
            </a>
          </div>
        </div>
      </nav>

      {/* Hero — diagonal split */}
      <section className="bg-[#0F172A] overflow-hidden" style={{ minHeight: 340 }}>
        <div className="max-w-6xl mx-auto px-6 flex items-stretch" style={{ minHeight: 340 }}>
          {/* Left: text */}
          <div className="flex flex-col justify-center py-16 pr-12 flex-1 z-10">
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Compassionate<br />Support Services
            </h1>
            <p className="text-slate-300 text-base mb-8 max-w-sm leading-relaxed">
              Empowering participants to achieve their goals with personalised, quality support across NSW.
            </p>
            <div className="flex gap-3">
              <a href="tel:0435951563" className="flex items-center gap-2 bg-white text-[#0F172A] hover:bg-slate-100 font-bold text-sm px-5 py-2.5 rounded-lg transition">
                <Phone size={15} /> Call Now
              </a>
              <a href="mailto:toby@szjiesupportservices.com" className="flex items-center gap-2 bg-transparent border border-slate-500 text-white hover:border-white font-bold text-sm px-5 py-2.5 rounded-lg transition">
                <Mail size={15} /> Email Us
              </a>
            </div>
          </div>
          {/* Right: image with diagonal clip */}
          <div className="relative flex-1 hidden md:block" style={{ clipPath: "polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%)" }}>
            <img
              src={HERO_IMG}
              alt="Support team"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-slate-100/10" />
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-[#0F172A] mb-4">Who We Are</h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-14 text-sm leading-relaxed">
            SZ-Jie Support Services is committed to delivering high-quality, person-centred support. We work with participants across NSW to help them achieve their goals and live more independently.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Shield, title: "Quality Support", desc: "SZ-Jie Support Services to achieve their goals with personalised, quality support across NSW." },
              { icon: Users, title: "Experienced Team", desc: "Empowering participants to achieve their goals with personalised, quality support across NSW." },
              { icon: Heart, title: "Person-Centred", desc: "SZ-Jie Support Services to achieve their goals with personalised, quality support across NSW." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-slate-600" />
                  </div>
                  <h3 className="font-black text-[#0F172A] text-base mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why We're Different */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-[#0F172A] mb-4">Why SZ-JIE Is Different</h2>
          <p className="text-slate-500 max-w-2xl mx-auto mb-10 text-sm leading-relaxed">
            We don't use off-the-shelf software. We build custom digital solutions designed specifically around your unique needs, goals, and circumstances. Technology adapted to people, not the other way around.
          </p>
          <a
            href="/innovation"
            className="inline-flex items-center gap-2 bg-[#0F172A] text-white hover:bg-slate-800 font-bold text-sm px-6 py-3 rounded-lg transition"
          >
            Explore Our Custom Solutions <ExternalLink size={14} />
          </a>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-[#0F172A] mb-12 text-center">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Community Access", desc: "Support with outings, social activities, and community participation to foster independence and inclusion." },
              { icon: Heart, title: "Daily Living Support", desc: "Help with meal preparation, personal care, and household tasks to support your daily routines." },
              { icon: Shield, title: "Specialist Support", desc: "Tailored programs for behaviour support and skill development with subtle hover lift shadow effect." },
            ].map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-7 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className="mb-4">
                    <Icon size={26} className="text-slate-700" />
                  </div>
                  <h3 className="font-black text-[#0F172A] text-base mb-2">{service.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0F172A] mb-3">Meet Our Support Workers</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Our experienced team brings heart, expertise, and dedication to every participant they support.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Toby */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex">
              <div className="w-24 shrink-0 flex items-start justify-center p-4 pt-5">
                <img
                  src="https://media.base44.com/images/public/69d54775d9a169daad84a133/9c2ede7a8_Picture1.png"
                  alt="Toby"
                  className="w-16 h-16 rounded-full object-cover object-top border-2 border-slate-200"
                />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg font-black text-[#0F172A]">Sz-Jie (Toby)</h3>
                  <p className="text-xs text-slate-500 mb-2">Disability Support Worker</p>
                  <div className="flex items-center gap-1 mb-3">
                    <CheckCircle size={12} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Verified</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Compassionate and dedicated, Toby brings certified training and a genuine passion for empowering individuals with disabilities. Fluent in English and Mandarin.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {["Daily Living", "Community Access", "Behaviour Support", "Behaviour Support"].map((tag, i) => (
                      <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href="/dashboard/toby" className="flex-1 text-center bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition">
                    View Full Profile
                  </a>
                  <a href="/dashboard/toby" className="flex-1 text-center bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-lg text-xs transition">
                    View Full Profile
                  </a>
                </div>
              </div>
            </div>

            {/* Jeffrey */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex">
              <div className="w-24 shrink-0 flex items-start justify-center p-4 pt-5">
                <img
                  src="https://media.base44.com/images/public/69d54775d9a169daad84a133/b8ef90a14_Jeff.jpg"
                  alt="Jeffrey"
                  className="w-16 h-16 rounded-full object-cover object-top border-2 border-slate-200"
                />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg font-black text-[#0F172A]">Jeffrey Minton</h3>
                  <p className="text-xs text-slate-500 mb-2">Specialist Disability Support Worker</p>
                  <div className="flex items-center gap-1 mb-3">
                    <CheckCircle size={12} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Verified</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    With 30+ years in NSW Special Education, Jeffrey brings unmatched expertise in behaviour support, capacity building, and complex disability. Former Head Teacher.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {["Daily Living", "Community Access", "Behaviour Support", "Behaviour Support"].map((tag, i) => (
                      <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href="/dashboard/jeffrey" className="flex-1 text-center bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition">
                    View Full Profile
                  </a>
                  <a href="/dashboard/jeffrey" className="flex-1 text-center bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-lg text-xs transition">
                    View Full Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Portal Guide */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#0F172A] mb-3">Staff Portal</h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">Your secure hub for managing rosters, compliance, payroll, and participant support — everything you need at your fingertips.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* What's Available */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7">
              <h3 className="font-black text-[#0F172A] text-lg mb-4">What's Available in Your Portal</h3>
              <div className="space-y-3">
                {[
                  { label: "My Profile", desc: "View your credentials, certifications, bio, and share your professional profile." },
                  { label: "Compliance Dashboard", desc: "Track WWCC, First Aid, Police Check, and training status at a glance." },
                  { label: "Rosters & Timesheets", desc: "View your shifts, log hours, submit timesheets for approval." },
                  { label: "Payslips", desc: "Access historical and current pay records with tax and superannuation details." },
                  { label: "Participant Support", desc: "Progress notes, support plans, goals, and participant contact details." },
                  { label: "Shift Logger", desc: "Clock in/out, record activities, log outcomes for the day." },
                  { label: "Documents", desc: "Download policies, training materials, and manage secure internal documents." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#0F172A] text-white flex items-center justify-center shrink-0 text-[10px] font-black">{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#0F172A]">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Login */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7">
              <h3 className="font-black text-[#0F172A] text-lg mb-4">How to Login</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Step 1: Navigate to Staff Login</p>
                  <p className="text-sm text-slate-600">Click the <strong>"Staff Login"</strong> button in the top navigation bar, or visit the Staff Portal link in the footer.</p>
                </div>
                <div className="h-px bg-slate-200" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Step 2: Enter Your Credentials</p>
                  <p className="text-sm text-slate-600">Use the email address and password you were provided during onboarding. If you haven't received credentials, contact Toby at <strong>toby@szjiesupportservices.com</strong>.</p>
                </div>
                <div className="h-px bg-slate-200" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Step 3: Access Your Portal</p>
                  <p className="text-sm text-slate-600">Once logged in, you'll see your personalized dashboard with tabs for the features your admin has enabled for you.</p>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-amber-700 mb-1">🔒 Security Reminder</p>
                  <p className="text-xs text-amber-600">Never share your login credentials. Always use a strong password and log out when finished.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Features Grid */}
          <div className="bg-gradient-to-r from-[#0F172A] to-slate-800 rounded-2xl p-8 text-white">
            <h3 className="font-black text-lg mb-6">Portal Features at a Glance</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Real-time Rosters", count: "100%" },
                { label: "Automated Payroll", count: "Tax Ready" },
                { label: "Secure Documents", count: "Encrypted" },
                { label: "Mobile Friendly", count: "Responsive" },
              ].map((feature, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                  <p className="text-slate-300 text-xs mb-1">{feature.label}</p>
                  <p className="text-white font-black text-sm">{feature.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Policies & Compliance */}
      <PoliciesSection />

      {/* Get in Touch */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-[#0F172A] mb-14 text-center">Get in Touch</h2>
          <div className="grid md:grid-cols-3 divide-x divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden max-w-3xl mx-auto">
            <a href="tel:0435951563" className="flex flex-col items-center text-center p-10 hover:bg-slate-50 transition">
              <Phone size={28} className="text-slate-700 mb-4" strokeWidth={1.5} />
              <h3 className="font-black text-[#0F172A] mb-1">Phone</h3>
              <p className="text-slate-500 text-sm">0435 951 563</p>
            </a>
            <a href="mailto:toby@szjiesupportservices.com" className="flex flex-col items-center text-center p-10 hover:bg-slate-50 transition">
              <Mail size={28} className="text-slate-700 mb-4" strokeWidth={1.5} />
              <h3 className="font-black text-[#0F172A] mb-1">Email</h3>
              <p className="text-slate-500 text-sm break-all">toby@szjiesupportservices.com</p>
            </a>
            <div className="flex flex-col items-center text-center p-10">
              <MapPin size={28} className="text-slate-700 mb-4" strokeWidth={1.5} />
              <h3 className="font-black text-[#0F172A] mb-1">Location</h3>
              <p className="text-slate-500 text-sm">309/12 Broome St, Waterloo NSW 2017</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 mb-8">
            <div>
              <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/539befd5f_White_transparent.png" alt="SZ-JIE Logo" className="h-12 mb-3" />
              <p className="text-sm text-slate-400 leading-relaxed">Delivering quality support services across NSW.</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400">ABN: 86 959 042 971</p>
              <p className="text-sm text-slate-400 mt-1">© 2026 SZ-Jie Support Services. All rights reserved.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-3">
                For urgent matters, please call{" "}
                <a href="tel:0435951563" className="text-white font-bold hover:underline">0435 951 563</a>
              </p>
              <div className="flex flex-col items-end gap-1">
                <a href="/dashboard/" className="text-sm text-slate-400 hover:text-white transition underline">Staff Portal</a>
                <a href="/participant-portal" className="text-sm text-slate-400 hover:text-white transition underline">Participant Portal</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}