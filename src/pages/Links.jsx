import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ExternalLink, ImageIcon, Loader2, Link as LinkIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Links() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    const data = await base44.entities.LinkItem.list("-created_date");
    setLinks(data);
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title || !form.url) return;
    setSaving(true);
    let image_url = "";
    if (imageFile) {
      const res = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = res.file_url;
    }
    await base44.entities.LinkItem.create({ ...form, image_url });
    setForm({ title: "", url: "", description: "" });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(false);
    await loadLinks();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.LinkItem.delete(id);
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Links</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage clickable image & text links for participants.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={16} /> Add Link
        </Button>
      </div>

      {/* Add Link Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="font-black text-foreground mb-4">New Link</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1 block">Title *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. NDIS Website" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">URL *</Label>
                <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Description (optional)</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description..." />
            </div>
            <div>
              <Label className="text-xs mb-2 block">Link Image (optional)</Label>
              <div className="flex items-center gap-4">
                <label htmlFor="link-img-upload" className="cursor-pointer flex items-center gap-2 border border-dashed border-border rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-accent transition">
                  <ImageIcon size={16} />
                  {imagePreview ? "Change Image" : "Upload Image"}
                  <input id="link-img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="preview" className="h-16 w-24 object-cover rounded-xl border border-border" />
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowForm(false); setImageFile(null); setImagePreview(null); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.title || !form.url || saving} className="gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Save Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Links Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <LinkIcon size={40} className="text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-black text-foreground mb-1">No Links Yet</h3>
          <p className="text-sm text-muted-foreground">Click "Add Link" to create your first image link.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {links.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card border border-border rounded-2xl p-5 flex items-center gap-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative"
            >
              {/* Icon / Image */}
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-secondary border border-border overflow-hidden flex items-center justify-center">
                {link.image_url ? (
                  <img src={link.image_url} alt={link.title} className="w-full h-full object-cover" />
                ) : (
                  <LinkIcon size={28} className="text-muted-foreground" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-foreground text-lg leading-tight mb-1">{link.title}</h3>
                {link.description && (
                  <p className="text-sm text-muted-foreground leading-snug line-clamp-3">{link.description}</p>
                )}
                {link.created_date && (
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Created {formatDistanceToNow(new Date(link.created_date), { addSuffix: true })}
                  </p>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={e => { e.preventDefault(); handleDelete(link.id); }}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
              >
                <Trash2 size={14} />
              </button>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}