import { useState } from "react";
import { Printer, FileText, ClipboardList, ShieldCheck, AlertTriangle, BookOpen, Package, FlaskConical, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const LOGO = "https://media.base44.com/images/public/69d54775d9a169daad84a133/09e12d07c_LOGO_LANDSCAPE.png";

const FORMS = [
  { id: "register", label: "Controlled Medication Register", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { id: "mar", label: "Medication Administration Record", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  { id: "consent", label: "Medication Consent Form", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  { id: "incident", label: "Medication Incident Report", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  { id: "storage", label: "Medication Storage Audit", icon: Package, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { id: "competency", label: "Staff Medication Competency Record", icon: CheckSquare, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  { id: "manual", label: "Medication Management Manual", icon: BookOpen, color: "text-slate-700", bg: "bg-slate-100 border-slate-200" },
  { id: "hcp", label: "Health Care Plan Register", icon: FlaskConical, color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
];

const headerHtml = (title, subtitle = "") => `
  <div style="background:linear-gradient(90deg,#3b82f6,#2563eb,#9333ea);padding:28px 40px;color:white;margin-bottom:32px;">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
      <img src="${LOGO}" alt="SZ-JIE WANG Support Services" style="height:56px;background:white;border-radius:10px;padding:6px 12px;" />
      <div style="text-align:right;">
        <h1 style="margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">${title}</h1>
        ${subtitle ? `<p style="margin:4px 0 0;font-size:13px;opacity:0.85;">${subtitle}</p>` : ""}
        <p style="margin:4px 0 0;font-size:11px;opacity:0.7;">SZ-JIE WANG Support Services · NDIS Registered Provider</p>
      </div>
    </div>
  </div>
`;

const fieldRow = (label, span = 1) => `
  <div style="grid-column:span ${span};margin-bottom:14px;">
    <label style="display:block;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${label}</label>
    <div style="border-bottom:1.5px solid #334155;min-height:28px;"></div>
  </div>
`;

const sectionHeader = (num, title, color = "#1e3a5f") => `
  <div style="background:${color};color:white;padding:10px 18px;border-radius:6px;margin:24px 0 16px;display:flex;align-items:center;gap:10px;">
    <span style="font-size:14px;font-weight:900;opacity:0.7;">${num}.</span>
    <span style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">${title}</span>
  </div>
`;

const tableHeader = (cols) => `
  <thead>
    <tr style="background:#1e3a5f;color:white;">
      ${cols.map(c => `<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;">${c}</th>`).join("")}
    </tr>
  </thead>
`;

const emptyRows = (n, cols) => Array.from({ length: n }).map((_, i) => `
  <tr style="border-bottom:1px solid #e2e8f0;background:${i % 2 === 0 ? "white" : "#f8fafc"};">
    ${cols.map(() => `<td style="padding:10px 12px;height:36px;"></td>`).join("")}
  </tr>
`).join("");

const footerHtml = () => `
  <div style="margin-top:40px;padding-top:16px;border-top:2px solid #e2e8f0;display:grid;grid-template-columns:1fr 1fr;gap:40px;">
    <div>
      <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Completed By</div>
      <div style="border-bottom:1.5px solid #334155;min-height:28px;margin-bottom:12px;"></div>
      <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Signature</div>
      <div style="border-bottom:1.5px solid #334155;min-height:28px;"></div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Date</div>
      <div style="border-bottom:1.5px solid #334155;min-height:28px;margin-bottom:12px;"></div>
      <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Witnessed By</div>
      <div style="border-bottom:1.5px solid #334155;min-height:28px;"></div>
    </div>
  </div>
  <p style="margin-top:20px;font-size:10px;color:#94a3b8;text-align:center;">SZ-JIE WANG Support Services · ABN: [ABN] · This document is confidential and for authorised use only.</p>
`;

const FORM_HTML = {
  register: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:0;}
.wrap{max-width:900px;margin:0 auto;padding-bottom:40px;}
table{width:100%;border-collapse:collapse;}th,td{padding:10px 12px;border:1px solid #e2e8f0;font-size:12px;}
thead tr{background:#1e3a5f;color:white;}tr:nth-child(even){background:#f8fafc;}
</style></head><body><div class="wrap">
${headerHtml("Controlled Medication Register", "NDIS Medication Management — Ongoing Register")}
<div style="padding:0 32px;">
  ${sectionHeader("A", "Participant & Medication Details")}
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 24px;">
    ${fieldRow("Participant Name", 2)}${fieldRow("NDIS Number")}
    ${fieldRow("Medication Name", 2)}${fieldRow("Strength / Form")}
    ${fieldRow("Prescriber")}${fieldRow("Pharmacy")}${fieldRow("Script Number")}
  </div>
  ${sectionHeader("B", "Administration Log")}
  <table>
    ${tableHeader(["Date", "Time", "Dose Given", "Route", "Administered By", "Observed By", "Participant Response", "Balance Remaining", "Notes"])}
    <tbody>${emptyRows(18, Array(9).fill(""))}</tbody>
  </table>
  ${sectionHeader("C", "Stock Count & Destruction Record")}
  <table>
    ${tableHeader(["Date", "Opening Balance", "Received", "Administered", "Closing Balance", "Witnessed By", "Discrepancy", "Notes"])}
    <tbody>${emptyRows(10, Array(8).fill(""))}</tbody>
  </table>
  ${footerHtml()}
</div></div></body></html>`,

  mar: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:0;}
.wrap{max-width:900px;margin:0 auto;padding-bottom:40px;}
table{width:100%;border-collapse:collapse;}th,td{padding:10px 12px;border:1px solid #e2e8f0;font-size:12px;}
thead tr{background:#1e3a5f;color:white;}tr:nth-child(even){background:#f8fafc;}
</style></head><body><div class="wrap">
${headerHtml("Medication Administration Record (MAR)", "Monthly Administration Tracking")}
<div style="padding:0 32px;">
  ${sectionHeader("1", "Participant Details")}
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 24px;">
    ${fieldRow("Participant Name", 2)}${fieldRow("DOB")}
    ${fieldRow("Address", 3)}
    ${fieldRow("Doctor / GP")}${fieldRow("GP Phone")}${fieldRow("Allergies")}
  </div>
  ${sectionHeader("2", "Current Medications")}
  <table>
    ${tableHeader(["Medication Name", "Dose", "Route", "Frequency", "Times", "Prescriber", "Start Date", "End Date", "Special Instructions"])}
    <tbody>${emptyRows(8, Array(9).fill(""))}</tbody>
  </table>
  ${sectionHeader("3", "Monthly Administration Record")}
  <table>
    ${tableHeader(["Medication", "Dose", "1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"])}
    <tbody>${emptyRows(6, Array(33).fill(""))}</tbody>
  </table>
  <div style="margin-top:16px;font-size:11px;color:#64748b;"><strong>Key:</strong> ✓ = Given · ✗ = Refused · H = Held · NA = Not applicable · P = PRN given</div>
  ${footerHtml()}
</div></div></body></html>`,

  consent: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:0;}
.wrap{max-width:900px;margin:0 auto;padding-bottom:40px;}
table{width:100%;border-collapse:collapse;}th,td{padding:10px 12px;border:1px solid #e2e8f0;font-size:12px;}
.info-box{background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin:12px 0;font-size:13px;color:#0369a1;}
</style></head><body><div class="wrap">
${headerHtml("Medication Consent Form", "Authorisation for Medication Administration")}
<div style="padding:0 32px;">
  <div class="info-box">This form authorises SZ-JIE WANG Support Services staff to administer the medications listed below to the participant. This consent must be signed by the participant, their guardian, or authorised representative.</div>
  ${sectionHeader("1", "Participant Details")}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;">
    ${fieldRow("Full Name")}${fieldRow("Date of Birth")}
    ${fieldRow("NDIS Number")}${fieldRow("Address")}
    ${fieldRow("Emergency Contact")}${fieldRow("Emergency Phone")}
  </div>
  ${sectionHeader("2", "Medications Consented To")}
  <table>
    <thead><tr style="background:#1e3a5f;color:white;"><th style="padding:10px 12px;font-size:11px;">Medication</th><th style="padding:10px 12px;font-size:11px;">Dose & Route</th><th style="padding:10px 12px;font-size:11px;">Frequency</th><th style="padding:10px 12px;font-size:11px;">Prescriber</th><th style="padding:10px 12px;font-size:11px;">Purpose</th></tr></thead>
    <tbody>${emptyRows(6, Array(5).fill(""))}</tbody>
  </table>
  ${sectionHeader("3", "Self-Administration")}
  <p style="font-size:13px;">Does the participant self-administer any medications?</p>
  <div style="display:flex;gap:32px;margin:8px 0 16px;font-size:13px;font-weight:700;">
    <label>☐ Yes (specify below)</label><label>☐ No — staff to administer</label>
  </div>
  ${fieldRow("Self-administered medications & instructions", 1)}
  ${sectionHeader("4", "Consent Declaration")}
  <p style="font-size:13px;line-height:1.7;">I, the undersigned, confirm that I authorise SZ-JIE WANG Support Services and its staff to administer the medications listed above. I understand that medications will only be given as prescribed, and that I will be informed of any changes or incidents related to medication administration.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px;">
    <div>${fieldRow("Participant / Guardian Name")}${fieldRow("Relationship")}${fieldRow("Signature")}${fieldRow("Date")}</div>
    <div>${fieldRow("Support Worker / Witness")}${fieldRow("Role")}${fieldRow("Signature")}${fieldRow("Date")}</div>
  </div>
  <p style="font-size:11px;color:#94a3b8;margin-top:20px;text-align:center;">SZ-JIE WANG Support Services · This form must be reviewed annually or when medications change.</p>
</div></div></body></html>`,

  incident: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:0;}
.wrap{max-width:900px;margin:0 auto;padding-bottom:40px;}
.alert{background:#fef2f2;border:2px solid #fca5a5;border-radius:8px;padding:16px;margin:12px 0;font-size:13px;color:#dc2626;font-weight:700;}
</style></head><body><div class="wrap">
${headerHtml("Medication Incident Report", "To be completed within 24 hours of any medication incident")}
<div style="padding:0 32px;">
  <div class="alert">⚠️ All medication incidents must be reported to the participant's GP, guardian/family, and the NDIS Quality & Safeguards Commission (if a notifiable incident). Retain a copy of this form for the participant's file.</div>
  ${sectionHeader("1", "Incident Details")}
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 24px;">
    ${fieldRow("Date of Incident")}${fieldRow("Time")}${fieldRow("Location")}
    ${fieldRow("Participant Name", 2)}${fieldRow("NDIS Number")}
  </div>
  ${sectionHeader("2", "Incident Type")}
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;font-size:13px;">
    ${["Wrong medication given","Wrong dose given","Wrong route","Missed dose","Extra dose given","Medication not available","Adverse reaction","Participant refused","Expired medication given","Other"].map(t=>`<label style="display:flex;align-items:center;gap:8px;">☐ ${t}</label>`).join("")}
  </div>
  ${fieldRow("If Other, specify:")}
  ${sectionHeader("3", "Medication Involved")}
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 24px;">
    ${fieldRow("Medication Name")}${fieldRow("Prescribed Dose")}${fieldRow("Dose Actually Given")}
    ${fieldRow("Route")}${fieldRow("Time Last Dose")}${fieldRow("Prescriber")}
  </div>
  ${sectionHeader("4", "Description & Immediate Action")}
  <div style="margin-bottom:14px;"><label style="display:block;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Full Description of Incident</label><div style="border:1.5px solid #cbd5e1;border-radius:6px;min-height:80px;"></div></div>
  <div style="margin-bottom:14px;"><label style="display:block;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Immediate Action Taken</label><div style="border:1.5px solid #cbd5e1;border-radius:6px;min-height:60px;"></div></div>
  ${sectionHeader("5", "Notifications Made")}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;">
    ${fieldRow("Guardian / Family notified?")}${fieldRow("Time notified")}
    ${fieldRow("GP / Doctor notified?")}${fieldRow("Time notified")}
    ${fieldRow("Supervisor notified?")}${fieldRow("NDIS Commission notified? (Y/N)")}
  </div>
  ${footerHtml()}
</div></div></body></html>`,

  storage: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:0;}
.wrap{max-width:900px;margin:0 auto;padding-bottom:40px;}
table{width:100%;border-collapse:collapse;}th,td{padding:10px 12px;border:1px solid #e2e8f0;font-size:12px;}
thead tr{background:#1e3a5f;color:white;}tr:nth-child(even){background:#f8fafc;}
.check{font-size:16px;text-align:center;}
</style></head><body><div class="wrap">
${headerHtml("Medication Storage Audit", "Monthly Storage & Safety Compliance Checklist")}
<div style="padding:0 32px;">
  ${sectionHeader("1", "Audit Details")}
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 24px;">
    ${fieldRow("Date of Audit")}${fieldRow("Location / Residence")}${fieldRow("Auditor Name")}
  </div>
  ${sectionHeader("2", "Storage Compliance Checklist")}
  <table>
    <thead><tr style="background:#1e3a5f;color:white;"><th style="padding:10px 12px;font-size:11px;width:60%;">Compliance Item</th><th style="padding:10px 12px;font-size:11px;text-align:center;">✓ / ✗</th><th style="padding:10px 12px;font-size:11px;">Comments / Action Required</th></tr></thead>
    <tbody>
      ${[
        "All medications stored in a locked, secure location",
        "Keys accessible only to authorised staff",
        "Medications stored at correct temperature (check fridge for refrigerated items)",
        "Fridge temperature logged and within range (2–8°C)",
        "All medications labelled with participant name",
        "Expiry dates checked — no expired medications",
        "Medication register up to date and accurately reflects stock",
        "No medications stored with food or cleaning products",
        "Emergency/rescue medications clearly identified and accessible",
        "Medication disposal procedure in place for expired/unused medications",
        "Controlled drug register completed and balanced",
        "All medications in original pharmacy packaging",
        "Medication profiles current and signed by prescriber",
        "Adverse drug reaction record current",
        "Staff aware of storage requirements for all medications",
      ].map((item, i) => `<tr style="border-bottom:1px solid #e2e8f0;background:${i%2===0?"white":"#f8fafc"};"><td style="padding:10px 12px;font-size:12px;">${item}</td><td style="padding:10px 12px;text-align:center;font-size:16px;"></td><td style="padding:10px 12px;"></td></tr>`).join("")}
    </tbody>
  </table>
  ${sectionHeader("3", "Medication Stock Verification")}
  <table>
    ${tableHeader(["Medication", "Participant", "Expected Balance", "Actual Balance", "Discrepancy", "Action Taken"])}
    <tbody>${emptyRows(8, Array(6).fill(""))}</tbody>
  </table>
  ${sectionHeader("4", "Action Plan")}
  <div style="margin-bottom:14px;"><div style="border:1.5px solid #cbd5e1;border-radius:6px;min-height:80px;"></div></div>
  ${footerHtml()}
</div></div></body></html>`,

  competency: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:0;}
.wrap{max-width:900px;margin:0 auto;padding-bottom:40px;}
table{width:100%;border-collapse:collapse;}th,td{padding:10px 12px;border:1px solid #e2e8f0;font-size:12px;}
thead tr{background:#1e3a5f;color:white;}tr:nth-child(even){background:#f8fafc;}
</style></head><body><div class="wrap">
${headerHtml("Staff Medication Competency Record", "Annual Competency Assessment for Medication Administration")}
<div style="padding:0 32px;">
  ${sectionHeader("1", "Staff Details")}
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 24px;">
    ${fieldRow("Staff Member Name", 2)}${fieldRow("Role")}
    ${fieldRow("Date of Assessment")}${fieldRow("Assessor Name")}${fieldRow("Next Due Date")}
  </div>
  ${sectionHeader("2", "Knowledge Assessment")}
  <table>
    <thead><tr style="background:#1e3a5f;color:white;"><th style="padding:10px 12px;font-size:11px;width:55%;">Competency Item</th><th style="padding:10px 12px;font-size:11px;text-align:center;">C / NYC</th><th style="padding:10px 12px;font-size:11px;">Evidence / Comments</th></tr></thead>
    <tbody>
      ${[
        "Understands the 8 Rights of medication administration (Right person, medication, dose, route, time, documentation, reason, response)",
        "Can identify medications by name, dose and route for assigned participants",
        "Understands medication storage requirements including controlled substances",
        "Knows how to complete the Medication Administration Record (MAR) accurately",
        "Can identify and respond to adverse drug reactions",
        "Understands when and how to withhold medication and who to notify",
        "Knows the medication incident reporting procedure",
        "Understands legislation relating to controlled/scheduled medications (NSW)",
        "Can demonstrate correct use of PRN medications and documentation",
        "Understands participant rights regarding medication refusal",
        "Knows correct procedure for medication disposal and waste",
        "Can demonstrate correct hand hygiene before and after administration",
      ].map((item, i) => `<tr style="border-bottom:1px solid #e2e8f0;background:${i%2===0?"white":"#f8fafc"};"><td style="padding:10px 12px;font-size:12px;">${item}</td><td style="padding:10px 12px;text-align:center;font-weight:700;"></td><td style="padding:10px 12px;"></td></tr>`).join("")}
    </tbody>
  </table>
  <p style="font-size:11px;color:#64748b;margin-top:8px;"><strong>C</strong> = Competent &nbsp; <strong>NYC</strong> = Not Yet Competent (requires further training)</p>
  ${sectionHeader("3", "Practical Observation")}
  <div style="margin-bottom:14px;"><label style="display:block;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Observations / Additional Comments</label><div style="border:1.5px solid #cbd5e1;border-radius:6px;min-height:80px;"></div></div>
  ${sectionHeader("4", "Outcome")}
  <div style="display:flex;gap:32px;margin:8px 0 16px;font-size:14px;font-weight:700;">
    <label>☐ COMPETENT — authorised to administer medications</label><label>☐ NOT YET COMPETENT — requires re-assessment</label>
  </div>
  ${footerHtml()}
</div></div></body></html>`,

  hcp: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:0;}
.wrap{max-width:900px;margin:0 auto;padding-bottom:40px;}
table{width:100%;border-collapse:collapse;}th,td{padding:10px 12px;border:1px solid #e2e8f0;font-size:12px;}
thead tr{background:#1e3a5f;color:white;}tr:nth-child(even){background:#f8fafc;}
.alert{background:#fef2f2;border:2px solid #fca5a5;border-radius:8px;padding:12px 16px;font-size:13px;color:#dc2626;font-weight:700;margin-bottom:16px;}
</style></head><body><div class="wrap">
${headerHtml("Health Care Plan Register", "Participant Health Plans & Medical Information")}
<div style="padding:0 32px;">
  ${sectionHeader("1", "Current Participants — Health Plan Register")}
  <table>
    ${tableHeader(["Participant Name","DOB","NDIS No.","Primary Diagnosis","Doctor/GP","Doctor Phone","Allergies","HCP Date","Review Date","Signed By","File Location"])}
    <tbody>${emptyRows(15, Array(11).fill(""))}</tbody>
  </table>
  ${sectionHeader("2", "Participants Requiring Specialist Health Plans")}
  <table>
    ${tableHeader(["Participant","Condition","Plan Type (Epilepsy/Diabetes/etc)","Specialist","Phone","Plan Created","Last Updated","Next Review","Staff Trained"])}
    <tbody>${emptyRows(10, Array(9).fill(""))}</tbody>
  </table>
  ${sectionHeader("3", "Annual Review Log")}
  <table>
    ${tableHeader(["Participant","Review Date","Reviewed By","Changes Made","New Plan Issued","Participant/Guardian Notified","Next Review Due"])}
    <tbody>${emptyRows(12, Array(7).fill(""))}</tbody>
  </table>
  ${footerHtml()}
</div></div></body></html>`,

  manual: `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:0;}
.wrap{max-width:900px;margin:0 auto;padding-bottom:40px;}
h2{color:#1e3a5f;font-size:16px;margin-top:28px;}
p,li{font-size:13px;line-height:1.8;color:#334155;}
ul{margin:8px 0 16px;padding-left:24px;}
.policy-box{background:#f0f9ff;border-left:4px solid #2563eb;padding:16px 20px;border-radius:0 8px 8px 0;margin:16px 0;}
</style></head><body><div class="wrap">
${headerHtml("Medication Management Manual", "Policies & Procedures — SZ-JIE WANG Support Services")}
<div style="padding:0 32px;">
  <div class="policy-box"><strong>Policy Statement:</strong> SZ-JIE WANG Support Services is committed to safe, accurate and person-centred medication management that upholds the rights and dignity of all participants. All staff must follow this policy and the relevant NSW Health and NDIS Commission guidelines.</div>
  <h2>1. Purpose & Scope</h2>
  <p>This manual applies to all staff employed by SZ-JIE WANG Support Services who are involved in any aspect of medication management including administration, storage, documentation and disposal.</p>
  <h2>2. Legislative Framework</h2>
  <ul>
    <li>Poisons and Therapeutic Goods Act 1966 (NSW)</li>
    <li>Poisons and Therapeutic Goods Regulation 2008 (NSW)</li>
    <li>NDIS Quality and Safeguards Commission Act 2018</li>
    <li>NDIS Practice Standards — Module 3: Specialist Behaviour Support</li>
    <li>NSW Health Policy Directive PD2013_043 — Medication Handling in NSW Public Hospitals</li>
  </ul>
  <h2>3. The 8 Rights of Medication Administration</h2>
  <ul>
    <li><strong>Right Person</strong> — Verify the participant's identity before administration</li>
    <li><strong>Right Medication</strong> — Check medication name matches the prescription</li>
    <li><strong>Right Dose</strong> — Confirm the dose is correct as per the prescription</li>
    <li><strong>Right Route</strong> — Confirm the method (oral, topical, inhaled etc.)</li>
    <li><strong>Right Time</strong> — Administer at the correct scheduled time</li>
    <li><strong>Right Documentation</strong> — Record administration immediately after giving</li>
    <li><strong>Right Reason</strong> — Confirm the indication for the medication</li>
    <li><strong>Right Response</strong> — Monitor for therapeutic effect and adverse reactions</li>
  </ul>
  <h2>4. Storage of Medications</h2>
  <p>All medications must be stored in a locked, secure location. Refrigerated medications must be kept at 2–8°C. Controlled medications (Schedule 8) must be stored in a double-locked safe and logged in the Controlled Medication Register at all times.</p>
  <h2>5. Administration Procedure</h2>
  <ul>
    <li>Wash hands before and after administration</li>
    <li>Check participant's current medication profile before administering</li>
    <li>Never crush or alter medication without pharmacist or prescriber advice</li>
    <li>If participant refuses, document refusal and notify supervisor</li>
    <li>Record all administrations in the MAR immediately</li>
  </ul>
  <h2>6. Incident Reporting</h2>
  <p>Any medication error, missed dose, adverse reaction or discrepancy must be reported immediately using the Medication Incident Report form. Notify the supervisor, participant's GP, and family/guardian within 24 hours. Serious incidents must be reported to the NDIS Quality and Safeguards Commission.</p>
  <h2>7. Disposal</h2>
  <p>Unused, expired or returned medications must be returned to a pharmacy for safe disposal. Do not dispose of medications in household bins or wastewater. Record all disposal in the Controlled Medication Register (for Schedule 8) or participant file.</p>
  <h2>8. Review</h2>
  <p>This manual is reviewed annually or following any significant medication incident. All staff must sign to confirm they have read and understood this policy.</p>
  ${sectionHeader("9", "Staff Acknowledgement")}
  <table>
    ${tableHeader(["Staff Name","Role","Date Read","Signature"])}
    <tbody>${emptyRows(10, Array(4).fill(""))}</tbody>
  </table>
  <p style="font-size:11px;color:#94a3b8;margin-top:20px;text-align:center;">SZ-JIE WANG Support Services · Document Owner: SZ Jie Wang · Review Date: Annually</p>
</div></div></body></html>`,
};

export default function MedicationHub() {
  const [selected, setSelected] = useState(null);

  const print = () => window.print();

  if (selected) {
    const form = FORMS.find(f => f.id === selected);
    return (
      <div>
        <style>{`@media print { .no-print { display: none !important; } }`}</style>
        <div className="no-print flex items-center justify-between mb-4 p-4 bg-card border-b border-border">
          <button onClick={() => setSelected(null)} className="text-primary font-bold text-sm hover:underline">← Back to Hub</button>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm">{form.label}</span>
            <Button onClick={print} variant="outline" className="rounded-xl gap-2"><Printer size={15} /> Print / Save PDF</Button>
          </div>
        </div>
        <iframe
          srcDoc={FORM_HTML[selected]}
          className="w-full border-0"
          style={{ height: "calc(100vh - 70px)" }}
          title={form.label}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <img src={LOGO} alt="SZ-JIE WANG Support Services" className="h-14 object-contain hidden sm:block" />
        <div>
          <h2 className="text-3xl font-black tracking-tight">Medication Management Hub</h2>
          <p className="text-muted-foreground text-sm">All medication forms, registers and policies — click any form to preview and print.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {FORMS.map(f => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => setSelected(f.id)}
              className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md ${f.bg}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shrink-0`}>
                <Icon size={20} className={f.color} />
              </div>
              <div>
                <p className={`font-black text-sm ${f.color}`}>{f.label}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Printer size={10} /> Print-ready form</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <p className="font-black mb-1">📋 How to use these forms</p>
        <p>Click any form to open the full print-ready document. Use <strong>Print / Save PDF</strong> to generate a PDF or print a hard copy. All forms are pre-branded with the SZ-JIE WANG Support Services logo.</p>
      </div>
    </div>
  );
}