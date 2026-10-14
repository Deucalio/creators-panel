/**
 * Pakistan payout methods validation, formatting and bank list.
 * Aligns with PartnerLoop Account Settings specification.
 */

export const PAKISTAN_BANKS = [
  "Allied Bank",
  "Askari Bank",
  "Bank Alfalah",
  "Bank Al Habib",
  "Faysal Bank",
  "Habib Bank Limited (HBL)",
  "Habib Metropolitan Bank",
  "JS Bank",
  "Meezan Bank",
  "MCB Bank",
  "National Bank of Pakistan",
  "Soneri Bank",
  "Standard Chartered Pakistan",
  "United Bank Limited (UBL)",
] as const;

export function formatMobile(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("92")) d = "0" + d.slice(2);
  d = d.slice(0, 11);
  return d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4)}` : d;
}

export function validMobile(v: string): true | string {
  const clean = v.replace(/\s/g, "");
  return /^03\d{9}$/.test(clean) || "Enter an 11-digit number starting with 03.";
}

export function formatIban(raw: string): string {
  const s = raw.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 24);
  return s.replace(/(.{4})/g, "$1 ").trim();
}

export function ibanChecksum(iban: string): boolean {
  const s = iban.slice(4) + iban.slice(0, 4);
  let rem = 0;
  for (const ch of s) {
    const chunk = String(parseInt(ch, 36));
    for (const digit of chunk) rem = (rem * 10 + Number(digit)) % 97;
  }
  return rem === 1;
}

export function validIban(v: string): true | string {
  const s = v.replace(/\s/g, "").toUpperCase();
  if (!/^PK\d{2}[A-Z]{4}\d{16}$/.test(s)) {
    return "A Pakistani IBAN has 24 characters and starts with PK.";
  }
  return ibanChecksum(s) || "That IBAN doesn't look right. Check each digit.";
}

export function validTitle(v: string): true | string {
  return v.trim().length >= 2 || "Enter the name on the account.";
}

export function validBankName(v: string): true | string {
  return v.trim().length >= 2 || "Enter or pick your bank.";
}

export type ParsedPayouts = {
  easypaisa: { number: string; title: string };
  jazzcash: { number: string; title: string };
  bank: { bankName: string; title: string; iban: string };
};

export function parsePayoutDetails(
  method: string | null | undefined,
  raw: string | null | undefined,
): ParsedPayouts {
  const result: ParsedPayouts = {
    easypaisa: { number: "", title: "" },
    jazzcash: { number: "", title: "" },
    bank: { bankName: "", title: "", iban: "" },
  };

  if (!raw || !raw.trim()) return result;
  const text = raw.trim();

  // Try JSON first if it looks like JSON
  if (text.startsWith("{") && text.endsWith("}")) {
    try {
      const data = JSON.parse(text);
      if (data.number) {
        const formatted = formatMobile(String(data.number));
        result.easypaisa.number = formatted;
        result.jazzcash.number = formatted;
      }
      if (data.title) {
        result.easypaisa.title = String(data.title);
        result.jazzcash.title = String(data.title);
        result.bank.title = String(data.title);
      }
      if (data.bankName) result.bank.bankName = String(data.bankName);
      if (data.iban) result.bank.iban = formatIban(String(data.iban));
      return result;
    } catch {
      // fallback to text parsing
    }
  }

  // Parse multiline string
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).toLowerCase();
      const val = line.slice(colonIdx + 1).trim();
      if (key.includes("bank") && !key.includes("statement")) {
        result.bank.bankName = val;
      } else if (key.includes("iban") || key.includes("account number")) {
        result.bank.iban = formatIban(val);
      } else if (key.includes("number") || key.includes("mobile") || key.includes("phone")) {
        const formatted = formatMobile(val);
        result.easypaisa.number = formatted;
        result.jazzcash.number = formatted;
      } else if (key.includes("title") || key.includes("name") || key.includes("holder")) {
        result.easypaisa.title = val;
        result.jazzcash.title = val;
        result.bank.title = val;
      }
    } else {
      const clean = line.replace(/\s/g, "");
      if (/^03\d{9}$/.test(clean)) {
        const formatted = formatMobile(line);
        result.easypaisa.number = formatted;
        result.jazzcash.number = formatted;
      } else if (/^PK/i.test(clean)) {
        result.bank.iban = formatIban(line);
      }
    }
  }

  return result;
}

export function isPayoutDetailsConfigured(
  method: string | null | undefined,
  raw: string | null | undefined,
): boolean {
  if (!method || !raw || !raw.trim()) return false;
  const parsed = parsePayoutDetails(method, raw);
  const m = method.toLowerCase();
  if (m.includes("easypaisa")) {
    return Boolean(parsed.easypaisa.number.trim());
  }
  if (m.includes("jazzcash")) {
    return Boolean(parsed.jazzcash.number.trim());
  }
  if (m.includes("bank")) {
    return Boolean(parsed.bank.iban.trim() || parsed.bank.bankName.trim());
  }
  return false;
}
