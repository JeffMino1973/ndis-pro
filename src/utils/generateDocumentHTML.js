import { getEmployer } from "@/components/payslips/PayslipPreview";
import { calcPayPeriodDeductions, TAX_STATUS_LABELS } from "@/utils/taxCalc";

const fmtDate = (d) => {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export function generateInvoiceHTML(invoice, config) {
  const lines = (invoice.line_items || []).map((l, i) => `
    <tr style="background:${i % 2 === 0 ? "#f8fafc" : "#fff"}">
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;white-space:nowrap">${fmtDate(l.date)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:11px">${l.support_item_code || "—"}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0">${l.description || ""}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right">$${(l.rate || 0).toFixed(2)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${l.hours || 0}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700">$${(l.amount || 0).toFixed(2)}</td>
    </tr>`).join("");

  const fillerRows = Array.from({ length: Math.max(0, 6 - (invoice.line_items || []).length) }).map(() => `
    <tr><td colspan="6" style="padding:12px 10px;border-bottom:1px solid #e2e8f0">&nbsp;</td></tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Invoice ${invoice.invoice_number}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#1e293b;max-width:700px;margin:0 auto;padding:28px;font-size:12px}
    h1{color:${config.brandColor || "#c0392b"};font-size:20px;border-bottom:3px solid ${config.brandColor || "#c0392b"};padding-bottom:6px;margin-bottom:4px}
    table{width:100%;border-collapse:collapse;margin-bottom:12px}
    th{background:${config.brandColor || "#c0392b"};color:white;padding:6px 10px;text-align:left;font-size:11px}
    td{font-size:11px}
    .total-row td{font-weight:900;background:#dbeafe!important}
    .meta{color:#475569;font-size:11px;margin-bottom:10px}
  </style></head><body>
    <h1>${config.businessName || "Provider Name"}</h1>
    <div class="meta">
      ${config.abn ? `<p>ABN: ${config.abn}</p>` : ""}
      ${config.address ? `<p>${config.address}</p>` : ""}
      ${config.email ? `<p style="color:#2563eb">${config.email}</p>` : ""}
      ${config.phone ? `<p>${config.phone}</p>` : ""}
    </div>
    <p style="font-size:14px;font-weight:900;margin:16px 0 4px">INVOICE # ${invoice.invoice_number}</p>
    <p style="font-size:12px;margin:0 0 12px"><strong>Date:</strong> ${fmtDate(invoice.issue_date)}</p>
    <p style="font-weight:700;margin:12px 0 2px">To:</p>
    <p>${invoice.plan_manager_name || "—"}</p>
    ${invoice.plan_manager_email ? `<p style="color:#2563eb">${invoice.plan_manager_email}</p>` : ""}
    <p style="margin:12px 0"><strong>Customer:</strong> ${invoice.participant_name}</p>
    ${invoice.participant_ndis_number ? `<p><strong>NDIS:</strong> ${invoice.participant_ndis_number}</p>` : ""}
    <table>
      <thead><tr><th>Date</th><th>Item Number</th><th>Description</th><th style="text-align:right">Unit price</th><th style="text-align:center">Qty</th><th style="text-align:right">Line total</th></tr></thead>
      <tbody>
        ${lines}
        ${fillerRows}
      </tbody>
      <tfoot>
        <tr style="background:#fdf2f2"><td colspan="4"></td><td style="padding:6px 10px;text-align:right;font-weight:900;color:${config.brandColor || "#c0392b"}">Subtotal</td><td style="padding:6px 10px;text-align:right;font-weight:700">$${(invoice.subtotal || 0).toFixed(2)}</td></tr>
        <tr><td colspan="4"></td><td style="padding:6px 10px;text-align:right;font-weight:900;color:${config.brandColor || "#c0392b"}">GST</td><td style="padding:6px 10px;text-align:right">0.00</td></tr>
        <tr style="background:#fdf2f2"><td colspan="4"></td><td style="padding:6px 10px;text-align:right;font-weight:900;color:${config.brandColor || "#c0392b"}">Total</td><td style="padding:6px 10px;text-align:right;font-weight:900">$${(invoice.total || 0).toFixed(2)}</td></tr>
      </tfoot>
    </table>
    <div style="margin-top:16px">
      <p style="font-weight:700;margin-bottom:4px">Please make payment to:</p>
      ${config.bankName ? `<p>${config.bankName}</p>` : ""}
      ${config.accountName ? `<p>Account Name: ${config.accountName}</p>` : ""}
      ${config.bsb ? `<p>BSB: ${config.bsb}</p>` : ""}
      ${config.accountNumber ? `<p>Account: ${config.accountNumber}</p>` : ""}
    </div>
    ${invoice.notes ? `<div style="margin-top:16px;font-size:10px;color:#64748b"><p style="font-weight:700">Notes:</p><p>${invoice.notes}</p></div>` : ""}
  </body></html>`;
}

export function generatePayslipHTML(record, staffMember) {
  const emp = getEmployer(record.date_from);
  const lines = record.line_items || [];
  const lineTotal = (l) => parseFloat(l.unit_price || 0) * parseFloat(l.qty || 0);
  const subtotal = lines.reduce((a, l) => a + lineTotal(l), 0);
  const taxStatus = staffMember?.tax_status || record.tax_status || "resident_with_threshold";
  const medicareExemption = staffMember?.medicare_exemption || record.medicare_exemption || false;
  const { tax, medicare, super: superAmt, net: netPay } = calcPayPeriodDeductions(subtotal, record.pay_period || "fortnightly", taxStatus, medicareExemption);
  const totalHours = lines.reduce((a, l) => a + parseFloat(l.qty || 0), 0);

  const lineRows = lines.map((l, i) => `
    <tr style="background:${i % 2 === 0 ? "#f8fafc" : "#fff"}">
      <td style="padding:5px 8px;border-bottom:1px solid #e2e8f0">${l.date || ""}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e2e8f0">${l.time || ""}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e2e8f0;font-family:monospace">${l.item_code || ""}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e2e8f0">${l.description || ""}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e2e8f0;text-align:right">$${parseFloat(l.unit_price || 0).toFixed(2)}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e2e8f0;text-align:right">${l.qty || 0}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700">$${lineTotal(l).toFixed(2)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Payslip ${record.payslip_number}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#1e293b;padding:24px;font-size:11px}
    h1{color:#1e3a5f;font-size:18px;border-bottom:3px solid #1e3a5f;padding-bottom:6px;margin-bottom:4px}
    h2{color:#1e3a5f;font-size:10px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:.06em;border-left:4px solid #1e3a5f;padding-left:6px}
    table{width:100%;border-collapse:collapse;margin-bottom:10px}
    th{background:#1e3a5f;color:white;padding:5px 8px;font-size:10px;text-align:left}
    td{padding:5px 8px;border-bottom:1px solid #e2e8f0;font-size:10px}
    .total-row td{font-weight:900;background:#dbeafe!important;color:#1e3a5f}
    .meta{font-size:10px;color:#475569;margin-bottom:10px}
    .summary{display:flex;gap:24px;background:#f0f9ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 14px;margin:10px 0}
    .summary-item{text-align:center}
    .summary-item .val{font-weight:900;font-size:14px;color:#1e3a5f}
    .summary-item .lbl{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.04em}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px 40px;font-size:10px}
    .footer{margin-top:16px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8}
  </style></head><body>
    <h1>Payslip — ${record.payslip_number || ""}</h1>
    <p class="meta"><strong>${record.staff_name}</strong> &nbsp;·&nbsp; Period: ${record.date_from} → ${record.date_to} &nbsp;·&nbsp; Pay: ${record.pay_period || "Fortnightly"} &nbsp;·&nbsp; Employer: ${emp.name}</p>
    <div class="summary">
      <div class="summary-item"><div class="val">$${subtotal.toFixed(2)}</div><div class="lbl">Gross Pay</div></div>
      <div class="summary-item"><div class="val" style="color:#e11d48">-$${(tax + medicare).toFixed(2)}</div><div class="lbl">Tax + Medicare</div></div>
      <div class="summary-item"><div class="val" style="color:#2563eb">$${superAmt.toFixed(2)}</div><div class="lbl">Super (12%)</div></div>
      <div class="summary-item"><div class="val" style="color:#16a34a">$${netPay.toFixed(2)}</div><div class="lbl">Net Pay</div></div>
      <div class="summary-item"><div class="val">${totalHours.toFixed(2)}</div><div class="lbl">Total Hours</div></div>
    </div>
    <h2>Shift Line Items</h2>
    <table><thead><tr><th>Date</th><th>Time</th><th>Item Code</th><th>Description</th><th style="text-align:right">Rate</th><th style="text-align:right">Hrs</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>
      ${lineRows}
      <tr class="total-row"><td colspan="6">GROSS PAY</td><td style="text-align:right">$${subtotal.toFixed(2)}</td></tr>
    </tbody></table>
    <div class="grid2">
      <div>
        <h2>Staff Details</h2>
        <p><strong>Name:</strong> ${record.staff_name || "—"}</p>
        <p><strong>Email:</strong> ${record.staff_email || "—"}</p>
        <p><strong>Phone:</strong> ${record.staff_phone || "—"}</p>
        <p><strong>Address:</strong> ${record.staff_address || "—"}</p>
        <p><strong>TFN:</strong> ${record.staff_tfn ? "••• ••• " + String(record.staff_tfn).slice(-3) : "—"}</p>
        <p><strong>ABN:</strong> ${record.staff_abn || "—"}</p>
      </div>
      <div>
        <h2>Banking &amp; Super</h2>
        <p><strong>Bank:</strong> ${record.bank_name || "—"}</p>
        <p><strong>BSB:</strong> ${record.bank_bsb || "—"}</p>
        <p><strong>Account:</strong> ${record.bank_account_number || "—"} (${record.bank_account_name || "—"})</p>
        <p><strong>Super Fund:</strong> ${record.super_fund_name || "—"}</p>
        <p><strong>Fund ABN:</strong> ${record.super_fund_abn || "—"}</p>
        <p><strong>USI:</strong> ${record.super_usi || "—"} &nbsp; <strong>Member:</strong> ${record.super_member_number || "—"}</p>
      </div>
    </div>
    ${taxStatus === "abn_contractor" ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;margin:10px 0;font-size:10px;color:#92400e"><strong>⚠️ ABN Contractor</strong> — Tax, Medicare and Super are <strong>not withheld</strong>. The contractor manages their own ATO obligations.</div>` : ""}
    <div class="footer">SZ-Jie Support Services · ${emp.name} · ABN ${emp.abn} · Tax calculated on ATO 2025–26 rates · ${TAX_STATUS_LABELS[taxStatus] || taxStatus}</div>
  </body></html>`;
}