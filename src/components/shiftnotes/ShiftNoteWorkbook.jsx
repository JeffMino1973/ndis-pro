import { useState, useRef } from "react";
import { X, FileText, Printer, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Full-screen shift note workbook viewer — renders the HTML template inside an
// iframe so staff complete the shift note within the portal (no external tab).
export default function ShiftNoteWorkbook({ templateUrl, templateLabel, shiftInfo, onClose, onComplete, status }) {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const handlePrint = () => {
    try {
      iframeRef.current?.contentWindow?.print();
    } catch {
      window.open(templateUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm truncate">{templateLabel || "Shift Note Workbook"}</p>
            {shiftInfo && (
              <p className="text-[10px] text-muted-foreground truncate">
                {shiftInfo.participant_name} · {shiftInfo.date} · {shiftInfo.staff_name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {status && (
            <span className={`text-[10px] font-black px-2 py-1 rounded-full mr-1 ${
              status === "Submitted" ? "bg-blue-100 text-blue-700" :
              status === "Reviewed" ? "bg-emerald-100 text-emerald-700" :
              "bg-slate-100 text-slate-600"
            }`}>{status}</span>
          )}
          <Button variant="ghost" size="sm" onClick={handlePrint} className="rounded-lg text-xs font-bold gap-1.5">
            <Printer size={14} /> Print
          </Button>
          {onComplete && status !== "Reviewed" && (
            <Button size="sm" onClick={onComplete} className="rounded-lg text-xs font-bold gap-1.5">
              <CheckCircle2 size={14} /> Mark Reviewed
            </Button>
          )}
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative bg-slate-100">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card gap-2">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading shift note workbook…</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={templateUrl}
          className="w-full h-full border-0 bg-white"
          onLoad={() => setLoading(false)}
          title={templateLabel || "Shift Note"}
        />
      </div>
    </div>
  );
}