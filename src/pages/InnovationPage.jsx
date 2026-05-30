import { Zap, BookOpen, Calendar, ShoppingCart, Briefcase, Users, ArrowRight, CheckCircle } from "lucide-react";

const INNOVATION_SECTIONS = [
  {
    id: "intro",
    title: "Why SZ-JIE Support Services Is Different",
    subtitle: "Technology Designed Around People, Not Templates",
    content: (
      <div className="space-y-4 text-slate-600 leading-relaxed">
        <p>
          At SZ-JIE Support Services, we don't purchase off-the-shelf software and try to make it fit. We design and develop customised digital solutions that are built specifically around the unique needs, goals, and circumstances of each individual client, family, support team, or organisation.
        </p>
        <p>
          Every person is different. Every support environment is different. Every challenge requires a personalised approach.
        </p>
        <p className="font-semibold text-[#0F172A]">
          That's why we create purpose-built web applications that improve independence, increase engagement, streamline support delivery, and empower people to achieve meaningful outcomes.
        </p>
        <p>
          Our technology solutions are developed by professionals with extensive experience in disability support, education, behaviour support, and capacity building. This means every platform is designed with real-world usability, accessibility, and participant outcomes at its core.
        </p>
      </div>
    ),
  },
  {
    id: "life-skills",
    icon: BookOpen,
    title: "Custom Digital Learning Platforms",
    subtitle: "Life Skills Academy",
    desc: "A comprehensive online learning platform designed to support the development of practical life skills, literacy, numeracy, community participation, health, safety, and independent living.",
    details: [
      "Interactive life skills training",
      "Literacy and numeracy programs",
      "Cooking and nutrition resources",
      "Community participation education",
      "Safety and personal wellbeing modules",
      "Read-aloud accessibility features",
      "Mobile, tablet, and desktop compatibility",
      "Secure personalised learning environments",
    ],
    color: "from-emerald-50 to-teal-50",
    accent: "text-emerald-600",
  },
  {
    id: "daily-schedule",
    icon: Calendar,
    title: "Personalised Daily Routine & Visual Support Systems",
    subtitle: "My Daily Schedule",
    desc: "Many individuals thrive when routines are predictable, visual, and easy to follow. This platform transforms daily planning into a visual, interactive experience.",
    details: [
      "Visual daily and weekly schedules",
      "Personalised activity images",
      "Routine and checklist management",
      "Family collaboration tools",
      "Interactive educational games",
      "Emotional regulation supports",
      "Progress tracking",
      "Fully customisable for individual needs",
    ],
    color: "from-blue-50 to-cyan-50",
    accent: "text-blue-600",
  },
  {
    id: "shopping",
    icon: ShoppingCart,
    title: "Smart Planning & Organisation Solutions",
    subtitle: "Digital Shopping & Household Management Systems",
    desc: "Shopping, meal planning, and household organisation can be overwhelming. Our custom platforms simplify the process with personalised product catalogues and planning tools.",
    details: [
      "Personalised product libraries",
      "Weekly shopping planners",
      "Printable shopping lists",
      "Household organisation tools",
      "Product image management",
      "Historical shopping records",
      "Mobile-friendly access",
    ],
    color: "from-amber-50 to-orange-50",
    accent: "text-amber-600",
  },
  {
    id: "ndis-planning",
    icon: Briefcase,
    title: "NDIS Schedule & Program Planning Solutions",
    subtitle: "Professional Activity Planning Systems",
    desc: "Support workers and coordinators often spend significant time preparing schedules and activity plans. Our purpose-built platforms automate much of this process.",
    details: [
      "Guided planning workflows",
      "Program and activity catalogues",
      "Conflict and availability management",
      "Automated pricing calculations",
      "Budget tracking tools",
      "Professional proposal generation",
      "PDF reporting capabilities",
      "Mobile responsive design",
    ],
    color: "from-indigo-50 to-purple-50",
    accent: "text-indigo-600",
  },
  {
    id: "portals",
    icon: Users,
    title: "Personalised Participant Portals",
    subtitle: "Individual Digital Hubs",
    desc: "Every participant has unique goals, resources, and support requirements. Our personalised hubs provide a central location for accessing resources and services.",
    details: [
      "Single-point access to services",
      "Easy-to-navigate dashboards",
      "Personalised resources",
      "Mobile accessibility",
      "Secure login protection",
      "Reduced cognitive load",
      "Increased independence",
    ],
    color: "from-pink-50 to-rose-50",
    accent: "text-pink-600",
  },
  {
    id: "behaviour-support",
    icon: Zap,
    title: "Behaviour Support & Clinical Resource Platforms",
    subtitle: "Digital Positive Behaviour Support Systems",
    desc: "Traditional behaviour support documentation often exists in large binders or disconnected systems. Our platforms bring everything together into one secure, accessible place.",
    details: [
      "Behaviour support plans",
      "Crisis response procedures",
      "Safety plans",
      "Clinical formulations",
      "Incident recording systems",
      "Behaviour tracking tools",
      "Emergency contact resources",
      "Training materials",
      "Visual support libraries",
      "Secure document storage",
    ],
    color: "from-red-50 to-orange-50",
    accent: "text-red-600",
  },
];

const WHY_CHOOSE = [
  {
    title: "We Build Solutions Around People",
    desc: "Most software forces people to adapt to the technology. We build technology that adapts to people. Every application is designed around the individual's goals, learning style, support needs, communication preferences, and daily routines.",
  },
  {
    title: "Real Industry Experience",
    desc: "Our solutions are developed by professionals with extensive backgrounds in Disability Support, NDIS Service Delivery, Special Education, Behaviour Support, Capacity Building, Community Participation, and Life Skills Development.",
  },
  {
    title: "Fully Tailored Development",
    desc: "No templates. No generic systems. No unnecessary complexity. Every platform is customised to suit the exact requirements of the people who use it.",
  },
  {
    title: "Accessible by Design",
    desc: "All solutions are developed with accessibility at the forefront, including mobile-friendly interfaces, responsive design, visual supports, read-aloud functionality, clear navigation, and user-friendly layouts.",
  },
  {
    title: "Ongoing Innovation",
    desc: "As participant needs evolve, our systems evolve too. We continuously refine and expand our platforms to ensure they remain relevant, effective, and aligned with best-practice support delivery.",
  },
];

export default function InnovationPage() {
  return (
    <div className="min-h-screen bg-white font-inter text-slate-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex flex-col leading-none">
            <span className="text-xl font-black text-[#0F172A] tracking-tight">SZ-JIE</span>
            <span className="text-[9px] font-bold text-[#0F172A] tracking-widest uppercase">Support Services</span>
          </a>
          <div className="flex items-center gap-8">
            <a href="/#contact" className="text-sm font-semibold text-slate-700 hover:text-[#0F172A] transition">
              Contact Us
            </a>
            <a href="/dashboard/" className="text-sm font-bold px-5 py-2.5 rounded-lg bg-[#0F172A] text-white hover:bg-slate-800 transition">
              Staff Login
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F172A] to-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Technology Designed Around People
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            At SZ-JIE Support Services, we create custom-built digital solutions designed specifically for you, not the other way around.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-6">
            {INNOVATION_SECTIONS[0].content}
          </div>
        </div>
      </section>

      {/* Solution Cards */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-[#0F172A] text-center mb-12">Our Custom Solutions</h2>
          <div className="space-y-8">
            {INNOVATION_SECTIONS.slice(1).map((section, i) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  className={`bg-gradient-to-br ${section.color} rounded-2xl border border-slate-200 p-8 md:p-10`}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl ${section.accent} bg-white flex items-center justify-center shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${section.accent} uppercase tracking-widest mb-1`}>Solution {i + 1}</p>
                      <h3 className="text-2xl font-black text-[#0F172A] mb-1">{section.title}</h3>
                      <p className="text-sm text-slate-600">{section.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">{section.desc}</p>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Key Benefits</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {section.details.map((detail, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CheckCircle size={14} className={`${section.accent} shrink-0 mt-0.5`} />
                          <span className="text-sm text-slate-700">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {section.id === "life-skills" && (
                    <div className="mt-6">
                      <img
                        src="https://media.base44.com/images/public/69d54775d9a169daad84a133/f8aab7e5f_Screenshot2026-05-31084746.png"
                        alt="Life Skills Academy Platform Example"
                        className="w-full rounded-lg border border-slate-200 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0F172A] mb-3">Why Choose SZ-JIE Support Services?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">We build solutions around people, not the other way around.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {WHY_CHOOSE.map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-black text-[#0F172A] mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#0F172A] to-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Transform Your Support Delivery?</h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Let's discuss how custom digital solutions can improve independence, increase engagement, and empower better outcomes for your participants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0435951563"
              className="flex items-center justify-center gap-2 bg-white text-[#0F172A] hover:bg-slate-100 font-bold px-6 py-3 rounded-lg transition"
            >
              Call Now
              <ArrowRight size={16} />
            </a>
            <a
              href="mailto:toby@szjiesupportservices.com"
              className="flex items-center justify-center gap-2 bg-transparent border border-slate-500 text-white hover:border-white font-bold px-6 py-3 rounded-lg transition"
            >
              Email Us
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 mb-8">
            <div>
              <div className="flex flex-col leading-none mb-3">
                <span className="text-xl font-black text-white tracking-tight">SZ-JIE</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Support Services</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Custom digital solutions for disability support.</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400">ABN: 86 959 042 971</p>
              <p className="text-sm text-slate-400 mt-1">© 2026 SZ-Jie Support Services. All rights reserved.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-3">
                <a href="tel:0435951563" className="text-white font-bold hover:underline">0435 951 563</a>
              </p>
              <div className="flex flex-col items-end gap-1">
                <a href="/" className="text-sm text-slate-400 hover:text-white transition underline">
                  Back to Home
                </a>
                <a href="/dashboard/" className="text-sm text-slate-400 hover:text-white transition underline">
                  Staff Portal
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}