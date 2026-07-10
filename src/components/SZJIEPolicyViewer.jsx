import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, BookOpen } from "lucide-react";

export default function SZJIEPolicyViewer({ compact = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [libraryUrl, setLibraryUrl] = useState(null);

  useEffect(() => {
    async function loadLibrary() {
      try {
        const res = await base44.functions.invoke("extractPolicyZip", {});
        setLibraryUrl(res.data.url);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load policy library");
      } finally {
        setLoading(false);
      }
    }
    loadLibrary();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: "50vh" }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading SZ-JIE policy library…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive text-sm font-medium">{error}</p>
      </div>
    );
  }

  const height = compact ? "75vh" : "calc(100vh - 200px)";

  return (
    <div className={compact ? "" : "max-w-7xl mx-auto"}>
      {!compact && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">SZ-JIE Support Services — Policies &amp; Procedures</h2>
            <p className="text-muted-foreground text-sm">Interactive policy library</p>
          </div>
        </div>
      )}
      <div className="rounded-xl overflow-hidden border border-border bg-white" style={{ height }}>
        <iframe
          src={libraryUrl}
          className="w-full h-full"
          title="SZ-JIE Support Services Policy Library"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}