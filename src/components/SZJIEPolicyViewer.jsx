import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, FileText, ExternalLink, X, BookOpen } from "lucide-react";

const CATEGORY_COLORS = {
  "Workforce & Employment": "bg-blue-100 text-blue-700",
  "Client Rights & Support": "bg-green-100 text-green-700",
  "Safety, Risk & Incidents": "bg-red-100 text-red-700",
  "Compliance & Governance": "bg-purple-100 text-purple-700",
  "Finance & Billing": "bg-amber-100 text-amber-700",
};

export default function SZJIEPolicyViewer({ compact = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePolicyId, setActivePolicyId] = useState(null);

  useEffect(() => {
    async function loadPolicies() {
      try {
        const res = await base44.functions.invoke("getSZJIEPolicies", {});
        setPolicies(res.data.policies || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load policies");
      } finally {
        setLoading(false);
      }
    }
    loadPolicies();
  }, []);

  const categories = useMemo(() => [...new Set(policies.map((p) => p.category))], [policies]);

  const filteredPolicies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return policies.filter((p) => {
      const matchesCat = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
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
    }
  }, []);

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
    <div className={compact ? "" : "max-w-7xl mx-auto"}>
      {!compact && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">SZJIE Support Services — Policies &amp; Procedures</h2>
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
            placeholder="Search policies by title…"
            className="w-full pl-9 pr-9 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
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
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Showing {filteredPolicies.length} of {policies.length} policies
      </p>

      {/* Two-column layout */}
      <div className="flex gap-4" style={{ height }}>
        {/* Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="w-64 h-full bg-card border border-border rounded-xl overflow-y-auto p-3">
            {Object.entries(sidebarByCategory).map(([cat, items]) => (
              <div key={cat} className="mb-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 mb-1.5">
                  {cat}
                </p>
                <div className="space-y-0.5">
                  {items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => scrollToPolicy(p.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-start gap-1.5 ${
                        activePolicyId === p.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <FileText size={11} className="mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{p.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content — policy cards */}
        <div className="flex-1 overflow-y-auto bg-card border border-border rounded-xl p-4 space-y-3">
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
                <div className="bg-secondary/60 px-4 py-2.5 flex items-center justify-between gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[p.category] || "bg-gray-100 text-gray-600"}`}>
                    {p.category}
                  </span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={11} /> Open PDF
                  </a>
                </div>
                {/* Title + preview */}
                <div className="px-4 py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <FileText size={20} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">SZJIE Support Services — Policies &amp; Procedures</p>
                    </div>
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink size={12} /> View
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}