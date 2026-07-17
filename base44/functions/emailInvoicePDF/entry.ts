import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const cleaned = (hex || '#c0392b').replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;
  return rgb(r || 0, g || 0, b || 0);
}

function fmtDate(d) {
  if (!d) return '';
  const parts = String(d).split('-');
  if (parts.length !== 3) return d;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function truncateText(text, font, size, maxWidth) {
  if (!text) return '';
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(t + '…', size) > maxWidth) {
    t = t.substring(0, t.length - 1);
  }
  return t + '…';
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

// ─── PDF Generation ────────────────────────────────────────────────────────────

async function generateInvoicePDF(invoice, config) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const margin = 50;
  const brand = hexToRgb(config.brandColor);
  const lightBlue = rgb(0.86, 0.92, 0.97);
  const altRow = rgb(0.97, 0.98, 0.99);

  // Table layout
  const colWidths = [62, 75, 165, 65, 35, 58];
  const tableW = colWidths.reduce((a, b) => a + b, 0);
  const tableX = (PAGE_W - tableW) / 2;
  const colX = [];
  let accX = tableX;
  for (const w of colWidths) { colX.push(accX); accX += w; }

  let currentPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - margin;

  // ── Header ──
  currentPage.drawText(config.businessName || 'SZ-Jie Support Services', {
    x: margin, y, size: 22, font: boldFont, color: brand,
  });
  y -= 26;

  let by = y;
  if (config.abn) { currentPage.drawText(`ABN: ${config.abn}`, { x: margin, y: by, size: 9, font }); by -= 13; }
  if (config.address) { currentPage.drawText(config.address, { x: margin, y: by, size: 9, font }); by -= 13; }
  if (config.email) { currentPage.drawText(config.email, { x: margin, y: by, size: 9, font, color: rgb(0.15, 0.39, 0.92) }); by -= 13; }
  if (config.phone) { currentPage.drawText(config.phone, { x: margin, y: by, size: 9, font }); by -= 13; }

  // Invoice title (right)
  const rightX = PAGE_W - margin;
  currentPage.drawText('TAX INVOICE', { x: rightX - 95, y: PAGE_H - margin, size: 16, font: boldFont, color: brand });
  currentPage.drawText(`Invoice # ${invoice.invoice_number || ''}`, { x: rightX - 95, y: PAGE_H - margin - 20, size: 11, font: boldFont });
  currentPage.drawText(`Date: ${fmtDate(invoice.issue_date)}`, { x: rightX - 95, y: PAGE_H - margin - 35, size: 10, font });
  if (invoice.due_date) currentPage.drawText(`Due: ${fmtDate(invoice.due_date)}`, { x: rightX - 95, y: PAGE_H - margin - 50, size: 10, font });

  y = Math.min(by, PAGE_H - margin - 70);

  // ── Bill To ──
  y -= 20;
  currentPage.drawText('Bill To:', { x: margin, y, size: 10, font: boldFont });
  y -= 14;
  if (invoice.plan_manager_name) { currentPage.drawText(invoice.plan_manager_name, { x: margin, y, size: 10, font }); y -= 13; }
  if (invoice.plan_manager_email) { currentPage.drawText(invoice.plan_manager_email, { x: margin, y, size: 10, font, color: rgb(0.15, 0.39, 0.92) }); y -= 13; }

  y -= 6;
  currentPage.drawText(`Customer: ${invoice.participant_name || ''}`, { x: margin, y, size: 10, font: boldFont });
  y -= 13;
  if (invoice.participant_ndis_number) { currentPage.drawText(`NDIS: ${invoice.participant_ndis_number}`, { x: margin, y, size: 10, font }); y -= 13; }

  // ── Table header ──
  const headers = ['Date', 'Item Code', 'Description', 'Unit Price', 'Qty', 'Total'];
  const headerH = 20;

  function drawTableHeader(page, yPos) {
    page.drawRectangle({ x: tableX, y: yPos - headerH, width: tableW, height: headerH, color: brand });
    headers.forEach((h, i) => {
      page.drawText(h, { x: colX[i] + 5, y: yPos - 14, size: 9, font: boldFont, color: rgb(1, 1, 1) });
    });
    return yPos - headerH;
  }

  y = drawTableHeader(currentPage, y);
  const rowH = 18;

  // ── Table rows ──
  for (const [i, line] of (invoice.line_items || []).entries()) {
    if (y < 120) {
      currentPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - margin;
      y = drawTableHeader(currentPage, y);
    }

    const bg = i % 2 === 0 ? altRow : rgb(1, 1, 1);
    currentPage.drawRectangle({ x: tableX, y: y - rowH, width: tableW, height: rowH, color: bg });

    const cells = [
      fmtDate(line.date),
      line.support_item_code || '—',
      truncateText(line.description || '', font, 9, colWidths[2] - 10),
      `$${(line.rate || 0).toFixed(2)}`,
      String(line.hours || 0),
      `$${(line.amount || 0).toFixed(2)}`,
    ];

    cells.forEach((cell, ci) => {
      currentPage.drawText(cell, {
        x: colX[ci] + 5,
        y: y - 13,
        size: 9,
        font: ci === 5 ? boldFont : font,
      });
    });
    y -= rowH;
  }

  // ── Totals ──
  y -= 8;
  const totalsW = 165;
  const totalsX = PAGE_W - margin - totalsW;

  currentPage.drawRectangle({ x: totalsX, y: y - 16, width: totalsW, height: 16, color: lightBlue });
  currentPage.drawText('Subtotal', { x: totalsX + 5, y: y - 12, size: 9, font: boldFont, color: brand });
  currentPage.drawText(`$${(invoice.subtotal || 0).toFixed(2)}`, { x: PAGE_W - margin - 5, y: y - 12, size: 9, font, color: brand });
  y -= 16;

  currentPage.drawText('GST', { x: totalsX + 5, y: y - 12, size: 9, font: boldFont, color: brand });
  currentPage.drawText('$0.00', { x: PAGE_W - margin - 5, y: y - 12, size: 9, font });
  y -= 16;

  currentPage.drawRectangle({ x: totalsX, y: y - 16, width: totalsW, height: 16, color: lightBlue });
  currentPage.drawText('Total', { x: totalsX + 5, y: y - 12, size: 9, font: boldFont, color: brand });
  currentPage.drawText(`$${(invoice.total || 0).toFixed(2)}`, { x: PAGE_W - margin - 5, y: y - 12, size: 9, font: boldFont, color: brand });
  y -= 30;

  // ── Payment details ──
  if (y < 100) { currentPage = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - margin; }
  y -= 10;
  currentPage.drawText('Please make payment to:', { x: margin, y, size: 10, font: boldFont });
  y -= 14;
  if (config.bankName) { currentPage.drawText(config.bankName, { x: margin, y, size: 10, font }); y -= 13; }
  if (config.accountName) { currentPage.drawText(`Account Name: ${config.accountName}`, { x: margin, y, size: 10, font }); y -= 13; }
  if (config.bsb) { currentPage.drawText(`BSB: ${config.bsb}`, { x: margin, y, size: 10, font }); y -= 13; }
  if (config.accountNumber) { currentPage.drawText(`Account: ${config.accountNumber}`, { x: margin, y, size: 10, font }); y -= 13; }

  // ── Notes ──
  if (invoice.notes) {
    if (y < 80) { currentPage = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - margin; }
    y -= 15;
    currentPage.drawText('Notes:', { x: margin, y, size: 9, font: boldFont });
    y -= 12;
    currentPage.drawText(truncateText(invoice.notes, font, 9, PAGE_W - 2 * margin), { x: margin, y, size: 9, font, color: rgb(0.39, 0.45, 0.55) });
  }

  const pdfBytes = await pdfDoc.save();
  return bytesToBase64(new Uint8Array(pdfBytes));
}

// ─── Main Handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { invoice_id } = body;

    if (!invoice_id) {
      return Response.json({ error: 'invoice_id is required' }, { status: 400 });
    }

    // Fetch invoice via service role (works in workflow context)
    const invoice = await base44.asServiceRole.entities.Invoice.get(invoice_id);
    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!invoice.plan_manager_email) {
      return Response.json({ error: 'Invoice has no plan manager email — cannot send' }, { status: 400 });
    }

    // Default business config
    let config = {
      businessName: 'SZ-Jie Support Services',
      abn: '',
      address: '',
      email: '',
      phone: '',
      bankName: '',
      accountName: '',
      bsb: '',
      accountNumber: '',
      brandColor: '#c0392b',
    };

    // Try to load business config from the user who created the invoice
    if (invoice.created_by_id) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: invoice.created_by_id });
        if (users && users.length > 0 && users[0].businessConfig) {
          config = { ...config, ...users[0].businessConfig };
        }
      } catch (_e) {
        // Fall back to defaults
      }
    }

    // ── Fetch & merge email template ──
    const templateUrl = 'https://media.base44.com/files/public/69d54775d9a169daad84a133/1189154e2_Invoice_Email.html';
    const templateRes = await fetch(templateUrl);
    const templateHtml = await templateRes.text();

    const mergeData = {
      'Invoice Number': invoice.invoice_number || '',
      'Plan Manager Name': invoice.plan_manager_name || '',
      'Participant Name': invoice.participant_name || '',
      'NDIS Number': invoice.participant_ndis_number || '',
      'Invoice Date': invoice.issue_date || '',
      'Bank Name': config.bankName || '',
      'Account Name': config.accountName || '',
      'BSB': config.bsb || '',
      'Account Number': config.accountNumber || '',
      'Sender Name': config.businessName || 'SZ-Jie Support Services',
    };

    let mergedHtml = templateHtml;
    mergedHtml = mergedHtml.replace(/\[([^\]]+)\]/g, (match, key) => {
      const trimmed = key.trim();
      return trimmed in mergeData ? String(mergeData[trimmed] ?? '') : match;
    });
    mergedHtml = mergedHtml.replace(/\(([^)]+)\)/g, (match, key) => {
      const trimmed = key.trim();
      return trimmed in mergeData ? String(mergeData[trimmed] ?? '') : match;
    });

    // ── Generate PDF ──
    const pdfBase64 = await generateInvoicePDF(invoice, config);

    // ── Get Gmail OAuth token ──
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // ── Build RFC 2822 email with PDF attachment ──
    const to = invoice.plan_manager_email;
    const subject = `NDIS Invoice Claim — ${invoice.invoice_number}`;
    const boundary = 'szjie_boundary_' + Math.random().toString(36).substring(2);
    const filename = `Invoice_${invoice.invoice_number}.pdf`;

    const lines = [];
    lines.push(`To: ${to}`);
    lines.push(`Subject: ${subject}`);
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push('MIME-Version: 1.0');
    lines.push('');
    // HTML body
    lines.push('--' + boundary);
    lines.push('Content-Type: text/html; charset=UTF-8');
    lines.push('Content-Transfer-Encoding: 8bit');
    lines.push('');
    lines.push(mergedHtml);
    lines.push('');
    // PDF attachment
    lines.push('--' + boundary);
    lines.push(`Content-Type: application/pdf; name="${filename}"`);
    lines.push(`Content-Disposition: attachment; filename="${filename}"`);
    lines.push('Content-Transfer-Encoding: base64');
    lines.push('');
    const raw64 = pdfBase64.replace(/\s/g, '');
    for (let i = 0; i < raw64.length; i += 76) {
      lines.push(raw64.substring(i, i + 76));
    }
    lines.push('');
    lines.push('--' + boundary + '--');

    const rawMessage = lines.join('\r\n');
    const messageBytes = new TextEncoder().encode(rawMessage);
    let binaryStr = '';
    for (let i = 0; i < messageBytes.length; i++) binaryStr += String.fromCharCode(messageBytes[i]);
    const encoded = btoa(binaryStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // ── Send via Gmail API ──
    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ raw: encoded }),
    });

    if (!sendRes.ok) {
      const err = await sendRes.json();
      return Response.json({ error: err.error?.message || 'Failed to send email' }, { status: sendRes.status });
    }

    const result = await sendRes.json();
    return Response.json({ success: true, messageId: result.id, threadId: result.threadId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});