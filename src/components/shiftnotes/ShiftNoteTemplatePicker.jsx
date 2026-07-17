import { useState } from "react";
import { SHIFT_NOTE_TEMPLATES } from "@/utils/shiftNoteTemplates";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, X, Loader2 } from "lucide-react";

// Renders a grid of shift note template cards. On select, creates a ShiftNote
// record linked to the matched shift (if provided) and opens the HTML workbook.
export default function ShiftNoteTemplatePicker({
  defaultStaffName,
  matchedShift,
  onSelect,
  onCancel,
  creating,
}) {
  const [selectedId, setSelectedId] = useState(null);

  const handleConfirm = () => {
    const tpl = SHIFT_NOTE_TEMPLATES.find(t => t.id === selectedId);
    if (tpl) onSelect(tpl);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h3 className="font-black text-sm">Select a Shift Note Template</h3>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        )}
      </div>

      {matchedShift && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 text-xs">
          <p className="font-bold text-primary">
            Linked Shift: {matchedShift.participant_name} · {matchedShift.date} ({matchedShift.program_type})
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-2.5">
        {SHIFT_NOTE_TEMPLATES.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => setSelectedId(tpl.id)}
            className={`text-left rounded-xl border-2 p-3 transition-all ${
              selectedId === tpl.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className="flex items-start gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedId === tpl.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <FileText size={14} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm leading-tight">{tpl.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{tpl.description}</p>
                <p className="text-[9px] text-muted-foreground mt-1">
                  {tpl.days.join(", ")} · {tpl.program_types.join(", ")}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="rounded-xl font-bold text-xs" disabled={creating}>
            Cancel
          </Button>
        )}
        <Button onClick={handleConfirm} disabled={!selectedId || creating} className="rounded-xl font-bold gap-2 text-xs">
          {creating ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
          Open Shift Note
        </Button>
      </div>
    </div>
  );
}