import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
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
} from "lucide-react";

const NAV_SECTIONS = [
  {
    title: "Core Operations",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/participants", label: "Participants", icon: Users },
      { path: "/onboarding", label: "Onboarding Requests", icon: ClipboardCheck },
      { path: "/kpi", label: "KPI Dashboard", icon: BarChart3 },
    ],
  },
  {
    title: "Scheduling",
    items: [
      { path: "/rostering", label: "Rostering", icon: Calendar },
      { path: "/timesheets", label: "Timesheets & Travel", icon: Clock },
      { path: "/shift-logger", label: "Shift Logger", icon: Play },
      { path: "/progress-notes", label: "Progress Notes", icon: FileText },
    ],
  },
  {
    title: "Client Management",
    items: [
      { path: "/goal-tracking", label: "Goal Tracking", icon: Target },
      { path: "/document-vault", label: "Document Vault", icon: FolderOpen },
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
    title: "Finance",
    items: [
      { path: "/support-plans", label: "Support Plans", icon: ClipboardList },
      { path: "/service-agreements", label: "Service Agreements", icon: FileText },
      { path: "/invoices", label: "Invoices & Claims", icon: Receipt },
      { path: "/quotes", label: "Quotes", icon: FileText },
    ],
  },
  {
    title: "Team",
    items: [
      { path: "/toby", label: "Toby's Profile", icon: UserCircle },
    ],
  },
  {
    title: "Stationery",
    items: [
      { path: "/stationery", label: "Templates & Stationery", icon: BookTemplate },
    ],
  },
  {
    title: "AI & Intelligence",
    items: [
      { path: "/ai-reports", label: "AI Report Centre", icon: Zap },
    ],
  },
  {
    title: "System",
    items: [
      { path: "/participant-portal", label: "Participant Portal", icon: UserCircle },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-foreground leading-none">
                NDIS PRO
              </h1>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Enterprise 2026
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 pb-4 overflow-y-auto space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 mb-2">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
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