import { jsPDF } from "jspdf";

/**
 * Generates a professional Certificate of Completion PDF for a staff training module.
 * Returns a Blob ready for upload.
 */
export function generateCertificatePDF({ staffName, courseTitle, category, completedAt }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();  // 297
  const H = doc.internal.pageSize.getHeight(); // 210

  // ── Background ──
  doc.setFillColor(252, 252, 253);
  doc.rect(0, 0, W, H, "F");

  // ── Outer decorative border ──
  doc.setDrawColor(234, 89, 54); // SZ-JIE primary orange
  doc.setLineWidth(2.5);
  doc.rect(10, 10, W - 20, H - 20);

  // ── Inner thin border ──
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.rect(14, 14, W - 28, H - 28);

  // ── Corner accents ──
  doc.setDrawColor(234, 89, 54);
  doc.setLineWidth(1.5);
  // Top-left
  doc.line(14, 22, 22, 14);
  doc.line(14, 30, 30, 14);
  // Top-right
  doc.line(W - 22, 14, W - 14, 22);
  doc.line(W - 30, 14, W - 14, 30);
  // Bottom-left
  doc.line(14, H - 22, 22, H - 14);
  doc.line(14, H - 30, 30, H - 14);
  // Bottom-right
  doc.line(W - 22, H - 14, W - 14, H - 22);
  doc.line(W - 30, H - 14, W - 14, H - 30);

  // ── Title ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  doc.setTextColor(30, 41, 59);
  doc.text("Certificate of Completion", W / 2, 48, { align: "center" });

  // ── Subtitle ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(100, 116, 139);
  doc.text("This is to proudly certify that", W / 2, 66, { align: "center" });

  // ── Staff name ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(234, 89, 54);
  const nameLines = doc.splitTextToSize(staffName || "Staff Member", W - 80);
  doc.text(nameLines, W / 2, 85, { align: "center" });

  // ── Decorative line under name ──
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 60, 95, W / 2 + 60, 95);

  // ── "has successfully completed" ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(100, 116, 139);
  doc.text("has successfully completed the training module", W / 2, 108, { align: "center" });

  // ── Course title ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  const courseLines = doc.splitTextToSize(courseTitle || "Training Module", W - 60);
  doc.text(courseLines, W / 2, 125, { align: "center" });

  // ── Category ──
  if (category) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Category: ${category}`, W / 2, 140, { align: "center" });
  }

  // ── Date ──
  const dateStr = completedAt
    ? new Date(completedAt).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Completed on ${dateStr}`, W / 2, 152, { align: "center" });

  // ── Footer ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("SZ-JIE Support Services  ·  Staff Training & Development Portal", W / 2, 178, { align: "center" });

  // ── Certificate ID ──
  const certId = `CERT-${Date.now().toString(36).toUpperCase()}`;
  doc.setFontSize(7);
  doc.setTextColor(180, 190, 200);
  doc.text(`Certificate ID: ${certId}`, W / 2, 184, { align: "center" });

  return doc.output("blob");
}