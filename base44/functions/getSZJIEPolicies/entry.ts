import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Policy documents with their file URLs and metadata
const SZJIE_POLICIES = [
  { id: 'szjie-001', category: 'Workforce & Employment', title: 'Self-Management Policy', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/65a6419aa_Selfmanagementpolicy.pdf' },
  { id: 'szjie-002', category: 'Client Rights & Support', title: 'Supported Decision Making Policy', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/562a60498_Supporteddecisionmakingpolicy.pdf' },
  { id: 'szjie-003', category: 'Workforce & Employment', title: 'Workplace Behaviour', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/f92330d1b_Workplacebehaviour.pdf' },
  { id: 'szjie-004', category: 'Safety, Risk & Incidents', title: 'Workplace Health and Safety Booklet', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/0829d00a6_Workplacehealthandsafetybooklet.pdf' },
  { id: 'szjie-005', category: 'Client Rights & Support', title: 'Client Documentation', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/24dbc93d3_Clientdocumentation.pdf' },
  { id: 'szjie-006', category: 'Client Rights & Support', title: 'Diversity and Inclusion', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/ee658d085_Diversityandinclusion.pdf' },
  { id: 'szjie-007', category: 'Client Rights & Support', title: 'Duty of Care and Dignity of Risk', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/8d92d7039_Dutyofcareanddignityofrisk.pdf' },
  { id: 'szjie-008', category: 'Safety, Risk & Incidents', title: 'Emergency Procedures', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/62d46a6af_Emergencyprocedures.pdf' },
  { id: 'szjie-009', category: 'Workforce & Employment', title: 'Employee Code of Conduct', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/96776b387_Employeecodeofconduct.pdf' },
  { id: 'szjie-010', category: 'Safety, Risk & Incidents', title: 'Fire Safety', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/5f3f55ef6_Firesafety.pdf' },
  { id: 'szjie-011', category: 'Workforce & Employment', title: 'Human Resources', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/553bd0892_Humanresources.pdf' },
  { id: 'szjie-012', category: 'Client Rights & Support', title: 'Human Rights', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/9b8297e93_Humanrights.pdf' },
  { id: 'szjie-013', category: 'Client Rights & Support', title: 'Leaving a Client Alone in a Vehicle', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/73b3e52bb_Leavingaclientaloneinavehicle.pdf' },
  { id: 'szjie-014', category: 'Compliance & Governance', title: 'NDIS Code of Conduct', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/23adaee1d_NDISCodeofConduct.pdf' },
  { id: 'szjie-015', category: 'Workforce & Employment', title: 'Personal Hygiene and Appropriate Clothing', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/7e12dffdb_Personalhygieneandappropriateclothing1.pdf' },
  { id: 'szjie-016', category: 'Client Rights & Support', title: 'Preventing and Addressing Racism', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/c0de52e69_Preventingandaddressingracism.pdf' },
  { id: 'szjie-017', category: 'Finance & Billing', title: 'Pricing', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/7c527967f_Pricing.pdf' },
  { id: 'szjie-018', category: 'Workforce & Employment', title: 'Recruitment', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/bfb6d5925_Recruitment.pdf' },
  { id: 'szjie-019', category: 'Compliance & Governance', title: 'Risk Assessed Roles and Worker Screening', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/ba008818e_RiskAssessedRolesandWorkerScreening.pdf' },
  { id: 'szjie-020', category: 'Workforce & Employment', title: 'Rosters and Relief Pool', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/5821e35da_Rostersandreliefpool.pdf' },
  { id: 'szjie-021', category: 'Workforce & Employment', title: 'Staff Meals in Shared Homes', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/93de7a642_Staffmealsinsharedhomes.pdf' },
  { id: 'szjie-022', category: 'Workforce & Employment', title: 'Supporting Return to Work Plans', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/2ccea382b_Supportingreturntoworkplans.pdf' },
  { id: 'szjie-023', category: 'Compliance & Governance', title: 'The Use of Videos and Photos', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/b8f95feeb_Theuseofvidoesandphotos.pdf' },
  { id: 'szjie-024', category: 'Safety, Risk & Incidents', title: 'Waste Management', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/905ab4e12_Wastemanagement.pdf' },
  { id: 'szjie-025', category: 'Workforce & Employment', title: 'Bullying, Harassment and Discrimination', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/9c93b1bc2_Bullyingharassmentanddiscrimination.pdf' },
  { id: 'szjie-026', category: 'Client Rights & Support', title: 'Complaint Management', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/e3ec5881b_Complaintmanagement.pdf' },
  { id: 'szjie-027', category: 'Workforce & Employment', title: 'Conflicts of Responsibility', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/757b6ef6a_Conflictsofresponsibility.pdf' },
  { id: 'szjie-028', category: 'Compliance & Governance', title: 'Continuous Improvement', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/970da460b_Continuousimprovement.pdf' },
  { id: 'szjie-029', category: 'Workforce & Employment', title: "Driver's Licence", url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/9df3d02d4_Driverslicence.pdf' },
  { id: 'szjie-030', category: 'Workforce & Employment', title: 'Drugs and Alcohol', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/39fe4a2cf_Drugsandalcohol.pdf' },
  { id: 'szjie-031', category: 'Client Rights & Support', title: 'Entry and Exit', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/b910c833e_Entryandexit.pdf' },
  { id: 'szjie-032', category: 'Workforce & Employment', title: 'Failure to Attend Training Appointments', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/998aae9d8_Failuretoattendtrainingappointments.pdf' },
  { id: 'szjie-033', category: 'Workforce & Employment', title: 'How to Stay Out of Trouble in the Workplace', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/e20c5f9a0_Howtostayoutoftroubleintheworkplace.pdf' },
  { id: 'szjie-034', category: 'Safety, Risk & Incidents', title: 'Infection Prevention and Control (Including Sharps)', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/606c63d9c_Infectionpreventionandcontrol.pdf' },
  { id: 'szjie-035', category: 'Workforce & Employment', title: 'Personal Belongings in the Workplace', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/c42b004f4_Personalbelongingsintheworkplace.pdf' },
  { id: 'szjie-036', category: 'Compliance & Governance', title: 'Staff Records', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/1306cd85c_Staffrecords.pdf' },
  { id: 'szjie-037', category: 'Compliance & Governance', title: 'Procedures for Dealing with Public Interest Disclosures', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/86b52ab32_ProceduresfordealingwithPublicInterestDisclosures.docx' },
  { id: 'szjie-038', category: 'Workforce & Employment', title: 'Communication Style Guide', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/342619f8e_Communicationstyleguide.pdf' },
  { id: 'szjie-039', category: 'Compliance & Governance', title: 'Conflict of Interest', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/785a1bb40_Conflictofinterest.pdf' },
  { id: 'szjie-040', category: 'Client Rights & Support', title: 'Continuity of Supports', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/66a90d612_Continuityofsupports.pdf' },
  { id: 'szjie-041', category: 'Client Rights & Support', title: 'Decision Making and Consent', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/cd294b510_Decisionmakingandconsent.pdf' },
  { id: 'szjie-042', category: 'Workforce & Employment', title: 'Demeanour Guide for All Employees in Frontline Positions', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/aa8607adf_Demeanourguideforallemployeesinfrontlinepositions.pdf' },
  { id: 'szjie-043', category: 'Workforce & Employment', title: 'Employee Personal Phone Use and Rest Breaks', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/dd68e6aa0_Employeepersonalphoneuseandrestbreaks.pdf' },
  { id: 'szjie-044', category: 'Compliance & Governance', title: 'Guide to Safe Use of Social Media', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/f69715f1d_Guidetosafeuseofsocialmedia.pdf' },
  { id: 'szjie-045', category: 'Workforce & Employment', title: 'How to Work in a Team', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/f2b55f927_Howtoworkinateam.pdf' },
  { id: 'szjie-046', category: 'Workforce & Employment', title: 'Leave Process', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/50bf9ff7c_Leaveprocess.pdf' },
  { id: 'szjie-047', category: 'Workforce & Employment', title: 'Managing Staff Depletion Through Illness', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/8f2103e59_ManagingstaffdepletionthroughIllness.pdf' },
  { id: 'szjie-048', category: 'Workforce & Employment', title: 'Sexual Harassment', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/db93bfa2f_Sexualharassment.pdf' },
  { id: 'szjie-049', category: 'Safety, Risk & Incidents', title: 'Smoking and Vaping', url: 'https://media.base44.com/files/public/69d54775d9a169daad84a133/e7a0fbf3e_Smokingandvaping.pdf' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    return Response.json({ policies: SZJIE_POLICIES, count: SZJIE_POLICIES.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});