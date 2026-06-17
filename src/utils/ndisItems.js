export const NDIS_ITEMS = [
  { code: "01_004_0107_1_1", name: "Assistance with Personal Domestic Activities", category: "Daily Activities", unit: "Hour", rate: 59.06 },
  { code: "04_104_0125_6_1", name: "Access Community, Social and Rec Activ – Standard – Weekday Daytime", category: "Community Participation", unit: "Hour", rate: 70.23 },
  { code: "04_105_0125_6_1", name: "Access Community, Social and Rec Activ – Standard – Saturday", category: "Community Participation", unit: "Hour", rate: 98.83 },
  { code: "04_106_0125_6_1", name: "Access Community, Social and Rec Activ – Standard – Sunday", category: "Community Participation", unit: "Hour", rate: 127.43 },
  { code: "104_102_0125_6_1", name: "Access Community, Social and Rec Activ – Standard – Public Holiday", category: "Community Participation", unit: "Hour", rate: 156.03 },
];

export const NDIS_ITEMS_BY_CODE = Object.fromEntries(NDIS_ITEMS.map(i => [i.code, i]));