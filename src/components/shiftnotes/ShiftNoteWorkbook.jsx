import { useState, useRef, useEffect } from "react";
import { X, FileText, Printer, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Full-screen shift note workbook viewer.
// The template HTML files are hosted on media.base44.com and some browsers
// treat them as downloads when loaded directly in an iframe src. To avoid that
// (and the "stuck loading spinner" that follows), we fetch the HTML as text
// and render it via a blob URL so it always loads inside the iframe.
export default function ShiftNoteWorkbook({ templateUrl, templateLabel, shiftInfo, onClose, onComplete, status }) {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let revoked = false;
    let createdUrl = null;

    async function loadTemplate() {
      try {
        const res = await fetch(templateUrl);
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const html = await res.text();
        if (revoked) return;
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
      } catch (err) {
        if (!revoked) setError(err.message || "Could not load template");
      }
    }

    loadTemplate();
    return () => {
      revoked = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [templateUrl]);

  const handlePrint = () => {
    try {
      iframeRef.current?.contentWindow?.focus();
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
          <Button variant="ghost" size="sm" onClick={handlePrint} className="rounded-lg text-xs font-bold gap-1.5" disabled={!blobUrl}>
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
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card gap-2">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading shift note workbook…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card gap-3 p-6 text-center">
            <AlertCircle size={32} className="text-rose-500" />
            <p className="font-bold text-sm">Couldn't load the template</p>
            <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
            <a
              href={templateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-primary hover:underline mt-1"
            >
              Open template in new tab
            </a>
          </div>
        )}
        {blobUrl && (
          <iframe
            ref={iframeRef}
            src={blobUrl}
            className="w-full h-full border-0 bg-white"
            onLoad={() => setLoading(false)}
            title={templateLabel || "Shift Note"}
          />
        )}
      </div>
    </div>
  );
}