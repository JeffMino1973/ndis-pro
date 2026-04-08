// NDIS Support Catalogue 2022-23 — NSW rates
// Source: NDIS Pricing Arrangements and Price Limits

export const NDIS_ITEMS = [
  // 01 - Daily Personal Activities
  { code: "01_002_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Weekday Night", category: "Assistance with Daily Life", rate: 69.77 },
  { code: "01_004_0107_1_1", name: "Assistance with Personal Domestic Activities", category: "Assistance with Daily Life", rate: 52.73 },
  { code: "01_010_0107_1_1", name: "Assistance With Self-Care Activities - Night-Time Sleepover", category: "Assistance with Daily Life", rate: 262.16 },
  { code: "01_011_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Weekday Daytime", category: "Assistance with Daily Life", rate: 62.17 },
  { code: "01_012_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Public Holiday", category: "Assistance with Daily Life", rate: 138.20 },
  { code: "01_013_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Saturday", category: "Assistance with Daily Life", rate: 87.51 },
  { code: "01_014_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Sunday", category: "Assistance with Daily Life", rate: 112.85 },
  { code: "01_015_0107_1_1", name: "Assistance With Self-Care Activities - Standard - Weekday Evening", category: "Assistance with Daily Life", rate: 68.50 },
  { code: "01_016_0104_1_1", name: "Specialised Home Based Assistance For A Child", category: "Assistance with Daily Life", rate: 52.73 },
  { code: "01_019_0120_1_1", name: "House or Yard Maintenance", category: "Assistance with Daily Life", rate: 50.87 },
  { code: "01_020_0120_1_1", name: "House Cleaning And Other Household Activities", category: "Assistance with Daily Life", rate: 51.81 },
  { code: "01_049_0107_1_1", name: "Establishment Fee For Personal Care/Participation", category: "Assistance with Daily Life", rate: 621.70 },
  { code: "01_300_0104_1_1", name: "Assistance With Self-Care Activities - High Intensity - Weekday Daytime", category: "Assistance with Daily Life", rate: 68.65 },
  { code: "01_301_0104_1_1", name: "Assistance With Self-Care Activities - High Intensity - Weekday Evening", category: "Assistance with Daily Life", rate: 75.52 },
  { code: "01_302_0104_1_1", name: "Assistance With Self-Care Activities - High Intensity - Saturday", category: "Assistance with Daily Life", rate: 96.56 },
  { code: "01_303_0104_1_1", name: "Assistance With Self-Care Activities - High Intensity - Sunday", category: "Assistance with Daily Life", rate: 124.47 },
  { code: "01_304_0104_1_1", name: "Assistance With Self-Care Activities - High Intensity - Public Holiday", category: "Assistance with Daily Life", rate: 152.38 },
  { code: "01_305_0104_1_1", name: "Assistance With Self-Care Activities - High Intensity - Weekday Night", category: "Assistance with Daily Life", rate: 75.52 },
  { code: "01_400_0115_1_1", name: "Assistance With Daily Life Tasks In Shared Living - Weekday Daytime", category: "Assistance with Daily Life", rate: 62.17 },
  { code: "01_401_0115_1_1", name: "Assistance With Daily Life Tasks In Shared Living - Weekday Evening", category: "Assistance with Daily Life", rate: 68.50 },
  { code: "01_402_0115_1_1", name: "Assistance With Daily Life Tasks In Shared Living - Saturday", category: "Assistance with Daily Life", rate: 87.51 },
  { code: "01_403_0115_1_1", name: "Assistance With Daily Life Tasks In Shared Living - Sunday", category: "Assistance with Daily Life", rate: 112.85 },
  { code: "01_404_0115_1_1", name: "Assistance With Daily Life Tasks In Shared Living - Public Holiday", category: "Assistance with Daily Life", rate: 138.20 },
  { code: "01_700_0115_1_1", name: "STA And Assistance (Respite) - 1:1 - Weekday", category: "Assistance with Daily Life", rate: 2028.64 },
  { code: "01_701_0115_1_1", name: "STA And Assistance (Respite) - 1:1 - Saturday", category: "Assistance with Daily Life", rate: 2231.03 },
  { code: "01_702_0115_1_1", name: "STA And Assistance (Respite) - 1:1 - Sunday", category: "Assistance with Daily Life", rate: 2433.41 },
  { code: "01_703_0115_1_1", name: "STA And Assistance (Respite) - 1:1 - Public Holiday", category: "Assistance with Daily Life", rate: 2635.80 },
  // 03 - Supported Independent Living (SIL)
  { code: "01_045_0115_1_1", name: "STA And Assistance (Inc. Respite) - 1:4 - Weekday", category: "Assistance with Daily Life", rate: 626.62 },
  // 04 - Community Participation
  { code: "04_102_0125_6_1", name: "Access Community Social And Rec Activities - Standard - Weekday Daytime", category: "Social, Economic & Community Participation", rate: 62.17 },
  { code: "04_103_0125_6_1", name: "Access Community Social And Rec Activities - Standard - Public Holiday", category: "Social, Economic & Community Participation", rate: 138.20 },
  { code: "04_104_0125_6_1", name: "Access Community Social And Rec Activities - Standard - Saturday", category: "Social, Economic & Community Participation", rate: 87.51 },
  { code: "04_105_0125_6_1", name: "Access Community Social And Rec Activities - Standard - Sunday", category: "Social, Economic & Community Participation", rate: 112.85 },
  { code: "04_106_0125_6_1", name: "Access Community Social And Rec Activities - Standard - Weekday Evening", category: "Social, Economic & Community Participation", rate: 68.50 },
  { code: "04_107_0125_6_1", name: "Access Community Social And Rec Activities - High Intensity - Weekday Daytime", category: "Social, Economic & Community Participation", rate: 68.65 },
  { code: "04_108_0125_6_1", name: "Access Community Social And Rec Activities - High Intensity - Saturday", category: "Social, Economic & Community Participation", rate: 96.56 },
  { code: "04_109_0125_6_1", name: "Access Community Social And Rec Activities - High Intensity - Sunday", category: "Social, Economic & Community Participation", rate: 124.47 },
  { code: "04_200_0136_6_1", name: "Group Activities - Ratio 1:1 - Weekday Daytime", category: "Social, Economic & Community Participation", rate: 62.17 },
  { code: "04_210_0136_6_1", name: "Group Activities - Ratio 1:2 - Weekday Daytime", category: "Social, Economic & Community Participation", rate: 35.93 },
  { code: "04_220_0136_6_1", name: "Group Activities - Ratio 1:3 - Weekday Daytime", category: "Social, Economic & Community Participation", rate: 25.86 },
  { code: "04_400_0136_6_1", name: "Centre Based Activities - Ratio 1:1 - Weekday Daytime", category: "Social, Economic & Community Participation", rate: 62.17 },
  // 07 - Support Coordination
  { code: "07_001_0106_1_3", name: "Support Connection", category: "Support Coordination", rate: 65.09 },
  { code: "07_002_0106_1_3", name: "Coordination of Supports", category: "Support Coordination", rate: 100.14 },
  { code: "07_004_0132_8_3", name: "Specialist Support Coordination", category: "Support Coordination", rate: 190.54 },
  // 08 - Plan Management
  { code: "08_001_0106_6_3", name: "Plan Management - Financial Administration (Monthly)", category: "Improved Living Arrangements", rate: 104.45 },
  { code: "08_002_0106_6_3", name: "Plan Management - Set Up and Ongoing (Once Off)", category: "Improved Living Arrangements", rate: 234.87 },
  // 09 - Therapeutic Supports
  { code: "09_001_0128_1_3", name: "Therapy Support - Physiotherapy", category: "Increased Social and Community Participation", rate: 193.99 },
  { code: "09_002_0128_1_3", name: "Therapy Support - Occupational Therapy", category: "Increased Social and Community Participation", rate: 193.99 },
  { code: "09_003_0128_1_3", name: "Therapy Support - Psychology", category: "Increased Social and Community Participation", rate: 234.43 },
  { code: "09_004_0128_1_3", name: "Therapy Support - Speech Pathology", category: "Increased Social and Community Participation", rate: 193.99 },
  { code: "09_005_0128_1_3", name: "Therapy Support - Dietetics", category: "Increased Social and Community Participation", rate: 154.60 },
  { code: "09_006_0128_1_3", name: "Therapy Support - Podiatry", category: "Increased Social and Community Participation", rate: 154.60 },
  { code: "09_007_0128_1_3", name: "Therapy Support - Music Therapy", category: "Increased Social and Community Participation", rate: 154.60 },
  { code: "09_008_0128_1_3", name: "Therapy Support - Art Therapy", category: "Increased Social and Community Participation", rate: 154.60 },
  { code: "09_009_0115_1_1", name: "Innovative Community Participation", category: "Increased Social and Community Participation", rate: 62.17 },
  // 11 - Life Skills
  { code: "11_022_0117_1_3", name: "Individual Life Skills - Weekday Daytime", category: "Improved Daily Living Skills", rate: 65.09 },
  { code: "11_023_0117_1_3", name: "Individual Life Skills - Weekday Evening", category: "Improved Daily Living Skills", rate: 71.60 },
  { code: "11_024_0117_1_3", name: "Individual Life Skills - Saturday", category: "Improved Daily Living Skills", rate: 91.60 },
  { code: "11_025_0117_1_3", name: "Individual Life Skills - Sunday", category: "Improved Daily Living Skills", rate: 118.10 },
  { code: "11_026_0117_1_3", name: "Individual Life Skills - Public Holiday", category: "Improved Daily Living Skills", rate: 144.61 },
  { code: "11_011_0117_7_3", name: "Life Transition Planning (incl. Mentoring, Peer Support)", category: "Improved Daily Living Skills", rate: 65.09 },
  { code: "11_015_0117_1_3", name: "Daily Activities Support For People With ABI - Weekday Daytime", category: "Improved Daily Living Skills", rate: 65.09 },
  // 12 - Communication
  { code: "12_016_0119_1_3", name: "Skills Development Activities for Improved Communication", category: "Improved Learning", rate: 65.09 },
  // 13 - Better Daily Life
  { code: "13_015_0102_1_3", name: "Assessment Recommendation Therapy or Training - Speech Path", category: "Improved Health and Wellbeing", rate: 193.99 },
  // 14 - Community Nursing
  { code: "14_015_0127_1_3", name: "Community Nursing Care - Standard", category: "Improved Health and Wellbeing", rate: 112.64 },
  { code: "14_033_0127_1_3", name: "Community Nursing Care - Nurse Practitioner", category: "Improved Health and Wellbeing", rate: 234.43 },
  // 15 - Behaviour Support
  { code: "15_002_0128_1_3", name: "Specialist Positive Behaviour Support", category: "Improved Learning", rate: 214.41 },
  { code: "15_056_0128_1_3", name: "Assessment Recommendation Therapy or Training - Other Therapy", category: "Improved Learning", rate: 193.99 },
  // 16 - Specialist Disability Accommodation
  { code: "15_003_0128_1_3", name: "Development of Behaviour Support Plan", category: "Improved Learning", rate: 214.41 },
  // 18 - Early Childhood
  { code: "10_006_0118_5_3", name: "Development of Behaviour Support Plan by NDIS Registered Provider", category: "Improved Daily Living Skills", rate: 214.41 },
  // General Allied Health
  { code: "01_741_0128_1_3", name: "Assessment Recommendation Therapy or Training - Social Worker", category: "Assistance with Daily Life", rate: 193.99 },
  { code: "01_742_0128_1_3", name: "Assessment Recommendation Therapy or Training - Counsellor", category: "Assistance with Daily Life", rate: 193.99 },
];

export const NDIS_ITEMS_BY_CODE = Object.fromEntries(NDIS_ITEMS.map(i => [i.code, i]));