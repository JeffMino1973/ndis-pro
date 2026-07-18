import { useState, useEffect } from "react";

/**
 * Returns an iframe-safe src for a document URL.
 * - PDFs: Google Docs Viewer (inline, no download)
 * - HTML: fetched and wrapped in a blob URL (avoids Content-Disposition: attachment downloads)
 * - Other: original URL
 */
export function usePreviewSrc(url) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) {
      setSrc(null);
      return;
    }

    const lower = url.toLowerCase();
    const isPdf = lower.endsWith(".pdf");
    const isHtml = lower.endsWith(".html") || lower.endsWith(".htm");

    if (isPdf) {
      setSrc(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`);
      return;
    }

    if (isHtml) {
      setLoading(true);
      let cancelled = false;
      let blobUrl = null;

      fetch(url)
        .then(res => res.text())
        .then(html => {
          if (cancelled) return;
          blobUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }));
          setSrc(blobUrl);
          setLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setSrc(url);
          setLoading(false);
        });

      return () => {
        cancelled = true;
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
    }

    setSrc(url);
  }, [url]);

  return { src, loading };
}