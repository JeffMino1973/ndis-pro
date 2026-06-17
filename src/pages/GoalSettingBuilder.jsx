import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Printer, ArrowLeft, ChevronDown, ChevronUp, Check } from "lucide-react";

// ── PRE-FILLED LIBRARY ─────────────────────────────────────────────────────
const GOAL_LIBRARY = [
  {
    id: "behaviour",
    area: "Behaviour Support & Emotional Regulation",
    ndisCategory: "NDIS: Social, Community & Relationships",
    dotColor: "#ef4444",
    ndisColor: "#ef4444",
    goalStatements: [
      "I want to develop strategies to manage my anxiety and phobias so that I can interact safely with others and participate in my community without distress. I need to learn safe ways to communicate my feelings so that I do not become physically aggressive toward my family and carers.",
      "I want to learn self-regulation strategies to manage my emotions and reduce episodes of challenging behaviour.",
      "I want to develop coping skills so I can manage frustration and anxiety in daily life situations.",
    ],
    supports: [
      { name: "Specialist Behaviour Intervention", desc: "Comprehensive Behaviour Support Plan (BSP) to systematically address perseveration and escalation toward physical violence." },
      { name: "Therapeutic Supports (Psychologist)", desc: "Regular 1:1 therapy targeting severe anxiety and phobias (focused on hygiene markers, medical supplies like bandaids, illness)." },
      { name: "De-escalation Training", desc: "Specialised coaching for her primary carer (mother, aged 70) to safely defuse physical escalation." },
      { name: "Visual/Visual Scripting Tools", desc: "Developing a \"safety script\" to communicate distress safely as an alternative to physical aggression." },
      { name: "Functional Behaviour Assessment (FBA)", desc: "Necessary to map internal and external sensory triggers causing physical outbursts." },
    ],
  },
  {
    id: "social",
    area: "Social Inclusion & Community Skills",
    ndisCategory: "NDIS: Social & Community Participation",
    dotColor: "#f97316",
    ndisColor: "#f97316",
    goalStatements: [
      "I want to be able to enjoy social activities, such as eating out in public, without feeling overwhelmed by anxiety regarding germs or contamination.",
      "I want to build friendships and participate in group activities in my community.",
      "I want to develop the social skills to interact confidently with peers and community members.",
    ],
    supports: [
      { name: "Exposure Therapy", desc: "Clinical support under a Psychologist to systematically reduce reliance on safety barriers (e.g., eating only with napkins) to broaden community settings." },
      { name: "Social Mentoring (1:1 Support)", desc: "A trained support worker to co-regulate and model calm behavior when exposed to community triggers (contamination signs, public restrooms)." },
      { name: "Sensory & Anxiety Strategies", desc: "Collaboration between Psychology and Occupational Therapy (OT) to equip her with sensory regulation tools in high-stimulus spaces." },
    ],
  },
  {
    id: "employment",
    area: "Employment Support",
    ndisCategory: "NDIS: Work & Relationships",
    dotColor: "#3b82f6",
    ndisColor: "#3b82f6",
    goalStatements: [
      "I would like to continue in a social enterprise or a supported work site (ADE) and I will need support to learn work skills and to maintain my job. I currently attend The Avenue 2 days per week and I would like to increase that to 3 days.",
      "I want to develop the skills and confidence to participate in meaningful employment or vocational training.",
      "I want to increase my working hours and build independence in the workplace.",
    ],
    supports: [
      { name: "ADE Funding Intake & Quote", desc: "Support for the family to coordinate with providers to request an NDIS-compliant quote for the extra day." },
      { name: "Task Instruction Modalities", desc: "Use of explicit, max-2-step language, gestures, visual schedules, modeling, and repetitive coaching to maintain task focus." },
      { name: "Skill Development", desc: "Target areas including manual dexterity, interpersonal workplace social skills, basic currency math, and self-esteem as a team member." },
      { name: "Self-Regulation & Resilience", desc: "Structured tasks with regular positive reinforcement/frequent praise to support her motivation and workplace endurance." },
    ],
  },
  {
    id: "education",
    area: "Further Lifelong Education",
    ndisCategory: "NDIS: Learning & Cognitive Development",
    dotColor: "#8b5cf6",
    ndisColor: "#8b5cf6",
    goalStatements: [
      "I need to continue building my communication skills.",
      "I want to develop my literacy and numeracy skills to support greater independence in daily life.",
      "I want to learn new skills that help me participate more fully in my community and daily routines.",
    ],
    supports: [
      { name: "Re-engagement of Speech Pathology", desc: "1 hour per week targeting functional vocabulary extension, structural sentences, and pronunciation clarity for professional environments." },
      { name: "1:1 Weekly Educational Tutoring", desc: "Guided practice sessions utilizing structured roleplay, scripted interactions, and context-based visual aids." },
      { name: "Skills Integration", desc: "Collaboration with day program (post-school) staff to ensure language skills transfer seamlessly across vocational and personal settings." },
      { name: "Reciprocal Conversational Training", desc: "Interactive modeling to build shared conversation themes beyond narrow, obsessive focus areas." },
    ],
  },
  {
    id: "health",
    area: "Health & Wellbeing",
    ndisCategory: "NDIS: Health & Wellbeing",
    dotColor: "#22c55e",
    ndisColor: "#22c55e",
    goalStatements: [
      "I will need to build my health and wellbeing.",
      "I want to develop healthy routines to improve my physical fitness and nutrition.",
      "I want to build my capacity to manage my own health needs with appropriate support.",
    ],
    supports: [
      { name: "Exercise Physiology (EP)", desc: "Structured, clinical sessions designed to develop safe movement patterns and build functional cardiovascular endurance safely." },
      { name: "Supported Gym Access", desc: "Active support from a 1:1 worker to implement the EP program, ensuring exercise safety and consistency." },
      { name: "Dietetic Consultation", desc: "Engagement with a Dietician to establish balanced nutrition, health strategies, and structured diet plans." },
      { name: "1:1 Diet Execution Support", desc: "Consistent prompting and implementation help from support staff to follow dietary recommendations at home." },
    ],
  },
  {
    id: "community",
    area: "Social and Community Participation",
    ndisCategory: "NDIS: Relationships & Community Inclusion",
    dotColor: "#ec4899",
    ndisColor: "#ec4899",
    goalStatements: [
      "I need to build social connections. I need to build healthy relationships and an understanding of the different types of relationships that there are.",
      "I want to participate in community activities and develop friendships with people my own age.",
      "I want to build confidence interacting with members of the public and in social settings.",
    ],
    supports: [
      { name: "Peer Group Activities", desc: "Scaffolded social opportunities to interact with peers her age in non-threatening, organized community settings." },
      { name: "Relationship Education", desc: "1:1 modeling and support to teach interpersonal concepts: trust, respect, healthy boundaries, and equal communication." },
      { name: "Structured Group Support", desc: "Active 1:1 support workers to initially bridge and build peer connections before transitioning into self-motivated groups." },
    ],
  },
  {
    id: "personal",
    area: "Personal Care & Management",
    ndisCategory: "NDIS: Choice & Control / Daily Living / Home",
    dotColor: "#0ea5e9",
    ndisColor: "#0ea5e9",
    goalStatements: [
      "I want to develop my independence skills inside and outside of the home to lead to Short Term Accommodation (STA).",
      "I want to develop my personal care skills to be more independent in daily hygiene and self-care routines.",
      "I want to build my capacity to manage my home environment with minimal support.",
    ],
    supports: [
      { name: "OT Functional Assessment", desc: "Detailed occupational therapist evaluation to identify physical independence blocks and suggest adaptive kitchen equipment (e.g., thick handles, non-slip mats)." },
      { name: "Independent Living Skills Training", desc: "1:1 support to learn home skills: food prep, setting tables, dishwashing, and structured personal hygiene (showering/bathing routines)." },
      { name: "Motor Skill Exercises", desc: "Dedicated fine-motor instruction to ensure safe use of cutlery, kitchen knives, and appliances." },
      { name: "Short Term Accommodation (STA) & Supported Breaks", desc: "Out-of-home experiential trials to generalize learned skills in structured, unfamiliar settings." },
    ],
  },
  {
    id: "transport",
    area: "Transport and Mobility",
    ndisCategory: "NDIS: Daily Living",
    dotColor: "#06b6d4",
    ndisColor: "#06b6d4",
    goalStatements: [
      "I need to build my independent travel skills.",
      "I want to learn to use public transport independently to access my community and supports.",
      "I want to develop the skills and confidence to travel independently to familiar destinations.",
    ],
    supports: [
      { name: "Structured Travel Training Program", desc: "Highly scaffolded, step-by-step training to systematically reduce anxiety during route transition planning." },
      { name: "Assisted Transit Experiences", desc: "Utilizing door-to-door bus trips and taxi vouchers alongside an active 1:1 support worker to reinforce transit familiarity." },
      { name: "Risk Management & Safety Training", desc: "Direct training focusing on pedestrian rules, basic stranger danger, and problem-solving if lost." },
    ],
  },
];

const SCHEDULE_COLORS = {
  "Community Access": "#d1fae5",
  "Domestic Skills": "#fef9c3",
  "The Avenue": "#dbeafe",
};

const DEFAULT_SCHEDULE = [
  { day: "Monday", slots: [{ time: "9–12pm", activity: "Domestic Skills" }] },
  { day: "Tuesday", slots: [{ time: "8–10am", activity: "Community Access" }, { time: "10–3pm", activity: "The Avenue" }, { time: "3–5pm", activity: "Community Access" }] },
  { day: "Wednesday", slots: [{ time: "9–12pm", activity: "Domestic Skills" }] },
  { day: "Thursday", slots: [{ time: "8–10am", activity: "Community Access" }, { time: "10–3pm", activity: "The Avenue" }, { time: "3–5pm", activity: "Community Access" }] },
  { day: "Friday", slots: [{ time: "10:30–1:30", activity: "Community Access" }, { time: "2–5pm", activity: "Domestic Skills" }] },
  { day: "Saturday", slots: [{ time: "9–1:30pm", activity: "Domestic Skills" }, { time: "4–7pm", activity: "Domestic Skills" }] },
  { day: "Sunday", slots: [{ time: "12:30–3:30pm", activity: "Community Access" }] },
];

// ── GOAL AREA CARD (builder) ───────────────────────────────────────────────
function GoalAreaCard({ lib, selected, onToggle, onSelectGoal, onToggleSupport, selectedGoalIdx, selectedSupports }) {
  const [open, setOpen] = useState(false);
  const isSelected = selected;

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${isSelected ? "border-blue-400 shadow-md" : "border-gray-200"}`}>
      <div
        className="flex items-center justify-between p-3 cursor-pointer bg-white"
        onClick={() => { onToggle(); if (!open) setOpen(true); }}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: lib.dotColor }} />
          <span className="font-semibold text-sm text-gray-800">{lib.area}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{lib.ndisCategory}</span>
        </div>
        <div className="flex items-center gap-2">
          {isSelected && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Added</span>}
          <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} className="text-gray-400 hover:text-gray-600">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 space-y-4">
          {/* Goal statements */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Select a Goal Statement</div>
            <div className="space-y-2">
              {lib.goalStatements.map((gs, i) => (
                <div
                  key={i}
                  onClick={() => onSelectGoal(i)}
                  className={`cursor-pointer rounded-lg border p-3 text-xs leading-relaxed transition-all ${selectedGoalIdx === i ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-200"}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${selectedGoalIdx === i ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                      {selectedGoalIdx === i && <Check size={10} className="text-white" />}
                    </div>
                    <span className="italic text-gray-700">"{gs}"</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supports */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Select Justified Supports</div>
            <div className="space-y-2">
              {lib.supports.map((sup, i) => (
                <div
                  key={i}
                  onClick={() => onToggleSupport(i)}
                  className={`cursor-pointer rounded-lg border p-3 text-xs transition-all ${selectedSupports.includes(i) ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:border-orange-200"}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 ${selectedSupports.includes(i) ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                      {selectedSupports.includes(i) && <Check size={10} className="text-white" />}
                    </div>
                    <div><strong>{sup.name}:</strong> <span className="text-gray-600">{sup.desc}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PRINT PREVIEW ──────────────────────────────────────────────────────────
function PrintPreview({ data, schedule, onBack }) {
  const printRef = useRef();

  const handlePrint = () => {
    const html = printRef.current.innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Goal Setting & Support Justification</title><style>
      *{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;color:#1e293b;font-size:13px;padding:28px 32px;}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e2e8f0;}
      .header-logo{width:150px;}.header-contact{text-align:right;font-size:11px;color:#475569;line-height:1.8;}
      .page-title{font-size:28px;font-weight:900;color:#1e293b;margin-bottom:4px;}.page-subtitle{font-size:13px;color:#64748b;margin-bottom:16px;border-left:4px solid #06b6d4;padding-left:12px;}
      .meta-box{border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:20px;}.meta-label{font-size:10px;font-weight:bold;text-transform:uppercase;color:#94a3b8;letter-spacing:.5px;margin-bottom:3px;}.meta-value{font-size:15px;font-weight:bold;color:#1e293b;margin-bottom:10px;}.meta-sub{font-size:12px;color:#475569;}
      .section-num{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:#1e293b;color:white;border-radius:4px;font-size:12px;font-weight:bold;margin-right:8px;}
      .section-title{font-size:16px;font-weight:bold;color:#1e293b;display:flex;align-items:center;margin:20px 0 12px;}
      .sched-table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px;}
      .sched-table th{background:#1e293b;color:white;padding:8px;text-align:center;font-size:11px;}
      .sched-table td{border:1px solid #e2e8f0;padding:4px;vertical-align:top;min-height:40px;}
      .slot{border-radius:4px;padding:3px 5px;margin-bottom:2px;font-size:11px;font-weight:600;}
      .goal-card{border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;margin-bottom:16px;break-inside:avoid;}
      .goal-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
      .goal-area{font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;}
      .ndis-badge{font-size:10.5px;font-weight:bold;}
      .my-goal-box{border-left:3px solid #e2e8f0;background:#f8fafc;border-radius:4px;padding:10px 14px;margin-bottom:14px;}
      .my-goal-label{font-size:10px;font-weight:bold;text-transform:uppercase;color:#94a3b8;letter-spacing:.5px;margin-bottom:5px;}
      .my-goal-text{font-size:12.5px;color:#374151;font-style:italic;line-height:1.6;}
      .supports-label{font-size:10px;font-weight:bold;text-transform:uppercase;color:#94a3b8;letter-spacing:.5px;margin-bottom:8px;}
      .support-item{display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;font-size:12.5px;line-height:1.5;}
      .check{color:#f97316;font-size:14px;flex-shrink:0;}
      .sign-box{border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between;align-items:flex-start;margin-top:20px;}
      .sign-name{font-size:18px;font-weight:900;color:#1e293b;}.sign-label{font-size:10px;font-weight:bold;text-transform:uppercase;color:#94a3b8;letter-spacing:.5px;margin-bottom:4px;}
      .sign-sub{font-size:12px;color:#475569;}.date-box{border:1px solid #e2e8f0;border-radius:6px;padding:6px 18px;font-size:14px;font-weight:bold;color:#1e293b;}
    </style></head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={onBack}><ArrowLeft size={14} className="mr-1" /> Back to Builder</Button>
        <Button onClick={handlePrint} className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white"><Printer size={14} className="mr-1" /> Print / Save PDF</Button>
      </div>

      <div ref={printRef} className="bg-white border border-gray-200 rounded-xl p-8 text-sm">
        {/* Header */}
        <div className="header flex justify-between items-start mb-4 pb-3 border-b border-gray-200">
          <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png" alt="SZ-JIE" className="header-logo w-36" />
          <div className="header-contact text-right text-xs text-gray-500 leading-relaxed">
            <div>📋 <strong>SZ-JIE Support Services</strong></div>
            <div>🏢 ABN: 86959042971</div>
            <div>📍 309/12 Broome St, Waterloo NSW, 2017</div>
            <div>✉️ jeff@szjiesupportservices.com</div>
            <div>🌐 www.szjiesupportservices.com</div>
            <div>📞 0401 343 876</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-3xl font-black text-gray-900 mb-1">GOAL SETTING &amp; SUPPORT JUSTIFICATION</div>
        <div className="text-sm text-gray-500 border-l-4 border-cyan-400 pl-3 mb-5">National Disability Insurance Scheme (NDIS) Supporting Evidence Document</div>

        {/* Meta */}
        <div className="border border-gray-200 rounded-xl p-5 mb-6">
          <div className="text-xs font-bold uppercase text-gray-400 tracking-wide mb-1">Participant Name</div>
          <div className="text-base font-bold text-gray-900 mb-3">{data.participantName || "—"}</div>
          <div className="text-xs font-bold uppercase text-gray-400 tracking-wide mb-1">Document Prepared By</div>
          <div className="text-lg font-black text-gray-900 mb-0.5">{data.preparedBy || "Jeffrey Minton"}</div>
          <div className="text-xs text-gray-500 mb-3">{data.preparedByTitle || "Bachelor of Education - Special Education"}</div>
          <div className="text-xs font-bold uppercase text-gray-400 tracking-wide mb-1">Date of Report</div>
          <div className="font-bold text-gray-900">{today}</div>
        </div>

        {/* Section 1: Schedule */}
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-900 text-white rounded text-xs font-bold">1</span>
          Weekly Schedule &amp; Community Access
        </div>
        <table className="w-full border-collapse mb-6 text-xs">
          <thead>
            <tr>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
              <th key={d} className="bg-gray-900 text-white p-2 text-center text-xs">{d}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[0,1,2].map(row => (
              <tr key={row}>
                {schedule.map(dayData => {
                  const slot = dayData.slots[row];
                  return (
                    <td key={dayData.day} className="border border-gray-200 p-1 align-top" style={{ minHeight: 40 }}>
                      {slot && (
                        <div className="rounded p-1 mb-1 font-semibold" style={{ background: SCHEDULE_COLORS[slot.activity] || "#f1f5f9", fontSize: 11 }}>
                          {slot.time}<br/>{slot.activity}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Section 2: Goals */}
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-900 text-white rounded text-xs font-bold">2</span>
          Individual Planning Areas &amp; Support Needs
        </div>

        {data.goals.map((g, idx) => {
          const lib = GOAL_LIBRARY.find(l => l.id === g.areaId);
          if (!lib) return null;
          return (
            <div key={idx} className="border border-gray-200 rounded-xl p-5 mb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 font-bold text-base text-gray-900">
                  <div className="w-3 h-3 rounded-full" style={{ background: lib.dotColor }} />
                  {lib.area}
                </div>
                <span className="text-xs font-bold" style={{ color: lib.ndisColor }}>{lib.ndisCategory}</span>
              </div>
              <div className="border-l-4 border-gray-200 bg-gray-50 rounded p-3 mb-4">
                <div className="text-xs font-bold uppercase text-gray-400 tracking-wide mb-2">My Goal</div>
                <div className="text-sm italic text-gray-700 leading-relaxed">"{lib.goalStatements[g.goalIdx]}"</div>
              </div>
              <div className="text-xs font-bold uppercase text-gray-400 tracking-wide mb-3">Justified Supports Required</div>
              {g.supports.map(si => (
                <div key={si} className="flex items-start gap-2 mb-2 text-sm leading-relaxed">
                  <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                  <div><strong>{lib.supports[si].name}:</strong> <span className="text-gray-600">{lib.supports[si].desc}</span></div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Sign-off */}
        <div className="border border-gray-200 rounded-xl p-5 flex justify-between items-start mt-4">
          <div>
            <div className="text-xs font-bold uppercase text-gray-400 tracking-wide mb-1">Authorised Sign-Off</div>
            <div className="text-xl font-black text-gray-900">{data.preparedBy || "Jeffrey Minton"}</div>
            <div className="text-sm text-gray-500">{data.preparedByTitle || "Bachelor of Education - Special Education"}</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase text-gray-400 tracking-wide mb-1">Date Signature Affixed</div>
            <div className="border border-gray-200 rounded px-4 py-2 font-bold text-gray-900">{today}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN BUILDER ──────────────────────────────────────────────────────────
export default function GoalSettingBuilder() {
  const [step, setStep] = useState("builder"); // builder | preview
  const [participantName, setParticipantName] = useState("Bronwyn Chau");
  const [preparedBy, setPreparedBy] = useState("Jeffrey Minton");
  const [preparedByTitle, setPreparedByTitle] = useState("Bachelor of Education - Special Education");

  // Per area: { areaId, goalIdx, supports: [0,1,...] }
  const [areaSelections, setAreaSelections] = useState({});
  const [schedule] = useState(DEFAULT_SCHEDULE);

  const toggleArea = (areaId) => {
    setAreaSelections(prev => {
      if (prev[areaId]) {
        const next = { ...prev }; delete next[areaId]; return next;
      }
      return { ...prev, [areaId]: { areaId, goalIdx: 0, supports: [0, 1] } };
    });
  };

  const selectGoal = (areaId, idx) => setAreaSelections(prev => ({ ...prev, [areaId]: { ...prev[areaId], goalIdx: idx } }));
  const toggleSupport = (areaId, idx) => setAreaSelections(prev => {
    const curr = prev[areaId];
    const supports = curr.supports.includes(idx) ? curr.supports.filter(s => s !== idx) : [...curr.supports, idx];
    return { ...prev, [areaId]: { ...curr, supports } };
  });

  const selectedGoals = Object.values(areaSelections).filter(a => a.supports.length > 0);

  const handlePreview = () => setStep("preview");

  if (step === "preview") {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PrintPreview
          data={{ participantName, preparedBy, preparedByTitle, goals: selectedGoals }}
          schedule={schedule}
          onBack={() => setStep("builder")}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Goal Setting &amp; Support Justification Builder</h1>
        <p className="text-sm text-gray-500 mt-1">Select goal areas, pick a goal statement and supported items, then generate the final NDIS document.</p>
      </div>

      {/* Document Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Document Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-gray-500">Participant Name</Label>
            <Input value={participantName} onChange={e => setParticipantName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Prepared By</Label>
            <Input value={preparedBy} onChange={e => setPreparedBy(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Title / Qualification</Label>
            <Input value={preparedByTitle} onChange={e => setPreparedByTitle(e.target.value)} className="mt-1" />
          </div>
        </div>
      </div>

      {/* Goal Area Library */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
          Planning Areas &amp; Goal Library
          <span className="ml-2 text-xs font-normal text-gray-400 normal-case">— click an area to expand and select goals/supports</span>
        </h2>
        <div className="space-y-3">
          {GOAL_LIBRARY.map(lib => {
            const sel = areaSelections[lib.id];
            return (
              <GoalAreaCard
                key={lib.id}
                lib={lib}
                selected={!!sel}
                onToggle={() => toggleArea(lib.id)}
                onSelectGoal={(i) => selectGoal(lib.id, i)}
                onToggleSupport={(i) => toggleSupport(lib.id, i)}
                selectedGoalIdx={sel?.goalIdx ?? -1}
                selectedSupports={sel?.supports ?? []}
              />
            );
          })}
        </div>
      </div>

      {/* Generate */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
        <div className="text-sm text-gray-600">
          <strong className="text-gray-900">{selectedGoals.length}</strong> goal area{selectedGoals.length !== 1 ? "s" : ""} selected
        </div>
        <Button
          onClick={handlePreview}
          disabled={selectedGoals.length === 0}
          className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-6"
        >
          <Printer size={14} className="mr-2" /> Generate Document
        </Button>
      </div>
    </div>
  );
}