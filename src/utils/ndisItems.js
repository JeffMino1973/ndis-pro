export const NDIS_ITEMS = [
  { code: "15_035_0106_1_3", name: "Assistance With Decision Making Daily Planning and Budgeting", category: "Support Coordination", unit: "Hour", rate: 70.23 },
  { code: "15_037_0117_1_3", name: "Skill Development And Training including Public Transport Training", category: "Support Coordination", unit: "Hour", rate: 70.23 },
  { code: "15_047_0135_1_3", name: "Selection and/or Manufacture of Customised or Wearable Technology", category: "Support Coordination", unit: "Hour", rate: 193.99 },
  { code: "11_024_0117_7_3", name: "Individual Social Skills Development", category: "Therapeutic Supports", unit: "Hour", rate: 80.06 },
  { code: "10_806_0133_5_1", name: "Supports in Employment - Weekday Daytime", category: "Finding and Keeping a Job", unit: "Hour", rate: 70.23 },
  { code: "09_009_0117_6_3", name: "Skills Development and Training", category: "Improved Daily Living", unit: "Hour", rate: 80.06 },
  { code: "04_801_0133_5_1", name: "Supports in Employment - Weekday Daytime", category: "Assistance with Social, Economic and Community Participation", unit: "Hour", rate: 70.23 },
  { code: "04_802_0133_5_1", name: "Supports in Employment - Weekday Evening", category: "Assistance with Social, Economic and Community Participation", unit: "Hour", rate: 77.38 },
  { code: "04_803_0133_5_1", name: "Supports in Employment - Saturday", category: "Assistance with Social, Economic and Community Participation", unit: "Hour", rate: 98.83 },
  { code: "04_804_0133_5_1", name: "Supports in Employment - Sunday", category: "Assistance with Social, Economic and Community Participation", unit: "Hour", rate: 127.43 },
  { code: "04_805_0133_5_1", name: "Supports in Employment - Public Holiday", category: "Assistance with Social, Economic and Community Participation", unit: "Hour", rate: 156.03 },
  { code: "04_104_0125_6_1", name: "Access Community Social and Rec Activ - Standard - Weekday Daytime", category: "Assistance with Social, Economic and Community Participation", unit: "Hour", rate: 70.23 },
  { code: "04_103_0125_6_1", name: "Access Community Social and Rec Activ - Standard - Weekday Evening", category: "Assistance with Social, Economic and Community Participation", unit: "Hour", rate: 77.38 },
  { code: "04_105_0125_6_1", name: "Access Community Social and Rec Activ - Standard - Saturday", category: "Assistance with Social, Economic and Community Participation", unit: "Hour", rate: 98.83 },
  { code: "04_106_0125_6_1", name: "Access Community Social and Rec Activ - Standard - Sunday", category: "Assistance with Social, Economic and Community Participation", unit: "Hour", rate: 127.43 },
  { code: "04_102_0125_6_1", name: "Access Community Social and Rec Activ - Standard - Public Holiday", category: "Assistance with Social, Economic and Community Participation", unit: "Hour", rate: 156.03 },
];

export const NDIS_ITEMS_BY_CODE = Object.fromEntries(NDIS_ITEMS.map(i => [i.code, i]));