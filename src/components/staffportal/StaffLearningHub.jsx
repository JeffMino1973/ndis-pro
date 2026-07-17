import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, CheckCircle, Clock, PlayCircle, Award, Loader2, X, Minus, Plus, ExternalLink } from "lucide-react";
import { prepareActivityHtml } from "@/utils/prepareActivityHtml";
import { generateCertificatePDF } from "@/utils/generateCertificate";
import { Progress } from "@/components/ui/progress";

export default function StaffLearningHub({ user, staffRecord }) {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);
  const [generatingCertId, setGeneratingCertId] = useState(null);

  const load = async () => {
    if (!user) return;
    const [allEnroll, allCourses] = await Promise.all([
      base44.entities.LMSEnrollment.list("-created_date", 200),
      base44.entities.LMSCourse.list("-created_date", 100),
    ]);
    const myName = (user.full_name || "").toLowerCase().trim();
    const myEmail = (user.email || "").toLowerCase().trim();
    const mine = allEnroll.filter(e =>
      e.target_type === "staff" && (
        (e.student_name || "").toLowerCase().trim() === myName ||
        (e.student_email || "").toLowerCase().trim() === myEmail ||
        (staffRecord?.id && e.staff_id === staffRecord.id)
      )
    );
    setEnrollments(mine);
    setCourses(allCourses);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, staffRecord]);

  const generateAndSaveCertificate = async (enrollment) => {
    if (enrollment.certificate_url) return enrollment.certificate_url;
    setGeneratingCertId(enrollment.id);
    try {
      const course = courseById(enrollment.course_id);
      const pdfBlob = generateCertificatePDF({
        staffName: enrollment.student_name || user?.full_name || "Staff Member",
        courseTitle: course?.title || "Training Module",
        category: course?.category,
        completedAt: enrollment.completed_at,
      });
      const file = new File([pdfBlob], `certificate-${(course?.title || "course").replace(/[^a-zA-Z0-9]/g, "-")}.pdf`, { type: "application/pdf" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.LMSEnrollment.update(enrollment.id, { certificate_url: file_url });
      setEnrollments(prev => prev.map(e => e.id === enrollment.id ? { ...e, certificate_url: file_url } : e));
      return file_url;
    } catch (err) {
      console.error("Certificate generation failed:", err);
    } finally {
      setGeneratingCertId(null);
    }
  };

  const updateStatus = async (enrollId, status) => {
    const patch = { status };
    if (status === "Completed") {
      patch.completed_at = new Date().toISOString();
      patch.progress_percent = 100;
    }
    await base44.entities.LMSEnrollment.update(enrollId, patch);
    const updated = { ...(enrollments.find(e => e.id === enrollId) || {}), ...patch };
    setEnrollments(prev => prev.map(e => e.id === enrollId ? { ...e, ...patch } : e));
    if (status === "Completed") {
      generateAndSaveCertificate(updated);
    }
  };

  const updateProgress = async (enrollId, currentPct, delta) => {
    const newPct = Math.max(0, Math.min(100, (currentPct || 0) + delta));
    const patch = { progress_percent: newPct };
    if (newPct === 100) {
      patch.status = "Completed";
      patch.completed_at = new Date().toISOString();
    } else if (newPct > 0) {
      patch.status = "In Progress";
    }
    await base44.entities.LMSEnrollment.update(enrollId, patch);
    const updated = { ...(enrollments.find(e => e.id === enrollId) || {}), ...patch };
    setEnrollments(prev => prev.map(e => e.id === enrollId ? { ...e, ...patch } : e));
    if (newPct === 100) {
      generateAndSaveCertificate(updated);
    }
  };

  const myCourseIds = new Set(enrollments.map(e => e.course_id));
  const courseById = (id) => courses.find(c => c.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const completedCount = enrollments.filter(e => e.status === "Completed").length;
  const inProgressCount = enrollments.filter(e => e.status === "In Progress").length;
  const assignedCount = enrollments.filter(e => e.status === "Assigned").length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Assigned" value={assignedCount} color="text-blue-600 bg-blue-50" />
        <StatCard icon={Clock} label="In Progress" value={inProgressCount} color="text-amber-600 bg-amber-50" />
        <StatCard icon={CheckCircle} label="Completed" value={completedCount} color="text-emerald-600 bg-emerald-50" />
        <StatCard icon={Award} label="Total Courses" value={enrollments.length} color="text-primary bg-primary/10" />
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-12 text-center">
          <BookOpen size={32} className="text-muted-foreground/50 mx-auto mb-2" />
          <p className="font-black text-sm text-muted-foreground">No courses assigned yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your administrator can assign learning activities to you from the LMS.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {enrollments.map(e => {
            const course = courseById(e.course_id);
            if (!course) return null;
            return (
              <div key={e.id} className={`bg-card border rounded-2xl p-4 space-y-3 ${
                e.status === "Completed" ? "border-emerald-200" : e.status === "In Progress" ? "border-amber-200" : "border-border"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-sm">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.category}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    e.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                    e.status === "In Progress" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{e.status}</span>
                </div>
                {course.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                )}
                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-black">
                    <span className="text-muted-foreground uppercase tracking-widest">Progress</span>
                    <span className={e.status === "Completed" ? "text-emerald-600" : "text-primary"}>{Math.round(e.progress_percent || 0)}%</span>
                  </div>
                  <Progress value={e.progress_percent || 0} className="h-2" />
                </div>
                {/* Progress controls */}
                {e.status !== "Completed" && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => updateProgress(e.id, e.progress_percent, -25)}
                      disabled={(e.progress_percent || 0) === 0}
                      className="flex items-center justify-center w-7 h-7 rounded-lg border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition"
                      title="Decrease 25%"
                    >
                      <Minus size={13} />
                    </button>
                    <div className="flex-1 flex gap-1">
                      {[25, 50, 75].map(pct => (
                        <button
                          key={pct}
                          onClick={() => updateProgress(e.id, e.progress_percent, pct - (e.progress_percent || 0))}
                          className="flex-1 text-[10px] font-black text-muted-foreground bg-secondary hover:bg-primary hover:text-primary-foreground rounded-lg py-1.5 transition"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => updateProgress(e.id, e.progress_percent, 25)}
                      disabled={(e.progress_percent || 0) >= 100}
                      className="flex items-center justify-center w-7 h-7 rounded-lg border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition"
                      title="Increase 25%"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  {course.activity_url && (
                    <button
                      onClick={() => setActiveCourse({ enrollment: e, course })}
                      className="flex items-center gap-1.5 text-xs font-black text-white bg-primary hover:bg-primary/90 rounded-xl px-3 py-2 transition"
                    >
                      <PlayCircle size={14} /> {e.status === "Completed" ? "Review" : "Open Activity"}
                    </button>
                  )}
                  {e.status !== "In Progress" && e.status !== "Completed" && (
                    <button
                      onClick={() => updateStatus(e.id, "In Progress")}
                      className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl px-3 py-2 transition"
                    >
                      <Clock size={13} /> Start
                    </button>
                  )}
                  {e.status !== "Completed" && (
                    <button
                      onClick={() => { if (confirm("Mark this course as completed?")) updateStatus(e.id, "Completed"); }}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl px-3 py-2 transition"
                    >
                      <CheckCircle size={13} /> Complete
                    </button>
                  )}
                </div>
                {e.status === "Completed" && e.completed_at && (
                  <p className="text-[10px] text-emerald-600 font-bold">✓ Completed {new Date(e.completed_at).toLocaleDateString("en-AU")}</p>
                )}
                {e.status === "Completed" && (
                  <div className="flex items-center gap-2">
                    {e.certificate_url ? (
                      <a href={e.certificate_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl px-3 py-2 transition">
                        <Award size={14} /> View Certificate <ExternalLink size={10} />
                      </a>
                    ) : generatingCertId === e.id ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-secondary rounded-xl px-3 py-2">
                        <Loader2 size={14} className="animate-spin" /> Generating Certificate...
                      </span>
                    ) : (
                      <button onClick={() => generateAndSaveCertificate(e)} className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl px-3 py-2 transition">
                        <Award size={14} /> Generate Certificate
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeCourse && (
        <CourseViewer
          course={activeCourse.course}
          enrollment={activeCourse.enrollment}
          onClose={() => setActiveCourse(null)}
          onComplete={() => { updateStatus(activeCourse.enrollment.id, "Completed"); setActiveCourse(null); }}
          onProgress={() => updateStatus(activeCourse.enrollment.id, "In Progress")}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 text-center">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
        <Icon size={16} />
      </div>
      <p className="text-xl font-black">{value}</p>
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  );
}

function CourseViewer({ course, enrollment, onClose, onComplete, onProgress }) {
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
        if (enrollment.status === "Assigned") onProgress();
      })
      .catch(() => { setError(true); setLoading(false); });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [course.activity_url]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0b2f55] to-[#1565c0] text-white shrink-0">
        <div className="min-w-0">
          <p className="font-black text-sm truncate">{course.title}</p>
          <p className="text-xs text-white/70">{course.category} · Learning Activity</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {enrollment.status !== "Completed" && (
            <button onClick={onComplete} className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-xl transition">
              <CheckCircle size={14} /> Mark Complete
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20"><X size={18} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <a href={course.activity_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">Open in new tab</a>
          </div>
        )}
        {blobUrl && <iframe src={blobUrl} className="w-full h-full border-0" title={course.title} sandbox="allow-scripts allow-same-origin allow-forms" />}
      </div>
    </div>
  );
}