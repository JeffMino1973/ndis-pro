export const NDIS_ITEMS = [
  { code: "01_801_0138_1_1", name: "Support Independent Living", category: "Core Supports", unit: "Hour", rate: 73.58, effective_from: "2026-07-01" },
  { code: "01_004_0107_1_1", name: "Assistance with Personal Domestic Activities", category: "Core Supports", unit: "Hour", rate: 61.16, effective_from: "2026-07-01" },
  { code: "04_103_0125_6_1", name: "Access Community Social and Rec Activ - Standard - Weekday Daytime", category: "Core Supports", unit: "Hour", rate: 73.58, effective_from: "2026-07-01" },
];

export const NDIS_ITEMS_BY_CODE = Object.fromEntries(NDIS_ITEMS.map(i => [i.code, i]));