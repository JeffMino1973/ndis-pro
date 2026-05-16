import { useState } from "react";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

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
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Commitment {i + 1}: {c.label}</p>
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
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-black flex items-center justify-center shrink-0">{item.n}</span>
              <div><p className="font-bold text-sm text-slate-800">{item.title}</p><p className="text-xs text-slate-500">{item.desc}</p></div>
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
            <div key={i} className="flex gap-2"><span className="font-bold text-slate-700 shrink-0">{item.label}:</span><span>{item.desc}</span></div>
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
          <p className="text-xs font-bold text-slate-800 mb-1">External Escalation: NDIS Quality and Safeguards Commission</p>
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
          <p className="text-xs font-bold text-slate-800 mb-2">Mandatory Action Steps</p>
          {[["Immediate", "Ensure the safety of all involved. Call 000 if needed."], ["Report", "Staff must notify management immediately."], ["Document", "Complete the Incident Report Form before end of shift."], ["Investigate", "Conduct root cause analysis and update Risk Register."]].map(([label, desc], i) => (
            <div key={i} className="flex gap-2 mb-1 text-sm"><span className="font-bold text-slate-800 shrink-0">{i + 1}. {label}:</span><span className="text-slate-500">{desc}</span></div>
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
          <p className="font-bold text-slate-700 text-xs mb-1">Worker Obligations</p>
          {["Take reasonable care of their own health and safety.", "Ensure their actions do not adversely affect others.", "Follow all safe work procedures (SWPs).", "Report all hazards and near misses immediately."].map((x, i) => <p key={i} className="mb-1">• {x}</p>)}
        </div>
        <div>
          <p className="font-bold text-slate-700 text-xs mb-1">Risk Control</p>
          {[["Manual Handling", "No-lift policy; use hoists and slides."], ["Environment", "Conduct Home Risk Assessments for all outreach services."], ["Lone Work", "Mandatory Check-In protocol via mobile app."]].map(([label, desc], i) => (
            <p key={i} className="mb-1"><strong className="text-slate-700">{label}:</strong> {desc}</p>
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
              <p className="font-black text-sm text-slate-800">{label}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{sub}</p>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-bold text-slate-800 mb-1">Respiratory Outbreak Plan</p>
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
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">The 6 Rights of Administration</p>
          <div className="grid grid-cols-2 gap-2">
            {["Right Participant", "Right Medication", "Right Dose", "Right Route", "Right Time", "Right Documentation"].map((r, i) => (
              <p key={i} className="text-white text-xs font-bold">{i + 1}. {r}</p>
            ))}
          </div>
        </div>
        <div className="space-y-1 text-sm text-slate-500">
          {[["Training", "Only staff who have completed 'Assist with Medication' training can administer."], ["Storage", "Locked medication cabinet required in all settings."], ["MARS", "Every dose must be recorded on the Medication Administration Record Sheet immediately."], ["Errors", "Any error must be reported as a High-Priority Incident within 2 hours."]].map(([label, desc], i) => (
            <p key={i}><strong className="text-slate-700">{label}:</strong> {desc}</p>
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
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-2">Preparedness</p>
            {["Maintain up-to-date Emergency Contact Lists.", "Every participant home must have a 'Go-Bag'.", "Quarterly fire drills and evacuation tests."].map((x, i) => <p key={i} className="text-xs text-slate-500 mb-1">• {x}</p>)}
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-2">Continuity</p>
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
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-2">Minimum Mandatory Checks</p>
          {["NDIS Worker Screening Check (NWSC)", "100 Points of Identity", "Current First Aid & CPR", "NDIS Worker Orientation Module Certificate", "Two professional references"].map((x, i) => (
            <div key={i} className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 shrink-0" /><p className="text-sm text-slate-600">{x}</p></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "11",
    title: "Behaviour Support",
    subtitle: "Positive Behaviour Support (PBS)",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">We prioritize human rights and aim to reduce and eliminate the use of restrictive practices.</p>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">Regulated Restrictive Practices</p>
          <p className="text-xs font-bold text-amber-800 mb-2">Any use of chemical, mechanical, physical, or environmental restraint is strictly regulated.</p>
          {["Must be authorized by the state/territory body.", "Must be part of a formal Behaviour Support Plan (BSP).", "Must be used only as a last resort and for the shortest possible time.", "Must be reported to the NDIS Commission monthly."].map((x, i) => <p key={i} className="text-xs text-amber-700 mb-1">• {x}</p>)}
        </div>
        <p className="text-xs italic text-slate-500">Unauthorized use of a restrictive practice is a reportable incident and must be notified to the Commission within 5 business days.</p>
      </div>
    ),
  },
  {
    num: "12",
    title: "Child Safety",
    subtitle: "Child Safe Standards Policy",
    content: (
      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-700">We maintain a zero-tolerance approach to child abuse.</p>
        <p className="text-sm text-slate-500">Our organization complies with the <strong>10 National Principles for Child Safe Organisations</strong>.</p>
        <div>
          <p className="text-xs font-bold text-slate-700 mb-1">Mandatory Reporting</p>
          <p className="text-sm text-slate-500">Staff are "Mandated Reporters." If a worker suspects a child is at risk of significant harm (ROSH), they must report it to the Child Protection Helpline immediately. Internal notification to management must follow within 1 hour.</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700 mb-1">Safe Recruitment</p>
          {["Verified Working With Children Check (WWCC).", "Two-stage reference checking focusing on child safety.", "Annual Child Safety refresher training."].map((x, i) => <p key={i} className="text-xs text-slate-500 mb-1">• {x}</p>)}
        </div>
      </div>
    ),
  },
  {
    num: "13",
    title: "Records Management",
    subtitle: "Information Management Policy",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-700 mb-2">Retention Periods</p>
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {[["Adult Records", "7 Years"], ["Child Records", "Until age 25"], ["Incident Reports", "Permanently"]].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center px-4 py-2 bg-slate-50">
                <span className="text-sm text-slate-600">{label}</span>
                <span className="text-sm font-bold text-slate-800">{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700 mb-1">Quality Standards</p>
          <p className="text-sm text-slate-500">Records must be: Contemporaneous (written at the time), Objective (fact-based), Accurate, and Legible. Staff must never use white-out; errors are crossed with a single line and initialed.</p>
        </div>
      </div>
    ),
  },
  {
    num: "14",
    title: "Professional Boundaries",
    subtitle: "Boundary & Ethics Policy",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Maintaining professional relationships is essential for the safety of both staff and participants.</p>
        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Prohibited Behaviours</p>
          {["Accepting gifts over $20", "Social media friendships with participants", "Romantic/Sexual relationships", "Lending/Borrowing money", "Transporting non-authorized persons", "Discussing personal staff issues"].map((x, i) => <p key={i} className="text-xs text-red-700 mb-1">• {x}</p>)}
        </div>
        <p className="text-sm italic text-slate-500">"Friendly but not friends." — All staff must maintain a 'Zone of Help' where the focus remains exclusively on participant goals.</p>
      </div>
    ),
  },
];

export default function PolicyManual() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground mb-1">NDIS Quality & Compliance Policy Manual</h1>
        <p className="text-muted-foreground text-sm">SZ-Jie Support Services — All staff are required to read and comply with these policies.</p>
      </div>
      <div className="space-y-2">
        {POLICIES.map((policy, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-accent transition"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-muted-foreground w-5">{policy.num}</span>
                <div>
                  <p className="font-black text-foreground text-sm">{policy.title}</p>
                  <p className="text-xs text-muted-foreground">{policy.subtitle}</p>
                </div>
              </div>
              {openIndex === i ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 pt-1 border-t border-border">
                {policy.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}