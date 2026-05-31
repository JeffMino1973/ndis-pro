/**
 * ATO Tax Calculation Utility — 2025–26 Financial Year
 *
 * Supports:
 *  - Resident (with/without TFN, with/without tax-free threshold claimed)
 *  - Non-resident
 *  - Working Holiday Maker (WHM)
 *  - LITO (Low Income Tax Offset)
 *  - Medicare Levy (with low-income reduction thresholds)
 *  - SGC Superannuation (12%)
 *
 * Reference: ATO Tax Withheld Calculator & NAT 1008 tax tables 2025–26
 */

// ── Resident income tax brackets (2025–26) ──────────────────────────────────
function calcResidentTax(annual) {
  if (annual <= 18200) return 0;
  if (annual <= 45000) return (annual - 18200) * 0.19;
  if (annual <= 135000) return 5092 + (annual - 45000) * 0.325;
  if (annual <= 190000) return 34204 + (annual - 135000) * 0.37;
  return 54630 + (annual - 190000) * 0.45;
}

// ── Non-resident tax brackets (2025–26) ─────────────────────────────────────
function calcNonResidentTax(annual) {
  if (annual <= 135000) return annual * 0.325;
  if (annual <= 190000) return 43875 + (annual - 135000) * 0.37;
  return 64225 + (annual - 190000) * 0.45;
}

// ── Working Holiday Maker tax brackets (2025–26) ─────────────────────────────
function calcWHMTax(annual) {
  if (annual <= 45000) return annual * 0.15;
  if (annual <= 135000) return 6750 + (annual - 45000) * 0.325;
  if (annual <= 190000) return 36000 + (annual - 135000) * 0.37;
  return 56350 + (annual - 190000) * 0.45;
}

// ── No TFN rate (highest marginal rate + Medicare) ───────────────────────────
// ATO requires withholding at 47% flat if no TFN or ABN quoted
function calcNoTFNTax(annual) {
  return annual * 0.47;
}

// ── LITO (Low Income Tax Offset) 2025–26 ────────────────────────────────────
function calcLITO(annual) {
  if (annual <= 37500) return 700;
  if (annual <= 45000) return 700 - (annual - 37500) * 0.05;
  if (annual <= 66667) return 325 - (annual - 45000) * 0.015;
  return 0;
}

// ── LMITO was removed from 1 July 2022. Not applicable for 2025–26.

// ── Medicare Levy 2025–26 ────────────────────────────────────────────────────
// Standard rate: 2.0%
// Low-income threshold (singles): $26,000 shade-in, full levy above $32,500
// Reduction: 10 cents per $ from $26,000; nil below that threshold
function calcMedicare(annual, hasMedicareExemption = false) {
  if (hasMedicareExemption) return 0;

  const LOWER = 26000;  // No medicare below this
  const UPPER = 32500;  // Full 2% above this
  const RATE = 0.02;
  const SHADE_IN_RATE = 0.10; // Shade-in rate: 10c per dollar

  if (annual <= LOWER) return 0;
  if (annual <= UPPER) return (annual - LOWER) * SHADE_IN_RATE;
  return annual * RATE;
}

// ── Periods per year ─────────────────────────────────────────────────────────
export const PERIODS = { weekly: 52, fortnightly: 26, monthly: 12 };

/**
 * Main calculation function.
 *
 * @param {number} grossPerPeriod - Gross pay for this pay period
 * @param {string} payPeriod - "weekly" | "fortnightly" | "monthly"
 * @param {string} taxStatus - "resident_with_threshold" | "resident_no_threshold" | "non_resident" | "working_holiday" | "no_tfn"
 * @param {boolean} medicareExemption - true if employee has a Medicare exemption
 * @returns {{ tax: number, medicare: number, super: number, net: number, annualised: number }}
 */
export function calcPayPeriodDeductions(
  grossPerPeriod,
  payPeriod = "fortnightly",
  taxStatus = "resident_with_threshold",
  medicareExemption = false
) {
  const periodsPerYear = PERIODS[payPeriod] || 26;
  const annual = grossPerPeriod * periodsPerYear;

  let annualTax = 0;

  switch (taxStatus) {
    case "resident_with_threshold":
      annualTax = Math.max(0, calcResidentTax(annual) - Math.max(0, calcLITO(annual)));
      break;
    case "resident_no_threshold":
      // No tax-free threshold — tax on every dollar from $1, still gets LITO
      annualTax = Math.max(0, calcResidentTaxNoThreshold(annual) - Math.max(0, calcLITO(annual)));
      break;
    case "non_resident":
      annualTax = calcNonResidentTax(annual); // Non-residents don't get LITO or Medicare
      return {
        tax: annualTax / periodsPerYear,
        medicare: 0,
        super: grossPerPeriod * 0.12,
        net: Math.max(0, grossPerPeriod - annualTax / periodsPerYear - grossPerPeriod * 0.12),
        annualised: annual,
      };
    case "working_holiday":
      annualTax = calcWHMTax(annual);
      return {
        tax: annualTax / periodsPerYear,
        medicare: 0,  // WHMs are generally not eligible for Medicare
        super: grossPerPeriod * 0.12,
        net: Math.max(0, grossPerPeriod - annualTax / periodsPerYear - grossPerPeriod * 0.12),
        annualised: annual,
      };
    case "no_tfn":
      annualTax = calcNoTFNTax(annual);
      return {
        tax: annualTax / periodsPerYear,
        medicare: 0, // Medicare already factored in the 47% flat rate
        super: grossPerPeriod * 0.12,
        net: Math.max(0, grossPerPeriod - annualTax / periodsPerYear - grossPerPeriod * 0.12),
        annualised: annual,
      };
    default:
      annualTax = Math.max(0, calcResidentTax(annual) - Math.max(0, calcLITO(annual)));
  }

  const annualMedicare = calcMedicare(annual, medicareExemption);
  const periodTax = annualTax / periodsPerYear;
  const periodMedicare = annualMedicare / periodsPerYear;
  const superAmt = grossPerPeriod * 0.12;
  const net = Math.max(0, grossPerPeriod - periodTax - periodMedicare - superAmt);

  return {
    tax: periodTax,
    medicare: periodMedicare,
    super: superAmt,
    net,
    annualised: annual,
  };
}

// Resident without tax-free threshold: pays tax from first dollar
// Same brackets but no $18,200 free threshold — use a flat low-income rate
function calcResidentTaxNoThreshold(annual) {
  // ATO NAT 1008: No threshold — taxed from $0 at 19% up to $45,000
  if (annual <= 45000) return annual * 0.19;
  if (annual <= 135000) return 8550 + (annual - 45000) * 0.325;
  if (annual <= 190000) return 37800 + (annual - 135000) * 0.37;
  return 58150 + (annual - 190000) * 0.45;
}

/**
 * Human-readable label for each tax status.
 */
export const TAX_STATUS_LABELS = {
  resident_with_threshold: "Australian Resident — Tax-Free Threshold Claimed",
  resident_no_threshold: "Australian Resident — No Tax-Free Threshold",
  non_resident: "Non-Resident for Tax Purposes",
  working_holiday: "Working Holiday Maker (417/462 Visa)",
  no_tfn: "No TFN Quoted (47% withholding)",
};