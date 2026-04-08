import { useState, useRef, useEffect } from "react";
import { NDIS_ITEMS } from "@/utils/ndisItems";
import { Search, ChevronDown } from "lucide-react";

export default function NDISItemSelect({ value, onSelect, placeholder = "Search NDIS item..." }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const filtered = search.length > 0
    ? NDIS_ITEMS.filter(
        (n) =>
          n.code.toLowerCase().includes(search.toLowerCase()) ||
          n.name.toLowerCase().includes(search.toLowerCase()) ||
          n.category.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 50)
    : NDIS_ITEMS.slice(0, 50);

  const selected = value ? NDIS_ITEMS.find((n) => n.code === value) : null;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
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
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-lg">
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
                <button
                  key={n.code}
                  type="button"
                  onClick={() => { onSelect(n); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors ${value === n.code ? "bg-primary/10" : ""}`}
                >
                  <span className="font-mono text-muted-foreground">{n.code}</span>
                  <span className="mx-1 text-muted-foreground">—</span>
                  <span className="text-foreground">{n.name}</span>
                  <span className="ml-2 text-muted-foreground">(${n.rate?.toFixed(2)})</span>
                </button>
              ))
            )}
            {search.length === 0 && NDIS_ITEMS.length > 50 && (
              <p className="text-[10px] text-muted-foreground text-center py-2">
                Showing 50 of {NDIS_ITEMS.length} — type to search all
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}