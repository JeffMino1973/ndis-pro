import { Phone, Mail, MapPin, Heart, Users, Shield, Zap, ExternalLink, CheckCircle, Brain, Navigation, Laptop, Star, Building2, Globe } from "lucide-react";

const APP_SOLUTIONS = [
  {
    title: "Participant Management Portal",
    desc: "Full participant profiles with NDIS numbers, plan types, budgets, goals, medical alerts, emergency contacts, and progress note history — all in one secure place.",
    color: "bg-blue-50 border-blue-200",
    tag: "Core Platform",
    tagColor: "bg-blue-100 text-blue-700",
    screenshot: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d61ac5d59_generated_image.png",
  },
  {
    title: "Rostering & Shift Management",
    desc: "Weekly calendar view for scheduling support workers to participants. Colour-coded by status, with shift logging, timesheet submission, and auto-billing integration.",
    color: "bg-violet-50 border-violet-200",
    tag: "Scheduling",
    tagColor: "bg-violet-100 text-violet-700",
    screenshot: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d61ac5d59_generated_image.png",
  },
  {
    title: "NDIS Invoicing & Billing",
    desc: "Auto-generates invoices from completed shifts, calculates hours and amounts by support item code, and produces payslips with tax, super, and banking detail breakdowns.",
    color: "bg-amber-50 border-amber-200",
    tag: "Finance",
    tagColor: "bg-amber-100 text-amber-700",
    screenshot: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d61ac5d59_generated_image.png",
  },
  {
    title: "Behaviour Support Plans",
    desc: "Digital PBS plans with Green/Yellow/Red/Blue zones, communication boards, social stories, ABC incident logs, and NDIS-compliant documentation.",
    color: "bg-rose-50 border-rose-200",
    tag: "Clinical",
    tagColor: "bg-rose-100 text-rose-700",
    screenshot: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d61ac5d59_generated_image.png",
  },
  {
    title: "Travel Training Platform",
    desc: "Systematic journey analysis that identifies barriers, anxiety triggers, and safety considerations — building genuine travel independence through structured learning programs.",
    color: "bg-emerald-50 border-emerald-200",
    tag: "Specialist",
    tagColor: "bg-emerald-100 text-emerald-700",
    screenshot: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d61ac5d59_generated_image.png",
  },
  {
    title: "Templates & Document Hub",
    desc: "Branded HTML templates for service agreements, epilepsy plans, crisis management plans, support plans, payslip advice, and goal setting — all print-ready and fillable.",
    color: "bg-cyan-50 border-cyan-200",
    tag: "Documents",
    tagColor: "bg-cyan-100 text-cyan-700",
    screenshot: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d61ac5d59_generated_image.png",
  },
];

export default function PublicWebsite() {
  return (
    <div className="min-h-screen bg-white font-inter text-slate-900">

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/50cfec215_ChatGPTImageMay31202609_02_19AM.png" alt="SZ-JIE Logo" className="h-14" />
          <div className="flex items-center gap-6">
            <a href="mailto:jeff@szjiesupportservices.com" className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-[#0F172A] transition">
              Contact Us
            </a>
            <a href="/participant-portal" className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-[#0F172A] transition">
              Participant Portal
            </a>
            <a href="/dashboard/" className="text-sm font-bold px-5 py-2.5 rounded-lg bg-[#0F172A] text-white hover:bg-slate-800 transition">
              Staff Login
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#0F172A] overflow-hidden" style={{ minHeight: 360 }}>
        <div className="max-w-6xl mx-auto px-6 flex items-stretch" style={{ minHeight: 360 }}>
          <div className="flex flex-col justify-center py-16 pr-12 flex-1 z-10">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">NSW Registered NDIS Provider · ABN 86 959 042 971</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Empowering<br />Independence
            </h1>
            <p className="text-slate-300 text-base mb-3 max-w-sm leading-relaxed">
              Through expertise, innovation, and personalised support — SZ-JIE Support Services helps individuals build independence, confidence, life skills, and meaningful community participation.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="tel:0401343876" className="flex items-center gap-2 bg-white text-[#0F172A] hover:bg-slate-100 font-bold text-sm px-5 py-2.5 rounded-lg transition">
                <Phone size={15} /> 0401 343 876
              </a>
              <a href="mailto:jeff@szjiesupportservices.com" className="flex items-center gap-2 bg-transparent border border-slate-500 text-white hover:border-white font-bold text-sm px-5 py-2.5 rounded-lg transition">
                <Mail size={15} /> Email Us
              </a>
            </div>
          </div>
          <div className="relative flex-1 hidden md:block" style={{ clipPath: "polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%)" }}>
            <img
              src="https://media.base44.com/images/public/69d54775d9a169daad84a133/d61ac5d59_generated_image.png"
              alt="Support team"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-slate-900/20" />
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">About Us</p>
              <h2 className="text-3xl font-black text-[#0F172A] mb-5">Who We Are</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                SZ-JIE Support Services is a specialist disability support and capacity-building organisation dedicated to helping individuals build independence, confidence, life skills, and meaningful community participation.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Founded on more than 30 years of experience within the New South Wales Department of Education, our organisation combines expertise in special education, disability support, behaviour support, wellbeing, capacity building, and digital innovation to create highly personalised support solutions for individuals and families.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: "30+ Years Experience", sub: "NSW Dept of Education" },
                  { icon: Users, label: "Government & Cross-Sector", sub: "Multi-agency collaboration" },
                  { icon: Brain, label: "Evidence-Based Practice", sub: "Research-informed support" },
                  { icon: Globe, label: "Bilingual Support", sub: "English & Mandarin" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <Icon size={18} className="text-slate-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-[#0F172A]">{item.label}</p>
                        <p className="text-[10px] text-slate-500">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#0F172A] rounded-2xl p-7 text-white">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Government & Cross-Sector Experience</p>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">Through decades of experience, we collaborate effectively with:</p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {["Local Government Agencies", "State Government Departments", "Federal Government Agencies", "Allied Health Professionals", "NDIS Service Providers", "Support Coordinators", "Plan Managers", "Local Area Coordinators", "Families and Carers", "Community Organisations"].map((org, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                      <p className="text-xs text-slate-300">{org}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Our Values</p>
                <div className="flex flex-wrap gap-2">
                  {["Empowerment", "Capacity Building", "Integrity", "Inclusion", "Dignity", "Evidence-Based Support"].map((v, i) => (
                    <span key={i} className="text-xs font-bold bg-[#0F172A] text-white px-3 py-1.5 rounded-full">{v}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">What We Do</p>
            <h2 className="text-3xl font-black text-[#0F172A] mb-4">Core Services</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">All supports are grounded in evidence-based practice and informed by current research, professional expertise, and collaborative planning.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Heart, title: "Capacity Building & Skill Development", desc: "Building independence through structured, goal-oriented skill development programs." },
              { icon: Brain, title: "Behaviour Support", desc: "Positive Behaviour Support strategies tailored to individual needs and circumstances." },
              { icon: Users, title: "Community Participation", desc: "Social inclusion, community access, and independent living programs across NSW." },
              { icon: Navigation, title: "Travel Training", desc: "Specialist travel independence programs examining psychology, confidence, and decision-making." },
              { icon: Zap, title: "Daily Living Skills", desc: "Practical support with household tasks, meal preparation, and personal care routines." },
              { icon: Shield, title: "Family Capacity Building", desc: "Coaching, mentoring, and guidance to empower families as consistent support environments." },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center mb-4">
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-black text-[#0F172A] text-sm mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specialised Travel Training */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Specialist Service</p>
              <h2 className="text-3xl font-black text-[#0F172A] mb-5">Specialised Travel Training</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Travel training is one of our specialist areas of practice. Our approach goes beyond teaching a person how to follow a route — we examine the <strong>psychology behind travel</strong>, independence, confidence, decision-making, and community navigation.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Every journey is systematically analysed and broken down into smaller components, allowing us to identify potential barriers and build genuine independence, confidence, resilience, and transferable problem-solving skills.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["Potential barriers", "Environmental challenges", "Anxiety triggers", "Safety considerations", "Communication requirements", "Individual support strategies"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                    <p className="text-xs text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Family Capacity Building</p>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  We recognise that sustainable outcomes are achieved when families are supported alongside participants. A significant component of our work involves helping families develop the skills, knowledge, confidence, and strategies required to effectively support their loved ones.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Coaching", "Mentoring", "Collaborative Planning", "Practical Guidance"].map((t, i) => (
                    <span key={i} className="text-xs font-semibold bg-slate-200 text-slate-700 px-3 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Leadership */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Leadership</p>
            <h2 className="text-3xl font-black text-[#0F172A] mb-3">Meet Our Team</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              SZ-JIE Support Services is co-led by Toby Wang and Jeffrey Minton, whose combined experience provides a unique blend of disability support, education, capacity building, and innovation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Toby */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-[#0F172A] p-8 flex flex-col items-center text-center">
                <img
                  src="https://media.base44.com/images/public/69d54775d9a169daad84a133/9c2ede7a8_Picture1.png"
                  alt="Toby Wang"
                  className="w-24 h-24 rounded-full object-cover object-top border-4 border-white/20 mb-4"
                />
                <h3 className="text-xl font-black text-white">Sz-Jie (Toby) Wang</h3>
                <p className="text-slate-400 text-sm mt-1">Managing Director</p>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle size={12} className="text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Verified NDIS Provider</span>
                </div>
              </div>
              <div className="p-7">
                <p className="text-slate-600 text-sm leading-relaxed mb-5">
                  Toby brings frontline disability support expertise, practical person-centred care experience, community participation knowledge, and bilingual English and Mandarin support for culturally and linguistically diverse participants and families.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {["Daily Living", "Community Participation", "Capacity Building", "Bilingual (English/Mandarin)", "Person-Centred Care"].map((tag, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <a href="/dashboard/toby" className="flex-1 text-center bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition">
                    View Full Profile
                  </a>
                  <a href="mailto:toby@szjiesupportservices.com" className="flex-1 text-center border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition">
                    Contact Toby
                  </a>
                </div>
              </div>
            </div>

            {/* Jeffrey */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-[#0F172A] p-8 flex flex-col items-center text-center">
                <img
                  src="https://media.base44.com/images/public/69d54775d9a169daad84a133/b8ef90a14_Jeff.jpg"
                  alt="Jeffrey Minton"
                  className="w-24 h-24 rounded-full object-cover object-top border-4 border-white/20 mb-4"
                />
                <h3 className="text-xl font-black text-white">Jeffrey Minton</h3>
                <p className="text-slate-400 text-sm mt-1">Principal Support Practitioner</p>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle size={12} className="text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Verified NDIS Provider</span>
                </div>
              </div>
              <div className="p-7">
                <p className="text-slate-600 text-sm leading-relaxed mb-5">
                  Jeffrey brings more than 30 years of experience within the New South Wales Department of Education, including leadership roles as <strong>Head Teacher Special Education</strong> and <strong>Learning & Wellbeing Adviser</strong> — delivering unmatched expertise in behaviour support, capacity building, and complex disability.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {["Behaviour Support", "Special Education", "Capacity Building", "Learning & Wellbeing", "Complex Disability"].map((tag, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <a href="/dashboard/jeffrey" className="flex-1 text-center bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition">
                    View Full Profile
                  </a>
                  <a href="mailto:jeff@szjiesupportservices.com" className="flex-1 text-center border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition">
                    Contact Jeffrey
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Custom Solutions */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Innovation</p>
            <h2 className="text-3xl font-black text-[#0F172A] mb-4">Technology Designed Around People</h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
              SZ-JIE Support Services is also an innovative developer of custom digital solutions. Rather than adapting people to generic software, we design technology around the individual — creating highly personalised platforms that support real people achieving real goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {APP_SOLUTIONS.map((app, i) => (
              <div key={i} className={`rounded-2xl border p-6 ${app.color} hover:shadow-md transition-all`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${app.tagColor}`}>{app.tag}</span>
                  <Laptop size={16} className="text-slate-400 mt-0.5" />
                </div>
                <h3 className="font-black text-[#0F172A] text-sm mb-2">{app.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{app.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="/innovation"
              className="inline-flex items-center gap-2 bg-[#0F172A] text-white hover:bg-slate-800 font-bold text-sm px-7 py-3 rounded-xl transition"
            >
              Explore All Our Solutions <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Staff Portal */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Staff</p>
            <h2 className="text-3xl font-black text-[#0F172A] mb-3">Staff Portal</h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">Your secure hub for managing rosters, compliance, payroll, and participant support — everything you need at your fingertips.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white rounded-2xl border border-slate-200 p-7">
              <h3 className="font-black text-[#0F172A] text-lg mb-4">What's Available in Your Portal</h3>
              <div className="space-y-3">
                {[
                  { label: "My Profile", desc: "View your credentials, certifications, bio, and share your professional profile." },
                  { label: "Compliance Dashboard", desc: "Track WWCC, First Aid, Police Check, and training status at a glance." },
                  { label: "Rosters & Timesheets", desc: "View your shifts, log hours, submit timesheets for approval." },
                  { label: "Payslips", desc: "Access historical and current pay records with tax and superannuation details." },
                  { label: "Participant Support", desc: "Progress notes, support plans, goals, and participant contact details." },
                  { label: "Shift Logger", desc: "Clock in/out, record activities, log outcomes for the day." },
                  { label: "Documents", desc: "Download policies, training materials, and manage secure internal documents." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#0F172A] text-white flex items-center justify-center shrink-0 text-[10px] font-black">{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#0F172A]">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-7">
              <h3 className="font-black text-[#0F172A] text-lg mb-4">How to Login</h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Navigate to Staff Login", desc: 'Click the "Staff Login" button in the top navigation bar.' },
                  { step: "2", title: "Enter Your Credentials", desc: "Use the email and password provided during onboarding. Contact jeff@szjiesupportservices.com if needed." },
                  { step: "3", title: "Access Your Portal", desc: "Once logged in, you'll see your personalized dashboard with the features enabled for your role." },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Step {item.step}: {item.title}</p>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                    {i < 2 && <div className="h-px bg-slate-200 mt-4" />}
                  </div>
                ))}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  <p className="text-xs font-bold text-amber-700 mb-1">🔒 Security Reminder</p>
                  <p className="text-xs text-amber-600">Never share your login credentials. Always log out when finished.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#0F172A] to-slate-800 rounded-2xl p-8 text-white">
            <h3 className="font-black text-lg mb-6">Portal Features at a Glance</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Real-time Rosters", count: "100%" },
                { label: "Automated Payroll", count: "Tax Ready" },
                { label: "Secure Documents", count: "Encrypted" },
                { label: "Mobile Friendly", count: "Responsive" },
              ].map((feature, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                  <p className="text-slate-300 text-xs mb-1">{feature.label}</p>
                  <p className="text-white font-black text-sm">{feature.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Contact</p>
            <h2 className="text-3xl font-black text-[#0F172A] mb-3">Get in Touch</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">We'd love to hear from you. Reach out to discuss how we can support you or your loved one.</p>
          </div>
          <div className="grid md:grid-cols-3 divide-x divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden max-w-3xl mx-auto">
            <a href="tel:0401343876" className="flex flex-col items-center text-center p-10 hover:bg-slate-50 transition">
              <Phone size={28} className="text-slate-700 mb-4" strokeWidth={1.5} />
              <h3 className="font-black text-[#0F172A] mb-1">Phone</h3>
              <p className="text-slate-500 text-sm">0401 343 876</p>
            </a>
            <a href="mailto:jeff@szjiesupportservices.com" className="flex flex-col items-center text-center p-10 hover:bg-slate-50 transition">
              <Mail size={28} className="text-slate-700 mb-4" strokeWidth={1.5} />
              <h3 className="font-black text-[#0F172A] mb-1">Email</h3>
              <p className="text-slate-500 text-sm break-all">jeff@szjiesupportservices.com</p>
            </a>
            <div className="flex flex-col items-center text-center p-10">
              <MapPin size={28} className="text-slate-700 mb-4" strokeWidth={1.5} />
              <h3 className="font-black text-[#0F172A] mb-1">Location</h3>
              <p className="text-slate-500 text-sm">309/12 Broome St, Waterloo NSW 2017</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 mb-8">
            <div>
              <img src="https://media.base44.com/images/public/69d54775d9a169daad84a133/539befd5f_White_transparent.png" alt="SZ-JIE Logo" className="h-12 mb-3" />
              <p className="text-sm text-slate-400 leading-relaxed">Empowering independence through expertise, innovation and personalised support across NSW.</p>
              <p className="text-xs text-slate-500 mt-3">ABN: 86 959 042 971</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-slate-400">309/12 Broome St, Waterloo NSW 2017</p>
              <p className="text-sm text-slate-400">jeff@szjiesupportservices.com</p>
              <p className="text-sm text-slate-400">0401 343 876</p>
              <p className="text-xs text-slate-500 mt-3">© 2026 SZ-JIE Support Services. All rights reserved.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-3">
                For urgent matters, call{" "}
                <a href="tel:0401343876" className="text-white font-bold hover:underline">0401 343 876</a>
              </p>
              <div className="flex flex-col items-end gap-1">
                <a href="/dashboard/" className="text-sm text-slate-400 hover:text-white transition underline">Staff Portal</a>
                <a href="/participant-portal" className="text-sm text-slate-400 hover:text-white transition underline">Participant Portal</a>
                <a href="/innovation" className="text-sm text-slate-400 hover:text-white transition underline">Innovation</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}