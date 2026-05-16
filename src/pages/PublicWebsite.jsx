import { Phone, Mail, MapPin, Heart, Users, Shield, Zap, ExternalLink, CheckCircle } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/641f2cf35_3cb3f155-51c2-49f0-993b-fc2df2583281.jpg";
const HERO_IMG = "https://media.base44.com/images/public/69d54775d9a169daad84a133/d61ac5d59_generated_image.png";

export default function PublicWebsite() {
  return (
    <div className="min-h-screen bg-white font-inter text-slate-900">

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black text-[#0F172A] tracking-tight">SZ-JIE</span>
            <span className="text-[9px] font-bold text-[#0F172A] tracking-widest uppercase">Support Services</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="mailto:szjiesupportservices@gmail.com" className="text-sm font-semibold text-slate-700 hover:text-[#0F172A] transition">
              Contact Us
            </a>
            <a href="/participant-portal" className="text-sm font-semibold text-slate-700 hover:text-[#0F172A] transition">
              Participant Portal
            </a>
            <a href="/dashboard/" className="text-sm font-bold px-5 py-2.5 rounded-lg bg-[#0F172A] text-white hover:bg-slate-800 transition">
              Staff Login
            </a>
          </div>
        </div>
      </nav>

      {/* Hero — diagonal split */}
      <section className="bg-[#0F172A] overflow-hidden" style={{ minHeight: 340 }}>
        <div className="max-w-6xl mx-auto px-6 flex items-stretch" style={{ minHeight: 340 }}>
          {/* Left: text */}
          <div className="flex flex-col justify-center py-16 pr-12 flex-1 z-10">
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Compassionate<br />Support Services
            </h1>
            <p className="text-slate-300 text-base mb-8 max-w-sm leading-relaxed">
              Empowering participants to achieve their goals with personalised, quality support across NSW.
            </p>
            <div className="flex gap-3">
              <a href="tel:0401343876" className="flex items-center gap-2 bg-white text-[#0F172A] hover:bg-slate-100 font-bold text-sm px-5 py-2.5 rounded-lg transition">
                <Phone size={15} /> Call Now
              </a>
              <a href="mailto:szjiesupportservices@gmail.com" className="flex items-center gap-2 bg-transparent border border-slate-500 text-white hover:border-white font-bold text-sm px-5 py-2.5 rounded-lg transition">
                <Mail size={15} /> Email Us
              </a>
            </div>
          </div>
          {/* Right: image with diagonal clip */}
          <div className="relative flex-1 hidden md:block" style={{ clipPath: "polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%)" }}>
            <img
              src={HERO_IMG}
              alt="Support team"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-slate-100/10" />
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-[#0F172A] mb-4">Who We Are</h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-14 text-sm leading-relaxed">
            SZ-Jie Support Services is committed to delivering high-quality, person-centred support. We work with participants across NSW to help them achieve their goals and live more independently.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Shield, title: "Quality Support", desc: "SZ-Jie Support Services to achieve their goals with personalised, quality support across NSW." },
              { icon: Users, title: "Experienced Team", desc: "Empowering participants to achieve their goals with personalised, quality support across NSW." },
              { icon: Heart, title: "Person-Centred", desc: "SZ-Jie Support Services to achieve their goals with personalised, quality support across NSW." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-slate-600" />
                  </div>
                  <h3 className="font-black text-[#0F172A] text-base mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-[#0F172A] mb-12 text-center">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Community Access", desc: "Support with outings, social activities, and community participation to foster independence and inclusion." },
              { icon: Heart, title: "Daily Living Support", desc: "Help with meal preparation, personal care, and household tasks to support your daily routines." },
              { icon: Shield, title: "Specialist Support", desc: "Tailored programs for behaviour support and skill development with subtle hover lift shadow effect." },
            ].map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-7 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className="mb-4">
                    <Icon size={26} className="text-slate-700" />
                  </div>
                  <h3 className="font-black text-[#0F172A] text-base mb-2">{service.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0F172A] mb-3">Meet Our Support Workers</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Our experienced team brings heart, expertise, and dedication to every participant they support.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Toby */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex">
              <div className="w-24 shrink-0 flex items-start justify-center p-4 pt-5">
                <img
                  src="https://media.base44.com/images/public/69d54775d9a169daad84a133/9c2ede7a8_Picture1.png"
                  alt="Toby"
                  className="w-16 h-16 rounded-full object-cover object-top border-2 border-slate-200"
                />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg font-black text-[#0F172A]">Sz-Jie (Toby)</h3>
                  <p className="text-xs text-slate-500 mb-2">Disability Support Worker</p>
                  <div className="flex items-center gap-1 mb-3">
                    <CheckCircle size={12} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Verified</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Compassionate and dedicated, Toby brings certified training and a genuine passion for empowering individuals with disabilities. Fluent in English and Mandarin.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {["Daily Living", "Community Access", "Behaviour Support", "Behaviour Support"].map((tag, i) => (
                      <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href="/dashboard/toby" className="flex-1 text-center bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition">
                    View Full Profile
                  </a>
                  <a href="/dashboard/toby" className="flex-1 text-center bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-lg text-xs transition">
                    View Full Profile
                  </a>
                </div>
              </div>
            </div>

            {/* Jeffrey */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex">
              <div className="w-24 shrink-0 flex items-start justify-center p-4 pt-5">
                <img
                  src="https://media.base44.com/images/public/69d54775d9a169daad84a133/b8ef90a14_Jeff.jpg"
                  alt="Jeffrey"
                  className="w-16 h-16 rounded-full object-cover object-top border-2 border-slate-200"
                />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg font-black text-[#0F172A]">Jeffrey Minton</h3>
                  <p className="text-xs text-slate-500 mb-2">Specialist Disability Support Worker</p>
                  <div className="flex items-center gap-1 mb-3">
                    <CheckCircle size={12} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Verified</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    With 30+ years in NSW Special Education, Jeffrey brings unmatched expertise in behaviour support, capacity building, and complex disability. Former Head Teacher.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {["Daily Living", "Community Access", "Behaviour Support", "Behaviour Support"].map((tag, i) => (
                      <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href="/dashboard/jeffrey" className="flex-1 text-center bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition">
                    View Full Profile
                  </a>
                  <a href="/dashboard/jeffrey" className="flex-1 text-center bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-lg text-xs transition">
                    View Full Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get in Touch */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-[#0F172A] mb-14 text-center">Get in Touch</h2>
          <div className="grid md:grid-cols-3 divide-x divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden max-w-3xl mx-auto">
            <a href="tel:0401343876" className="flex flex-col items-center text-center p-10 hover:bg-slate-50 transition">
              <Phone size={28} className="text-slate-700 mb-4" strokeWidth={1.5} />
              <h3 className="font-black text-[#0F172A] mb-1">Phone</h3>
              <p className="text-slate-500 text-sm">0401 343 876</p>
            </a>
            <a href="mailto:szjiesupportservices@gmail.com" className="flex flex-col items-center text-center p-10 hover:bg-slate-50 transition">
              <Mail size={28} className="text-slate-700 mb-4" strokeWidth={1.5} />
              <h3 className="font-black text-[#0F172A] mb-1">Email</h3>
              <p className="text-slate-500 text-sm break-all">szjiesupportservices@gmail.com</p>
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
              <div className="flex flex-col leading-none mb-3">
                <span className="text-xl font-black text-white tracking-tight">SZ-JIE</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Support Services</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Delivering quality support services across NSW.</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400">ABN: 86 959 042 971</p>
              <p className="text-sm text-slate-400 mt-1">© 2026 SZ-Jie Support Services. All rights reserved.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-3">
                For urgent matters, please call{" "}
                <a href="tel:0401343876" className="text-white font-bold hover:underline">0401 343 876</a>
              </p>
              <div className="flex flex-col items-end gap-1">
                <a href="/dashboard/" className="text-sm text-slate-400 hover:text-white transition underline">Staff Portal</a>
                <a href="/participant-portal" className="text-sm text-slate-400 hover:text-white transition underline">Participant Portal</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}