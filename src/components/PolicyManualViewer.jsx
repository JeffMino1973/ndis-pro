import { useState, useEffect } from "react";
import { BookOpen, ExternalLink, Loader2 } from "lucide-react";

const POLICY_URL = "https://media.base44.com/files/public/69d54775d9a169daad84a133/896d1b30e_SZ-JIE_Support_Services_Policies_and_Procedures.html";

export default function PolicyManualViewer({ compact = false }) {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(POLICY_URL)
      .then(res => res.text())
      .then(html => {
        setHtmlContent(html);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const height = compact ? "70vh" : "80vh";

  return (
    <div className={compact ? "" : "max-w-5xl mx-auto"}>
      {!compact && (
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Policies & Procedures Manual</h2>
              <p className="text-muted-foreground text-sm">SZ-JIE Support Services — 102 policies across 6 categories · Last updated July 2026</p>
            </div>
          </div>
          <a href={POLICY_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0">
            <ExternalLink size={14} /> Open Full Screen
          </a>
        </div>
      )}

      <div className={`bg-card border border-border rounded-2xl overflow-hidden ${compact ? "" : "shadow-sm"}`}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-col gap-3" style={{ height }}>
            <BookOpen size={32} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Unable to load policy manual inline.</p>
            <a href={POLICY_URL} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-bold underline">Open manual directly</a>
          </div>
        ) : (
          <iframe
            srcDoc={htmlContent}
            title="SZ-JIE Support Services Policies and Procedures"
            className="w-full"
            style={{ height, border: "none" }}
          />
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Use the search bar and category filters within the manual to find specific policies. Use the Print button to save as PDF.
      </p>
    </div>
  );
}