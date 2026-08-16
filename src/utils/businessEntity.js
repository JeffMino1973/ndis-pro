// Returns the correct business entity config (name, ABN, contact, bank details)
// based on a shift/invoice date vs the configured ABN change date.
// Used by invoices, payslips, and roster billing so documents show the
// correct entity (legacy vs current) for their date.
//
// Bank details are hardcoded as defaults so invoices always show payment
// info regardless of which admin user is logged in (each user may have a
// different businessConfig saved on their profile).

const DEFAULT_CURRENT_BANK = {
  bankName: "NAB",
  accountName: "SZ-JIE WANG JEFFREY KENNETH MINTON",
  bsb: "083-054",
  accountNumber: "42-731-9774",
};

const DEFAULT_LEGACY_BANK = {
  bankName: "NAB",
  accountName: "SZ-JIE WANG",
  bsb: "083-054",
  accountNumber: "429014456",
};

export function getEntityForDate(dateStr, config) {
  const newBank = {
    bankName: config?.bankName || DEFAULT_CURRENT_BANK.bankName,
    accountName: config?.accountName || DEFAULT_CURRENT_BANK.accountName,
    bsb: config?.bsb || DEFAULT_CURRENT_BANK.bsb,
    accountNumber: config?.accountNumber || DEFAULT_CURRENT_BANK.accountNumber,
  };
  const legacyBank = {
    bankName: config?.legacyBankName || config?.bankName || DEFAULT_LEGACY_BANK.bankName,
    accountName: config?.legacyAccountName || config?.accountName || DEFAULT_LEGACY_BANK.accountName,
    bsb: config?.legacyBsb || config?.bsb || DEFAULT_LEGACY_BANK.bsb,
    accountNumber: config?.legacyAccountNumber || config?.accountNumber || DEFAULT_LEGACY_BANK.accountNumber,
  };

  if (!config || !config.abnChangeDate || !dateStr) {
    return {
      name: config?.businessName || "SZ-Jie Support Services",
      abn: config?.abn || "86959042971",
      address: config?.address || "309/12 Broome St, Waterloo NSW 2017",
      email: config?.email || "jeff@szjiesupportservices.com",
      phone: config?.phone || "0401 343 876",
      website: config?.website || "www.szjiesupportservices.com",
      ...newBank,
    };
  }

  const date = typeof dateStr === "string" ? dateStr : dateStr.toISOString().split("T")[0];
  const isLegacy = date < config.abnChangeDate;

  if (isLegacy) {
    return {
      name: config.legacyBusinessName || "SZ-Jie Wang",
      abn: config.legacyAbn || "44833193250",
      address: config.address || "309/12 Broome St, Waterloo NSW 2017",
      email: config.legacyEmail || "Toby7796@gmail.com",
      phone: config.legacyPhone || "0435 951 563",
      website: config?.website || "www.szjiesupportservices.com",
      ...legacyBank,
    };
  }

  return {
    name: config.businessName || "SZ-Jie Support Services",
    abn: config.abn || "86959042971",
    address: config.address || "309/12 Broome St, Waterloo NSW 2017",
    email: config.email || "jeff@szjiesupportservices.com",
    phone: config.phone || "0401 343 876",
    website: config?.website || "www.szjiesupportservices.com",
    ...newBank,
  };
}