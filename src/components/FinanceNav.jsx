import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, ListChecks, BarChart3, FileText, DollarSign } from "lucide-react";

const FINANCE_PAGES = [
  { path: "/weekly-tasks", label: "Weekly Tasks", icon: ListChecks, desc: "Step-by-step wizard" },
  { path: "/roster-billing", label: "Invoices & Payslips", icon: DollarSign, desc: "Generate from shifts" },
  { path: "/finance", label: "Finance Centre", icon: FileText, desc: "Invoice tracker, receipts, BAS" },
  { path: "/financial-reports", label: "Financial Reports", icon: BarChart3, desc: "BAS & accountant reports" },
];

export default function FinanceNav() {
  const location = useLocation();
  const currentPath = location.pathname.replace("/dashboard", "");

  return (
    <div className="bg-card border border-border rounded-2xl p-3 mb-2">
      <div className="flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 shrink-0 hidden sm:block">Finance Hub</span>
        {FINANCE_PAGES.map((page, i) => {
          const isActive = currentPath === page.path;
          const Icon = page.icon;
          return (
            <div key={page.path} className="flex items-center gap-1.5 shrink-0">
              {i > 0 && <span className="text-muted-foreground/40 text-xs">→</span>}
              <Link
                to={`/dashboard${page.path}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {isActive ? <CheckCircle2 size={13} /> : <Icon size={13} />}
                <span>{page.label}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}