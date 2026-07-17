import { jsPDF } from "jspdf";

/**
 * Generates a downloadable PDF summary report of training completion rates
 * for each staff member, formatted as a clean table.
 */
export function generateTrainingReportPDF({ staffMembers, enrollments, avgOverall }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const tableW = pageW - margin * 2; // 182mm on A4

  // Column layout
  const cols = [
    { header: "Staff Name", x: margin, w: 56, align: "left" },
    { header: "Role", x: margin + 56, w: 52, align: "left" },
    { header: "Assigned", x: margin + 108, w: 26, align: "center" },
    { header: "Completed", x: margin + 134, w: 26, align: "center" },
    { header: "Avg %", x: margin + 160, w: 22, align: "center" },
  ];

  // ── Build per-staff summary ──────────────────────────────────────────
  const staffByLowerName = new Map();
  const staffByLowerEmail = new Map();
  (staffMembers || []).forEach(s => {
    if (s.name) staffByLowerName.set(s.name.toLowerCase().trim(), s);
    if (s.email) staffByLowerEmail.set(s.email.toLowerCase().trim(), s);
  });

  const staffMap = new Map(); // staffId/name -> { staff, assigned, completed, sumPct }
  const getOrCreate = (staff, key) => {
    if (!staffMap.has(key)) {
      staffMap.set(key, { staff: staff || { name: key, role: "—" }, assigned: 0, completed: 0, sumPct: 0 });
    }
    return staffMap.get(key);
  };

  (enrollments || []).forEach(e => {
    const name = (e.student_name || "").toLowerCase().trim();
    const email = (e.student_email || "").toLowerCase().trim();
    const staff = staffByLowerName.get(name) || staffByLowerEmail.get(email);
    const key = staff?.id || e.student_name || "Unknown";
    const row = getOrCreate(staff, key);
    row.assigned += 1;
    row.sumPct += e.progress_percent || 0;
    if ((e.progress_percent || 0) >= 100 || e.status === "Completed") row.completed += 1;
  });

  // Also include staff with no assignments (for completeness)
  (staffMembers || []).forEach(s => {
    const key = s.id;
    if (!staffMap.has(key)) {
      staffMap.set(key, { staff: s, assigned: 0, completed: 0, sumPct: 0 });
    }
  });

  const rows = Array.from(staffMap.values()).map(r => ({
    name: r.staff.name || "Unknown",
    role: r.staff.role || "—",
    assigned: r.assigned,
    completed: r.completed,
    avgPct: r.assigned > 0 ? Math.round(r.sumPct / r.assigned) : null,
  }));
  // Sort: lowest completion first (biggest gaps at top), staff with no assignments treated as 0
  rows.sort((a, b) => (a.avgPct ?? -1) - (b.avgPct ?? -1));

  // ── Header ────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("SZ-JIE Support Services", margin, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Staff Training Completion Report", margin, 19);
  doc.setFontSize(8);
  doc.text(new Date().toLocaleString("en-AU", { dateStyle: "long", timeStyle: "short" }), pageW - margin, 19, { align: "right" });

  // Summary stats
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Overall Average Completion: ${avgOverall}%`, margin, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Total staff: ${rows.length}  ·  Total assignments: ${rows.reduce((s, r) => s + r.assigned, 0)}  ·  Completed: ${rows.reduce((s, r) => s + r.completed, 0)}`, margin, 44);

  // ── Table ────────────────────────────────────────────────────────────
  const headerY = 52;
  const rowH = 7;
  const headerH = 8;

  // Header row
  doc.setFillColor(34, 64, 128); // primary blue
  doc.rect(margin, headerY, tableW, headerH, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  cols.forEach(c => {
    const tx = c.align === "center" ? c.x + c.w / 2 : c.x + 2;
    doc.text(c.header, tx, headerY + headerH - 2.8, { align: c.align === "center" ? "center" : "left" });
  });

  // Data rows
  let y = headerY + headerH;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  rows.forEach((r, i) => {
    // Page break
    if (y + rowH > pageH - 18) {
      doc.addPage();
      y = margin;
      // Re-draw header on new page
      doc.setFillColor(34, 64, 128);
      doc.rect(margin, y, tableW, headerH, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      cols.forEach(c => {
        const tx = c.align === "center" ? c.x + c.w / 2 : c.x + 2;
        doc.text(c.header, tx, y + headerH - 2.8, { align: c.align === "center" ? "center" : "left" });
      });
      y += headerH;
      doc.setFont("helvetica", "normal");
    }

    // Alternating row background
    if (i % 2 === 1) {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(margin, y, tableW, rowH, "F");
    }

    // Row border
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    doc.rect(margin, y, tableW, rowH);

    // Cell text
    const pctText = r.avgPct === null ? "N/A" : `${r.avgPct}%`;
    const pctColor = r.avgPct === null ? [148, 163, 184]
      : r.avgPct < 25 ? [239, 68, 68]
      : r.avgPct < 50 ? [245, 158, 11]
      : r.avgPct < 75 ? [202, 138, 4]
      : [34, 197, 94];

    doc.setTextColor(30, 41, 59);
    // Truncate name if too long
    const nameText = r.name.length > 30 ? r.name.substring(0, 30) + "…" : r.name;
    const roleText = r.role.length > 28 ? r.role.substring(0, 28) + "…" : r.role;
    doc.text(nameText, cols[0].x + 2, y + rowH - 2.5);
    doc.setTextColor(100, 116, 139);
    doc.text(roleText, cols[1].x + 2, y + rowH - 2.5);
    doc.setTextColor(30, 41, 59);
    doc.text(String(r.assigned), cols[2].x + cols[2].w / 2, y + rowH - 2.5, { align: "center" });
    doc.text(String(r.completed), cols[3].x + cols[3].w / 2, y + rowH - 2.5, { align: "center" });
    doc.setTextColor(...pctColor);
    doc.setFont("helvetica", "bold");
    doc.text(pctText, cols[4].x + cols[4].w / 2, y + rowH - 2.5, { align: "center" });
    doc.setFont("helvetica", "normal");

    y += rowH;
  });

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`SZ-JIE Support Services · Staff Training Report · Page ${p} of ${pageCount}`, pageW / 2, pageH - 8, { align: "center" });
  }

  doc.save(`staff-training-report-${new Date().toISOString().split("T")[0]}.pdf`);
}