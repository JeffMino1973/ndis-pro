// Shift Note HTML workbook templates — mapped by day + program type
export const SHIFT_NOTE_TEMPLATES = [
  {
    id: "monday_library",
    label: "Monday — Library Learning",
    description: "Library Learning shift notes workbook",
    days: ["Monday"],
    program_types: ["Life Skills Program"],
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/bfa24f5b8_Monday_Library_ShiftNotes.html",
  },
  {
    id: "wednesday_library",
    label: "Wednesday — Library Learning",
    description: "Library Learning shift notes workbook",
    days: ["Wednesday"],
    program_types: ["Life Skills Program"],
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/9620a2b1d_Wednesday_Library_ShiftNotes.html",
  },
  {
    id: "friday_library",
    label: "Friday — Library Learning",
    description: "Library Learning shift notes workbook",
    days: ["Friday"],
    program_types: ["Life Skills Program"],
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/4aaeb39df_Friday_Library_ShiftNotes.html",
  },
  {
    id: "saturday_domestic",
    label: "Saturday — Domestic Skills",
    description: "Domestic Skills shift notes workbook",
    days: ["Saturday"],
    program_types: ["Domestic Skills"],
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/da8425408_SaturdayDomesticSkillsShiftNotes.html",
  },
  {
    id: "sunday_community",
    label: "Sunday — Community Access",
    description: "Community Access shift notes workbook",
    days: ["Sunday"],
    program_types: ["Community Program"],
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/d2d10312d_Sunday_Community_AccessShiftNotes.html",
  },
  {
    id: "tue_thu_travel",
    label: "Tuesday & Thursday — Travel",
    description: "Travel shift notes workbook",
    days: ["Tuesday", "Thursday"],
    program_types: ["Travel Training"],
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/b027183b9_TuesdayThursdayTravelShiftNotes.html",
  },
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getDayOfWeek(dateStr) {
  if (!dateStr) return "";
  try {
    return DAY_NAMES[new Date(dateStr + "T00:00:00").getDay()];
  } catch {
    return "";
  }
}

// Find the best-matching template for a given shift (by day + program type)
export function getTemplateForShift(shift) {
  if (!shift) return null;
  const dow = getDayOfWeek(shift.date);
  // Try exact day + program type match first
  let match = SHIFT_NOTE_TEMPLATES.find(t =>
    t.days.includes(dow) && t.program_types.includes(shift.program_type)
  );
  if (match) return match;
  // Fall back to day-only match
  match = SHIFT_NOTE_TEMPLATES.find(t => t.days.includes(dow));
  if (match) return match;
  // Fall back to program-type-only match
  match = SHIFT_NOTE_TEMPLATES.find(t => t.program_types.includes(shift.program_type));
  return match || null;
}