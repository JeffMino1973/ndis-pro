import { Phone, Mail, MapPin, Heart, Users, Shield, Zap, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/641f2cf35_3cb3f155-51c2-49f0-993b-fc2df2583281.jpg";

export default function PublicWebsite() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <img src={LOGO} alt="SZ-Jie Support Services" className="h-8 object-contain" />
          <div className="flex items-center gap-6">
            <a href="mailto:szjiesupportservices@gmail.com" className="text-sm font-semibold text-slate-600 hover:text-primary">
              Contact Us
            </a>
            <a href="/participant-portal" className="text-sm font-semibold text-slate-600 hover:text-primary">
              Participant Portal
            </a>
            <a href="/dashboard/" className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">
              Staff Login
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Compassionate Support Services
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Empowering participants to achieve their goals with personalised, quality support across NSW.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="tel:0401343876">
              <Button className="bg-white text-primary hover:bg-slate-100 rounded-xl gap-2 font-bold">
                <Phone size={16} /> Call Now
              </Button>
            </a>
            <a href="mailto:szjiesupportservices@gmail.com">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-xl gap-2 font-bold">
                <Mail size={16} /> Email Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black mb-4 text-slate-900">Who We Are</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                SZ-Jie Support Services is committed to delivering high-quality, person-centred support. We work with participants across NSW to help them achieve their goals and live more independently.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Our experienced team provides tailored support solutions in community access, daily living skills, personal care, and specialist support — all designed around each person's unique needs and aspirations.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Shield className="text-primary shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-black text-slate-900">Quality Support</h3>
                    <p className="text-sm text-slate-600">Committed to quality and safeguarding standards</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Users className="text-primary shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-black text-slate-900">Experienced Team</h3>
                    <p className="text-sm text-slate-600">Qualified, trained support workers</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Heart className="text-primary shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-black text-slate-900">Person-Centred</h3>
                    <p className="text-sm text-slate-600">Your goals drive our support approach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black mb-12 text-center text-slate-900">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Community Access", desc: "Support with outings, social activities, and community participation" },
              { icon: Heart, title: "Daily Living Support", desc: "Help with meal preparation, personal care, and household tasks" },
              { icon: Shield, title: "Specialist Support", desc: "Tailored programs for behaviour support and skill development" },
            ].map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                  <Icon className="text-primary mb-4" size={32} />
                  <h3 className="font-black text-lg mb-2 text-slate-900">{service.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Meet Our Support Workers</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Our experienced team brings heart, expertise, and dedication to every participant they support.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Toby */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-3 bg-gradient-to-r from-sky-500 to-blue-600" />
              <div className="p-8">
                <div className="flex items-center gap-5 mb-5">
                  <img
                    src="https://media.base44.com/images/public/69d54775d9a169daad84a133/9c2ede7a8_Picture1.png"
                    alt="Toby"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md shrink-0"
                  />
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Sz-Jie (Toby)</h3>
                    <p className="text-sm text-blue-600 font-semibold">Certified Disability Support Worker</p>
                    <span className="text-[10px] font-black bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full uppercase tracking-widest border border-sky-200 mt-1 inline-block">✓ Verified</span>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Compassionate and dedicated, Toby brings certified training and a genuine passion for empowering individuals with disabilities. Fluent in English, Mandarin, and Cantonese — making him ideal for CALD participants.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {["Daily Living", "Community Access", "Mobility Support", "CALD"].map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <a href="/dashboard/toby" className="flex items-center gap-2 justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition">
                  <ExternalLink size={14} /> View Full Profile
                </a>
              </div>
            </div>

            {/* Jeffrey */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600" />
              <div className="p-8">
                <div className="flex items-center gap-5 mb-5">
                  <img
                    src="https://media.base44.com/images/public/69d54775d9a169daad84a133/b8ef90a14_Jeff.jpg"
                    alt="Jeffrey"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md shrink-0"
                  />
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Jeffrey Minton</h3>
                    <p className="text-sm text-indigo-600 font-semibold">Specialist Disability Support Worker</p>
                    <span className="text-[10px] font-black bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full uppercase tracking-widest border border-sky-200 mt-1 inline-block">✓ Verified</span>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  With 30+ years in NSW Special Education, Jeffrey brings unmatched expertise in behaviour support, capacity building, and complex disability. Former Head Teacher and Learning & Wellbeing Adviser.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {["Behaviour Support", "Capacity Building", "ASD", "Intellectual Disability"].map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <a href="/dashboard/jeffrey" className="flex items-center gap-2 justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition">
                  <ExternalLink size={14} /> View Full Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black mb-12 text-center text-slate-900">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <a href="tel:0401343876" className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all text-center">
              <Phone className="text-primary mx-auto mb-3" size={28} />
              <h3 className="font-black text-slate-900 mb-2">Phone</h3>
              <p className="text-primary font-bold">0401 343 876</p>
            </a>
            <a href="mailto:szjiesupportservices@gmail.com" className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all text-center">
              <Mail className="text-primary mx-auto mb-3" size={28} />
              <h3 className="font-black text-slate-900 mb-2">Email</h3>
              <p className="text-sm text-slate-600 break-all">szjiesupportservices@gmail.com</p>
            </a>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <MapPin className="text-primary mx-auto mb-3" size={28} />
              <h3 className="font-black text-slate-900 mb-2">Location</h3>
              <p className="text-sm text-slate-600">309/12 Broome St<br />Waterloo NSW 2017</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <img src={LOGO} alt="SZ-Jie Support Services" className="h-6 object-contain mb-4" />
              <p className="text-sm">Delivering quality support services across NSW.</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">ABN: 86 959 042 971</p>
              <p className="text-xs text-slate-400 mt-2">© 2026 SZ-Jie Support Services. All rights reserved.</p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 space-y-4">
            <p className="text-xs text-slate-400 text-center">
              For urgent matters, please call <a href="tel:0401343876" className="text-primary hover:underline font-semibold">0401 343 876</a>
            </p>
            <div className="flex gap-4 justify-center text-xs">
              <a href="/dashboard/" className="text-slate-400 hover:text-primary">Staff Portal</a>
              <span className="text-slate-600">•</span>
              <a href="/participant-portal" className="text-slate-400 hover:text-primary">Participant Portal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}