export const NDIS_ITEMS = [
  // Daily Activities / Personal Care
  { code: "01_002_0107_1_1", name: "Assistance with Daily Life – Standard", category: "Daily Activities", unit: "Hour", rate: 67.56 },
  { code: "01_004_0107_1_1", name: "Assistance with Personal Domestic Activity", category: "Daily Activities", unit: "Hour", rate: 59.06 },
  { code: "01_011_0107_1_1", name: "Assistance with Daily Life – Saturday", category: "Daily Activities", unit: "Hour", rate: 94.60 },
  { code: "01_012_0107_1_1", name: "Assistance with Daily Life – Sunday", category: "Daily Activities", unit: "Hour", rate: 122.14 },
  { code: "01_013_0107_1_1", name: "Assistance with Daily Life – Public Holiday", category: "Daily Activities", unit: "Hour", rate: 149.68 },

  // Community Participation / Social & Rec
  { code: "04_104_0125_6_1", name: "Access Community Social and Rec Activ (Weekday)", category: "Community Participation", unit: "Hour", rate: 70.23 },
  { code: "04_105_0125_6_1", name: "Access Community Social and Rec Activ (Saturday)", category: "Community Participation", unit: "Hour", rate: 98.83 },
  { code: "04_106_0125_6_1", name: "Access Community Social and Rec Activ (Sunday)", category: "Community Participation", unit: "Hour", rate: 127.43 },
  { code: "04_107_0125_6_1", name: "Access Community Social and Rec Activ (Public Holiday)", category: "Community Participation", unit: "Hour", rate: 156.03 },

  // Community Participation – Group
  { code: "04_210_0125_6_1", name: "Group and Centre Based Activities (Weekday)", category: "Community Participation", unit: "Hour", rate: 25.05 },
  { code: "04_215_0125_6_1", name: "Group and Centre Based Activities (Saturday)", category: "Community Participation", unit: "Hour", rate: 35.25 },
  { code: "04_216_0125_6_1", name: "Group and Centre Based Activities (Sunday)", category: "Community Participation", unit: "Hour", rate: 45.45 },

  // Capacity Building – Support Coordination
  { code: "07_001_0106_8_3", name: "Support Coordination", category: "Capacity Building", unit: "Hour", rate: 100.14 },
  { code: "07_002_0106_8_3", name: "Specialist Support Coordination", category: "Capacity Building", unit: "Hour", rate: 190.54 },

  // Capacity Building – Life Skills
  { code: "09_008_0117_6_3", name: "Skills Development and Training (Weekday)", category: "Capacity Building", unit: "Hour", rate: 67.56 },
  { code: "09_009_0117_6_3", name: "Skills Development and Training (Saturday)", category: "Capacity Building", unit: "Hour", rate: 94.60 },

  // Capacity Building – Behaviour Support
  { code: "10_001_0128_5_3", name: "Behaviour Support – Specialist Positive", category: "Capacity Building", unit: "Hour", rate: 214.41 },
  { code: "10_002_0128_5_3", name: "Behaviour Support – Implementation by Worker", category: "Capacity Building", unit: "Hour", rate: 67.56 },

  // Transport
  { code: "02_051_0108_1_1", name: "Transport – Non-Labour (per km)", category: "Transport", unit: "Each", rate: 0.97 },
  { code: "04_590_0125_6_1", name: "Activity Based Transport", category: "Transport", unit: "Each", rate: 26.76 },

  // Assistive Technology / Capital
  { code: "05_100_0118_1_1", name: "Assistive Technology – Low Cost", category: "Capital / AT", unit: "Each", rate: 1.00 },
];

export const NDIS_ITEMS_BY_CODE = Object.fromEntries(NDIS_ITEMS.map(i => [i.code, i]));