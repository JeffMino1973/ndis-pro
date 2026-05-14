import { Phone, Mail, MapPin, Heart, Users, Shield, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/09e12d07c_LOGO_LANDSCAPE.png";

export default function PublicWebsite() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <img src={LOGO} alt="SZ-Jie Support Services" className="h-8 object-contain" />
          <a href="mailto:szjiesupportservices@gmail.com" className="text-sm font-semibold text-primary hover:text-primary/80">
            Contact Us
          </a>
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
          <div className="border-t border-slate-700 pt-8">
            <p className="text-xs text-slate-400 text-center">
              For urgent matters, please call <a href="tel:0401343876" className="text-primary hover:underline font-semibold">0401 343 876</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}