import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Navigation, Printer, Loader2, Plus, Trash2, Bus, Train, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TravelGuide() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState(null);

  const generate = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    setGuide(null);

    const prompt = `You are an NDIS support worker creating a detailed public transport travel guide for a participant with a disability in Sydney, Australia.

Origin: ${origin}
Destination: ${destination}
Participant: ${participantName || "NDIS Participant"}
Additional notes: ${notes || "None"}

Search Google Maps / trip planner for the best public transport routes from "${origin}" to "${destination}" in Sydney.

Return a JSON object with this exact structure:
{
  "title": "Travel Guide: [origin] ↔ [destination]",
  "origin": "${origin}",
  "destination": "${destination}",
  "participant": "${participantName || "NDIS Participant"}",
  "generated_date": "today's date in DD/MM/YYYY format",
  "summary": "1-2 sentence overview of the journey",
  "routes": [
    {
      "id": 1,
      "label": "Route 1 — Recommended",
      "total_time": "e.g. 45 mins",
      "total_cost": "e.g. $3.20 (Opal)",
      "accessibility": "Fully accessible" or "Partially accessible" or "Steps involved",
      "best_for": "e.g. Fastest option",
      "steps": [
        {
          "type": "walk" | "bus" | "train" | "ferry" | "light_rail",
          "instruction": "e.g. Walk to Coogee Beach bus stop on Arden St",
          "detail": "e.g. Head north on Beach St, turn left on Arden St. Bus stop is on the left.",
          "duration": "e.g. 3 mins",
          "line": "e.g. 353" (bus/train number, or null for walk),
          "towards": "e.g. towards Circular Quay" (direction of service, or null)
        }
      ],
      "tips": ["tip 1", "tip 2"]
    }
  ],
  "accessibility_notes": ["General accessibility notes for this journey"],
  "emergency_info": "What to do if participant gets lost or needs help",
  "opal_info": "Brief Opal card tapping instructions for this route"
}

Provide 2-3 realistic route options. Make steps very detailed and beginner-friendly. Include real bus numbers, train lines, stops. Consider accessibility needs of an NDIS participant.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          origin: { type: "string" },
          destination: { type: "string" },
          participant: { type: "string" },
          generated_date: { type: "string" },
          summary: { type: "string" },
          routes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                label: { type: "string" },
                total_time: { type: "string" },
                total_cost: { type: "string" },
                accessibility: { type: "string" },
                best_for: { type: "string" },
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      instruction: { type: "string" },
                      detail: { type: "string" },
                      duration: { type: "string" },
                      line: { type: "string" },
                      towards: { type: "string" }
                    }
                  }
                },
                tips: { type: "array", items: { type: "string" } }
              }
            }
          },
          accessibility_notes: { type: "array", items: { type: "string" } },
          emergency_info: { type: "string" },
          opal_info: { type: "string" }
        }
      }
    });

    setGuide(result);
    setLoading(false);
  };

  const typeIcon = (type) => {
    if (type === "bus") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-bold" style={{ backgroundColor: "#002664" }}><Bus size={11} /></span>;
    if (type === "train") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-bold" style={{ backgroundColor: "#F0521F" }}><Train size={11} /></span>;
    if (type === "walk") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-xs font-bold">🚶</span>;
    if (type === "ferry") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-bold" style={{ backgroundColor: "#00A9CE" }}>⛴</span>;
    if (type === "light_rail") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-bold" style={{ backgroundColor: "#78BE20" }}>🚊</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-xs">→</span>;
  };

  const accessColor = (a) => {
    if (!a) return "bg-slate-100 text-slate-600";
    if (a.toLowerCase().includes("fully")) return "bg-emerald-100 text-emerald-700";
    if (a.toLowerCase().includes("partial")) return "bg-amber-100 text-amber-700";
    return "bg-rose-100 text-rose-700";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body * { visibility: hidden; }
          #travel-guide-print, #travel-guide-print * { visibility: visible; }
          #travel-guide-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .route-card { break-inside: avoid; border: 1px solid #ddd; margin-bottom: 20px; }
        }
        .step-border { border-left: 3px solid #e5e7eb; margin-left: 14px; }
      `}</style>

      {/* Header */}
      <div className="no-print">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
            <Navigation size={20} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Travel Guide Generator</h2>
            <p className="text-muted-foreground text-sm">Generate step-by-step public transport guides for participants · Powered by live trip data</p>
          </div>
        </div>
      </div>

      {/* Input form */}
      <div className="bg-card border border-border rounded-2xl p-6 no-print space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-1.5 mb-1"><MapPin size={13} className="text-rose-500" /> Origin / Starting Point *</Label>
            <Input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g. Coogee Beach, NSW" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-1"><MapPin size={13} className="text-emerald-500" /> Destination *</Label>
            <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Botany Community Centre" />
          </div>
          <div>
            <Label className="mb-1 block">Participant Name</Label>
            <Input value={participantName} onChange={e => setParticipantName(e.target.value)} placeholder="e.g. John Smith" />
          </div>
          <div>
            <Label className="mb-1 block">Additional Notes / Needs</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. wheelchair accessible, avoid stairs" />
          </div>
        </div>
        <Button
          onClick={generate}
          disabled={!origin || !destination || loading}
          className="w-full h-12 rounded-xl font-black text-base gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
          {loading ? "Searching live trip data..." : "Generate Travel Guide"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">Uses live internet data to find real routes · Sydney public transport</p>
        <p className="text-xs text-amber-600 text-center">⚡ Uses Gemini with web search — uses more integration credits</p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <Loader2 size={32} className="text-blue-500 mx-auto mb-3 animate-spin" />
          <p className="font-black text-blue-700">Searching Sydney trip planner...</p>
          <p className="text-sm text-blue-500 mt-1">Finding routes, checking accessibility, calculating times</p>
        </div>
      )}

      {/* Generated guide */}
      {guide && (
        <>
          <div className="flex justify-between items-center no-print">
            <div className="flex items-center gap-3">
              <p className="font-black text-lg text-foreground">Travel Guide Ready</p>
              <Button variant="outline" size="sm" onClick={() => { setGuide(null); setOrigin(""); setDestination(""); }} className="rounded-xl gap-1.5 text-xs">
                + Plan New Journey
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setGuide(null); }} className="rounded-xl gap-1.5 text-xs text-muted-foreground">
                Modify This Journey
              </Button>
            </div>
            <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2 font-bold">
              <Printer size={15} /> Print / Save PDF
            </Button>
          </div>

          <div id="travel-guide-print" className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="text-center py-8 px-6 border-b border-slate-200">
              <h1 className="text-3xl font-black text-slate-800 mb-1">{guide.title || "Travel Itinerary"}</h1>
              <p className="text-slate-500 text-sm">{guide.summary}</p>
            </div>

            {/* Participant info row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50 border-b border-slate-200 divide-x divide-slate-200">
              {[
                { label: "Participant", value: guide.participant },
                { label: "From", value: guide.origin },
                { label: "To", value: guide.destination },
                { label: "Date", value: guide.generated_date },
              ].map(f => (
                <div key={f.label} className="px-5 py-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{f.label}</p>
                  <p className="text-sm font-bold text-slate-800">{f.value}</p>
                </div>
              ))}
            </div>

            <div className="p-6 lg:p-8 space-y-6">
              {/* Routes */}
              {(guide.routes || []).map((route, ri) => (
                <div key={ri} className="route-card border border-slate-200 rounded-2xl overflow-hidden">
                  {/* Route header */}
                  <div className="bg-slate-800 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-black text-sm">{route.label}</p>
                      {route.best_for && <p className="text-slate-400 text-xs">{route.best_for}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-white/10 rounded px-2 py-1 font-bold">⏱ {route.total_time}</span>
                      <span className="bg-white/10 rounded px-2 py-1 font-bold">💳 {route.total_cost}</span>
                      <span className={`rounded px-2 py-1 font-bold ${
                        route.accessibility?.toLowerCase().includes("fully") ? "bg-emerald-500" :
                        route.accessibility?.toLowerCase().includes("partial") ? "bg-amber-500" : "bg-rose-500"
                      }`}>♿ {route.accessibility}</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="px-5 py-4 space-y-0">
                    {(route.steps || []).map((step, si) => (
                      <div key={si} className="flex gap-4 step-border pl-4 pb-5 last:pb-0">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-black shrink-0 -ml-7 relative z-10">
                          {si + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {step.type === "bus" && (
                              <span className="text-white text-xs font-black px-2 py-0.5 rounded flex items-center gap-1" style={{ backgroundColor: "#002664" }}>
                                <Bus size={10} /> Bus
                              </span>
                            )}
                            {step.type === "train" && (
                              <span className="text-white text-xs font-black px-2 py-0.5 rounded flex items-center gap-1" style={{ backgroundColor: "#F0521F" }}>
                                <Train size={10} /> Train
                              </span>
                            )}
                            {step.type === "walk" && (
                              <span className="bg-slate-200 text-slate-700 text-xs font-black px-2 py-0.5 rounded">🚶 Walk</span>
                            )}
                            {step.type === "ferry" && (
                              <span className="text-white text-xs font-black px-2 py-0.5 rounded" style={{ backgroundColor: "#00A9CE" }}>⛴ Ferry</span>
                            )}
                            {step.type === "light_rail" && (
                              <span className="text-white text-xs font-black px-2 py-0.5 rounded" style={{ backgroundColor: "#78BE20" }}>🚊 Light Rail</span>
                            )}
                            {step.line && (
                              <span className="text-white text-xs font-black px-2 py-0.5 rounded" style={{ backgroundColor: step.type === "bus" ? "#002664" : step.type === "train" ? "#F0521F" : "#555" }}>
                                {step.line}
                              </span>
                            )}
                            {step.towards && (
                              <span className="text-xs text-slate-500">→ {step.towards}</span>
                            )}
                            {step.duration && (
                              <span className="text-xs text-slate-400 ml-auto">⏱ {step.duration}</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-800">{step.instruction}</p>
                          {step.detail && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.detail}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  {route.tips && route.tips.length > 0 && (
                    <div className="bg-blue-50 border-t border-slate-200 px-5 py-3">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Tips</p>
                      <ul className="space-y-1">
                        {route.tips.map((tip, ti) => (
                          <li key={ti} className="text-xs text-blue-700 flex gap-1.5"><span>•</span>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              {/* Accessibility notes */}
              {guide.accessibility_notes?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <p className="font-black text-amber-800 mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Accessibility Notes</p>
                  <ul className="space-y-1">
                    {guide.accessibility_notes.map((n, i) => (
                      <li key={i} className="text-sm text-amber-700 flex gap-1.5"><span>♿</span>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Emergency + Opal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {guide.emergency_info && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
                    <p className="font-black text-rose-700 mb-2 text-sm">🆘 If You Need Help</p>
                    <p className="text-sm text-rose-600 leading-relaxed">{guide.emergency_info}</p>
                  </div>
                )}
                {guide.opal_info && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <p className="font-black text-slate-700 mb-2 text-sm">💳 Opal Card</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{guide.opal_info}</p>
                  </div>
                )}
              </div>

              <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
                Generated by NDIS PRO · Travel Guide for {guide.participant} · {guide.generated_date}<br />
                Always verify times with Transport for NSW or the Opal app before travel.
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!guide && !loading && (
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
          <Navigation size={40} className="text-primary/30 mx-auto mb-3" />
          <h3 className="font-black text-lg mb-1">Enter journey details to get started</h3>
          <p className="text-sm text-muted-foreground">The guide will include step-by-step directions, bus numbers, accessibility info, and safety tips.</p>
        </div>
      )}
    </div>
  );
}