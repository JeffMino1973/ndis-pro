import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ShieldCheck, Brain, Pill, Heart, ShieldAlert,
  ClipboardCheck, UserCircle, AlertTriangle, ClipboardList, FileText, Flame,
  Settings, Menu, ChevronRight, Receipt, Calendar, FolderOpen,
  MessageSquareWarning, CheckSquare, BarChart3, BookTemplate, Zap,
  Navigation, DollarSign, Activity, Banknote, LogOut, Link2, BookOpen,
  Shield, Database, CheckCircle2, Cloud, Mail, ChevronDown,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const ADMIN_NAV_SECTIONS = [
  {
    title: "Home",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/kpi", label: "KPI & Analytics", icon: BarChart3 },
      { path: "/ai-reports", label: "AI Reports", icon: Zap },
    ],
  },
  {
    title: "Participants",
    items: [
      { path: "/participants", label: "Participants", icon: Users },
      { path: "/onboarding", label: "Onboarding", icon: ClipboardCheck },
      { path: "EXTERNAL:/participant-portal", label: "Participant Portal", icon: UserCircle },
    ],
  },
  {
    title: "Shifts & Billing",
    items: [
      { path: "/shift-notes", label: "Shift Notes", icon: ClipboardList },
      { path: "/rostering", label: "Rostering", icon: Calendar },
      { path: "/roster-billing", label: "Invoices & Payslips", icon: DollarSign },
      { path: "/weekly-tasks", label: "Weekly Tasks", icon: CheckCircle2 },
      { path: "/quotes", label: "Quotes", icon: FileText },
      { path: "/finance", label: "Finance Centre", icon: BarChart3 },
      { path: "/financial-reports", label: "Financial Reports", icon: BarChart3 },
    ],
  },
  {
    title: "Clinical & Support",
    items: [
      { path: "/support-plans", label: "Support Plans", icon: ClipboardList },
      { path: "/service-agreements", label: "Service Agreements", icon: FileText },
      { path: "/implementation-programs", label: "Implementation Programs", icon: Activity },
      { path: "/behaviour-support-plans", label: "Behaviour Support", icon: Brain },
      { path: "/positive-behaviour-support-plans", label: "PBS Plans", icon: Heart },
      { path: "/epilepsy-plans", label: "Epilepsy Plans", icon: Brain },
      { path: "/health-care-plans", label: "Health Care Plans", icon: Heart },
      { path: "/medications", label: "Medications", icon: Pill },
    ],
  },
  {
    title: "Compliance & Safety",
    items: [
      { path: "/compliance-dashboard", label: "Compliance Dashboard", icon: ShieldCheck },
      { path: "/staff", label: "Staff & Compliance", icon: ShieldCheck },
      { path: "/risk-assessments", label: "Risk Assessments", icon: AlertTriangle },
      { path: "/incidents", label: "Incidents", icon: Flame },
      { path: "/complaints", label: "Complaints", icon: MessageSquareWarning },
      { path: "/restrictive-practices", label: "Restrictive Practices", icon: ShieldAlert },
      { path: "/audit-checklists", label: "Audit Checklists", icon: CheckSquare },
    ],
  },

  {
    title: "Tools & Resources",
    items: [
      { path: "/templates", label: "Templates", icon: BookTemplate },
      { path: "/travel-guide", label: "Travel Guide", icon: Navigation },
      { path: "/document-vault", label: "Document Vault", icon: FolderOpen },
      { path: "/google-drive", label: "Google Drive", icon: Cloud },
      { path: "/gmail", label: "Gmail", icon: Mail },
      { path: "/links", label: "Quick Links", icon: Link2 },
      { path: "/staff-portal", label: "Staff Portal", icon: UserCircle },
      { path: "/training-dashboard", label: "Training Dashboard", icon: BarChart3 },
      { path: "/lms", label: "Learning Hub (LMS)", icon: BookOpen },
    ],
  },
  {
    title: "Admin",
    items: [
      { path: "/reports", label: "Reports Centre", icon: BarChart3 },
      { path: "/audit-log", label: "Audit Log", icon: Shield },
      { path: "/data-export", label: "Data Export", icon: Database },
      { path: "/nav-admin", label: "Menu Permissions", icon: Settings },
      { path: "/policy-manual", label: "Policy Manual", icon: ClipboardList },
      { path: "/user-guide", label: "User Guide", icon: BookOpen },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

// Staff-only nav — just their portal
const STAFF_NAV_SECTIONS = [
  {
    title: "My Portal",
    items: [
      { path: "/staff-portal", label: "My Staff Portal", icon: UserCircle },
    ],
  },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hiddenPaths, setHiddenPaths] = useState(null); // null = loading
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    async function loadPerms() {
      const me = await base44.auth.me();
      setCurrentUser(me);
      if (!me) { setHiddenPaths([]); return; }

      // Staff (user role) — redirect to staff portal if not already there
      if (me.role === "user") {
        setHiddenPaths([]); // no per-user filtering needed, nav is already staff-only
        if (!location.pathname.endsWith("/staff-portal")) {
          navigate("/dashboard/staff-portal", { replace: true });
        }
        return;
      }

      // Admins — respect NavPermissions overrides
      if (me.role === "admin") {
        const perms = await base44.entities.NavPermissions.filter({ user_email: me.email });
        setHiddenPaths(perms?.[0]?.hidden_paths ?? []);
        return;
      }

      setHiddenPaths([]);
    }
    loadPerms();
  }, []);

  const isStaff = currentUser?.role === "user";
  const navSections = isStaff ? STAFF_NAV_SECTIONS : ADMIN_NAV_SECTIONS;

  // Auto-expand the section containing the current route
  useEffect(() => {
    const activeSection = navSections.find(section =>
      section.items.some(item => {
        if (item.path.startsWith("EXTERNAL:")) return false;
        return location.pathname === `/dashboard${item.path}`;
      })
    );
    if (activeSection) {
      setExpandedSections(prev => ({ ...prev, [activeSection.title]: true }));
    }
  }, [location.pathname, navSections]);

  const toggleSection = (title) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 pb-2">
          <img
            src="https://media.base44.com/images/public/69d54775d9a169daad84a133/641f2cf35_3cb3f155-51c2-49f0-993b-fc2df2583281.jpg"
            alt="SZ-JIE WANG Support Services"
            className="w-full max-w-[200px] mx-auto block"
          />
        </div>

        {/* Staff role banner */}
        {isStaff && (
          <div className="mx-4 mb-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-center">
            <p className="text-xs font-black text-primary">Staff Portal</p>
            <p className="text-[10px] text-muted-foreground truncate">{currentUser?.full_name}</p>
          </div>
        )}

        <nav className="flex-1 px-4 pb-4 overflow-y-auto space-y-1.5">
          {navSections.map((section) => {
            const visibleItems = isStaff
              ? section.items
              : section.items.filter(item => !(hiddenPaths ?? []).includes(item.path));
            if (visibleItems.length === 0) return null;
            const isExpanded = expandedSections[section.title];
            const hasActive = visibleItems.some(item =>
              !item.path.startsWith("EXTERNAL:") && location.pathname === `/dashboard${item.path}`
            );
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    hasActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
                {isExpanded && (
                  <div className="space-y-0.5 mt-1">
                    {visibleItems.map((item) => {
                      const isActive = location.pathname === `/dashboard${item.path}`;
                      const Icon = item.icon;
                      const isExternal = item.path.startsWith("EXTERNAL:");
                      const href = isExternal ? item.path.replace("EXTERNAL:", "") : `/dashboard${item.path}`;
                      const linkClass = `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`;
                      return isExternal ? (
                        <a key={item.path} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </a>
                      ) : (
                        <Link
                          key={item.path}
                          to={href}
                          onClick={() => setSidebarOpen(false)}
                          className={linkClass}
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                          {isActive && <ChevronRight size={14} className="ml-auto" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="bg-secondary rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xs">
                {currentUser?.full_name?.charAt(0) || "?"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-foreground truncate">
                  {currentUser?.full_name || "Loading…"}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {currentUser?.role === "user" ? "Support Worker" : "Administrator"}
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => base44.auth.logout("/")}
            variant="outline"
            className="w-full gap-2 rounded-xl"
            size="sm"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-card border-b border-border px-4 lg:px-8 flex items-center justify-between shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-secondary">
            <Menu size={20} />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">NSW Registered Provider</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              Compliant • 2026
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-sm">
              {currentUser?.full_name?.charAt(0) || "SZ"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}