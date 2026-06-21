import { format, parseISO } from "date-fns";
import { calcPayPeriodDeductions, TAX_STATUS_LABELS } from "@/utils/taxCalc";

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

// record shape: { payslip_number, staff_name, pay_period, date_from, date_to, line_items, bank_* fields }
export default function PayslipPreview({ record, staffMember }) {
  const lines = record.line_items || [];
  const lineTotal = (l) => parseFloat(l.unit_price || 0) * parseFloat(l.qty || 0);
  const subtotal = lines.reduce((a, l) => a + lineTotal(l), 0);

  // Use tax status from live staffMember data, fall back to saved record
  const taxStatus = staffMember?.tax_status || record.tax_status || "resident_with_threshold";
  const medicareExemption = staffMember?.medicare_exemption || record.medicare_exemption || false;

  const { tax, medicare, super: superAmt, net: netPay } = calcPayPeriodDeductions(
    subtotal,
    record.pay_period || "fortnightly",
    taxStatus,
    medicareExemption
  );

  const totalDeductions = tax + medicare + superAmt;
  const emp = getEmployer(record.date_from);

  // Bank details: prefer live staffMember data, fall back to saved record fields
  const bank = {
    bank_name: staffMember?.bank_name || record.bank_name,
    bank_account_name: staffMember?.bank_account_name || record.bank_account_name,
    bank_bsb: staffMember?.bank_bsb || record.bank_bsb,
    bank_account_number: staffMember?.bank_account_number || record.bank_account_number,
  };

  const taxLabel = TAX_STATUS_LABELS[taxStatus] || taxStatus;

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

      {/* Tax / Super / Net — 2 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px", fontSize: "10px" }}>
        {/* Deductions */}
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#fff1f2", padding: "4px 8px", borderBottom: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: "8px", textTransform: "uppercase", color: "#be123c" }}>Deductions</p>
          </div>
          <div style={{ padding: "6px 8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}><span style={{ color: "#64748b" }}>Tax (PAYG)</span><span style={{ fontWeight: 700, color: "#e11d48" }}>– ${tax.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}><span style={{ color: "#64748b" }}>Medicare Levy</span><span style={{ fontWeight: 700, color: "#e11d48" }}>– ${medicare.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}><span style={{ color: "#64748b" }}>Superannuation (12%)</span><span style={{ fontWeight: 700, color: "#2563eb" }}>– ${superAmt.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "3px" }}><span style={{ fontWeight: 900, color: "#475569" }}>Total Deductions</span><span style={{ fontWeight: 900, color: "#be123c" }}>– ${totalDeductions.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Net Pay */}
        <div style={{ backgroundColor: "#1e3a5f", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ margin: "0 0 2px 0", fontSize: "8px", fontWeight: 900, textTransform: "uppercase", color: "#93c5fd" }}>Gross Pay</p>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: 700, color: "#cbd5e1" }}>${subtotal.toFixed(2)}</p>
          <p style={{ margin: "0 0 2px 0", fontSize: "8px", fontWeight: 900, textTransform: "uppercase", color: "#93c5fd" }}>Less Deductions</p>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: 700, color: "#fca5a5" }}>– ${totalDeductions.toFixed(2)}</p>
          <div style={{ borderTop: "1px solid #334d6e", paddingTop: "8px" }}>
            <p style={{ margin: "0 0 2px 0", fontSize: "8px", fontWeight: 900, textTransform: "uppercase", color: "#93c5fd" }}>Net Pay</p>
            <p style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: "white" }}>${netPay.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* ABN Contractor notice OR Tax Declaration Badge */}
      {taxStatus === "abn_contractor" ? (
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "8px 12px", marginBottom: "10px", fontSize: "10px", color: "#92400e" }}>
          <strong>⚠️ ABN Contractor</strong> — This worker is engaged under their own ABN. Tax, Medicare and Super are <strong>not withheld</strong>. The contractor manages their own ATO obligations.
        </div>
      ) : (
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "6px 10px", marginBottom: "10px", fontSize: "9px", color: "#475569" }}>
          <strong>Tax Declaration:</strong> {taxLabel} · <strong>ATO 2025–26 rates</strong> · LITO applied where eligible
          {medicareExemption && " · Medicare Levy Exemption applied"}
        </div>
      )}

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
        <p style={{ margin: 0 }}>Tax calculated on ATO 2025–26 rates · {taxLabel} · LITO applied where eligible · Medicare levy with low-income threshold · SGC 12% employer contribution. This payslip is computer-generated by SZ-Jie Support Services management system.</p>
      </div>
    </div>
  );
}