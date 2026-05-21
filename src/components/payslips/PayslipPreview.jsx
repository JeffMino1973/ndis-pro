import { format, parseISO } from "date-fns";

const EMPLOYER_OLD = {
  name: "SZ-Jie Wang",
  abn: "44 833 193 250",
  address: "309/12 Broome St, Waterloo NSW 2017",
  email: "Toby7796@gmail.com",
  phone: "0435 951 563",
};
const EMPLOYER_NEW = {
  name: "SZ-Jie Support Services",
  abn: "86 959 042 971",
  address: "309/12 Broome St, Waterloo NSW 2017",
  email: "jeff@szjiesupportservices@gmail.com",
  phone: "0401 343 876",
};
const CHANGEOVER_DATE = "2026-05-17";

export function getEmployer(dateFrom) {
  if (!dateFrom) return EMPLOYER_NEW;
  return dateFrom < CHANGEOVER_DATE ? EMPLOYER_OLD : EMPLOYER_NEW;
}

function calcAnnualTax(a) {
  if (a <= 18200) return 0;
  if (a <= 45000) return (a - 18200) * 0.19;
  if (a <= 135000) return 5092 + (a - 45000) * 0.325;
  if (a <= 190000) return 34204 + (a - 135000) * 0.37;
  return 54630 + (a - 190000) * 0.45;
}
function calcLITO(a) {
  if (a <= 37500) return 700;
  if (a <= 45000) return 700 - (a - 37500) * 0.05;
  if (a <= 66667) return 325 - (a - 45000) * 0.015;
  return 0;
}
const PERIODS = { weekly: 52, fortnightly: 26, monthly: 12 };
function periodTax(gross, payPeriod) {
  const periodsPerYear = PERIODS[payPeriod] || 26;
  const ann = gross * periodsPerYear;
  const tax = Math.max(0, calcAnnualTax(ann) - Math.max(0, calcLITO(ann)));
  const med = ann * 0.02;
  return { tax: tax / periodsPerYear, medicare: med / periodsPerYear };
}

// record shape: { payslip_number, staff_name, pay_period, date_from, date_to, line_items, bank_* fields, employer_name }
export default function PayslipPreview({ record, staffMember }) {
  const lines = record.line_items || [];
  const lineTotal = (l) => parseFloat(l.unit_price || 0) * parseFloat(l.qty || 0);
  const subtotal = lines.reduce((a, l) => a + lineTotal(l), 0);
  const { tax, medicare } = periodTax(subtotal, record.pay_period || "fortnightly");
  const superAmt = subtotal * 0.12;
  const totalDeductions = tax + medicare;
  const netPay = Math.max(0, subtotal - totalDeductions);
  const emp = getEmployer(record.date_from);

  // Bank details: prefer live staffMember data, fall back to saved record fields
  const bank = {
    bank_name: staffMember?.bank_name || record.bank_name,
    bank_account_name: staffMember?.bank_account_name || record.bank_account_name,
    bank_bsb: staffMember?.bank_bsb || record.bank_bsb,
    bank_account_number: staffMember?.bank_account_number || record.bank_account_number,
  };

  return (
    <div id="payslip-printable" style={{ fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#1e293b", background: "white", padding: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1e3a5f", paddingBottom: "10px", marginBottom: "12px" }}>
        <div>
          <p style={{ fontWeight: 900, fontSize: "14px", margin: 0 }}>{emp.name}</p>
          <p style={{ margin: "2px 0", color: "#475569" }}>ABN: {emp.abn}</p>
          <p style={{ margin: "2px 0", color: "#475569" }}>{emp.address}</p>
          <p style={{ margin: "2px 0", color: "#475569" }}>{emp.email} · {emp.phone}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 900, margin: 0, color: "#1e3a5f" }}>PAYSLIP</h1>
          <p style={{ margin: "2px 0", color: "#475569" }}>#{record.payslip_number}</p>
          <p style={{ margin: "2px 0", fontWeight: 700 }}>{record.staff_name}</p>
          <p style={{ margin: "2px 0", color: "#64748b" }}>{record.date_from} → {record.date_to}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginBottom: "4px" }}>
        <thead>
          <tr style={{ backgroundColor: "#1e3a5f" }}>
            {["Date", "Time", "Item Number", "Description", "Unit Price", "Qty (hrs)", "Line Total"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "white", fontWeight: 700, fontSize: "10px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff" }}>
              <td style={{ padding: "5px 8px", color: "#475569" }}>{l.date ? format(parseISO(l.date), "dd/MM/yy") : "—"}</td>
              <td style={{ padding: "5px 8px", color: "#475569" }}>{l.time || "—"}</td>
              <td style={{ padding: "5px 8px", fontFamily: "monospace", color: "#334155" }}>{l.item_code}</td>
              <td style={{ padding: "5px 8px", color: "#334155" }}>{l.description}</td>
              <td style={{ padding: "5px 8px", textAlign: "right" }}>${parseFloat(l.unit_price || 0).toFixed(2)}</td>
              <td style={{ padding: "5px 8px", textAlign: "right" }}>{l.qty}</td>
              <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 700 }}>${lineTotal(l).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Subtotal box */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <div style={{ width: "200px", border: "1px solid #e2e8f0", borderRadius: "0 0 8px 8px", overflow: "hidden", fontSize: "10px" }}>
          {[{ label: "Subtotal", value: subtotal }, { label: "GST", value: 0 }, { label: "Gross Pay", value: subtotal, bold: true }].map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 12px", backgroundColor: r.bold ? "#f1f5f9" : "white", fontWeight: r.bold ? 900 : "normal", borderBottom: r.bold ? "none" : "1px solid #f1f5f9" }}>
              <span style={{ color: "#64748b" }}>{r.label}</span>
              <span>${r.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tax / Super / Net — 4 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "12px", fontSize: "10px" }}>
        {/* Deductions */}
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#eff6ff", padding: "4px 8px", borderBottom: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: "8px", textTransform: "uppercase", color: "#1d4ed8" }}>Deductions</p>
          </div>
          <div style={{ padding: "6px 8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}><span style={{ color: "#64748b" }}>Tax</span><span style={{ fontWeight: 700, color: "#e11d48" }}>– ${tax.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}><span style={{ color: "#64748b" }}>Medicare</span><span style={{ fontWeight: 700, color: "#e11d48" }}>– ${medicare.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "3px" }}><span style={{ fontWeight: 900, color: "#475569" }}>Total</span><span style={{ fontWeight: 900, color: "#be123c" }}>– ${totalDeductions.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Super */}
        <div style={{ border: "1px solid #bfdbfe", borderRadius: "8px", overflow: "hidden", backgroundColor: "#eff6ff" }}>
          <div style={{ backgroundColor: "#dbeafe", padding: "4px 8px", borderBottom: "1px solid #bfdbfe" }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: "8px", textTransform: "uppercase", color: "#1d4ed8" }}>Super</p>
          </div>
          <div style={{ padding: "6px 8px" }}>
            <p style={{ margin: 0, fontWeight: 900, color: "#1e40af", fontSize: "12px" }}>${superAmt.toFixed(2)}</p>
            <p style={{ margin: 0, fontSize: "7px", color: "#3b82f6" }}>12% SGC</p>
          </div>
        </div>

        {/* Net Pay */}
        <div style={{ backgroundColor: "#1e3a5f", borderRadius: "8px", padding: "8px" }}>
          <p style={{ margin: "0 0 2px 0", fontSize: "8px", fontWeight: 900, textTransform: "uppercase", color: "#93c5fd" }}>Net Pay</p>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "white" }}>${netPay.toFixed(2)}</p>
        </div>

        {/* Summary */}
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px", fontSize: "8px", color: "#475569" }}>
          <p style={{ margin: "0 0 2px 0" }}><strong>Gross:</strong> ${subtotal.toFixed(2)}</p>
          <p style={{ margin: "0 0 2px 0" }}><strong>Tax:</strong> ${tax.toFixed(2)}</p>
          <p style={{ margin: 0 }}><strong>Medicare:</strong> ${medicare.toFixed(2)}</p>
        </div>
      </div>

      {/* Bank Details */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px", backgroundColor: "#f8fafc", marginBottom: "10px", fontSize: "10px" }}>
        <p style={{ margin: "0 0 6px 0", fontWeight: 900, fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>Payment Details</p>
        {bank.bank_bsb || bank.bank_name ? (
          <div style={{ color: "#334155", lineHeight: "1.6" }}>
            <p style={{ margin: 0 }}>Please make payment to:</p>
            {bank.bank_name && <p style={{ margin: 0 }}><strong>Bank:</strong> {bank.bank_name}</p>}
            {bank.bank_account_name && <p style={{ margin: 0 }}><strong>Account Name:</strong> {bank.bank_account_name}</p>}
            {bank.bank_bsb && <p style={{ margin: 0 }}><strong>BSB:</strong> {bank.bank_bsb}</p>}
            {bank.bank_account_number && <p style={{ margin: 0 }}><strong>Account:</strong> {bank.bank_account_number}</p>}
          </div>
        ) : (
          <p style={{ margin: 0, color: "#94a3b8", fontStyle: "italic" }}>No bank details on file for {record.staff_name}.</p>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "6px", fontSize: "7px", color: "#94a3b8" }}>
        <p style={{ margin: 0 }}>Tax calculated on ATO 2025–26 resident rates with LITO. Superannuation 12% per SGC. This payslip is computer-generated by SZ-Jie Support Services management system.</p>
      </div>
    </div>
  );
}