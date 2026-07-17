import { useState } from "react";
import { ClipboardList, ExternalLink, Calendar, X, Loader2, Navigation } from "lucide-react";

const SHIFT_NOTE_DOCS = [
  {
    day: "Friday",
    label: "Friday Morning Shift Notes",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/7b294704f_Friday_Morning_Shift_Notes.html",
    description: "Morning shift documentation and checklists",
  },
  {
    day: "Friday",
    label: "Friday Afternoon Shift Notes",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/86dba06d2_Friday_Afternoon_Shift_Notes.html",
    description: "Afternoon shift documentation and checklists",
  },
  {
    day: "Monday / Wednesday",
    label: "Mon & Wed Outbound Shift Notes",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/75b7fda67_Monday_Wednesday_Outbound_Shift_Notes.html",
    description: "Outbound journey shift notes",
  },
  {
    day: "Monday / Wednesday",
    label: "Mon & Wed Return Shift Notes",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/1ef0e54c4_Monday_Wednesday_Return_Shift_Notes.html",
    description: "Return journey shift notes",
  },
  {
    day: "Saturday",
    label: "Saturday Outbound Shift Notes",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/7fe95d7ad_Saturday_Outbound_Shift_Notes.html",
    description: "Outbound journey shift notes",
  },
  {
    day: "Saturday",
    label: "Saturday Return Shift Notes",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e1e1fa2c8_Saturday_Return_Shift_Notes.html",
    description: "Return journey shift notes",
  },
  {
    day: "Saturday",
    label: "Saturday Domestic Skills Notes & Checklist",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/32e1c10fe_Saturday_Domestic_Skills_Shift_Notes_Checklist.html",
    description: "Domestic skills shift notes and checklists",
  },
  {
    day: "Sunday",
    label: "Sunday Outbound Shift Notes",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/f0194d559_Sunday_Outbound_Shift_Notes.html",
    description: "Outbound journey shift notes",
  },
  {
    day: "Sunday",
    label: "Sunday Return Shift Notes",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/9fa3e13f6_Sunday_Return_Shift_Notes.html",
    description: "Return journey shift notes",
  },
];

const DAY_COLORS = {
  "Friday": "bg-blue-100 text-blue-700 border-blue-200",
  "Monday / Wednesday": "bg-purple-100 text-purple-700 border-purple-200",
  "Saturday": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Sunday": "bg-amber-100 text-amber-700 border-amber-200",
};

export default function ShiftNoteDocuments() {
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Group by day
  const grouped = SHIFT_NOTE_DOCS.reduce((acc, doc) => {
    if (!acc[doc.day]) acc[doc.day] = [];
    acc[doc.day].push(doc);
    return acc;
  }, {});

  const openPreview = (doc) => {
    setPreviewDoc(doc);
    setPreviewLoading(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList size={18} className="text-primary" />
          <h3 className="font-black text-base text-slate-900">Shift Notes & Checklists</h3>
        </div>
        <p className="text-xs text-slate-500">
          Your shift note templates for each day — tap to preview or open the full document.
        </p>
      </div>

      {Object.entries(grouped).map(([day, docs]) => (
        <div key={day}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${DAY_COLORS[day] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              <Calendar size={10} className="inline mr-1 -mt-0.5" />{day}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {docs.map(doc => (
              <div key={doc.url} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ClipboardList size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-sm text-slate-900 leading-tight">{doc.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openPreview(doc)}
                    className="flex-1 text-center bg-primary text-white hover:bg-primary/90 rounded-lg py-2 text-xs font-bold transition-colors"
                  >
                    Preview
                  </button>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg py-2 px-3 text-xs font-bold transition-colors"
                  >
                    Open <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <ClipboardList size={16} className="text-primary shrink-0" />
                <p className="font-black text-sm text-slate-900 truncate">{previewDoc.label}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  Open Full <ExternalLink size={12} />
                </a>
                <button onClick={() => { setPreviewDoc(null); setPreviewLoading(false); }} className="text-slate-400 hover:text-slate-700 p-1">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 relative bg-slate-50">
              {previewLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-primary" />
                </div>
              )}
              <iframe
                src={previewDoc.url}
                className="w-full h-full border-0"
                onLoad={() => setPreviewLoading(false)}
                title={previewDoc.label}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}