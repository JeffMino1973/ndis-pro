import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Brain,
  Pill,
  Heart,
  ShieldAlert,
  ClipboardCheck,
  UserCircle,
  AlertTriangle,
  ClipboardList,
  FileText,
  Flame,
  Settings,
  Menu,
  ChevronRight,
  Receipt,
  Calendar,
  Clock,
  Target,
  FolderOpen,
  MessageSquareWarning,
  CheckSquare,
  BarChart3,
  BookTemplate,
  Play,
  Zap,
  Navigation,
  Mail,
  DollarSign,
  Activity,
  Banknote,
  LogOut,
  Link2,
  BookOpen,
  Shield,
  Database,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const NAV_SECTIONS = [
  {
    title: "Dashboard",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/kpi", label: "KPI Dashboard", icon: BarChart3 },
      { path: "/ai-reports", label: "AI Report Centre", icon: Zap },
      { path: "/reports", label: "Reports Centre", icon: BarChart3 },
    ],
  },
  {
    title: "Participants",
    items: [
      { path: "/participants", label: "Participants", icon: Users },
      { path: "/onboarding", label: "Onboarding", icon: ClipboardCheck },
      { path: "/goal-tracking", label: "Goal Tracking", icon: Target },
      { path: "/document-vault", label: "Document Vault", icon: FolderOpen },
      { path: "EXTERNAL:/participant-portal", label: "Participant Portal", icon: UserCircle },
    ],
  },
  {
    title: "Scheduling & Shifts",
    items: [
      { path: "/rostering", label: "Rostering", icon: Calendar },
      { path: "/roster-billing", label: "Roster Billing", icon: DollarSign },
      { path: "/timesheets", label: "Timesheets & Travel", icon: Clock },
      { path: "/shift-logger", label: "Shift Logger", icon: Play },
      { path: "/progress-notes", label: "Progress Notes", icon: FileText },
      { path: "/travel-guide", label: "Travel Guide Generator", icon: Navigation },
    ],
  },
  {
    title: "Health & Medication",
    items: [
      { path: "/medications", label: "Medication Dashboard", icon: Pill },
      { path: "/medication-hub", label: "Medication Forms Hub", icon: ClipboardList },
      { path: "/epilepsy-plans", label: "Epilepsy Plans", icon: Brain },
      { path: "/health-care-plans", label: "Health Support Plans", icon: Heart },
      { path: "/implementation-programs", label: "Implementation Programs", icon: Activity },
    ],
  },
  {
    title: "Behaviour Support",
    items: [
      { path: "/behaviour-continuum", label: "Behaviour Continuum", icon: BarChart3 },
      { path: "/behaviour-support-plans", label: "Behaviour Support Plans", icon: Brain },
      { path: "/positive-behaviour-support-plans", label: "PBS Plans", icon: Heart },
    ],
  },
  {
    title: "Compliance & Safety",
    items: [
      { path: "/staff", label: "Staff & Compliance", icon: ShieldCheck },
      { path: "/risk-assessments", label: "Risk Assessments", icon: AlertTriangle },
      { path: "/incidents", label: "Incidents", icon: Flame },
      { path: "/audit-checklists", label: "Audit Checklists", icon: CheckSquare },
      { path: "/complaints", label: "Complaints Register", icon: MessageSquareWarning },
      { path: "/restrictive-practices", label: "Restrictive Practices", icon: ShieldAlert },
    ],
  },
  {
    title: "Finance & Billing",
    items: [
      { path: "/finance", label: "Finance Centre", icon: DollarSign },
      { path: "/staff-portal", label: "My Staff Portal", icon: UserCircle },
      { path: "/payslips", label: "Payslip Generator", icon: Banknote },
      { path: "/invoices", label: "Invoices & Claims", icon: Receipt },
      { path: "/quotes", label: "Quotes", icon: FileText },
      { path: "/support-plans", label: "Support Plans", icon: ClipboardList },
      { path: "/service-agreements", label: "Service Agreements", icon: FileText },
    ],
  },
  {
    title: "Documents & Templates",
    items: [
      { path: "/templates", label: "Templates", icon: BookTemplate },
      { path: "/links", label: "Links", icon: Link2 },
    ],
  },
  {
    title: "Security & Backup",
    items: [
      { path: "/audit-log", label: "Activity Audit Log", icon: Shield },
      { path: "/data-export", label: "Data Backup & Export", icon: Database },
    ],
  },
  {
    title: "System",
    items: [
      { path: "/user-guide", label: "User Guide", icon: BookOpen },
      { path: "/policy-manual", label: "Policy & Compliance Manual", icon: ClipboardList },
      { path: "/nav-admin", label: "Menu Permissions", icon: Settings },
      { path: "/toby", label: "Toby's Profile", icon: UserCircle },
      { path: "/jeffrey", label: "Jeffrey's Profile", icon: UserCircle },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hiddenPaths, setHiddenPaths] = useState(null); // null = loading, [] = no restrictions

  useEffect(() => {
    async function loadPerms() {
      const me = await base44.auth.me();
      if (!me) { setHiddenPaths([]); return; }
      // Admins see everything
      if (me.role === "admin") { setHiddenPaths([]); return; }
      const perms = await base44.entities.NavPermissions.filter({ user_email: me.email });
      setHiddenPaths(perms?.[0]?.hidden_paths ?? []);
    }
    loadPerms();
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 pb-2">
          <img
            src="https://media.base44.com/images/public/69d54775d9a169daad84a133/641f2cf35_3cb3f155-51c2-49f0-993b-fc2df2583281.jpg"
            alt="SZ-JIE WANG Support Services"
            className="w-full max-w-[200px] mx-auto block"
          />
        </div>

        <nav className="flex-1 px-4 pb-4 overflow-y-auto space-y-6">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(item => !(hiddenPaths ?? []).includes(item.path));
            if (visibleItems.length === 0) return null;
            return (
            <div key={section.title}>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 mb-2">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  const isExternal = item.path.startsWith("EXTERNAL:");
                  const href = isExternal ? item.path.replace("EXTERNAL:", "") : `/dashboard${item.path}`;
                  const linkClass = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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
            </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="bg-secondary rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xs">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-foreground truncate">
                  Admin Manager
                </p>
                <p className="text-[10px] text-muted-foreground">
                  NSW Provider
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border px-4 lg:px-8 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary"
          >
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
              SZ
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}