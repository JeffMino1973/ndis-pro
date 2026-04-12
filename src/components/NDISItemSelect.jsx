import { useState, useRef, useEffect } from "react";
import { NDIS_ITEMS } from "@/utils/ndisItems";
import { Search, ChevronDown } from "lucide-react";

export default function NDISItemSelect({ value, onSelect, placeholder = "Search NDIS item..." }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const filtered = search.length > 0
    ? NDIS_ITEMS.filter(
        (n) =>
          n.code.toLowerCase().includes(search.toLowerCase()) ||
          n.name.toLowerCase().includes(search.toLowerCase()) ||
          n.category.toLowerCase().includes(search.toLowerCase())
      )
    : NDIS_ITEMS;

  const selected = value ? NDIS_ITEMS.find((n) => n.code === value) : null;

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (n) => {
    onSelect(n);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(""); }}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {selected ? (
          <span className="truncate text-xs">
            <span className="font-mono text-muted-foreground">{selected.code}</span>
            {" — "}
            {selected.name}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 99999,
            marginTop: 4,
          }}
          className="bg-white border border-border rounded-md shadow-xl"
        >
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type code or name..."
                className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 text-center">No items found</p>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.code}
                  onClick={() => handleSelect(n)}
                  className={`w-full text-left px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 transition-colors ${value === n.code ? "bg-blue-100" : ""}`}
                >
                  <span className="font-mono text-slate-500">{n.code}</span>
                  <span className="mx-1 text-slate-400">—</span>
                  <span className="text-slate-800">{n.name}</span>
                  <span className="ml-2 text-slate-400">(${n.rate?.toFixed(2)}/hr)</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}