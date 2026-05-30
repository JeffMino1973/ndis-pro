/**
 * Generates a rich A4-style HTML document for a staff profile.
 * Used for both Print / Save PDF and Email Profile.
 */
export function buildProfileHTML({ data, photoUrl, gradientFrom, gradientTo, profileUrl, firstName }) {
  const servicesHTML = (data.services || []).map(s => `
    <div style="flex:1 1 45%;min-width:200px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin:6px;">
      <div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:4px;">${s.title}</div>
      <div style="font-size:12px;color:#64748b;line-height:1.5;">${s.desc}</div>
    </div>
  `).join("");

  const qualsHTML = (data.qualifications || []).map(q => `
    <div style="display:flex;align-items:flex-start;gap:14px;padding:10px 0;border-bottom:1px solid #f1f5f9;">
      <div style="width:36px;height:36px;background:#f1f5f9;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;">🎓</div>
      <div>
        <div style="font-size:13px;font-weight:700;color:#1e293b;">${q.title}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">${q.sub}</div>
      </div>
    </div>
  `).join("");

  const valuesHTML = (data.values || []).map(v => `
    <span style="background:#e0e7ff;color:#3730a3;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;margin:3px;display:inline-block;">${v}</span>
  `).join("");

  const availHTML = (data.availability || []).map(a => `
    <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #e0e7ff;">
      <span style="font-size:12px;color:#475569;font-weight:600;">${a.day}</span>
      <span style="font-size:12px;color:#1d4ed8;font-weight:700;">${a.time}</span>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.name} — Support Worker Profile</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', 'Segoe UI', sans-serif;
      background: #f0f4f8;
      color: #1e293b;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      position: relative;
    }
    .hero {
      height: 90px;
      background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%);
    }
    .profile-header {
      padding: 0 32px 24px;
      display: flex;
      align-items: flex-end;
      gap: 20px;
      margin-top: -40px;
    }
    .avatar {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 4px solid white;
      overflow: hidden;
      flex-shrink: 0;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .name-block { padding-bottom: 4px; }
    .name-block h1 { font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.2; }
    .verified { display: inline-block; font-size: 10px; font-weight: 800; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 20px; padding: 2px 10px; margin-left: 8px; vertical-align: middle; text-transform: uppercase; letter-spacing: 0.05em; }
    .name-block .title { font-size: 13px; font-weight: 600; color: #2563eb; margin-top: 3px; }
    .name-block .location { font-size: 11px; color: #64748b; margin-top: 3px; }
    .body { padding: 0 32px 32px; display: flex; gap: 20px; }
    .sidebar { width: 175px; flex-shrink: 0; }
    .main { flex: 1; min-width: 0; }
    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .card-title {
      font-size: 12px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .card-title::before { content: ""; display: inline-block; width: 3px; height: 14px; background: #2563eb; border-radius: 2px; }
    .contact-label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
    .contact-value { font-size: 11px; font-weight: 600; color: #1e293b; word-break: break-all; margin-bottom: 10px; }
    .avail-card { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 14px; }
    .avail-title { font-size: 12px; font-weight: 800; color: #1e40af; margin-bottom: 10px; }
    .section-title { font-size: 15px; font-weight: 900; color: #0f172a; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
    .about-text { font-size: 12px; line-height: 1.7; color: #475569; margin-bottom: 10px; }
    .services-grid { display: flex; flex-wrap: wrap; margin: -6px; }
    .qual-list { }
    @media print {
      body { background: white; }
      .page { width: 100%; box-shadow: none; }
      .hero { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .avail-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="hero"></div>
    <div class="profile-header">
      <div class="avatar"><img src="${photoUrl}" alt="${data.name}" /></div>
      <div class="name-block">
        <h1>${data.name} <span class="verified">✓ Verified Provider</span></h1>
        <div class="title">${data.title}</div>
        <div class="location">📍 ${data.location}</div>
      </div>
    </div>

    <div class="body">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="card">
          <div class="card-title">Contact Details</div>
          <div class="contact-label">Address</div>
          <div class="contact-value">${data.address || ''}</div>
          <div class="contact-label">Phone</div>
          <div class="contact-value">${data.phone || ''}</div>
          <div class="contact-label">Email</div>
          <div class="contact-value">${data.email || ''}</div>
          <div class="contact-label">Languages</div>
          <div class="contact-value">${data.languages || ''}</div>
        </div>

        <div class="card">
          <div class="card-title">Core Values</div>
          <div>${valuesHTML}</div>
        </div>

        <div class="avail-card">
          <div class="avail-title">Availability</div>
          ${availHTML}
        </div>
      </div>

      <!-- Main content -->
      <div class="main">
        <div style="margin-bottom:16px;">
          <div class="section-title">About ${firstName}</div>
          <p class="about-text">${data.bio1 || ''}</p>
          ${data.bio2 ? `<p class="about-text">${data.bio2}</p>` : ''}
        </div>

        <div style="margin-bottom:16px;">
          <div class="section-title">Services &amp; Expertise</div>
          <div class="services-grid">${servicesHTML}</div>
        </div>

        <div>
          <div class="section-title">Training &amp; Qualifications</div>
          <div class="qual-list">${qualsHTML}</div>
        </div>

        ${profileUrl ? `
        <div style="margin-top:20px;text-align:center;">
          <a href="${profileUrl}" style="display:inline-block;background:#2563eb;color:white;padding:10px 28px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;">View Full Profile →</a>
        </div>
        ` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}