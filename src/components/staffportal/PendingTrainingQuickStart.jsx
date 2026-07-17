import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, PlayCircle, Loader2, CheckCircle2, Clock } from "lucide-react";

export default function PendingTrainingQuickStart({ user, staffRecord, onJumpToLearning }) {
  const [pending, setPending] = useState(null); // null = loading

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      const myName = (user.full_name || "").toLowerCase().trim();
      const myEmail = (user.email || "").toLowerCase().trim();
      const [allEnroll, allCourses] = await Promise.all([
        base44.entities.LMSEnrollment.filter({ target_type: "staff" }, "-created_date", 200),
        base44.entities.LMSCourse.list("-created_date", 100),
      ]);
      if (cancelled) return;
      const ci = (a, b) => (a || "").toLowerCase().trim() === b;
      const mine = allEnroll.filter(e =>
        e.target_type === "staff" && (
          ci(e.student_name, myName) ||
          ci(e.student_email, myEmail) ||
          (staffRecord?.id && e.staff_id === staffRecord.id)
        )
      );
      const courseById = (id) => allCourses.find(c => c.id === id);
      // Pending = not yet completed (progress < 100, status != Completed)
      const pendingItems = mine
        .filter(e => (e.progress_percent || 0) < 100 && e.status !== "Completed")
        .map(e => ({
          ...e,
          course: courseById(e.course_id),
        }))
        .sort((a, b) => (b.progress_percent || 0) - (a.progress_percent || 0)); // in-progress first, then not started
      setPending(pendingItems);
    }
    load().catch(() => !cancelled && setPending([]));
    return () => { cancelled = true; };
  }, [user, staffRecord]);

  // Don't render the section at all if loading or no pending items
  if (pending === null) return null;
  if (pending.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <BookOpen size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-black text-base leading-tight">Continue Your Training</h3>
            <p className="text-[11px] text-muted-foreground">
              {pending.length} module{pending.length > 1 ? "s" : ""} awaiting completion
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {pending.map(e => {
          const pct = e.progress_percent || 0;
          const started = pct > 0;
          return (
            <button
              key={e.id}
              onClick={onJumpToLearning}
              className="group shrink-0 w-56 text-left bg-card border border-border rounded-xl p-3 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${started ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                  {started ? <Clock size={15} /> : <PlayCircle size={15} />}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${started ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                  {started ? "In Progress" : "Not Started"}
                </span>
              </div>
              <p className="text-xs font-black text-foreground leading-tight mb-1 line-clamp-2">
                {e.course?.title || e.course_title || "Training Module"}
              </p>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground">{pct}%</span>
                  {pct > 0 && <span className="text-[10px] text-primary font-black group-hover:underline">Resume →</span>}
                  {pct === 0 && <span className="text-[10px] text-primary font-black group-hover:underline">Start →</span>}
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onJumpToLearning}
        className="mt-3 flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
      >
        View all my training <BookOpen size={13} />
      </button>
    </div>
  );
}