// Single source of truth for the business logo URL used across ALL generated
// documents — invoices, payslips, bank reconciliation reports, and email
// templates.
//
// Update the URL here ONCE and every document generator picks it up. This
// prevents the logo from silently dropping out of individual documents when
// only one generator is patched (which is why the logo kept disappearing
// week after week — each fix only touched one of several hardcoded copies).
export const LOGO_URL = "https://media.base44.com/images/public/69d54775d9a169daad84a133/5a211afd4_logo_coloured_transpaprent.png";