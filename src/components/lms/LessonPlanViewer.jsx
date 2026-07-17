import { useState, useEffect } from "react";
import { X, ChevronLeft, BookOpen } from "lucide-react";

export const LESSON_PLANS = [
  { title: "30-Week Interactive Community Program", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/8f236210c_30_Week_Interactive_CommunityProgram.html", category: "Life Skills" },
  { title: "ATM Simulator — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/bae3be563_ATMdetailed_program_and_lesson_plans.html", category: "Money & Budgeting" },
  { title: "Beyond Maths — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/3c3dfbba0_beyond_maths_lesson_plans.html", category: "Maths & Literacy" },
  { title: "Catching a Bus — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/eb5406b7a_CathchingaBusdetailed_program_and_lesson_plans.html", category: "Travel & Transport" },
  { title: "Coles Shopping — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/40da61af5_ColesShoppingdetailed_coles_shopping_lesson_plans.html", category: "Money & Budgeting" },
  { title: "Cafe Navigation — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/113357b5a_detailed_cafe_program_lesson_plans.html", category: "Community Skills" },
  { title: "Cinema Navigation — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/2a0f49ca0_detailed_cinema_program_lesson_plans.html", category: "Community Skills" },
  { title: "Home Life Skills — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/71188ff98_detailed_home_life_skills_program_lesson_plans.html", category: "Life Skills" },
  { title: "Laundry — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/d3c445449_detailed_laundry_program_lesson_plans.html", category: "Life Skills" },
  { title: "Emergency Call — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/294e002a7_emergency_call_lesson_plans.html", category: "Health & Safety" },
  { title: "Employment Academy — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/bb85cbc4c_EmploymentAcademydetailed_employment_academy_lesson_plans.html", category: "Employment & Vocational" },
  { title: "English Skills — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e53be9505_English_Skills_etailed_program_and_lesson_plans.html", category: "Maths & Literacy" },
  { title: "Outing Planner — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/eda4a8db2_Event_Plannerdetailed_outing_planner_lesson_plans.html", category: "Community Skills" },
  { title: "Twinkl Life Skills — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/2c2065402_interactive_workbook_lesson_plans.html", category: "Life Skills" },
  { title: "Kitchen Expert — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e2fe5baef_kitchen_expert_lesson_plans.html", category: "Life Skills" },
  { title: "Learning Hub Master Curriculum", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/103c1237a_learning_hub_master_curriculum.html", category: "Master Curriculum" },
  { title: "Literacy Box — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/3be1ecb2b_Literacy_Box_Program_and_Lesson_Plans.html", category: "Maths & Literacy" },
  { title: "Longman Photo Dictionary — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/c4a6f32cf_longman_photo_dictionary_lesson_plans.html", category: "Maths & Literacy" },
  { title: "Maths Box 1 — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e173e9a09_Maths_Box_1_Program_and_Lesson_Plans.html", category: "Maths & Literacy" },
  { title: "Maths Box 4 — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/d628bd2ed_Maths_Box_4_Program_and_Lesson_Plans.html", category: "Maths & Literacy" },
  { title: "Money & Budgeting Academy — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/fa3aada58_money_budgeting_academy_lesson_plans.html", category: "Money & Budgeting" },
  { title: "Sandwich Academy — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/6463e48aa_sandwich_academy_lesson_plans.html", category: "Life Skills" },
  { title: "Shopping Compare — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/97a10e914_shopping_compare_lesson_plans.html", category: "Money & Budgeting" },
  { title: "SMS Simulator — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/0e84971f8_sms_simulator_lesson_plans.html", category: "Community Skills" },
  { title: "Twinkl Life Skills Program — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/ef5addc1d_twinkl_life_skills_lesson_plans.html", category: "Life Skills" },
  { title: "Universal Life Skills — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/6c50d3b8e_Universal_Life_Skills_Program_and_Lesson_Plans.html", category: "Life Skills" },
  { title: "Life Skills Academy Volume 2 — Lesson Plans", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/df0fa2e54_universal_life_skills_vol_2_lesson_plans.html", category: "Life Skills" },
];

export default function LessonPlanViewer({ plan, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let url = null;
    fetch(plan.url)
      .then(r => r.text())
      .then(html => {
        const blob = new Blob([html], { type: "text/html" });
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [plan.url]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0b2f55] to-[#1565c0] text-white shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20"><ChevronLeft size={18} /></button>
          <div>
            <p className="font-black text-sm">{plan.title}</p>
            <p className="text-xs text-white/70">{plan.category} · Staff Resource</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20"><X size={18} /></button>
      </div>
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading lesson plan...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <a href={plan.url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">Open in new tab</a>
          </div>
        )}
        {blobUrl && <iframe src={blobUrl} className="w-full h-full border-0" title={plan.title} sandbox="allow-scripts allow-same-origin allow-forms" />}
      </div>
    </div>
  );
}