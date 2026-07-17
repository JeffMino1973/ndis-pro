import { useState, useEffect } from "react";
import { Brain, TrafficCone, Utensils, ShieldHalf, BandageIcon, Smartphone, UserCheck, Plus, Trash2, TriangleAlert, FileText, Archive, ChevronDown, ChevronUp } from "lucide-react";
import PBSReferenceDocs from "@/components/behaviour/PBSReferenceDocs";

const DEFAULT_ENTRIES = [
  {
    id: 1,
    time: "2026-05-18T08:00",
    antecedent: "Mom routine change (cereal/lunch)",
    behavior: "Threw box of cereal and bowl in the bin. Hit mother repeatedly, hyper-focused.",
    consequence: "Support worker arrived. Intervention was attempted too closely, which escalated hitting.",
    outcome: "Delayed regulation (over 1 hour). Later hit support worker too."
  },
  {
    id: 2,
    time: "2026-05-18T12:15",
    antecedent: "Dad leftovers returned to fridge",
    behavior: "Tried to force mother to eat the remainder of fathers lunch.",
    consequence: "Fathers yogurt and spoon were returned to fridge out of sight.",
    outcome: "She stopped forcing mother once yogurt became visually inaccessible."
  },
  {
    id: 3,
    time: "2026-05-18T15:30",
    antecedent: "Attempted tissue/serviette handoff",
    behavior: "Refused tissue handed by mother, threw it away. Offered worker a white serviette to hold food.",
    consequence: "Support worker accepted serviette quietly without praise or comment.",
    outcome: "Remained regulated. Reinforced rule system."
  }
];

const ANTECEDENT_OPTIONS = [
  "Mom routine change (cereal/lunch)",
  "Dad leftovers returned to fridge",
  "Support worker presence (Demand/School)",
  "Physical discomfort (Cut/Itch/Band-Aid)",
  "Attempted tissue/serviette handoff",
  "Other Environmental Trigger"
];

function Toast({ message, onRemove }) {
  useEffect(() => {
    const t = setTimeout(onRemove, 3000);
    return () => clearTimeout(t);
  }, [onRemove]);
  return (
    <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
      <TriangleAlert size={14} className="text-amber-400" />
      <span>{message}</span>
    </div>
  );
}

export default function BehaviourSupportPlan() {
  const [clientName, setClientName] = useState("Anonymous Profile");
  const [clientAge, setClientAge] = useState("32 Years");
  const [workerName, setWorkerName] = useState("Mr. Minton");
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("behavior_logs");
      return saved ? JSON.parse(saved) : DEFAULT_ENTRIES;
    } catch { return DEFAULT_ENTRIES; }
  });
  const [toast, setToast] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [newEntry, setNewEntry] = useState({
    time: "",
    antecedent: ANTECEDENT_OPTIONS[0],
    behavior: "",
    consequence: "",
    outcome: ""
  });

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setNewEntry(e => ({ ...e, time: now.toISOString().slice(0, 16) }));
  }, []);

  useEffect(() => {
    localStorage.setItem("behavior_logs", JSON.stringify(logs));
  }, [logs]);

  function addEntry() {
    if (!newEntry.time || !newEntry.behavior || !newEntry.consequence) {
      setToast("Please fill in Date/Time, Behavior, and Response fields.");
      return;
    }
    setLogs(prev => [...prev, { ...newEntry, id: Date.now(), outcome: newEntry.outcome || "Not recorded" }]);
    setNewEntry(e => ({ ...e, behavior: "", consequence: "", outcome: "" }));
  }

  function deleteEntry(id) {
    setLogs(prev => prev.filter(e => e.id !== id));
  }

  function resetDefaults() {
    if (window.confirm("Restore pre-set behavior tracker defaults?")) {
      setLogs([...DEFAULT_ENTRIES]);
    }
  }

  const sortedLogs = [...logs].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="min-h-screen bg-slate-100 pb-16 font-inter">
      {toast && <Toast message={toast} onRemove={() => setToast(null)} />}

      {/* Control Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 shadow-sm no-print">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md">
              <FileText size={18} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">Interactive Behavior Support Dashboard</h1>
              <p className="text-xs text-slate-500">Co-authored with Lead Support Worker & Parents</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={() => window.print()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-medium transition text-sm">
              Export / Print PDF
            </button>
            <button onClick={resetDefaults} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-medium transition text-sm">
              Reset Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">

        {/* ---- PBS Reference Documents ---- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <PBSReferenceDocs />
        </div>

        {/* ---- Archived Older Plans ---- */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setShowArchived(s => !s)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="flex items-center gap-2 font-bold text-slate-600 text-sm">
              <Archive size={16} className="text-slate-400" />
              Archived Behaviour Support Documents
              <span className="text-[10px] font-black text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Older</span>
            </span>
            {showArchived ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {showArchived && (
            <div className="px-4 pb-4 space-y-8">

        {/* ---- PAGE 1 ---- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-10">
          {/* Header */}
          <div className="border-b border-slate-100 pb-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <span className="bg-teal-50 text-teal-700 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-teal-100">Clinical Formulation</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Positive Behavior Support & Response Framework</h2>
                <p className="text-slate-500 text-sm mt-1">Structured support targeting rigid order preferences, routine adjustments, and defensive PDA profiles.</p>
              </div>
              <div className="w-full md:w-auto bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-xs space-y-2 shrink-0">
                <div className="grid grid-cols-2 gap-4">
                  <div><strong className="text-slate-400 block">CLIENT:</strong><input value={clientName} onChange={e => setClientName(e.target.value)} className="font-semibold text-slate-700 bg-transparent border-b border-slate-300 w-full focus:outline-none focus:border-teal-500" /></div>
                  <div><strong className="text-slate-400 block">AGE:</strong><input value={clientAge} onChange={e => setClientAge(e.target.value)} className="font-semibold text-slate-700 bg-transparent border-b border-slate-300 w-full focus:outline-none focus:border-teal-500" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div><strong className="text-slate-400 block">DIAGNOSIS:</strong><span className="font-medium text-slate-700">Autism, Mod. ID</span></div>
                  <div><strong className="text-slate-400 block">LEAD WORKER:</strong><input value={workerName} onChange={e => setWorkerName(e.target.value)} className="font-semibold text-slate-700 bg-transparent border-b border-slate-300 w-full focus:outline-none focus:border-teal-500" /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Formulation */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Brain size={18} className="text-teal-600" /> Primary Clinical Formulation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-100 p-5 rounded-xl">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-800">The "Control vs. Chaos" Drive</h4>
                <p className="text-sm text-slate-600 leading-relaxed">For this individual, her behaviors (including sudden hitting) are primarily driven by an acute need for <strong>predictability and external environmental ordering</strong>. When her strict internal rules are breached—e.g., Mom choosing a breakfast food out of turn, Dad returning food to the fridge half-eaten, or visible injuries on others—she experiences instantaneous neurological threat. Unable to process this via complex expressive verbal language, she discharges this sudden internal panic physically through hitting.</p>
              </div>
              <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-200/80 pt-4 md:pt-0 md:pl-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-800">The Professional-PDA Boundary Dynamic</h4>
                <p className="text-sm text-slate-600 leading-relaxed">A stark difference exists between her interactions with parents vs. her support worker. Parents represent "safe" attachments where she feels empowered to try and enforce order. The support worker ("{workerName}") represents a formal "system framework." Her initial defensive comment ("Bye, {workerName}") and reference to "School" indicate she is hyper-aware that his presence challenges her established control.</p>
              </div>
            </div>
          </div>

          {/* Arousal Phases */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <TrafficCone size={18} className="text-teal-600" /> The Four Stages of Arousal & Crisis Response
            </h3>
            <div className="space-y-4">
              {[
                { color: "emerald", dot: "bg-emerald-500", border: "border-emerald-100", bg: "bg-emerald-50/40", label: "1. GREEN Phase", sub: "Baseline/Regulated", obj: "Consolidate safety triggers & respect routine rules.", points: ["The Serviette Accommodation: Ensure white serviettes are always readily available and physically presented with foods. Do not force direct touching.", '"Mom\'s Choice" Visuals: Proactively schedule breakfast options so variations are visual events rather than surprises.'] },
                { color: "amber", dot: "bg-amber-500", border: "border-amber-100", bg: "bg-amber-50/40", label: "2. YELLOW Phase", sub: 'The "Rumble" Stage', obj: "Warning Signs: Vocal repetitions, pacing, phone wiping, ordering parents.", points: ["Immediate Non-Verbal Interventions: Introduce \"change cards\" without complex speaking. Switch to quiet, low tone.", "Declarative Statements: Avoid telling her what to do. Use \"I can see the cereal box is in the bin. Let's step away.\""] },
                { color: "red", dot: "bg-red-500", border: "border-red-100", bg: "bg-red-50/40", label: "3. RED Phase", sub: "Crisis / Hitting", obj: "Intervention: Maximum Distance, Total Silence, Block Safely.", points: ["Evacuate & Step Back: Both worker and parent must physically disengage. Speak 0 words.", "No Eye Contact: Looking at her reinforces challenge loops. Look down or away while securing yourself behind a physical barrier (counter/sofa cushion)."] },
                { color: "blue", dot: "bg-blue-500", border: "border-blue-100", bg: "bg-blue-50/40", label: "4. BLUE Phase", sub: "Recovery / Fatigue", obj: "Intervention: Low Demands, Extended Rest.", points: ["The Recovery Window: Expect cortisol levels to remain elevated for up to 3 hours. Avoid asking her to choose anything or do any tasks.", "Refusal Acceptance: Accept she may be highly fragile or lethargic; let her reset without commentary."] },
              ].map((phase, i) => (
                <div key={i} className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border ${phase.border} ${phase.bg}`}>
                  <div className="sm:w-1/4 flex flex-row sm:flex-col items-center sm:items-start gap-2">
                    <span className={`w-4 h-4 rounded-full ${phase.dot} shrink-0`}></span>
                    <div>
                      <h4 className={`font-bold text-${phase.color}-900 text-sm`}>{phase.label}</h4>
                      <span className={`text-xs text-${phase.color}-700`}>{phase.sub}</span>
                    </div>
                  </div>
                  <div className="sm:w-3/4 text-sm text-slate-600 space-y-2">
                    <p className="font-medium text-slate-800">{phase.obj}</p>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                      {phase.points.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- PAGE 2 ---- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-10">
          <div className="border-b border-slate-100 pb-6 mb-6">
            <span className="bg-teal-50 text-teal-700 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-teal-100">Tactical Core Toolbox</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">Targeted Protocols & Environmental Rules</h2>
            <p className="text-xs text-slate-500">Concrete steps to manage the five primary anxiety-response profiles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <Utensils size={16} className="text-teal-600" />, title: 'Food Throwing & "Completion" Rules', dynamic: 'She wants to control what is eaten and bought to eliminate food she dislikes. Half-eaten or "saved" food (like Dad\'s yogurt or lunch) violates her rule of "closed" items, initiating an obsession to force consumption or discard.', protocol: ['Clean Counter Policy: All parental food prep and leftovers must be immediately closed and stored behind closed cupboard doors/fridges out of direct sight line.', 'Verbal Script: If she attempts to force her parent to finish food, use flat tone: "Dad\'s food is finished. It is away." Do not debate or justify the choice. Walk away immediately.'] },
              { icon: <ShieldHalf size={16} className="text-teal-600" />, title: 'Sensory Shields (White Serviette)', dynamic: "White napkins act as a mandatory protective shield against food textures. Her refusal of tissues from parents but acceptance from support workers is a direct test of relational boundaries and demand-avoidance.", protocol: ['Systemic Uniformity: All staff and parents must use identical white serviettes. Stock them in identical plastic boxes.', 'Deputize Control: Before meals, utilize her desire to order the house: "Can you please put three clean serviettes on the table?" This translates bossing into a helpful structuring task.'] },
              { icon: <BandageIcon size={16} className="text-teal-600" />, title: 'Injury & Hygiene Hyper-Fixations', dynamic: "Skin disruptions (itches/cuts) cause high tactile panic. Visible Band-Aids on others cause systemic uncertainty. Ear-inspections and cotton buds are obsessive-compulsive efforts to ensure \"perfection.\"", protocol: ['Cotton Bud/Ear Boundary: The support worker must state firmly: "My ears are clean. Cotton buds are away." Put all cotton buds in locked or out-of-reach storage.', 'The Band-Aid Script: If she obsesses over someone\'s bandage: "Mom\'s arm is healing. The Band-Aid is working. We are finished talking about it." Diversion must immediately follow.'] },
              { icon: <Smartphone size={16} className="text-teal-600" />, title: 'Phone Wiping & Audio Control', dynamic: "Deleting all notifications and icons represents her attempt to keep her digital ecosystem perfectly neat. Restricting music/stereo play on others is a protective effort to reduce auditory chaos.", protocol: ['Let her delete: Let her delete harmless system assets on her phone. Use parental control locks to prevent deletion of critical communication tools or contacts.', 'The "My Turn" Visual: Use a simple, laminated double-sided visual token for the stereo: "Side A: Parent\'s Turn / Side B: Her Turn". When Side A is active, she cannot modify input.'] },
            ].map((card, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm">
                  {card.icon} {card.title}
                </h4>
                <div className="space-y-3 text-xs text-slate-600">
                  <div><strong className="text-slate-800 block mb-1">The Dynamic:</strong>{card.dynamic}</div>
                  <div className="bg-teal-50/50 p-3 rounded-lg border border-teal-100/50">
                    <strong className="text-teal-900 block mb-1">Direct Protocol:</strong>
                    <ul className="list-disc pl-3 space-y-1">
                      {card.protocol.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mr. Minton Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-3 text-sm">
              <UserCheck size={16} className="text-teal-600" /> "{workerName}" Relationship & PDA Boundary Plan
            </h4>
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl text-xs text-slate-600 space-y-3">
              <p>Her comment, <em>"Bye {workerName},"</em> paired with her anxieties about <em>"going back to school,"</em> confirms she perceives you as a source of routine expectations and direct behavior challenges. She has spent 12 months managing her parents under her own rigid systems, and your return represents a dismantling of her authority structure.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div><strong className="text-slate-800 block mb-1">1. Neutral, High-Structure Re-entry</strong>Do not over-explain or try to "win" a warm connection right away. Focus on highly predictable, low-demand activities that she has complete control over (e.g. organizing her space or wiping her phone). Use declarative language.</div>
                <div><strong className="text-slate-800 block mb-1">2. Establishing Unified Rules</strong>If she attempts to hit you or force boundaries upon you, she must experience the same immediate physical distance protocol as parents. By displaying structured, predictable boundaries, you demonstrate she can trust you to be calm and immovable.</div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- PAGE 3: ABC Log ---- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-10">
          <div className="border-b border-slate-100 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="bg-teal-50 text-teal-700 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-teal-100">Data Collection</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">Interactive ABC Behavior Log</h2>
              </div>
              <span className="text-xs text-slate-400">Data saves to browser memory</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Logs chronological triggers (Antecedent), Actions (Behavior), and responses/outcomes (Consequence) to pinpoint shifting baseline patterns.</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl mb-6 shadow-inner">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold tracking-wider uppercase">
                  <th className="py-3.5 px-4 w-32">Date & Time</th>
                  <th className="py-3.5 px-4 w-44">Antecedent (Trigger)</th>
                  <th className="py-3.5 px-4">Behavior (Action)</th>
                  <th className="py-3.5 px-4">Consequence (Response)</th>
                  <th className="py-3.5 px-4 w-44">Outcome / Lesson</th>
                  <th className="py-3.5 px-4 w-20 text-center no-print">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedLogs.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-400 text-xs">No behaviors logged. Clean tracking period.</td></tr>
                ) : sortedLogs.map(entry => {
                  const d = new Date(entry.time);
                  const fmt = d.toLocaleDateString() + " @ " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-700">{fmt}</td>
                      <td className="py-3 px-4 text-teal-800 font-medium">{entry.antecedent}</td>
                      <td className="py-3 px-4 text-slate-600">{entry.behavior}</td>
                      <td className="py-3 px-4 text-slate-600">{entry.consequence}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{entry.outcome}</td>
                      <td className="py-3 px-4 text-center no-print">
                        <button onClick={() => deleteEntry(entry.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded transition">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Entry Form */}
          <div className="no-print bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
              <Plus size={16} className="text-teal-600" /> Add New Behavior Entry
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
              {[
                { label: "Date & Time", el: <input type="datetime-local" value={newEntry.time} onChange={e => setNewEntry(n => ({ ...n, time: e.target.value }))} className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none" /> },
                { label: "Antecedent (Trigger)", el: <select value={newEntry.antecedent} onChange={e => setNewEntry(n => ({ ...n, antecedent: e.target.value }))} className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none">{ANTECEDENT_OPTIONS.map(o => <option key={o}>{o}</option>)}</select> },
                { label: "Behavior (Action)", el: <input type="text" value={newEntry.behavior} onChange={e => setNewEntry(n => ({ ...n, behavior: e.target.value }))} placeholder="e.g. Hit mother, threw items in bin" className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none" /> },
                { label: "Response (Action Taken)", el: <input type="text" value={newEntry.consequence} onChange={e => setNewEntry(n => ({ ...n, consequence: e.target.value }))} placeholder="e.g. Worker stepped away, silence" className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none" /> },
                { label: "Outcome / Recovery Time", el: <input type="text" value={newEntry.outcome} onChange={e => setNewEntry(n => ({ ...n, outcome: e.target.value }))} placeholder="e.g. Regulated after 45 minutes" className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none" /> },
              ].map(({ label, el }, i) => (
                <div key={i}><label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>{el}</div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={addEntry} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1">
                <Plus size={13} /> Add Entry
              </button>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {["Parent/Guardian Signature & Date", `Lead Support Worker ("${workerName}") Signature`, "Behavior Support Specialist Sign-Off"].map((label, i) => (
                <div key={i} className="space-y-2">
                  <div className="border-b border-slate-300 h-12"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

            </div>
          )}
        </div>
        {/* ---- End Archived ---- */}

      </div>
    </div>
  );
}