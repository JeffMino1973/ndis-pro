export default function StatCard({ icon: Icon, label, value, color = "primary", iconBg }) {
  const bgMap = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${bgMap[color] || bgMap.primary}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-black text-foreground">{value}</p>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}