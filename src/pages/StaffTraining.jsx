import { useState } from "react";
import { BookOpen, Image, Search, ExternalLink, X, ChevronLeft, ChevronRight, Video, Mic, Award, Users, ShieldCheck, Banknote, AlertTriangle, Brain, Activity, Heart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrainingMedia from "@/components/staffportal/TrainingMedia";

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
  { title: "Preventing and Responding to Abuse", category: "Compliance & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/75383971d_abuse.html" },
  { title: "Employee and Professional Conduct", category: "HR & Payroll", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/4803a1087_conduct.html" },
  { title: "Driving and Vehicle Compliance", category: "Compliance & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/ea2071467_driving.html" },
  { title: "Forms and Documentation", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/02a67a930_forms.html" },
  { title: "Home-Based Support and Safety", category: "Work Health & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/3622e848f_home.html" },
  { title: "Staff Induction", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/62c7843dd_induction.html" },
  { title: "Manual Handling", category: "Work Health & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/2d7b93c4f_manual.html" },
  { title: "Use of Videos and Photos", category: "Compliance & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/9112ff724_media.html" },
  { title: "Mental Health First Aid", category: "Work Health & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/494598f86_mhfa.html" },
  { title: "NDIS Code of Conduct", category: "NDIS & Community", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/6d7a843f6_ndis.html" },
  { title: "Workplace Orientation", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/f60304068_orientation.html" },
  { title: "Person-Centred Planning", category: "NDIS & Community", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/3ed7e76ac_planning.html" },
  { title: "Personal Protective Equipment", category: "Work Health & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e3da7bc20_ppe.html" },
  { title: "Privacy and Confidentiality", category: "Compliance & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/7f6179711_privacy.html" },
  { title: "Service Quality", category: "Service Quality", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/773dd8f64_quality.html" },
  { title: "Rights, Choice and Control", category: "NDIS & Community", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/c17a435b9_rights.html" },
  { title: "Support Worker Role", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/2898a8f9c_role.html" },
  { title: "Worker Screening", category: "Compliance & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/63ab1f1bf_screening.html" },
  { title: "Timesheets and Payroll", category: "HR & Payroll", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/14b15c772_timesheet.html" },
  { title: "Training Resources Hub", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/d48114f80_index.html" },
  { title: "Video Library", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/979c7c771_index.html" },
  { title: "Training Portal Home", category: "Induction & Onboarding", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/e53327d35_index.html" },
  { title: "PPE – Full Reference Document", category: "Work Health & Safety", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/c10e89666_ppe_original.html" },
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
  { title: "The Heart of It – Teacher Training Must Shift", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/bb70464c3_f061.jpg" },
  { title: "Transition-Support Training", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/cca6d4fde_f062.jpg" },
  { title: "Why Breath Changes Are a Critical Cue for Teachers", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/978ea5c7b_f063.jpg" },
  { title: "A Deeper Look: Sensory Systems and Behavior Regulation", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d88003cbb_f064.jpg" },
  { title: "Autistic Sensory Decoding – Mental Health & Support Throughout Childhood", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/da9607f4d_f065.jpg" },
  { title: "Body-Word Disconnect", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/f2f866c01_f066.jpg" },
  { title: "Decoding: Behaviour vs Sensory Need", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/8092e926c_f067.jpg" },
  { title: "Decoding Sensory Aggression", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0da203a0a_f068.jpg" },
  { title: "Decoding Sensory Diet", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/f649bbb14_f069.jpg" },
  { title: "Decoding: The Biological Side of Sensory Masking", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c7d6f35bc_f070.jpg" },
  { title: "Decoding the Impact: Why Sensory Challenges Matter", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7e44c8383_f071.jpg" },
  { title: "Interoception Awareness", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/77713cc8a_f072.jpg" },
  { title: "Interoception Confusion", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/6b7ec10d8_f073.jpg" },
  { title: "Navigating My Sensory Needs", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/06bab07a3_f074.jpg" },
  { title: "School Sensory Environment Awareness", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0ec3e6987_f075.jpg" },
  { title: "Sensory and Elopement Specific Encoding", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/9e817eb0a_f076.jpg" },
  { title: "Sensory and Hospital Specific Decoding", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e4d748fde_f077.jpg" },
  { title: "Sensory and Hairdresser Specific Decoding", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b1fe7d43f_f078.jpg" },
  { title: "Sensory and Transport Specific Encoding – Stimming During Travel", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e7099a264_f079.jpg" },
  { title: "Sensory and Waiting Specific Encoding – Stimming During Waiting", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/97a5c3693_f080.jpg" },
  { title: "Sensory Breaks & Regulation Tools", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ed1c5d847_f081.jpg" },
  { title: "Sensory Decoding: Headbanging and Biting", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/1f76e50d4_f082.jpg" },
  { title: "Sensory Decoding: Apply Simple Regulation Strategies in Class", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/752aabe0a_f083.jpg" },
  { title: "Sensory Decoding: Our Child Has Very Deep Feelings", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/aa5f317ca_f084.jpg" },
  { title: "Sensory Decoding: Do Autistic Children Point?", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/fab9711e0_f085.jpg" },
  { title: "Sensory Decoding: How to Help Your Autistic Child Regulate", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/5a4e354f6_f086.jpg" },
  { title: "Sensory Decoding: Fight/Flight Activation", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0c3e7b628_f087.jpg" },
  { title: "Sensory Decoding: Food, Textures, and Temperature", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/5d32ba4f9_f088.jpg" },
  { title: "Sensory Decoding: Is It All Communication?", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/70c404740_f089.jpg" },
  { title: "Sensory Decoding: Like vs Love, Dislike vs Strong Dislike", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/55b89621b_f090.jpg" },
  { title: "Sensory Decoding: Managing Meltdowns and Aggression", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d1936c75e_f091.jpg" },
  { title: "Sensory Decoding: Needing to Clean the Showerhead After Every Shower", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ed45852e4_f092.jpg" },
  { title: "Sensory Decoding: Our Child Isn't Out of Control", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b693daa30_f093.jpg" },
  { title: "Sensory Decoding: Reasonable Sensory Accommodations", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0c80ace20_f094.jpg" },
  { title: "Sensory Decoding: Recognise Sensory Cues and Nervous System States", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/08e62c604_f095.jpg" },
  { title: "Sensory Decoding: Routine and Change", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b1bbe30ce_f096.jpg" },
  { title: "Sensory Decoding: Sample Sensory Toolkit List", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/579fb3961_f097.jpg" },
  { title: "Sensory Decoding: Sensory Overload (Decoding the Point)", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b50446fd5_f098.jpg" },
  { title: "Sensory Decoding: Sensory Strengths and Challenges", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2797d0c55_f099.jpg" },
  { title: "Sensory Decoding: Sensory Processing Patterns – Hypo, Hyper, Seeking, Avoiding", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c3850b564_f100.jpg" },
  { title: "Sensory Decoding: Supporting a Child's Sensory Overwhelm", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ba90cac0d_f101.jpg" },
  { title: "Sensory Decoding: Restrictive and Repetitive Behaviours (RRBs)", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/def177838_f102.jpg" },
  { title: "Sensory Decoding: The Hidden GAP in Autism Support", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/47edd5eb0_f103.jpg" },
  { title: "Sensory Decoding: Early Diagnosis and Intervention", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/1d17a553a_f104.jpg" },
  { title: "Sensory Decoding: The Missing Piece They Can't See", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/feeb8dc27_f105.jpg" },
  { title: "Sensory Decoding: Use a Physiology-First Lens", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/26445714d_f106.jpg" },
  { title: "Sensory Decoding: What Internal Cues Are Before Behaviour", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/37877c3e1_f107.jpg" },
  { title: "Sensory Decoding: Why Do They Meltdown Over Small Things?", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7deb4b713_f108.jpg" },
  { title: "Sensory Decoding: Classroom Sensory Audit Template", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/249d5bbe6_f109.jpg" },
  { title: "Sensory Defensiveness Education", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7ef9e96d0_f110.jpg" },
  { title: "Sensory Fatigue – Why Autistic Children Crash After School", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c47999d0f_f111.jpg" },
  { title: "Sensory Overload Recognition", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/cd25c8540_f112.jpg" },
  { title: "Teaching Body-Signal Awareness", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/24c23ca39_f113.jpg" },
  { title: "Teaching Self-Care Through Sensory Safety", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/8e6c9212d_f114.jpg" },
  { title: "Theraputty Exercises for Special Need Kids", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/dcf5008e0_f115.jpg" },
  { title: "Trauma-Informed Sensory Practice", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/6e8b52369_f116.jpg" },
  { title: "Understanding Common Sensory Encoding Challenges", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e1a60dc0b_f117.jpg" },
  { title: "Understanding the Sensory Nervous System: From Behaviour to Regulation", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/a758fd787_f118.jpg" },
  { title: "Visual Guide: Body Language of Sensory Overload (Pre-Meltdown Changes)", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/163e1580a_f119.jpg" },
  { title: "What Soreness Feels Like Inside the Autistic Body", category: "Autism Awareness", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0ce6fbb90_f120.jpg" },
  { title: "Why Early Sensory Support Prevents Years of Misunderstood Behaviour", category: "Support Strategies", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b7533f2f5_f121.jpg" },
  { title: "Emotional Flashbacks Explained", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b3978856e_f122.jpg" },
  { title: "Fear of Mistakes – Perfectionism Driven by Sensory Anxiety", category: "Behaviour & Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/a763c297f_f123.jpg" },
];

const DOC_CATEGORIES = ["All", ...Array.from(new Set(DOCUMENTS.map(d => d.category)))];
const FLYER_CATEGORIES = ["All", ...Array.from(new Set(FLYERS.map(f => f.category)))];

const CATEGORY_STYLES = {
  "Service Quality": { accent: "bg-emerald-500", icon: "bg-emerald-100 text-emerald-600", pill: "bg-emerald-500 text-white", badge: "bg-emerald-100 text-emerald-700" },
  "NDIS & Community": { accent: "bg-purple-500", icon: "bg-purple-100 text-purple-600", pill: "bg-purple-500 text-white", badge: "bg-purple-100 text-purple-700" },
  "Induction & Onboarding": { accent: "bg-blue-500", icon: "bg-blue-100 text-blue-600", pill: "bg-blue-500 text-white", badge: "bg-blue-100 text-blue-700" },
  "Compliance & Safety": { accent: "bg-rose-500", icon: "bg-rose-100 text-rose-600", pill: "bg-rose-500 text-white", badge: "bg-rose-100 text-rose-700" },
  "HR & Payroll": { accent: "bg-pink-500", icon: "bg-pink-100 text-pink-600", pill: "bg-pink-500 text-white", badge: "bg-pink-100 text-pink-700" },
  "Work Health & Safety": { accent: "bg-amber-500", icon: "bg-amber-100 text-amber-600", pill: "bg-amber-500 text-white", badge: "bg-amber-100 text-amber-700" },
  "Autism Awareness": { accent: "bg-indigo-500", icon: "bg-indigo-100 text-indigo-600", pill: "bg-indigo-500 text-white", badge: "bg-indigo-100 text-indigo-700" },
  "Behaviour & Regulation": { accent: "bg-orange-500", icon: "bg-orange-100 text-orange-600", pill: "bg-orange-500 text-white", badge: "bg-orange-100 text-orange-700" },
  "Neurodivergence": { accent: "bg-violet-500", icon: "bg-violet-100 text-violet-600", pill: "bg-violet-500 text-white", badge: "bg-violet-100 text-violet-700" },
  "Support Strategies": { accent: "bg-teal-500", icon: "bg-teal-100 text-teal-600", pill: "bg-teal-500 text-white", badge: "bg-teal-100 text-teal-700" },
};

const CATEGORY_ICONS = {
  "Service Quality": Award,
  "NDIS & Community": Users,
  "Induction & Onboarding": BookOpen,
  "Compliance & Safety": ShieldCheck,
  "HR & Payroll": Banknote,
  "Work Health & Safety": AlertTriangle,
  "Autism Awareness": Brain,
  "Behaviour & Regulation": Activity,
  "Neurodivergence": Brain,
  "Support Strategies": Heart,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shrink-0">
            <BookOpen size={26} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Staff Training</h2>
            <p className="text-muted-foreground text-sm">Training documents, induction resources & educational flyers</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-xs font-black text-emerald-700">NSW Registered Provider</span>
          <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Compliant</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><FileText size={22} className="text-blue-600" /></div>
          <div><p className="text-2xl font-black">{DOCUMENTS.length}</p><p className="text-xs text-muted-foreground font-bold">Total Documents</p></div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"><Image size={22} className="text-emerald-600" /></div>
          <div><p className="text-2xl font-black">{FLYERS.length}</p><p className="text-xs text-muted-foreground font-bold">Flyer Library</p></div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><Video size={22} className="text-amber-600" /></div>
          <div><p className="text-2xl font-black">9</p><p className="text-xs text-muted-foreground font-bold">Videos & Podcasts</p></div>
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
        <button onClick={() => { setTab("media"); setSearch(""); }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "media" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Video size={14} /> Videos & Podcasts
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === "documents" ? "Search training documents…" : tab === "flyers" ? "Search flyers…" : "Search videos & podcasts…"}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* ── DOCUMENTS TAB ──────────────────────────────────────────────────────── */}
      {tab === "documents" && !viewingDoc && (
        <div className="space-y-4">
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {DOC_CATEGORIES.map(cat => {
              const style = CATEGORY_STYLES[cat];
              const active = docCategory === cat;
              return (
                <button key={cat} onClick={() => setDocCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all ${active
                    ? (style ? style.pill : "bg-primary text-primary-foreground") + " border-transparent"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocs.map((doc, i) => {
              const style = CATEGORY_STYLES[doc.category] || {};
              const Icon = CATEGORY_ICONS[doc.category] || BookOpen;
              return (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col">
                  <div className={`h-1.5 ${style.accent || "bg-slate-400"}`} />
                  <div className="p-4 pb-2">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${style.icon || "bg-slate-100 text-slate-500"}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="px-4 flex-1">
                    <p className="font-bold text-sm leading-snug min-h-[2.5rem]">{doc.title}</p>
                  </div>
                  <div className="p-4 pt-3 flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${style.badge || "bg-slate-100 text-slate-600"}`}>
                      {doc.category}
                    </span>
                    <Button size="sm" onClick={() => setViewingDoc(doc)} className="rounded-xl font-bold text-xs gap-1">
                      Open <ExternalLink size={12} />
                    </Button>
                  </div>
                </div>
              );
            })}
            {filteredDocs.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground italic text-sm bg-card border border-border rounded-2xl">
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
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ml-auto shrink-0 ${(CATEGORY_STYLES[viewingDoc.category] || {}).badge || "bg-slate-100 text-slate-600"}`}>
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
            {FLYER_CATEGORIES.map(cat => {
              const style = CATEGORY_STYLES[cat];
              const active = flyerCategory === cat;
              return (
                <button key={cat} onClick={() => setFlyerCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all ${active
                    ? (style ? style.pill : "bg-primary text-primary-foreground") + " border-transparent"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                  {cat}
                </button>
              );
            })}
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
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full mt-1 inline-block ${(CATEGORY_STYLES[flyer.category] || {}).badge || "bg-slate-100 text-slate-600"}`}>
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

      {/* ── VIDEOS & PODCASTS TAB ─────────────────────────────────────────────────── */}
      {tab === "media" && <TrainingMedia search={search} />}

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