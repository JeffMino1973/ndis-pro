import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Play, CheckCircle, Clock, Star, X, ChevronLeft, Loader2, Award } from "lucide-react";
import { prepareActivityHtml } from "@/utils/prepareActivityHtml";
import { Progress } from "@/components/ui/progress";

const CATEGORY_COLORS = {
  "Everyday Life & Community Skills": "bg-blue-100 text-blue-700",
  "Maths & Literacy": "bg-violet-100 text-violet-700",
  "Employment & Vocational": "bg-amber-100 text-amber-700",
  "Health & Wellbeing": "bg-rose-100 text-rose-700",
  "Travel & Transport": "bg-cyan-100 text-cyan-700",
  "Other": "bg-slate-100 text-slate-600",
};

function ActivityViewer({ course, enrollment, onClose, onComplete, onProgress }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let url = null;
    fetch(course.activity_url)
      .then(r => r.text())
      .then(html => {
        const prepared = prepareActivityHtml(html, course.activity_url);
        const blob = new Blob([prepared], { type: "text/html" });
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [course.activity_url]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20">
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="font-black text-sm">{course.title}</p>
            <p className="text-xs opacity-80">{course.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {enrollment?.status !== "Completed" && (
            <>
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <Progress value={enrollment?.progress_percent || 0} className="w-24 h-2 bg-white/20" />
                <span className="text-xs font-black">{enrollment?.progress_percent || 0}%</span>
              </div>
              {onProgress && enrollment?.progress_percent < 100 && (
                <button onClick={onProgress} className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition">
                  +25%
                </button>
              )}
              <button onClick={onComplete} className="flex items-center gap-1.5 text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition">
                <CheckCircle size={14} /> Mark Complete
              </button>
            </>
          )}
          {enrollment?.status === "Completed" && (
            <span className="flex items-center gap-1.5 text-xs font-black bg-emerald-600 text-white px-3 py-1.5 rounded-lg">
              <Star size={14} /> Completed!
            </span>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20"><X size={18} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 size={28} className="text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground mb-3">Could not load activity in-portal.</p>
              <a href={course.activity_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">Open in new tab</a>
            </div>
          </div>
        )}
        {blobUrl && <iframe src={blobUrl} className="w-full h-full border-0" title={course.title} sandbox="allow-scripts allow-same-origin allow-forms" />}
      </div>
    </div>
  );
}

export default function ParticipantLearningHub({ participant }) {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeActivity, setActiveActivity] = useState(null);

  useEffect(() => {
    async function load() {
      const [byName, byParticipant, allCourses] = await Promise.all([
        base44.entities.LMSEnrollment.filter({ student_name: participant.name }).catch(() => []),
        participant.id ? base44.entities.LMSEnrollment.filter({ participant_id: participant.id }).catch(() => []) : Promise.resolve([]),
        base44.entities.LMSCourse.list("-created_date", 100).catch(() => []),
      ]);
      // Merge and dedupe
      const seen = new Set();
      const merged = [...(byName || []), ...(byParticipant || [])].filter(e => {
        if (seen.has(e.id)) return false;
        seen.add(e.id); return true;
      });
      setEnrollments(merged);
      setCourses(allCourses || []);
      setLoading(false);
    }
    load();
  }, [participant.id, participant.name]);

  const getEnrollment = (courseId) => enrollments.find(e => e.course_id === courseId);
  const myCourses = courses.filter(c => getEnrollment(c.id));
  const completed = myCourses.filter(c => getEnrollment(c.id)?.status === "Completed");
  const inProgress = myCourses.filter(c => getEnrollment(c.id)?.status !== "Completed");

  const markComplete = async () => {
    if (!activeActivity) return;
    const enrollment = enrollments.find(e => e.course_id === activeActivity.id);
    if (!enrollment) return;
    await base44.entities.LMSEnrollment.update(enrollment.id, {
      status: "Completed",
      progress_percent: 100,
      completed_at: new Date().toISOString(),
    });
    setEnrollments(prev => prev.map(e => e.id === enrollment.id ? { ...e, status: "Completed", progress_percent: 100 } : e));
  };

  const bumpProgress = async () => {
    if (!activeActivity) return;
    const enrollment = enrollments.find(e => e.course_id === activeActivity.id);
    if (!enrollment) return;
    const current = enrollment.progress_percent || 0;
    const next = Math.min(current + 25, 100);
    const newStatus = next >= 100 ? "Completed" : (current === 0 ? "In Progress" : enrollment.status);
    await base44.entities.LMSEnrollment.update(enrollment.id, {
      progress_percent: next,
      status: newStatus,
      ...(newStatus === "Completed" ? { completed_at: new Date().toISOString() } : {}),
    });
    setEnrollments(prev => prev.map(e => e.id === enrollment.id ? { ...e, progress_percent: next, status: newStatus } : e));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="text-primary animate-spin" />
    </div>
  );

  return (
    <>
      {activeActivity && (
        <ActivityViewer
          course={activeActivity}
          enrollment={getEnrollment(activeActivity.id)}
          onClose={() => setActiveActivity(null)}
          onComplete={markComplete}
          onProgress={bumpProgress}
        />
      )}

      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-black text-lg flex items-center gap-2"><BookOpen size={18} /> My Learning Hub</h3>
            <p className="text-sm opacity-80">Access your assigned learning activities and track your progress.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <Award size={16} className="text-yellow-300" />
            <span className="font-black text-sm">{completed.length} / {myCourses.length} completed</span>
          </div>
        </div>

        {myCourses.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
            <h3 className="font-black text-slate-800 mb-1">No courses assigned yet</h3>
            <p className="text-sm text-slate-500">Your support coordinator will assign learning activities here. Check back soon!</p>
          </div>
        )}

        {inProgress.length > 0 && (
          <div>
            <h4 className="font-black text-base mb-3 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> In Progress</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {inProgress.map(course => {
                const enroll = getEnrollment(course.id);
                const pct = enroll?.progress_percent || 0;
                return (
                  <button key={course.id} onClick={() => setActiveActivity(course)}
                    className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <BookOpen size={18} className="text-primary" />
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${CATEGORY_COLORS[course.category] || "text-muted-foreground"}`}>{course.category}</span>
                    </div>
                    <h5 className="font-black text-sm mb-2 line-clamp-2">{course.title}</h5>
                    <div className="mb-3">
                      <Progress value={pct} className="h-2" />
                      <p className="text-[10px] font-bold text-muted-foreground mt-1">{pct}% complete</p>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-black text-xs group-hover:gap-3 transition-all">
                      <Play size={14} className="fill-primary" /> {pct === 0 ? "Start" : "Continue"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h4 className="font-black text-base mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Completed</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {completed.map(course => (
                <button key={course.id} onClick={() => setActiveActivity(course)}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Star size={18} className="text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Completed ✓</span>
                  </div>
                  <h5 className="font-black text-sm mb-1 line-clamp-2">{course.title}</h5>
                  <p className="text-xs text-muted-foreground">Tap to review</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}