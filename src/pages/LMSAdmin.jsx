import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, BookOpen, Users, Trash2, Edit2, CheckCircle, Clock, X, ExternalLink, ClipboardList } from "lucide-react";
import { LESSON_PLANS } from "@/components/lms/LessonPlanViewer";
import LessonPlanViewer from "@/components/lms/LessonPlanViewer";

const CATEGORIES = ["Everyday Life & Community Skills", "Maths & Literacy", "Employment & Vocational", "Health & Wellbeing", "Travel & Transport", "Other"];

const ALL_ACTIVITIES = [
  { title: "CommBank ATM Simulator", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/357b93969_ATM_Simulator.html", category: "Everyday Life & Community Skills" },
  { title: "Catching a Bus — Life Skills", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e7d36bd9e_Catching_a_Bus.html", category: "Travel & Transport" },
  { title: "My Coles Shopping List & Budget", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e35e441f3_Coles_Shopping_List___Budget.html", category: "Everyday Life & Community Skills" },
  { title: "Employment Academy", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/34f871655_Employment.html", category: "Employment & Vocational" },
  { title: "English Skills Learning", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/57bdb757d_English_Skills_Learning.html", category: "Maths & Literacy" },
  { title: "My Outing Planner & Budget", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/a61caa1ae_Event_Planner.html", category: "Everyday Life & Community Skills" },
  { title: "Filling Forms Academy", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/d468c718c_Filling_Forms.html", category: "Everyday Life & Community Skills" },
  { title: "Going to the Cafe", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/bfe2b62bd_Going_to_the_Cafe.html", category: "Everyday Life & Community Skills" },
  { title: "Going to the Cinema", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/fb935aef4_Going_to_the_Cinema.html", category: "Everyday Life & Community Skills" },
  { title: "Home Life Skills Workbook", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e8b28c0d9_Home_Life_Skills.html", category: "Everyday Life & Community Skills" },
  { title: "Interactive Life Skills Workbook", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/dc8f41048_Interactive_Life_Skills_Workbook.html", category: "Everyday Life & Community Skills" },
  { title: "Interactive Maths Workbook", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/41a32e2d0_Interactive_Maths_Workbook.html", category: "Maths & Literacy" },
  { title: "Laundry Day", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/98b64e658_Laundry_Day.html", category: "Everyday Life & Community Skills" },
  { title: "Life Skills Academy Volume 2", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/cbb0d41c4_Life_Skills_Academy_Volume_2.html", category: "Everyday Life & Community Skills" },
  { title: "Life Skills Interactive Workbook", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/f9123ca3a_Life_Skills_Interactive_Workbook.html", category: "Everyday Life & Community Skills" },
  { title: "Literacy Box Interactive Workbooks", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/cbc0fe821_Literacy_Box_Interactive_Workbooks.html", category: "Maths & Literacy" },
  { title: "Making a Sandwich", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/967e13c3a_Making_a_Sandwich.html", category: "Everyday Life & Community Skills" },
  { title: "Making an Emergency Phone Call", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/da21f5b1a_Making_an_Emergency_Phone_Call.html", category: "Health & Wellbeing" },
  { title: "Maths Box 1 Learning Hub", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/2611d6676_Maths_Box_1_Learning_Hub.html", category: "Maths & Literacy" },
  { title: "Maths Box 4 Digital Portal", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/732c28bfa_Maths_Box_4_Digital_Portal.html", category: "Maths & Literacy" },
  { title: "Messages Practice Simulator", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e1f62134f_Messages_Practice_Simulator.html", category: "Everyday Life & Community Skills" },
  { title: "Money & Budgeting Academy", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/2ca9be8dc_Money___Budgeting.html", category: "Everyday Life & Community Skills" },
  { title: "Morning Routine Workbook", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/452ad9a23_Morning_Routine.html", category: "Everyday Life & Community Skills" },
  { title: "Shopping Compare — Coles vs Woolworths", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/ea9293a94_Shopping_Compare.html", category: "Everyday Life & Community Skills" },
  { title: "The Kitchen Life Skills", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/d6c3431a2_The_Kitchen.html", category: "Everyday Life & Community Skills" },
  { title: "Universal Life Skills & Vocational Academy", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/aa471d709_Universal_Life_Skills_Vocational_Academy.html", category: "Employment & Vocational" },
  { title: "30-Week Interactive Community Program", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/67690e39a_30_Week_Interactive_Community_Program.html", category: "Everyday Life & Community Skills" },
];

const STATUS_COLORS = {
  Assigned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

export default function LMSAdmin() {
  const [tab, setTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", category: CATEGORIES[0], activity_url: "", is_active: true });
  const [enrollForm, setEnrollForm] = useState({ student_name: "", student_email: "", participant_id: "", course_id: "" });
  const [search, setSearch] = useState("");
  const [activePlan, setActivePlan] = useState(null);

  const load = async () => {
    setLoading(true);
    const [c, e, p] = await Promise.all([
      base44.entities.LMSCourse.list("-created_date", 100),
      base44.entities.LMSEnrollment.list("-created_date", 200),
      base44.entities.Participant.list("-created_date", 100).catch(() => []),
    ]);
    setCourses(c);
    setEnrollments(e);
    setParticipants(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveCourse = async () => {
    if (editCourse) {
      await base44.entities.LMSCourse.update(editCourse.id, courseForm);
    } else {
      await base44.entities.LMSCourse.create(courseForm);
    }
    setShowCourseForm(false);
    setEditCourse(null);
    setCourseForm({ title: "", description: "", category: CATEGORIES[0], activity_url: "", is_active: true });
    load();
  };

  const deleteCourse = async (id) => {
    if (!confirm("Delete this course?")) return;
    await base44.entities.LMSCourse.delete(id);
    load();
  };

  const saveEnrollment = async () => {
    const course = courses.find(c => c.id === enrollForm.course_id);
    await base44.entities.LMSEnrollment.create({ ...enrollForm, course_title: course?.title || "" });
    setShowEnrollForm(false);
    setEnrollForm({ student_name: "", student_email: "", participant_id: "", course_id: "" });
    load();
  };

  const updateEnrollmentStatus = async (id, status) => {
    await base44.entities.LMSEnrollment.update(id, { status, completed_at: status === "Completed" ? new Date().toISOString() : undefined });
    load();
  };

  const deleteEnrollment = async (id) => {
    await base44.entities.LMSEnrollment.delete(id);
    load();
  };

  const importActivity = async (act) => {
    await base44.entities.LMSCourse.create({ title: act.title, category: act.category, activity_url: act.url, is_active: true });
    load();
  };

  const filteredEnrollments = enrollments.filter(e =>
    !search || e.student_name?.toLowerCase().includes(search.toLowerCase()) || e.course_title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      {activePlan && <LessonPlanViewer plan={activePlan} onClose={() => setActivePlan(null)} />}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Learning Management System</h2>
            <p className="text-muted-foreground text-sm">Manage courses and assign activities to students.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {tab === "courses" && <Button onClick={() => { setEditCourse(null); setCourseForm({ title: "", description: "", category: CATEGORIES[0], activity_url: "", is_active: true }); setShowCourseForm(true); }} className="gap-2 rounded-xl"><Plus size={16} /> New Course</Button>}
          {tab === "enrollments" && <Button onClick={() => setShowEnrollForm(true)} className="gap-2 rounded-xl"><Plus size={16} /> Assign Course</Button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {["courses", "enrollments", "import", "lessons"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition -mb-px capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "courses" ? `Courses (${courses.length})` : t === "enrollments" ? `Enrollments (${enrollments.length})` : t === "import" ? "Import Activities" : "Lesson Plans (Staff)"}
          </button>
        ))}
      </div>

      {/* COURSES TAB */}
      {tab === "courses" && (
        <div>
          {showCourseForm && (
            <div className="bg-card border border-border rounded-2xl p-5 mb-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm">{editCourse ? "Edit Course" : "New Course"}</h3>
                <button onClick={() => setShowCourseForm(false)}><X size={16} className="text-muted-foreground" /></button>
              </div>
              <Input placeholder="Course Title *" value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} />
              <Input placeholder="Description" value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} />
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-transparent" value={courseForm.category} onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <Input placeholder="Activity URL (HTML file link)" value={courseForm.activity_url} onChange={e => setCourseForm(f => ({ ...f, activity_url: e.target.value }))} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCourseForm(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={saveCourse} disabled={!courseForm.title} className="rounded-xl">Save Course</Button>
              </div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            {courses.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.category}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {c.activity_url && <a href={c.activity_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><ExternalLink size={13} /></a>}
                    <button onClick={() => { setEditCourse(c); setCourseForm({ title: c.title, description: c.description || "", category: c.category || CATEGORIES[0], activity_url: c.activity_url || "", is_active: c.is_active !== false }); setShowCourseForm(true); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><Edit2 size={13} /></button>
                    <button onClick={() => deleteCourse(c.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><Trash2 size={13} /></button>
                  </div>
                </div>
                {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{enrollments.filter(e => e.course_id === c.id).length} enrolled</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${c.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{c.is_active !== false ? "Active" : "Inactive"}</span>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p className="text-muted-foreground text-sm italic col-span-2 py-8 text-center">No courses yet. Create one or import from the Activities tab.</p>}
          </div>
        </div>
      )}

      {/* ENROLLMENTS TAB */}
      {tab === "enrollments" && (
        <div className="space-y-3">
          {showEnrollForm && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm">Assign Course to Student</h3>
                <button onClick={() => setShowEnrollForm(false)}><X size={16} className="text-muted-foreground" /></button>
              </div>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-transparent" value={enrollForm.participant_id}
                onChange={e => {
                  const p = participants.find(x => x.id === e.target.value);
                  setEnrollForm(f => ({ ...f, participant_id: e.target.value, student_name: p?.name || f.student_name, student_email: p?.email || f.student_email }));
                }}>
                <option value="">-- Select Participant (optional) --</option>
                {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <Input placeholder="Student Name *" value={enrollForm.student_name} onChange={e => setEnrollForm(f => ({ ...f, student_name: e.target.value }))} />
              <Input placeholder="Student Email" value={enrollForm.student_email} onChange={e => setEnrollForm(f => ({ ...f, student_email: e.target.value }))} />
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-transparent" value={enrollForm.course_id} onChange={e => setEnrollForm(f => ({ ...f, course_id: e.target.value }))}>
                <option value="">-- Select Course *--</option>
                {courses.filter(c => c.is_active !== false).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEnrollForm(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={saveEnrollment} disabled={!enrollForm.student_name || !enrollForm.course_id} className="rounded-xl">Assign</Button>
              </div>
            </div>
          )}
          <Input placeholder="Search student or course..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
          <div className="space-y-2">
            {filteredEnrollments.map(e => (
              <div key={e.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-black text-sm truncate">{e.student_name}</p>
                  <p className="text-xs text-muted-foreground">{e.course_title}</p>
                  {e.student_email && <p className="text-xs text-muted-foreground">{e.student_email}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select className={`text-xs font-bold px-2 py-1 rounded-full border-0 ${STATUS_COLORS[e.status] || "bg-slate-100"}`}
                    value={e.status} onChange={x => updateEnrollmentStatus(e.id, x.target.value)}>
                    <option>Assigned</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                  <button onClick={() => deleteEnrollment(e.id)} className="p-1 hover:bg-rose-50 rounded-lg text-rose-500"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
            {filteredEnrollments.length === 0 && <p className="text-muted-foreground text-sm italic py-8 text-center">No enrollments yet.</p>}
          </div>
        </div>
      )}

      {/* IMPORT TAB */}
      {tab === "import" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Import pre-built interactive activities as courses. Already imported activities won't be duplicated if you manage them in the Courses tab.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {ALL_ACTIVITIES.map((act, i) => {
              const exists = courses.some(c => c.activity_url === act.url);
              return (
                <div key={i} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{act.title}</p>
                    <p className="text-xs text-muted-foreground">{act.category}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <a href={act.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><ExternalLink size={13} /></a>
                    {exists
                      ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle size={13} /> Added</span>
                      : <Button size="sm" onClick={() => importActivity(act)} className="rounded-lg text-xs h-7 px-3">Import</Button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LESSON PLANS TAB (staff only) */}
      {tab === "lessons" && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 flex items-start gap-2">
            <ClipboardList size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-black mb-0.5">Staff-Only Resource Library</p>
              <p className="text-xs">These detailed lesson plans and teaching programs are for staff use only. They are not visible in the student portal.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {LESSON_PLANS.map((plan, i) => (
              <button key={i} onClick={() => setActivePlan(plan)}
                className="bg-card border border-border rounded-xl px-4 py-3 text-left hover:shadow-md hover:border-primary/30 transition-all group flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{plan.title}</p>
                  <p className="text-xs text-muted-foreground">{plan.category}</p>
                </div>
                <div className="flex items-center gap-1 text-primary font-black text-xs shrink-0 group-hover:gap-2 transition-all">
                  <BookOpen size={14} /> View
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}