import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, BookOpen, ChevronRight, X } from "lucide-react";

const POLICY_BODY_CSS = `
.pm-body { font-size: 13px; line-height: 1.6; color: #1f2937; }
.pm-body h3 { margin: 18px 0 10px; padding: 9px 18px; background: #073763; color: #fff; font-size: 15px; font-weight: 700; border-radius: 6px; }
.pm-body h4 { margin: 16px 0 7px; color: #0b5cab; font-size: 14px; font-weight: 700; border-left: 4px solid #0b5cab; padding-left: 8px; }
.pm-body p { margin: 8px 0; color: #374151; }
.pm-body ul { margin: 8px 0 12px 22px; list-style: disc; padding: 0; }
.pm-body ol { margin: 8px 0 12px 22px; list-style: decimal; padding: 0; }
.pm-body li { margin: 4px 0; }
.pm-body table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; font-size: 12px; }
.pm-body th, .pm-body td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
.pm-body th { background: #f3f4f6; font-weight: 700; color: #073763; }
.pm-body strong { color: #073763; font-weight: 700; }
.pm-body a { color: #0b5cab; text-decoration: underline; }
.pm-body img { max-width: 100%; border-radius: 6px; margin: 8px 0; }
.pm-body hr { border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0; }
.pm-body h3[id], .pm-body h4[id] { scroll-margin-top: 16px; }
`;

export default function PolicyManualViewer({ compact = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePolicyId, setActivePolicyId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    async function loadPolicies() {
      try {
        const res = await base44.functions.invoke("getPolicyData", {});
        setPolicies(res.data.policies || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load policies");
      } finally {
        setLoading(false);
      }
    }
    loadPolicies();
  }, []);

  const categories = useMemo(
    () => [...new Set(policies.map((p) => p.category))],
    [policies]
  );

  const filteredPolicies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return policies.filter((p) => {
      const matchesCat = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.bodyHtml.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [policies, activeCategory, searchQuery]);

  const sidebarByCategory = useMemo(() => {
    const grouped = {};
    filteredPolicies.forEach((p) => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });
    return grouped;
  }, [filteredPolicies]);

  const scrollToPolicy = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActivePolicyId(id);
      setSidebarOpen(false);
    }
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setSidebarOpen(false);
    }
  }, []);

  // Track active policy on scroll
  useEffect(() => {
    if (filteredPolicies.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActivePolicyId(entry.target.id);
          }
        });
      },
      { root: contentRef.current, rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    filteredPolicies.forEach((p) => {
      const el = document.getElementById(p.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [filteredPolicies]);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: "50vh" }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading policies…</span>
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
    <>
      <style dangerouslySetInnerHTML={{ __html: POLICY_BODY_CSS }} />

      <div className={compact ? "" : "max-w-7xl mx-auto"}>
        {!compact && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Policies &amp; Procedures Manual</h2>
              <p className="text-muted-foreground text-sm">
                {policies.length} policies across {categories.length} categories
              </p>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search policies by title or content…"
              className="w-full pl-9 pr-9 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-card font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {compact && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden px-3 py-2 border border-border rounded-lg text-sm font-bold bg-card"
            >
              Index
            </button>
          )}
        </div>

        {/* Result count */}
        <p className="text-xs text-muted-foreground mb-3">
          Showing {filteredPolicies.length} of {policies.length} policies
        </p>

        {/* Two-column layout */}
        <div className="flex gap-4" style={{ height }}>
          {/* Sidebar — policy index */}
          <div
            className={`${
              sidebarOpen ? "fixed inset-0 z-50 bg-black/30 lg:bg-transparent lg:static" : "hidden lg:block"
            } lg:w-64 lg:shrink-0`}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSidebarOpen(false);
            }}
          >
            <div className="w-64 h-full bg-card border border-border rounded-xl overflow-y-auto p-3 lg:sticky lg:top-0">
              <div className="flex items-center justify-between mb-3 lg:hidden">
                <p className="text-sm font-black">Policy Index</p>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              {Object.entries(sidebarByCategory).map(([cat, items]) => (
                <div key={cat} className="mb-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 mb-1.5">
                    {cat}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((p) => (
                      <div key={p.id}>
                        <button
                          onClick={() => scrollToPolicy(p.id)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-start gap-1.5 ${
                            activePolicyId === p.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          {activePolicyId === p.id && <ChevronRight size={11} className="mt-0.5 shrink-0" />}
                          <span className="line-clamp-2">{p.title}</span>
                        </button>
                        {activePolicyId === p.id && p.headings?.length > 0 && (
                          <div className="ml-3 mb-1 border-l border-border pl-2 space-y-0">
                            {p.headings.map((h) => (
                              <button
                                key={h.id}
                                onClick={() => scrollToSection(h.id)}
                                className="w-full text-left px-1.5 py-1 rounded text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors leading-tight"
                                style={{ paddingLeft: h.level === 3 ? "6px" : "12px" }}
                              >
                                {h.text}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main content — policy cards */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto bg-card border border-border rounded-xl p-4 space-y-4"
          >
            {filteredPolicies.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Search size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No policies match your search.</p>
              </div>
            ) : (
              filteredPolicies.map((p) => (
                <div
                  key={p.id}
                  id={p.id}
                  className="border border-border rounded-xl overflow-hidden scroll-mt-4"
                >
                  {/* Card header */}
                  <div className="bg-secondary/60 px-4 py-2 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                      {p.category}
                    </span>
                    {p.source && (
                      <span className="text-[10px] text-muted-foreground truncate">{p.source}</span>
                    )}
                  </div>
                  {/* Title */}
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-base font-bold text-foreground">{p.title}</h3>
                  </div>
                  {/* Body */}
                  <div
                    className="pm-body px-4 py-3"
                    dangerouslySetInnerHTML={{ __html: p.bodyHtml }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}