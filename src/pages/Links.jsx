import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ExternalLink, ImageIcon, Loader2, Link as LinkIcon } from "lucide-react";

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map(link => (
            <div key={link.id} className="bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-md transition-shadow">
              {link.image_url ? (
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <img src={link.image_url} alt={link.title} className="w-full h-40 object-cover hover:opacity-90 transition-opacity" />
                </a>
              ) : (
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-40 bg-muted hover:bg-accent transition-colors">
                  <LinkIcon size={32} className="text-muted-foreground" />
                </a>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-black text-foreground hover:text-primary transition-colors flex items-center gap-1.5 truncate">
                      {link.title} <ExternalLink size={12} className="shrink-0" />
                    </a>
                    {link.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{link.description}</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-1 truncate">{link.url}</p>
                  </div>
                  <button onClick={() => handleDelete(link.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}