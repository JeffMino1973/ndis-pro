import { useState, useMemo } from "react";
import { BarChart3, DollarSign, Clock, FileText, TrendingDown, Loader2 } from "lucide-react";

export default function SpendingTracker({ invoices, participant }) {
  const [statusFilter, setStatusFilter] = useState("all");

  // Flatten all invoice line items into a unified list
  const allLineItems = useMemo(() => {
    const items = [];
    (invoices || []).forEach(inv => {
      const statusOk = statusFilter === "all" || inv.status === statusFilter;
      if (!statusOk) return;
      (inv.line_items || []).forEach(li => {
        items.push({
          invoice_number: inv.invoice_number || "—",
          invoice_status: inv.status || "Draft",
          issue_date: inv.issue_date || "—",
          support_item_code: li.support_item_code || "—",
          description: li.description || "—",
          hours: parseFloat(li.hours) || 0,
          rate: parseFloat(li.rate) || 0,
          amount: parseFloat(li.amount) || 0,
          date: li.date || inv.issue_date || "—",
        });
      });
    });
    return items;
  }, [invoices, statusFilter]);

  // Aggregate by support item code
  const byCode = useMemo(() => {
    const map = {};
    allLineItems.forEach(li => {
      const code = li.support_item_code;
      if (!map[code]) map[code] = { code, description: li.description, hours: 0, rate: 0, amount: 0, count: 0 };
      map[code].hours += li.hours;
      map[code].amount += li.amount;
      map[code].count++;
      // keep the latest non-zero rate
      if (li.rate > 0) map[code].rate = li.rate;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [allLineItems]);

  const totals = useMemo(() => ({
    hours: byCode.reduce((a, c) => a + c.hours, 0),
    amount: byCode.reduce((a, c) => a + c.amount, 0),
    invoices: new Set(allLineItems.map(li => li.invoice_number)).size,
    lineItems: allLineItems.length,
  }), [byCode, allLineItems]);

  const statusOptions = ["all", "Draft", "Sent", "Paid", "Overdue"];

  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <BarChart3 size={40} className="text-slate-300 mx-auto mb-3" />
        <h3 className="font-black text-slate-800 mb-1">No Spending Data Yet</h3>
        <p className="text-sm text-slate-500">Your NDIS spending will appear here once invoices are generated for you.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="bg-primary rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={20} />
          <h2 className="text-xl font-black">My NDIS Spending</h2>
        </div>
        <p className="text-primary-foreground/80 text-sm">
          Track your NDIS line item usage, total hours delivered, and total spend across all invoices.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <DollarSign size={16} className="text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-black text-emerald-600">${totals.amount.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Spend</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <Clock size={16} className="text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-black text-blue-600">{totals.hours.toFixed(1)}</p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Hours</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <FileText size={16} className="text-violet-600 mx-auto mb-1" />
          <p className="text-2xl font-black text-violet-600">{totals.invoices}</p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Invoices</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <BarChart3 size={16} className="text-amber-600 mx-auto mb-1" />
          <p className="text-2xl font-black text-amber-600">{byCode.length}</p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Line Items</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Invoice Status:</span>
        {statusOptions.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
              statusFilter === s
                ? "bg-primary text-white shadow"
                : "bg-white border border-slate-200 text-slate-600 hover:border-primary"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Spending table by line item code */}
      {byCode.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <TrendingDown size={32} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 italic">No line items match the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3 text-left">Support Item Code</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Rate ($/hr)</th>
                  <th className="px-4 py-3 text-right">Total Hours</th>
                  <th className="px-4 py-3 text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byCode.map(row => (
                  <tr key={row.code} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-black text-primary">{row.code}</td>
                    <td className="px-4 py-3 text-slate-700 text-xs">{row.description}</td>
                    <td className="px-4 py-3 text-right text-slate-600 text-xs">${row.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600 text-xs">{row.hours.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600 text-xs">${row.amount.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                  <td colSpan={3} className="px-4 py-3 font-black text-slate-800 text-xs uppercase tracking-widest text-right">Totals</td>
                  <td className="px-4 py-3 text-right font-black text-blue-700 text-sm">{totals.hours.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700 text-sm">${totals.amount.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed line items */}
      {allLineItems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
            <h3 className="font-black text-sm text-slate-700">Invoice Line Item Breakdown ({allLineItems.length})</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left">Date</th>
                  <th className="px-4 py-2.5 text-left">Invoice #</th>
                  <th className="px-4 py-2.5 text-left">Code</th>
                  <th className="px-4 py-2.5 text-left">Description</th>
                  <th className="px-4 py-2.5 text-right">Hours</th>
                  <th className="px-4 py-2.5 text-right">Rate</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allLineItems.map((li, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-xs text-slate-500">{li.date}</td>
                    <td className="px-4 py-2 text-xs font-bold text-slate-600">{li.invoice_number}</td>
                    <td className="px-4 py-2 font-mono text-[10px] font-bold text-primary">{li.support_item_code}</td>
                    <td className="px-4 py-2 text-xs text-slate-700 max-w-[200px] truncate">{li.description}</td>
                    <td className="px-4 py-2 text-right text-xs font-bold text-blue-600">{li.hours.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right text-xs text-slate-500">${li.rate.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-xs font-bold text-emerald-600">${li.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}