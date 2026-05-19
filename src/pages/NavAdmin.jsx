import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, ChevronDown, ChevronRight, Eye, EyeOff, Save, Check } from "lucide-react";
import { toast } from "sonner";

// All nav items mirrored from Layout
const ALL_NAV_SECTIONS = [
  {
    title: "Dashboard",
    items: [
      { path: "/", label: "Dashboard" },
      { path: "/kpi", label: "KPI Dashboard" },
      { path: "/ai-reports", label: "AI Report Centre" },
    ],
  },
  {
    title: "Participants",
    items: [
      { path: "/participants", label: "Participants" },
      { path: "/onboarding", label: "Onboarding" },
      { path: "/goal-tracking", label: "Goal Tracking" },
      { path: "/document-vault", label: "Document Vault" },
      { path: "EXTERNAL:/participant-portal", label: "Participant Portal" },
    ],
  },
  {
    title: "Scheduling & Shifts",
    items: [
      { path: "/rostering", label: "Rostering" },
      { path: "/timesheets", label: "Timesheets & Travel" },
      { path: "/shift-logger", label: "Shift Logger" },
      { path: "/progress-notes", label: "Progress Notes" },
      { path: "/travel-guide", label: "Travel Guide Generator" },
    ],
  },
  {
    title: "Health & Medication",
    items: [
      { path: "/medications", label: "Medication Dashboard" },
      { path: "/medication-hub", label: "Medication Forms Hub" },
      { path: "/epilepsy-plans", label: "Epilepsy Plans" },
      { path: "/health-care-plans", label: "Health Support Plans" },
      { path: "/implementation-programs", label: "Implementation Programs" },
    ],
  },
  {
    title: "Behaviour Support",
    items: [
      { path: "/behaviour-continuum", label: "Behaviour Continuum" },
      { path: "/behaviour-support-plans", label: "Behaviour Support Plans" },
      { path: "/positive-behaviour-support-plans", label: "PBS Plans" },
    ],
  },
  {
    title: "Compliance & Safety",
    items: [
      { path: "/staff", label: "Staff & Compliance" },
      { path: "/risk-assessments", label: "Risk Assessments" },
      { path: "/incidents", label: "Incidents" },
      { path: "/audit-checklists", label: "Audit Checklists" },
      { path: "/complaints", label: "Complaints Register" },
      { path: "/restrictive-practices", label: "Restrictive Practices" },
    ],
  },
  {
    title: "Finance & Billing",
    items: [
      { path: "/finance", label: "Finance Centre" },
      { path: "/invoices", label: "Invoices & Claims" },
      { path: "/quotes", label: "Quotes" },
      { path: "/support-plans", label: "Support Plans" },
      { path: "/service-agreements", label: "Service Agreements" },
    ],
  },
  {
    title: "Documents & Templates",
    items: [
      { path: "/stationery", label: "Templates & Stationery" },
      { path: "/email-templates", label: "Email Templates" },
      { path: "/links", label: "Links" },
    ],
  },
  {
    title: "System",
    items: [
      { path: "/policy-manual", label: "Policy & Compliance Manual" },
      { path: "/toby", label: "Toby's Profile" },
      { path: "/jeffrey", label: "Jeffrey's Profile" },
      { path: "/settings", label: "Settings" },
    ],
  },
];

export default function NavAdmin() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState({}); // keyed by user_email
  const [expandedUser, setExpandedUser] = useState(null);
  const [saving, setSaving] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [allUsers, allPerms] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.NavPermissions.list(),
      ]);
      setUsers(allUsers);
      // Build a map: email -> { id, hidden_paths }
      const map = {};
      allPerms.forEach(p => {
        map[p.user_email] = p;
      });
      setPermissions(map);
      setLoading(false);
    }
    load();
  }, []);

  function isHidden(email, path) {
    return permissions[email]?.hidden_paths?.includes(path) ?? false;
  }

  function togglePath(email, path) {
    setPermissions(prev => {
      const current = prev[email]?.hidden_paths ?? [];
      const updated = current.includes(path)
        ? current.filter(p => p !== path)
        : [...current, path];
      return {
        ...prev,
        [email]: { ...prev[email], hidden_paths: updated, user_email: email },
      };
    });
  }

  function toggleSection(email, sectionItems) {
    const paths = sectionItems.map(i => i.path);
    setPermissions(prev => {
      const current = prev[email]?.hidden_paths ?? [];
      const allHidden = paths.every(p => current.includes(p));
      const updated = allHidden
        ? current.filter(p => !paths.includes(p))
        : [...new Set([...current, ...paths])];
      return {
        ...prev,
        [email]: { ...prev[email], hidden_paths: updated, user_email: email },
      };
    });
  }

  async function saveUser(email, name) {
    setSaving(email);
    const existing = permissions[email];
    const hidden = existing?.hidden_paths ?? [];

    if (existing?.id) {
      await base44.entities.NavPermissions.update(existing.id, { hidden_paths: hidden, user_name: name });
    } else {
      const created = await base44.entities.NavPermissions.create({ user_email: email, user_name: name, hidden_paths: hidden });
      setPermissions(prev => ({ ...prev, [email]: { ...prev[email], id: created.id } }));
    }
    setSaving(null);
    toast.success(`Permissions saved for ${name || email}`);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Menu Permissions</h2>
        <p className="text-muted-foreground text-sm">Control which navigation items each staff user can see. Hidden items are removed from their sidebar.</p>
      </div>

      <div className="space-y-3">
        {users.map(user => {
          const isOpen = expandedUser === user.email;
          const hiddenCount = permissions[user.email]?.hidden_paths?.length ?? 0;

          return (
            <div key={user.email} className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* User Row */}
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/50 transition text-left"
                onClick={() => setExpandedUser(isOpen ? null : user.email)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                    {(user.full_name || user.email)?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{user.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hiddenCount > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                      {hiddenCount} hidden
                    </span>
                  )}
                  <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full capitalize">
                    {user.role}
                  </span>
                  {isOpen ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded Panel */}
              {isOpen && (
                <div className="border-t border-border px-6 py-5 space-y-5">
                  {ALL_NAV_SECTIONS.map(section => {
                    const allHidden = section.items.every(i => isHidden(user.email, i.path));
                    const someHidden = section.items.some(i => isHidden(user.email, i.path));

                    return (
                      <div key={section.title}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{section.title}</p>
                          <button
                            onClick={() => toggleSection(user.email, section.items)}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            {allHidden ? "Show All" : "Hide All"}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {section.items.map(item => {
                            const hidden = isHidden(user.email, item.path);
                            return (
                              <button
                                key={item.path}
                                onClick={() => togglePath(user.email, item.path)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition text-left ${
                                  hidden
                                    ? "bg-secondary text-muted-foreground border-border line-through opacity-60"
                                    : "bg-primary/5 text-primary border-primary/20"
                                }`}
                              >
                                {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-3 border-t border-border flex justify-end">
                    <button
                      onClick={() => saveUser(user.email, user.full_name)}
                      disabled={saving === user.email}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition disabled:opacity-60"
                    >
                      {saving === user.email ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      Save Permissions
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}