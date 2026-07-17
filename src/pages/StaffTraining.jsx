import { useState } from "react";
import { BookOpen, Image, Search, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── HTML Training Documents ──────────────────────────────────────────────────
const DOCUMENTS = [
  { title: "30 Elements of Service Quality", category: "Service Quality", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/a51aed505_30_Elements_of_Service_Quality.html" },
  { title: "Building Better Lives", category: "NDIS & Community", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/501edcccc_Building_Better_Lives.html" },
  { title: "Disability Support Worker Registration", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/c56b999ca_Disability_Support_Worker_Registrsation.html" },
  { title: "Disability Support Worker Screening: What Does It Mean?", category: "Compliance & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/9b2ab1f6e_Disability_Support_Worker_Screening_What_Does_It_Mean.html" },
  { title: "Disability Worker Screening", category: "Compliance & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/f8b147fb3_Disability_Worker_Screening.html" },
  { title: "Employee Confidentiality Declaration", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/f361a14f6_Employee_Confidentiality_Declaration.html" },
  { title: "Employee Payroll Authority", category: "HR & Payroll", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/d44eb68eb_Employee_Payroll_Authority.html" },
  { title: "Employment Contract", category: "HR & Payroll", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/95f1e2a18_Employment_Contract.html" },
  { title: "General Service Induction", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/b58076ec5_General_Service_Induction.html" },
  { title: "Interactive Timesheet", category: "HR & Payroll", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/9a08b5f71_Interactive_Timesheet.html" },
  { title: "Manual Handling Induction", category: "Work Health & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/43a56d046_Manual_Handling.html" },
  { title: "Mental Health First", category: "Work Health & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/9c1d0a5b7_Mental_Health_First.html" },
  { title: "NDIS Code of Conduct", category: "NDIS & Community", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/6a0445197_NDIS_Code_of_Conduct.html" },
  { title: "NDIS Quality and Safeguards Commission", category: "NDIS & Community", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/da0771bfe_NDIS_Quality_and_Safeguards_Commission.html" },
  { title: "Orientation Checklist", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/97afd0bd9_Orientation_Checklist.html" },
  { title: "Preventing and Responding to Abuse", category: "Compliance & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/81e581a05_Preventing_and_Responding_to_Abuse.html" },
  { title: "Receipt Explanation Sheet", category: "HR & Payroll", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/9802d3eef_Receipt_Explanation_Sheet.html" },
  { title: "Staff Portal User Guide", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/93180c1f9_Staff_Portal_User_Guide.html" },
  { title: "The Use of Videos and Photos", category: "Compliance & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/a95f55474_The_Use_of_Videos_and_Photos.html" },
];

// ─── Flyer/Infographic Gallery ─────────────────────────────────────────────────
const FLYERS = [
  { title: "ADHD, Imposter Syndrome & the Hidden Cost of Processing", category: "Neurodivergence", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c590a360d_f001.jpg" },
  { title: "Autistic Traits and Strengths", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0b2555d69_f002.jpg" },
  { title: "Can Autism Be Diagnosed Later in Childhood?", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/25eef4642_f003.jpg" },
  { title: "Decoding: Brain Chemistry & Melatonin Differences in Autism", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/160ead2bb_f004.jpg" },
  { title: "Perfectionism in Neurodivergent Children", category: "Neurodivergence", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c3132a902_f005.png" },
  { title: "Processing Speed ≠ Intelligence", category: "Neurodivergence", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/f2e533bf3_f006.jpg" },
  { title: "Shutdowns – The Most Misunderstood Autistic Response", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d1123fa6c_f007.jpg" },
  { title: "Supporting Students with OCD & Autism", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/3bc3474df_f008.jpg" },
  { title: "What It Feels Like to Be AuDHD", category: "Neurodivergence", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c983d9935_f009.jpg" },
  { title: "Why Does Autism Happen?", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c61fccd07_f010.jpg" },
  { title: "Beyond the Surface: Decoding Behaviour", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/3cdf03ff2_f011.jpg" },
  { title: "Co-Regulation Instead of Behaviour Management", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/f497cbdb0_f012.jpg" },
  { title: "Decoding Social Anxiety in Autism", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/748494026_f013.jpg" },
  { title: "Decoding Stimming for Long Periods of Time", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/23b90ec5b_f014.jpg" },
  { title: "Demand-Sensitivity Models", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ad0acf8b7_f015.jpg" },
  { title: "Problems with Forced Apologies", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/f63ab67f1_f016.jpg" },
  { title: "See the Behaviour – Watch the Video (Sue Larkey)", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/91b2599ab_f017.jpg" },
  { title: "Tasks and Demands – Autistic Nervous System", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2be4be093_f018.jpg" },
  { title: "Understanding Stimming in Autism", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/80cd0a8b2_f019.jpg" },
  { title: "Why Predictability Matters in Neurodivergence", category: "Neurodivergence", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/bb0db3bc9_f020.jpg" },
  { title: "10 Things to Do When You Lose Patience", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/106b96590_f021.jpg" },
  { title: "Building Parent-School Sensory Partnerships", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/f4842ab0f_f022.jpg" },
  { title: "Decoding Daily Routines", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/4acb33020_f023.jpg" },
  { title: "Parent-Led Insight Integration", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/dc554651e_f024.jpg" },
  { title: "Sensory Decoding: Breakdown of Parental Stress & Autism", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b22f41182_f025.jpg" },
  { title: "Decoding Breakdown of Parental Burnout in Autism", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b1f56b0e2_f026.jpg" },
  { title: "Sensory Decoding: Is My Autistic Child Happy?", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ec4d6a504_f027.jpg" },
  { title: "Why Does My Autistic Child Behave Like This?", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/113182ae5_f028.jpg" },
  { title: "What Matters Most for My Autistic Child's Future", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/5c60348ea_f029.jpg" },
  { title: "15 Ways to Teach an Autistic Child to Express Emotions", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e459cf312_f030.jpg" },
  { title: "AAC Pathways", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/de848e61a_f031.jpg" },
  { title: "Decoding vs Encoding in Nonspeaking Autism", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2cb58c8f5_f032.jpg" },
  { title: "How Encoding + Decoding Shape the Nervous System", category: "Neurodivergence", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0dea70af3_f033.jpg" },
  { title: "The Neuroscience of Nonspeaking Communication", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c5d0f417e_f034.jpg" },
  { title: "Baseline Anxiety – Why the Nervous System Sits Higher", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d9a167f7c_f035.jpg" },
  { title: "Decoding: Shutdown Cues Were Mistaken for Calmness", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/492943b56_f036.jpg" },
  { title: "Decoding: Meltdown vs Tantrum in Autism", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7fd463e76_f037.jpg" },
  { title: "Early Cues – What Happens Before Behaviour Adults Miss", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ab1a7956e_f038.jpg" },
  { title: "Every Boy. Every Girl. Every Country. One Nervous System.", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/770bfb301_f039.jpg" },
  { title: "Fight · Flight · Freeze · Fawn", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/789d9d876_f040.jpg" },
  { title: "I Need Space, Not Attention", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/a748fb402_f041.jpg" },
  { title: "Instruction Overload – Too Many Words Collapse Processing", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/eb6b34481_f042.jpg" },
  { title: "Internal Overwhelm", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/050315a92_f043.jpg" },
  { title: "Myth vs Reality – Nervous System Edition", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b393e6ca3_f044.jpg" },
  { title: "Not Avoiding You – Protecting His Energy", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d9f47791e_f045.jpg" },
  { title: "Not Being Dramatic – Feeling Real Discomfort", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/923d92433_f046.jpg" },
  { title: "Not 'Just the Heat' – His Nervous System Can't Settle", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/77282c1c1_f047.jpg" },
  { title: "Post Shutdown Recovery", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2e49a595d_f048.jpg" },
  { title: "Regulation Science – How the Nervous System Becomes Overloaded", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/4141562a8_f049.jpg" },
  { title: "Sensory Decoding: Overload vs Shutdown", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/f31cee7d0_f050.jpg" },
  { title: "The Biggest Knowledge Gap", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/4103ce7e3_f051.jpg" },
  { title: "Top 10 Tips for Emotional Regulation", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e0165eab6_f052.jpg" },
  { title: "Transition Overload – Corridors, Lining Up, Moving Rooms", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/02035aea3_f053.jpg" },
  { title: "Updated Meltdown/Shutdown Training", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ee8691d58_f054.jpg" },
  { title: "What to Do When a Child is Self-Harming", category: "Compliance & Safety", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/603ceaace_f055.jpg" },
  { title: "Early Sensory-Phase Training (Age 7-9)", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/be926c2a0_f056.jpg" },
  { title: "Multisensory Teaching Techniques", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/422ff9470_f057.jpg" },
  { title: "School Support & Reasonable Adjustments", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/3e100b825_f058.jpg" },
  { title: "Sensory-Safe Lunch Environments for Autistic Children", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/6ccd8312d_f059.jpg" },
  { title: "Teach Schools Sensory-First Training", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/bf7b8d63a_f060.jpg" },
];

const DOC_CATEGORIES = ["All", ...Array.from(new Set(DOCUMENTS.map(d => d.category)))];
const FLYER_CATEGORIES = ["All", ...Array.from(new Set(FLYERS.map(f => f.category)))];

const categoryColors = {
  "Induction & Onboarding": "bg-blue-100 text-blue-700",
  "Compliance & Safety": "bg-rose-100 text-rose-700",
  "HR & Payroll": "bg-emerald-100 text-emerald-700",
  "NDIS & Community": "bg-purple-100 text-purple-700",
  "Work Health & Safety": "bg-amber-100 text-amber-700",
  "Service Quality": "bg-cyan-100 text-cyan-700",
  "Autism Awareness": "bg-indigo-100 text-indigo-700",
  "Behaviour & Regulation": "bg-orange-100 text-orange-700",
  "Neurodivergence": "bg-violet-100 text-violet-700",
  "Support Strategies": "bg-teal-100 text-teal-700",
};

export default function StaffTraining() {
  const [tab, setTab] = useState("documents");
  const [search, setSearch] = useState("");
  const [docCategory, setDocCategory] = useState("All");
  const [flyerCategory, setFlyerCategory] = useState("All");
  const [viewingDoc, setViewingDoc] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredDocs = DOCUMENTS.filter(d =>
    (docCategory === "All" || d.category === docCategory) &&
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFlyers = FLYERS.filter(f =>
    (flyerCategory === "All" || f.category === flyerCategory) &&
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  const lightboxFlyers = lightboxIndex !== null ? filteredFlyers : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <BookOpen size={22} className="text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">Staff Training</h2>
          <p className="text-muted-foreground text-sm">Training documents, induction resources & educational flyers</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-secondary p-1 rounded-2xl w-fit">
        <button onClick={() => { setTab("documents"); setSearch(""); }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "documents" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <BookOpen size={14} /> Documents ({DOCUMENTS.length})
        </button>
        <button onClick={() => { setTab("flyers"); setSearch(""); }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "flyers" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Image size={14} /> Flyer Library ({FLYERS.length})
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === "documents" ? "Search training documents…" : "Search flyers…"}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* ── DOCUMENTS TAB ──────────────────────────────────────────────────────── */}
      {tab === "documents" && !viewingDoc && (
        <div className="space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {DOC_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setDocCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${docCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-2">
            {filteredDocs.map((doc, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-primary/30 transition-all">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{doc.title}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${categoryColors[doc.category] || "bg-slate-100 text-slate-600"}`}>
                      {doc.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => setViewingDoc(doc)} className="rounded-xl font-bold text-xs gap-1">
                    Open
                  </Button>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="rounded-xl font-bold text-xs gap-1 h-9 w-9 p-0">
                      <ExternalLink size={13} />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
            {filteredDocs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground italic text-sm bg-card border border-border rounded-2xl">
                No documents match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DOCUMENT VIEWER ─────────────────────────────────────────────────────── */}
      {tab === "documents" && viewingDoc && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => setViewingDoc(null)}
              className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition">
              <ChevronLeft size={16} /> Back to Documents
            </button>
            <div className="flex gap-2">
              <a href={viewingDoc.url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="rounded-xl font-bold text-xs gap-1">
                  <ExternalLink size={12} /> Open in New Tab
                </Button>
              </a>
              <Button size="sm" variant="ghost" onClick={() => setViewingDoc(null)} className="rounded-xl text-xs gap-1 px-2">
                <X size={14} />
              </Button>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-secondary px-4 py-2.5 border-b border-border flex items-center gap-2">
              <BookOpen size={14} className="text-primary" />
              <p className="text-sm font-bold truncate">{viewingDoc.title}</p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ml-auto shrink-0 ${categoryColors[viewingDoc.category] || "bg-slate-100 text-slate-600"}`}>
                {viewingDoc.category}
              </span>
            </div>
            <iframe
              src={viewingDoc.url}
              title={viewingDoc.title}
              className="w-full"
              style={{ height: "80vh", border: "none" }}
            />
          </div>
        </div>
      )}

      {/* ── FLYERS TAB ──────────────────────────────────────────────────────────── */}
      {tab === "flyers" && (
        <div className="space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {FLYER_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFlyerCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${flyerCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredFlyers.map((flyer, i) => (
              <button key={i} onClick={() => setLightboxIndex(i)}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all text-left">
                <div className="aspect-[3/4] overflow-hidden bg-secondary">
                  <img src={flyer.url} alt={flyer.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold leading-tight line-clamp-2">{flyer.title}</p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full mt-1 inline-block ${categoryColors[flyer.category] || "bg-slate-100 text-slate-600"}`}>
                    {flyer.category}
                  </span>
                </div>
              </button>
            ))}
            {filteredFlyers.length === 0 && (
              <div className="col-span-4 text-center py-12 text-muted-foreground italic text-sm bg-card border border-border rounded-2xl">
                No flyers match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setLightboxIndex(null)}>
            <X size={28} />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            onClick={e => { e.stopPropagation(); setLightboxIndex(i => Math.max(0, i - 1)); }}>
            <ChevronLeft size={36} />
          </button>
          <div className="max-h-full max-w-2xl w-full flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            <img src={lightboxFlyers[lightboxIndex]?.url} alt="" className="max-h-[85vh] w-full object-contain rounded-xl" />
            <div className="text-center">
              <p className="text-white font-bold text-sm">{lightboxFlyers[lightboxIndex]?.title}</p>
              <p className="text-white/60 text-xs mt-0.5">{lightboxIndex + 1} / {lightboxFlyers.length}</p>
            </div>
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            onClick={e => { e.stopPropagation(); setLightboxIndex(i => Math.min(lightboxFlyers.length - 1, i + 1)); }}>
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </div>
  );
}