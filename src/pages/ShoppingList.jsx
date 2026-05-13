import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Printer, ShoppingCart, Upload, Loader2, CheckCircle,
  Trash2, ImagePlus, Package, ChevronDown, ChevronUp, X
} from "lucide-react";

const LOGO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/09e12d07c_LOGO_LANDSCAPE.png";

const CATEGORIES = ["Produce", "Meat & Seafood", "Pantry", "Health & Pharmacy", "Cleaning", "Beverages", "Other"];

const DEFAULT_ITEMS = [
  // Produce
  { name: "Pears", category: "Produce", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/cb209324a_Pears.jpg" },
  { name: "Strawberries - 250g", category: "Produce", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2110a18b1_Strawberries.jpg" },
  { name: "Navel Oranges - approx. 250g", category: "Produce", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/1dce7d5d0_Oranges.jpg" },
  { name: "Eggplant", category: "Produce", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/25d4def65_effplant.jpg" },
  { name: "Brown Mushrooms", category: "Produce", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/6fc10a747_brownmyshroom.jpg" },
  { name: "Corn", category: "Produce", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2b308a71b_Corn.jpg" },
  { name: "Garlic Bulb Net", category: "Produce", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b6bb2a7ef_Garlic.jpg" },
  { name: "Plums", category: "Produce", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/70e155927_IMG_0923.jpg" },
  { name: "Ripe Pineapple", category: "Produce", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7a8625948_IMG_0924.jpg" },
  { name: "Organic Choy Pack", category: "Produce", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/80a0451f3_IMG_0925.jpg" },
  // Meat & Seafood
  { name: "Cleaver's Organic Grass-fed Beef Eye Fillet - 240g", category: "Meat & Seafood", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2c939ec27_CleaversOrganixBeef.jpg" },
  { name: "Luv a Duck Fresh Duck Breasts - 380g", category: "Meat & Seafood", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/4244116ba_LuvaDuckBreast.jpg" },
  { name: "Inglewood Farms Chicken Thigh Fillets Skin Off - 425g", category: "Meat & Seafood", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2a653eaff_InglewoodChickenThigs.jpg" },
  { name: "K-Roo Kangaroo Steak", category: "Meat & Seafood", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/4ae6f9392_KanarooSteak.jpg" },
  // Pantry
  { name: "Fresh Thick Rice Noodles - 950g", category: "Pantry", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/612d220a8_IMG_1171.png" },
  { name: "Nongshim Soon Veggie Ramyun Noodles - 5 pack", category: "Pantry", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/36d578667_IMG_1170.png" },
  // Health & Pharmacy
  { name: "Strepsils Orange Throat Lozenges - 36 pack", category: "Health & Pharmacy", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2a05f1bba_StrepsilsOrangeThroatLozenges36pack.jpg" },
  { name: "Band Aid Tough Strips - 40 pack", category: "Health & Pharmacy", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7f273a045_Band-AidToughStrips40pack.jpg" },
  { name: "Colgate Plax Freshmint Mouthwash - 1L", category: "Health & Pharmacy", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/8c4d0958e_MouthWash.jpeg" },
  // Cleaning
  { name: "Morning Fresh Original Dishwashing Liquid - 900ml", category: "Cleaning", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c827953dd_mormningfreshlime900ml.jpg" },
  // Beverages
  { name: "Twinings Pure Camomile Tea - 80 bags", category: "Beverages", image_url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0eec9534b_IMG_2459.jpeg" },
];

const UNITS = ["", "x", "kg", "g", "L", "ml", "pack", "bunch", "bag", "box", "bottle", "can"];

export default function ShoppingListPage() {
  const [view, setView] = useState("weekly"); // weekly | manage | print
  const [items, setItems] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekLabel, setWeekLabel] = useState("");
  const [quantities, setQuantities] = useState({});
  const [units, setUnitMap] = useState({});
  const [notes, setNotes] = useState({});
  const [listNotes, setListNotes] = useState("");
  const [uploadingId, setUploadingId] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Other", image_url: "" });
  const [newItemUploading, setNewItemUploading] = useState(false);
  const [savedList, setSavedList] = useState(null);
  const [collapsedCats, setCollapsedCats] = useState({});

  useEffect(() => {
    load();
    // Default week label to current week
    const now = new Date();
    const mon = new Date(now);
    mon.setDate(now.getDate() - now.getDay() + 1);
    setWeekLabel(`Week of ${mon.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })}`);
  }, []);

  const load = async () => {
    setLoading(true);
    let [dbItems, dbLists] = await Promise.all([
      base44.entities.ShoppingItem.list("-created_date"),
      base44.entities.ShoppingList.list("-created_date", 20),
    ]);

    // Seed default items if none exist
    if (dbItems.length === 0) {
      const created = await Promise.all(DEFAULT_ITEMS.map(i => base44.entities.ShoppingItem.create({ ...i, is_active: true })));
      dbItems = created;
    }

    setItems(dbItems.filter(i => i.is_active !== false));
    setLists(dbLists);
    setLoading(false);
  };

  const setQty = (id, val) => setQuantities(p => ({ ...p, [id]: val }));
  const setUnit = (id, val) => setUnitMap(p => ({ ...p, [id]: val }));
  const setNote = (id, val) => setNotes(p => ({ ...p, [id]: val }));
  const toggleCat = (cat) => setCollapsedCats(p => ({ ...p, [cat]: !p[cat] }));

  const uploadImage = async (file, onDone) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onDone(file_url);
  };

  const handleItemImageUpload = async (itemId, file) => {
    setUploadingId(itemId);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.ShoppingItem.update(itemId, { image_url: file_url });
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, image_url: file_url } : i));
    setUploadingId(null);
  };

  const handleNewItemImage = async (file) => {
    setNewItemUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewItem(p => ({ ...p, image_url: file_url }));
    setNewItemUploading(false);
  };

  const addNewItem = async () => {
    if (!newItem.name.trim()) return;
    const created = await base44.entities.ShoppingItem.create({ ...newItem, is_active: true });
    setItems(prev => [...prev, created]);
    setNewItem({ name: "", category: "Other", image_url: "" });
    setShowAddItem(false);
  };

  const deleteItem = async (id) => {
    await base44.entities.ShoppingItem.update(id, { is_active: false });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const saveList = async () => {
    setSaving(true);
    const listItems = items
      .filter(i => Number(quantities[i.id] || 0) > 0)
      .map(i => ({
        item_id: i.id,
        item_name: i.name,
        image_url: i.image_url || "",
        qty: Number(quantities[i.id]),
        unit: units[i.id] || "",
        notes: notes[i.id] || "",
      }));

    const saved = await base44.entities.ShoppingList.create({
      week_label: weekLabel,
      participant_name: "Bronwyn Chau",
      status: "Ready",
      items: listItems,
      notes: listNotes,
    });
    setSavedList(saved);
    await load();
    setSaving(false);
    setView("print");
  };

  const loadList = (list) => {
    const qMap = {}, uMap = {}, nMap = {};
    (list.items || []).forEach(li => {
      qMap[li.item_id] = li.qty;
      uMap[li.item_id] = li.unit || "";
      nMap[li.item_id] = li.notes || "";
    });
    setQuantities(qMap);
    setUnitMap(uMap);
    setNotes(nMap);
    setWeekLabel(list.week_label);
    setListNotes(list.notes || "");
    setSavedList(list);
    setView("weekly");
  };

  // Group items by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {});

  const activeCount = items.filter(i => Number(quantities[i.id] || 0) > 0).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  // ── PRINT VIEW ──
  if (view === "print" && savedList) {
    const printItems = savedList.items || [];
    const printGrouped = CATEGORIES.reduce((acc, cat) => {
      const catItems = printItems.filter(li => {
        const src = items.find(i => i.id === li.item_id);
        return src?.category === cat;
      });
      if (catItems.length > 0) acc[cat] = catItems;
      return acc;
    }, {});

    return (
      <div>
        <style>{`@media print { .no-print { display: none !important; } @page { size: A4; margin: 12mm; } }`}</style>
        <div className="no-print flex justify-between items-center mb-4 p-4 bg-card border-b border-border">
          <button onClick={() => setView("weekly")} className="text-primary font-bold text-sm hover:underline">← Back</button>
          <Button onClick={() => window.print()} variant="outline" className="gap-2 rounded-xl"><Printer size={15} /> Print / Save PDF</Button>
        </div>

        <div className="max-w-3xl mx-auto bg-white shadow-xl overflow-hidden rounded-b-xl">
          {/* Header */}
          <div style={{background:"linear-gradient(90deg,#3b82f6,#2563eb,#9333ea)"}} className="p-6 flex items-center justify-between">
            <img src={LOGO} alt="SZ-JIE WANG" className="h-12 bg-white rounded-xl px-3 py-1.5 object-contain" />
            <div className="text-right text-white">
              <h1 className="text-xl font-black">Shopping List</h1>
              <p className="text-blue-100 text-xs mt-0.5">Bronwyn Chau · {savedList.week_label}</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {Object.entries(printGrouped).map(([cat, catItems]) => (
              <section key={cat}>
                <div className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest mb-3">{cat}</div>
                <div className="grid grid-cols-2 gap-3">
                  {catItems.map((li, i) => (
                    <div key={i} className="flex gap-3 border border-slate-200 rounded-xl p-3 items-start">
                      {li.image_url && (
                        <img src={li.image_url} alt={li.item_name} className="w-16 h-16 object-cover rounded-lg shrink-0 border border-slate-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-slate-800 leading-tight">{li.item_name}</p>
                        <p className="text-blue-700 font-black text-base mt-1">{li.qty}{li.unit ? ` ${li.unit}` : ""}</p>
                        {li.notes && <p className="text-xs text-slate-500 mt-0.5">{li.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {savedList.notes && (
              <section>
                <div className="bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest mb-3">Additional Notes</div>
                <p className="text-sm text-slate-700">{savedList.notes}</p>
              </section>
            )}

            <p className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">SZ-JIE WANG Support Services · Prepared for Bronwyn Chau · {savedList.week_label}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── MANAGE ITEMS VIEW ──
  if (view === "manage") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => setView("weekly")} className="text-primary font-bold text-sm hover:underline">← Back to List</button>
            <h2 className="text-2xl font-black mt-1">Manage Products</h2>
            <p className="text-muted-foreground text-sm">Add, remove or update product images.</p>
          </div>
          <Button onClick={() => setShowAddItem(true)} className="gap-2 rounded-xl"><Plus size={15} /> Add Product</Button>
        </div>

        {showAddItem && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-black text-lg">New Product</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Product Name *</Label><Input value={newItem.name} onChange={e => setNewItem(p => ({...p, name: e.target.value}))} placeholder="e.g. Bok Choy" className="mt-1" /></div>
              <div>
                <Label>Category</Label>
                <Select value={newItem.category} onValueChange={v => setNewItem(p => ({...p, category: v}))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Product Image</Label>
                <label className="mt-1 flex items-center gap-2 border border-dashed border-border rounded-xl p-3 cursor-pointer hover:bg-secondary transition-colors">
                  {newItemUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} className="text-muted-foreground" />}
                  <span className="text-sm text-muted-foreground">{newItem.image_url ? "Image uploaded ✓" : "Upload image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleNewItemImage(e.target.files[0])} />
                </label>
                {newItem.image_url && <img src={newItem.image_url} className="mt-2 h-20 w-20 object-cover rounded-xl border border-slate-200" />}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddItem(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={addNewItem} disabled={!newItem.name.trim()} className="rounded-xl gap-2"><Plus size={14} /> Add Product</Button>
            </div>
          </div>
        )}

        {CATEGORIES.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">{cat}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {catItems.map(item => (
                  <div key={item.id} className="bg-card border border-border rounded-2xl p-3 relative group">
                    <button onClick={() => deleteItem(item.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-24 object-cover rounded-xl mb-2 border border-slate-100" />
                    ) : (
                      <div className="w-full h-24 bg-slate-100 rounded-xl mb-2 flex items-center justify-center">
                        <Package size={24} className="text-slate-300" />
                      </div>
                    )}
                    <p className="font-black text-xs text-slate-800 leading-tight mb-2">{item.name}</p>
                    <label className="flex items-center gap-1.5 text-[10px] text-primary font-bold cursor-pointer hover:underline">
                      {uploadingId === item.id ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                      {item.image_url ? "Replace image" : "Add image"}
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleItemImageUpload(item.id, e.target.files[0])} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── WEEKLY ORDER VIEW ──
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <img src={LOGO} alt="SZ-JIE WANG" className="h-10 object-contain hidden sm:block" />
          <div>
            <h2 className="text-2xl font-black tracking-tight">Bronwyn Chau — Shopping List</h2>
            <p className="text-muted-foreground text-sm">Set quantities for this week's shop. Zero = not needed.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setView("manage")} className="gap-2 rounded-xl text-sm"><Package size={14} /> Manage Products</Button>
        </div>
      </div>

      {/* Week label + past lists */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-black">Week Label</Label>
            <Input value={weekLabel} onChange={e => setWeekLabel(e.target.value)} className="mt-1" placeholder="e.g. Week of 12 May 2026" />
          </div>
          {lists.length > 0 && (
            <div>
              <Label className="text-xs font-black">Load Previous List</Label>
              <Select onValueChange={id => { const l = lists.find(x => x.id === id); if (l) loadList(l); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select a previous list..." /></SelectTrigger>
                <SelectContent>{lists.map(l => <SelectItem key={l.id} value={l.id}>{l.week_label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Item grid by category */}
      {CATEGORIES.map(cat => {
        const catItems = grouped[cat];
        if (!catItems || catItems.length === 0) return null;
        const collapsed = collapsedCats[cat];
        return (
          <div key={cat} className="bg-card border border-border rounded-2xl overflow-hidden">
            <button onClick={() => toggleCat(cat)} className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white hover:bg-slate-800 transition-colors">
              <span className="text-xs font-black uppercase tracking-widest">{cat}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-60">{catItems.filter(i => Number(quantities[i.id]||0) > 0).length}/{catItems.length} selected</span>
                {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </div>
            </button>
            {!collapsed && (
              <div className="divide-y divide-border">
                {catItems.map(item => {
                  const qty = quantities[item.id] || "";
                  const hasQty = Number(qty) > 0;
                  return (
                    <div key={item.id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${hasQty ? "bg-emerald-50/50" : ""}`}>
                      {/* Image */}
                      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-slate-300" /></div>
                        )}
                      </div>
                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-foreground leading-tight">{item.name}</p>
                        {hasQty && <p className="text-[10px] text-emerald-600 font-black mt-0.5">✓ Added to list</p>}
                      </div>
                      {/* Qty + unit */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={e => setQty(item.id, e.target.value)}
                          placeholder="0"
                          className="w-16 text-center font-black"
                        />
                        <Select value={units[item.id] || ""} onValueChange={v => setUnit(item.id, v)}>
                          <SelectTrigger className="w-20 text-xs"><SelectValue placeholder="unit" /></SelectTrigger>
                          <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u || "—"}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Notes */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <Label className="text-xs font-black">Any other items / notes this week?</Label>
        <Textarea value={listNotes} onChange={e => setListNotes(e.target.value)} placeholder="e.g. Extra garlic this week, check for fresh ginger..." className="mt-2 min-h-[80px]" />
      </div>

      {/* Summary & Save */}
      <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="font-black text-foreground">{activeCount} item{activeCount !== 1 ? "s" : ""} on list this week</p>
          <p className="text-sm text-muted-foreground">Items with qty = 0 will not appear on the printed list</p>
        </div>
        <Button onClick={saveList} disabled={saving || activeCount === 0 || !weekLabel.trim()} className="gap-2 rounded-xl font-black">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
          Save &amp; Print List
        </Button>
      </div>

      {/* Past lists */}
      {lists.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Previous Lists</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lists.slice(0, 6).map(l => (
              <button key={l.id} onClick={() => { setSavedList(l); setView("print"); }} className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="font-black text-sm">{l.week_label}</p>
                    <p className="text-xs text-muted-foreground">{(l.items || []).length} items · {l.status}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}