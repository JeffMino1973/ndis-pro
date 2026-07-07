import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, FileText, ExternalLink, CheckCircle, XCircle, Clock, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function StaffComplianceReview() {
  const [docs, setDocs] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStaff, setExpandedStaff] = useState(null);
  const [saving, setSaving] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});

  useEffect(() => {
    async function load() {
      const [allDocs, staff] = await Promise.all([
        base44.entities.StaffComplianceDoc.list("-created_date"),
        base44.entities.StaffMember.list(),
      ]);
      setDocs(allDocs);
      setStaffList(staff);
      setLoading(false);
    }
    load();
  }, []);

  const setStatus = async (doc, status) => {
    setSaving(doc.id);
    const me = await base44.auth.me().catch(() => null);
    await base44.entities.StaffComplianceDoc.update(doc.id, {
      status,
      reviewed_by: me?.email || me?.full_name || "Admin",
      notes: reviewNotes[doc.id] || doc.notes || "",
    });
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status, reviewed_by: me?.email || "Admin", notes: reviewNotes[doc.id] || d.notes } : d));
    setSaving(null);
  };

  if (loading) return (
    <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-muted-foreground" /></div>
  );

  const pendingCount = docs.filter(d => d.status === "Pending").length;
  const verifiedCount = docs.filter(d => d.status === "Verified").length;
  const rejectedCount = docs.filter(d => d.status === "Rejected").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-primary" />
        <h3 className="font-black text-base">Staff Compliance Document Review</h3>
      </div>
      <p className="text-sm text-muted-foreground">Review and verify compliance documents uploaded by staff members.</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Pending</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-emerald-600">{verifiedCount}</p>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Verified</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-rose-600">{rejectedCount}</p>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Rejected</p>
        </div>
      </div>

      {/* By Staff */}
      {staffList.map(staff => {
        const sDocs = docs.filter(d => d.staff_name === staff.name || d.staff_id === staff.id);
        if (sDocs.length === 0) return null;
        const sPending = sDocs.filter(d => d.status === "Pending").length;
        return (
          <div key={staff.id} className="bg-card border border-border rounded-2xl overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition"
              onClick={() => setExpandedStaff(expandedStaff === staff.id ? null : staff.id)}>
              <div className="flex items-center gap-3">
                {staff.photo_url
                  ? <img src={staff.photo_url} alt="" className="w-9 h-9 rounded-xl object-cover" />
                  : <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">{staff.name?.charAt(0)}</div>
                }
                <div className="text-left">
                  <p className="font-bold text-sm">{staff.name}</p>
                  <p className="text-xs text-muted-foreground">{staff.role} · {sDocs.length} doc{sDocs.length !== 1 ? "s" : ""}{sPending > 0 && ` · ${sPending} pending`}</p>
                </div>
              </div>
              {expandedStaff === staff.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>

            {expandedStaff === staff.id && (
              <div className="border-t border-border p-4 space-y-3">
                {sDocs.map(doc => {
                  const days = doc.expiry_date ? Math.ceil((new Date(doc.expiry_date) - new Date()) / 86400000) : null;
                  const expired = days !== null && days < 0;
                  return (
                    <div key={doc.id} className={`border rounded-xl p-4 ${doc.status === "Verified" ? "border-emerald-200 bg-emerald-50/50" : doc.status === "Rejected" ? "border-rose-200 bg-rose-50/50" : "border-amber-200 bg-amber-50/50"}`}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText size={18} className="text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-sm">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">{doc.category}{doc.expiry_date ? ` · Exp: ${doc.expiry_date}` : ""}{expired ? " (EXPIRED)" : ""}</p>
                            {doc.reviewed_by && <p className="text-[10px] text-muted-foreground">Reviewed by: {doc.reviewed_by}</p>}
                          </div>
                        </div>
                        {doc.file_url && (
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs font-bold h-7 px-2">
                              <ExternalLink size={11} /> View File
                            </Button>
                          </a>
                        )}
                      </div>

                      {doc.status === "Pending" && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={reviewNotes[doc.id] ?? doc.notes ?? ""}
                            onChange={e => setReviewNotes(prev => ({ ...prev, [doc.id]: e.target.value }))}
                            placeholder="Add review notes (optional)…"
                            rows={2}
                            className="text-xs"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" disabled={saving === doc.id}
                              onClick={() => setStatus(doc, "Verified")}
                              className="rounded-xl font-bold text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                              {saving === doc.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Verify
                            </Button>
                            <Button size="sm" variant="outline" disabled={saving === doc.id}
                              onClick={() => setStatus(doc, "Rejected")}
                              className="rounded-xl font-bold text-xs gap-1 border-rose-300 text-rose-600 hover:bg-rose-50">
                              <XCircle size={12} /> Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {doc.status !== "Pending" && doc.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">Note: {doc.notes}</p>
                      )}

                      {doc.status !== "Pending" && (
                        <div className="mt-2">
                          <Button size="sm" variant="ghost" disabled={saving === doc.id}
                            onClick={() => setStatus(doc, "Pending")}
                            className="rounded-xl text-xs text-muted-foreground hover:text-foreground gap-1 h-7 px-2">
                            <Clock size={10} /> Reset
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {docs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground italic text-sm bg-card border border-border rounded-2xl">
          No compliance documents uploaded by staff yet.
        </div>
      )}
    </div>
  );
}