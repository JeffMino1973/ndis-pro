export const NDIS_ITEMS = [
  // Core Supports: Assistance with Daily Life
  { code: "01_011_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Weekday Daytime (Inc. Meal Prep / Nutrition)", category: "Core Supports: Assistance with Daily Life", unit: "Hour", rate: 73.57, effective_from: "2026-07-01" },
  { code: "01_012_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Saturday", category: "Core Supports: Assistance with Daily Life", unit: "Hour", rate: 103.52, effective_from: "2026-07-01" },
  { code: "01_013_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Sunday", category: "Core Supports: Assistance with Daily Life", unit: "Hour", rate: 133.48, effective_from: "2026-07-01" },
  { code: "01_014_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Public Holiday", category: "Core Supports: Assistance with Daily Life", unit: "Hour", rate: 163.44, effective_from: "2026-07-01" },
  { code: "01_004_0107_1_1", name: "Assistance with Personal Domestic Activities", category: "Core Supports: Assistance with Daily Life", unit: "Hour", rate: 61.87, effective_from: "2026-07-01" },
  { code: "01_058_0115_1_1", name: "Short Term Respite (STA) - 1:2 Ratio - Weekday", category: "Core Supports: Assistance with Daily Life", unit: "Day", rate: 1255.63, effective_from: "2026-07-01" },
  { code: "01_059_0115_1_1", name: "Short Term Respite (STA) - 1:2 Ratio - Saturday", category: "Core Supports: Assistance with Daily Life", unit: "Day", rate: 1573.31, effective_from: "2026-07-01" },
  { code: "01_060_0115_1_1", name: "Short Term Respite (STA) - 1:2 Ratio - Sunday", category: "Core Supports: Assistance with Daily Life", unit: "Day", rate: 1962.23, effective_from: "2026-07-01" },

  // Core Supports: Assistance with Social, Economic and Community Participation
  { code: "04_111_0136_6_1", name: "Group Activities in the Community - Standard - Weekday Daytime", category: "Core Supports: Community Participation", unit: "Hour", rate: 73.57, effective_from: "2026-07-01" },
  { code: "04_104_0125_6_1", name: "Access Community Social and Rec Activ - Standard - Saturday", category: "Core Supports: Community Participation", unit: "Hour", rate: 103.52, effective_from: "2026-07-01" },
  { code: "04_105_0125_6_1", name: "Access Community Social and Rec Activ - Standard - Sunday", category: "Core Supports: Community Participation", unit: "Hour", rate: 133.48, effective_from: "2026-07-01" },
  { code: "04_599_0136_6_1", name: "Centre Capital Cost", category: "Core Supports: Community Participation", unit: "Hour", rate: 2.59, effective_from: "2026-07-01" },

  // Capacity Building Supports
  { code: "14_033_0127_8_3", name: "Plan Management - Monthly Fee (Choice and Control)", category: "Capacity Building Supports", unit: "Month", rate: 104.45, effective_from: "2026-07-01" },
  { code: "14_042_0110_8_3", name: "Specialist Behavioural Intervention Support", category: "Capacity Building Supports", unit: "Hour", rate: 252.99, effective_from: "2026-07-01" },
  { code: "14_043_0110_8_3", name: "Behaviour Management Plan Training", category: "Capacity Building Supports", unit: "Hour", rate: 252.99, effective_from: "2026-07-01" },
  { code: "15_056_0128_1_3", name: "Assessment Recommendation Therapy or Training - Occupational Therapist", category: "Capacity Building Supports", unit: "Hour", rate: 193.99, effective_from: "2026-07-01" },
  { code: "07_002_0106_8_3", name: "Support Coordination Level 2: Coordination of Supports", category: "Capacity Building Supports", unit: "Hour", rate: 100.14, effective_from: "2026-07-01" },

  // Recurring Supports
  { code: "02_051_0108_1_1", name: "Recurring Transport", category: "Recurring Supports", unit: "Annual Block", rate: 2676.00, effective_from: "2026-07-01" },
];

export const NDIS_ITEMS_BY_CODE = Object.fromEntries(NDIS_ITEMS.map(i => [i.code, i]));