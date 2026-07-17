import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Play, CheckCircle, Clock, Star, LogOut, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prepareActivityHtml } from "@/utils/prepareActivityHtml";

const CATEGORY_COLORS = {
  "Everyday Life & Community Skills": "bg-blue-100 text-blue-700",
  "Maths & Literacy": "bg-violet-100 text-violet-700",
  "Employment & Vocational": "bg-amber-100 text-amber-700",
  "Health & Wellbeing": "bg-rose-100 text-rose-700",
  "Travel & Transport": "bg-cyan-100 text-cyan-700",
  "Other": "bg-slate-100 text-slate-600",
};

function ActivityViewer({ course, enrollment, onClose, onComplete }) {
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
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0b2f55] to-[#1565c0] text-white shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20">
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="font-black text-sm">{course.title}</p>
            <p className="text-xs text-white/70">{course.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {enrollment?.status !== "Completed" && (
            <button onClick={onComplete} className="flex items-center gap-1.5 text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition">
              <CheckCircle size={14} /> Mark Complete
            </button>
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
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
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

export default function StudentPortal() {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeActivity, setActiveActivity] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) {
        setAuthChecked(true);
        setLoading(false);
        return;
      }
      const me = await base44.auth.me();
      setUser(me);
      // Load all courses and enrollments for this user
      const [e, c] = await Promise.all([
        base44.entities.LMSEnrollment.filter({ student_email: me.email }).catch(() => []),
        base44.entities.LMSCourse.list("-created_date", 100).catch(() => []),
      ]);
      // Also try matching by name
      const nameEnrolls = await base44.entities.LMSEnrollment.filter({ student_name: me.full_name }).catch(() => []);
      const allEnrolls = [...e, ...nameEnrolls.filter(n => !e.find(x => x.id === n.id))];
      setEnrollments(allEnrolls);
      setCourses(c);
      setAuthChecked(true);
      setLoading(false);
    });
  }, []);

  const markComplete = async () => {
    if (!activeActivity) return;
    const enrollment = enrollments.find(e => e.course_id === activeActivity.id);
    if (!enrollment) return;
    await base44.entities.LMSEnrollment.update(enrollment.id, { status: "Completed", completed_at: new Date().toISOString() });
    setEnrollments(prev => prev.map(e => e.id === enrollment.id ? { ...e, status: "Completed" } : e));
  };

  const getEnrollment = (courseId) => enrollments.find(e => e.course_id === courseId);

  const myCourses = courses.filter(c => getEnrollment(c.id));
  const completed = myCourses.filter(c => getEnrollment(c.id)?.status === "Completed");
  const inProgress = myCourses.filter(c => getEnrollment(c.id)?.status !== "Completed");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b2f55] to-[#1565c0]">
      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!authChecked || !user) {
    // Not logged in — redirect to login
    base44.auth.redirectToLogin(window.location.href);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b2f55] to-[#1565c0]">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {activeActivity && (
        <ActivityViewer
          course={activeActivity}
          enrollment={getEnrollment(activeActivity.id)}
          onClose={() => setActiveActivity(null)}
          onComplete={markComplete}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b2f55] to-[#1565c0] text-white px-6 py-5">
          <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/539befd5f_White_transparent.png" alt="SZ-JIE Support Services" className="h-12 object-contain" />
              <div>
                <h1 className="font-black text-xl">My Learning Hub</h1>
                <p className="text-white/80 text-sm">Welcome, {user.full_name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                <Star size={16} className="text-yellow-300" />
                <span className="font-black text-sm">{completed.length} / {myCourses.length} completed</span>
              </div>
              <button onClick={() => base44.auth.logout("/")} className="flex items-center gap-2 text-sm font-bold hover:bg-white/10 px-3 py-2 rounded-xl transition">
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {myCourses.length === 0 && (
            <div className="text-center py-16">
              <BookOpen size={48} className="text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-black text-lg text-muted-foreground mb-2">No courses assigned yet</h3>
              <p className="text-muted-foreground text-sm">Your teacher will assign learning activities here. Check back soon!</p>
            </div>
          )}

          {inProgress.length > 0 && (
            <div>
              <h2 className="font-black text-base mb-3 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> My Activities</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {inProgress.map(course => {
                  const enroll = getEnrollment(course.id);
                  return (
                    <button key={course.id} onClick={() => setActiveActivity(course)}
                      className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <BookOpen size={18} className="text-primary" />
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${enroll?.status === "In Progress" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                          {enroll?.status || "Assigned"}
                        </span>
                      </div>
                      <h3 className="font-black text-sm mb-1 line-clamp-2">{course.title}</h3>
                      <p className={`text-[10px] font-bold mb-3 ${CATEGORY_COLORS[course.category] || "text-muted-foreground"} inline-block px-2 py-0.5 rounded-full`}>{course.category}</p>
                      <div className="flex items-center gap-2 text-primary font-black text-xs group-hover:gap-3 transition-all">
                        <Play size={14} className="fill-primary" /> Start Activity
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="font-black text-base mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Completed</h2>
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
                    <h3 className="font-black text-sm mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-muted-foreground">Tap to review</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}