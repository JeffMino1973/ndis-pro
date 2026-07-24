import { useState } from "react";
import { FileText, ExternalLink, X, Loader2 } from "lucide-react";
import { usePreviewSrc } from "@/hooks/usePreviewSrc";

const BRONWYN_DOCS = [
  {
    id: "quote",
    title: "Service Quote — Bronwyn Chau",
    subtitle: "NDIS Support Services Quote",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/74564661c_Quote.html",
    color: "bg-blue-100 text-blue-700",
  },
];

export default function BronwynDocuments() {
  const [previewDoc, setPreviewDoc] = useState(null);
  const { src: previewSrc, loading: srcLoading } = usePreviewSrc(previewDoc?.url);

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-2xl p-6 text-white">
        <h2 className="text-xl font-black mb-1">My Documents</h2>
        <p className="text-primary-foreground/80 text-sm">
          Your important documents — click to preview or open the full document.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {BRONWYN_DOCS.map(doc => (
          <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${doc.color}`}>
                <FileText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-sm text-slate-900 leading-tight">{doc.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{doc.subtitle}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewDoc(doc)}
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

      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
              <p className="font-black text-sm text-slate-900 truncate">{previewDoc.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  Open Full <ExternalLink size={12} />
                </a>
                <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 relative bg-slate-50">
              {srcLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-primary" />
                </div>
              )}
              <iframe
                src={previewSrc}
                className="w-full h-full border-0"
                title={previewDoc.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}