import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, FileText, Loader2, Calculator } from "lucide-react";
import { format, differenceInMinutes, parseISO, isWithinInterval } from "date-fns";

// ATO 2025-26 tax calculation
function calcAnnualTax(annual) {
  if (annual <= 18200) return 0;
  if (annual <= 45000) return (annual - 18200) * 0.19;
  if (annual <= 135000) return 5092 + (annual - 45000) * 0.325;
  if (annual <= 190000) return 34204 + (annual - 135000) * 0.37;
  return 54630 + (annual - 190000) * 0.45;
}

function calcLITO(annual) {
  if (annual <= 37500) return 700;
  if (annual <= 45000) return 700 - (annual - 37500) * 0.05;
  if (annual <= 66667) return 325 - (annual - 45000) * 0.015;
  return 0;
}

function calcTaxForPeriod(gross, periodsPerYear) {
  const annual = gross * periodsPerYear;
  const annualTax = Math.max(0, calcAnnualTax(annual) - Math.max(0, calcLITO(annual)));
  const medicare = annual * 0.02;
  return (annualTax + medicare) / periodsPerYear;
}

function hoursFromTimes(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(0, mins / 60);
}

const LOGO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/641f2cf35_3cb3f155-51c2-49f0-993b-fc2df2583281.jpg";

export default function Payslips() {
  const [staff, setStaff] = useState([]);
  const [allShifts, setAllShifts] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [payslip, setPayslip] = useState(null);

  const today = new Date();
  const [staffName, setStaffName] = useState("");
  const [dateFrom, setDateFrom] = useState(format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(today, "yyyy-MM-dd"));
  const [hourlyRate, setHourlyRate] = useState(35);
  const [payPeriod, setPayPeriod] = useState("fortnightly"); // weekly | fortnightly | monthly

  const periodsPerYear = { weekly: 52, fortnightly: 26, monthly: 12 }[payPeriod];

  useEffect(() => {
    async function load() {
      const [s, sh, inv] = await Promise.all([
        base44.entities.StaffMember.list(),
        base44.entities.Shift.list("-date"),
        base44.entities.Invoice.list("-created_date"),
      ]);
      setStaff(s);
      setAllShifts(sh);
      setAllInvoices(inv);
      setLoading(false);
    }
    load();
  }, []);

  const generate = () => {
    if (!staffName) return;
    setGenerating(true);

    const from = parseISO(dateFrom);
    const to = parseISO(dateTo);

    // Completed shifts for this staff in period
    const completedShifts = allShifts.filter(s =>
      s.staff_name === staffName &&
      s.status === "Completed" &&
      s.date &&
      isWithinInterval(parseISO(s.date), { start: from, end: to })
    );

    // Invoices linked to this staff (by participant names from completed shifts)
    const participantNames = [...new Set(completedShifts.map(s => s.participant_name))];
    const relatedInvoices = allInvoices.filter(inv => {
      const pName = inv.participant_name || "";
      return participantNames.some(p => pName.toLowerCase().includes(p.toLowerCase()));
    });

    // Calculate hours & gross from completed shifts
    const shiftDetails = completedShifts.map(s => {
      const hours = hoursFromTimes(s.start_time, s.end_time);
      const gross = hours * hourlyRate;
      return { ...s, hours, gross };
    });

    const totalHours = shiftDetails.reduce((a, s) => a + s.hours, 0);
    const grossPay = shiftDetails.reduce((a, s) => a + s.gross, 0);

    // Tax calculations
    const taxWithheld = calcTaxForPeriod(grossPay, periodsPerYear);
    const medicarePortion = (grossPay * periodsPerYear * 0.02) / periodsPerYear;
    const taxOnly = taxWithheld - medicarePortion;
    const superAmount = grossPay * 0.12;
    const netPay = grossPay - taxWithheld;

    setPayslip({
      staffName,
      dateFrom,
      dateTo,
      payPeriod,
      hourlyRate,
      shiftDetails,
      totalHours,
      grossPay,
      taxWithheld: Math.max(0, taxOnly),
      medicare: Math.max(0, medicarePortion),
      totalDeductions: Math.max(0, taxWithheld),
      superAmount,
      netPay: Math.max(0, netPay),
      relatedInvoices,
      generatedAt: new Date().toISOString(),
    });
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Payslip Generator</h2>
        <p className="text-muted-foreground text-sm">Auto-generates payslips from completed roster shifts with tax, super & Medicare.</p>
      </div>

      {/* Config Panel */}
      <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
        <h3 className="font-black text-lg flex items-center gap-2"><Calculator size={18} className="text-primary" /> Payslip Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Staff Member</Label>
            <Select value={staffName} onValueChange={setStaffName}>
              <SelectTrigger><SelectValue placeholder="Select staff..." /></SelectTrigger>
              <SelectContent>
                {staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Pay Period Type</Label>
            <Select value={payPeriod} onValueChange={setPayPeriod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Hourly Rate ($)</Label>
            <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">From Date</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">To Date</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
        <Button
          onClick={generate}
          disabled={!staffName || generating}
          className="rounded-xl font-bold gap-2 px-8"
        >
          {generating ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
          Generate Payslip
        </Button>
      </div>

      {/* Payslip Output */}
      {payslip && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
            <h3 className="font-black">Payslip Preview</h3>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 rounded-xl">
              <Printer size={14} /> Print / Save PDF
            </Button>
          </div>

          {/* Printable Payslip */}
          <div id="payslip-print" className="p-8 space-y-6 print:p-0">

            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <img src={LOGO} alt="SZ-Jie" className="h-14 mb-3" />
                <p className="text-xs text-muted-foreground">SZ-Jie Support Services</p>
                <p className="text-xs text-muted-foreground">ABN: 86 959 042 971</p>
                <p className="text-xs text-muted-foreground">309/12 Broome St, Waterloo NSW 2017</p>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-black text-foreground">PAYSLIP</h1>
                <p className="text-sm text-muted-foreground mt-1">Pay Period: <span className="font-bold capitalize">{payslip.payPeriod}</span></p>
                <p className="text-sm text-muted-foreground">From: <span className="font-bold">{format(parseISO(payslip.dateFrom), "d MMM yyyy")}</span></p>
                <p className="text-sm text-muted-foreground">To: <span className="font-bold">{format(parseISO(payslip.dateTo), "d MMM yyyy")}</span></p>
                <p className="text-xs text-muted-foreground mt-2">Generated: {format(new Date(payslip.generatedAt), "d MMM yyyy h:mm a")}</p>
              </div>
            </div>

            {/* Employee */}
            <div className="bg-secondary/50 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Employee</p>
              <p className="text-xl font-black text-foreground">{payslip.staffName}</p>
              <p className="text-sm text-muted-foreground">Disability Support Worker · Hourly Rate: ${payslip.hourlyRate.toFixed(2)}/hr</p>
            </div>

            {/* Shift Breakdown */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Completed Shifts ({payslip.shiftDetails.length})</p>
              {payslip.shiftDetails.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                  No completed shifts found for <strong>{payslip.staffName}</strong> between {format(parseISO(payslip.dateFrom), "d MMM")} – {format(parseISO(payslip.dateTo), "d MMM yyyy")}. Mark shifts as "Completed" in Rostering.
                </div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-secondary text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <th className="text-left px-3 py-2 rounded-l-lg">Date</th>
                      <th className="text-left px-3 py-2">Participant</th>
                      <th className="text-left px-3 py-2">Support Type</th>
                      <th className="text-left px-3 py-2">Time</th>
                      <th className="text-right px-3 py-2">Hours</th>
                      <th className="text-right px-3 py-2 rounded-r-lg">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payslip.shiftDetails.map((s, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2.5 text-muted-foreground">{format(parseISO(s.date), "EEE d MMM")}</td>
                        <td className="px-3 py-2.5 font-medium">{s.participant_name}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{s.support_type || "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{s.start_time}–{s.end_time}</td>
                        <td className="px-3 py-2.5 text-right font-bold">{s.hours.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right font-bold">${s.gross.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-secondary/30">
                      <td colSpan={4} className="px-3 py-2 font-black text-right text-muted-foreground text-xs uppercase tracking-widest">Total</td>
                      <td className="px-3 py-2 text-right font-black">{payslip.totalHours.toFixed(2)} hrs</td>
                      <td className="px-3 py-2 text-right font-black">${payslip.grossPay.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Pay Summary */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="border border-border rounded-2xl overflow-hidden">
                <div className="bg-emerald-50 border-b border-border px-4 py-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Earnings</p>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ordinary Hours ({payslip.totalHours.toFixed(2)} hrs @ ${payslip.hourlyRate}/hr)</span>
                    <span className="font-bold">${payslip.grossPay.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-black">
                    <span>Gross Pay</span>
                    <span className="text-emerald-600">${payslip.grossPay.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-border rounded-2xl overflow-hidden">
                <div className="bg-rose-50 border-b border-border px-4 py-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">Deductions (ATO 2025–26)</p>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income Tax Withheld</span>
                    <span className="font-bold text-rose-600">– ${payslip.taxWithheld.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medicare Levy (2%)</span>
                    <span className="font-bold text-rose-600">– ${payslip.medicare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-black">
                    <span>Total Deductions</span>
                    <span className="text-rose-600">– ${payslip.totalDeductions.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay + Super */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-primary text-primary-foreground rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-70">Net Pay (Take Home)</p>
                  <p className="text-3xl font-black mt-1">${payslip.netPay.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <FileText size={22} />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600">Superannuation (12%)</p>
                  <p className="text-3xl font-black text-blue-700 mt-1">${payslip.superAmount.toFixed(2)}</p>
                  <p className="text-xs text-blue-500 mt-1">Employer contribution — paid separately</p>
                </div>
              </div>
            </div>

            {/* Summary row */}
            <div className="bg-secondary/50 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
              {[
                { label: "Gross Pay", value: "$" + payslip.grossPay.toFixed(2), color: "text-foreground" },
                { label: "Tax Withheld", value: "– $" + payslip.taxWithheld.toFixed(2), color: "text-rose-600" },
                { label: "Medicare Levy", value: "– $" + payslip.medicare.toFixed(2), color: "text-rose-600" },
                { label: "Net Pay", value: "$" + payslip.netPay.toFixed(2), color: "text-emerald-600" },
              ].map(item => (
                <div key={item.label}>
                  <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Linked Invoices */}
            {payslip.relatedInvoices.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Linked Invoices ({payslip.relatedInvoices.length})</p>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-secondary text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <th className="text-left px-3 py-2 rounded-l-lg">Invoice #</th>
                      <th className="text-left px-3 py-2">Participant</th>
                      <th className="text-left px-3 py-2">Date</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-right px-3 py-2 rounded-r-lg">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payslip.relatedInvoices.map((inv, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2.5 font-bold">{inv.invoice_number || "—"}</td>
                        <td className="px-3 py-2.5">{inv.participant_name}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{inv.issue_date || inv.date || "—"}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${inv.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold">${parseFloat(inv.total || inv.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-border pt-4 text-xs text-muted-foreground">
              <p>Tax calculations based on ATO 2025–26 resident tax rates with LITO applied. Superannuation is 12% of ordinary time earnings as per SGC. This payslip is computer-generated by SZ-Jie Support Services management system.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}