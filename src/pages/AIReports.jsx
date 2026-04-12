import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Zap, FileText, Activity, AlertCircle, TrendingUp, Download,
  Loader2, Star, ChevronDown, ChevronUp, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";

const REPORT_TYPES = [
  { id: "monthly_summary", label: "Monthly Progress Summary", icon: FileText, desc: "Auto-generate a professional monthly report from all session notes for a participant." },
  { id: "goal_analytics", label: "Goal Progress Analytics", icon: Activity, desc: "Analyse progress note outcomes and rate achievement against NDIS goals." },
  { id: "risk_flags", label: "Risk & Behaviour Analysis", icon: AlertCircle, desc: "Identify behaviour trends, flag risks, and recommend support adjustments." },
  { id: "incident_report", label: "Incident Summary Report", icon: TrendingUp, desc: "Summarise all incidents for a participant over a selected period." },
];

export default function AIReports() {
  const [participants, setParticipants] = useState([]);
  const [notes, setNotes] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [reportType, setReportType] = useState("monthly_summary");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [p, n, i] = await Promise.all([
        base44.entities.Participant.list(),
        base44.entities.ProgressNote.list("-note_date", 200),
        base44.entities.Incident.list("-incident_date", 100),
      ]);
      setParticipants(p);
      setNotes(n);
      setIncidents(i);
      setLoading(false);
    }
    load();
  }, []);

  const generate = async () => {
    if (!selectedParticipant) return;
    setGenerating(true);
    setResult(null);
    setError("");

    const participant = participants.find(p => p.name === selectedParticipant);
    const filteredNotes = notes.filter(n =>
      n.participant_name === selectedParticipant &&
      n.note_date?.startsWith(selectedMonth)
    );
    const filteredIncidents = incidents.filter(i =>
      i.participant_name === selectedParticipant &&
      i.incident_date?.startsWith(selectedMonth)
    );

    const rType = REPORT_TYPES.find(r => r.id === reportType);

    let prompt = "";
    if (reportType === "monthly_summary") {
      prompt = `You are an NDIS support worker creating a professional monthly progress report.

Participant: ${selectedParticipant}
NDIS Number: ${participant?.ndis_number || "N/A"}
Plan Type: ${participant?.plan_type || "N/A"}
Month: ${selectedMonth}
Goals: ${(participant?.goals || []).join("; ") || "Not specified"}

Session Notes for this month (${filteredNotes.length} sessions):
${filteredNotes.map((n, i) => `
Session ${i + 1} — ${n.note_date} (${n.template_type}):
- Activities: ${n.activities_delivered || "N/A"}
- Participant Response: ${n.participant_response || "N/A"}
- Outcomes: ${n.outcomes || "N/A"}
- Concerns: ${n.concerns || "None"}
`).join("\n")}

Write a professional, structured Monthly Progress Report in markdown format with:
1. Executive Summary (2-3 sentences)
2. Support Delivered This Month (sessions, hours, types)
3. Goal Progress (link activities to stated goals)
4. Participant Strengths & Achievements
5. Areas for Development / Concerns
6. Recommendations for Next Month
7. Conclusion

Write in a professional, compassionate tone suitable for NDIS plan review.`;
    } else if (reportType === "goal_analytics") {
      prompt = `You are an NDIS coordinator analysing goal progress.

Participant: ${selectedParticipant}
Goals: ${(participant?.goals || []).join("; ") || "Not specified"}
Period: ${selectedMonth}

Progress notes data:
${filteredNotes.map(n => `${n.note_date}: Outcomes: ${n.outcomes || "N/A"}`).join("\n")}

Provide a structured markdown analysis:
1. Goals Summary (list each goal)
2. Evidence of Progress (quote specific outcomes from notes)
3. Goal Achievement Rating (for each goal: On Track / Needs Support / Not Yet Started)
4. Quantitative Summary (% sessions where goals were addressed)
5. Recommendations

Be specific and cite evidence from the session notes.`;
    } else if (reportType === "risk_flags") {
      prompt = `You are an NDIS risk analyst reviewing support worker notes for a participant.

Participant: ${selectedParticipant}
Period: ${selectedMonth}
Disability: ${participant?.primary_disability || "Not specified"}
Medical Alerts: ${participant?.medical_alerts || "None"}

Progress notes:
${filteredNotes.map(n => `${n.note_date}: Response: ${n.participant_response || "N/A"} | Concerns: ${n.concerns || "None"}`).join("\n")}

Incidents this period: ${filteredIncidents.length}
${filteredIncidents.map(i => `- ${i.incident_date}: ${i.incident_type} (${i.severity}) — ${i.description}`).join("\n")}

Provide a structured markdown risk analysis:
1. Risk Summary (overall risk level: Low/Medium/High/Critical)
2. Identified Risk Factors (list specific patterns from notes)
3. Behaviour Trends (positive and concerning)
4. Safeguarding Concerns (if any)
5. Recommended Interventions
6. Support Adjustments Suggested

Flag any patterns that suggest escalating risk.`;
    } else if (reportType === "incident_report") {
      prompt = `You are an NDIS compliance officer writing an incident summary report.

Participant: ${selectedParticipant}
Period: ${selectedMonth}
Total Incidents: ${filteredIncidents.length}

Incident Details:
${filteredIncidents.map((i, idx) => `
Incident ${idx + 1}:
- Date: ${i.incident_date}
- Type: ${i.incident_type}
- Severity: ${i.severity}
- Description: ${i.description}
- Action Taken: ${i.action_taken || "N/A"}
- Status: ${i.status}
`).join("\n")}

Write a professional markdown Incident Summary Report:
1. Summary Overview
2. Incident Analysis (patterns, frequency, severity breakdown)
3. Contributing Factors (identified from descriptions)
4. Actions Taken & Outcomes
5. Systemic Issues / Recommendations
6. Next Steps & Review Date

Suitable for NDIS Commission review if required.`;
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
    });
    setResult(response);
    setGenerating(false);
  };

  const downloadReport = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-${selectedParticipant}-${selectedMonth}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <style>{`@media print { .no-print { display: none !important; } #report-output { border: none !important; } }`}</style>

      <div className="no-print">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white">
            <Zap size={20} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">AI Intelligence Centre</h2>
            <p className="text-muted-foreground text-sm">Auto-generate reports · Goal analytics · Risk flagging</p>
          </div>
        </div>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
        {REPORT_TYPES.map(r => (
          <button
            key={r.id}
            onClick={() => setReportType(r.id)}
            className={`text-left p-4 rounded-2xl border transition-all ${reportType === r.id ? "bg-primary/10 border-primary" : "bg-card border-border hover:border-primary/40"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <r.icon size={16} className={reportType === r.id ? "text-primary" : "text-muted-foreground"} />
              <p className={`font-black text-sm ${reportType === r.id ? "text-primary" : "text-foreground"}`}>{r.label}</p>
            </div>
            <p className="text-xs text-muted-foreground">{r.desc}</p>
          </button>
        ))}
      </div>

      {/* Config panel */}
      <div className="bg-card border border-border rounded-2xl p-5 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Participant</Label>
            <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
              <SelectTrigger><SelectValue placeholder="Select participant..." /></SelectTrigger>
              <SelectContent>
                {participants.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Month</Label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={generate}
              disabled={!selectedParticipant || generating}
              className="w-full rounded-xl font-bold gap-2 h-9"
            >
              {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {generating ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>
        {selectedParticipant && (
          <p className="text-xs text-muted-foreground mt-2">
            {notes.filter(n => n.participant_name === selectedParticipant && n.note_date?.startsWith(selectedMonth)).length} session notes found for {selectedMonth}
          </p>
        )}
      </div>

      {/* Note: uses more credits */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-700 font-medium no-print">
        ⚡ This feature uses Claude Sonnet (premium AI model) for high-quality clinical reports — uses more integration credits than standard features.
      </div>

      {/* Report output */}
      {result && (
        <div id="report-output" className="bg-white border border-border rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6 no-print">
            <div>
              <p className="font-black text-lg">{REPORT_TYPES.find(r => r.id === reportType)?.label}</p>
              <p className="text-sm text-muted-foreground">{selectedParticipant} · {selectedMonth}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadReport} className="rounded-xl gap-1 font-bold">
                <Download size={14} /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={printReport} className="rounded-xl gap-1 font-bold">
                <FileText size={14} /> Print / PDF
              </Button>
            </div>
          </div>
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}

      {!result && !generating && (
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
          <Sparkles size={40} className="text-primary/30 mx-auto mb-3" />
          <h3 className="font-black text-lg mb-1">Ready to Generate</h3>
          <p className="text-sm text-muted-foreground">Select a report type and participant, then click Generate Report.</p>
        </div>
      )}
    </div>
  );
}