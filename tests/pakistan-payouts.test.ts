import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatMobile,
  validMobile,
  formatIban,
  validIban,
  ibanChecksum,
  parsePayoutDetails,
} from "@/lib/pakistan-payouts";

describe("pakistan payouts formatting & validation", () => {
  it("formats Pakistani mobile numbers to 03xx xxxxxxx", () => {
    assert.equal(formatMobile("03001234567"), "0300 1234567");
    assert.equal(formatMobile("+923001234567"), "0300 1234567");
    assert.equal(formatMobile("923451234567"), "0345 1234567");
    assert.equal(formatMobile("0312-9876543"), "0312 9876543");
  });

  it("validates mobile numbers correctly", () => {
    assert.equal(validMobile("0300 1234567"), true);
    assert.equal(validMobile("03451234567"), true);
    assert.equal(typeof validMobile("0400 1234567"), "string");
    assert.equal(typeof validMobile("0300 123"), "string");
  });

  it("formats and validates Pakistani IBAN with MOD-97-10 checksum", () => {
    const valid = "PK36 SCBL 0000 0011 2345 6702";
    assert.equal(formatIban("pk36scbl0000001123456702"), valid);
    assert.equal(validIban(valid), true);

    // Corrupted checksum
    assert.equal(typeof validIban("PK35 SCBL 0000 0011 2345 6702"), "string");
    // Invalid length / prefix
    assert.equal(typeof validIban("GB36 SCBL 0000 0011 2345 6702"), "string");
    assert.equal(typeof validIban("PK36 SCBL 123"), "string");
  });

  it("parses multiline and json payout details", () => {
    const text = "Account title: Sarah Jenkins\nEasypaisa mobile number: 0345 1234567";
    const parsed = parsePayoutDetails("Easypaisa", text);
    assert.equal(parsed.easypaisa.title, "Sarah Jenkins");
    assert.equal(parsed.easypaisa.number, "0345 1234567");

    const bankText = "Bank name: Meezan Bank\nAccount title: Sarah Jenkins\nIBAN: PK36 SCBL 0000 0011 2345 6702";
    const parsedBank = parsePayoutDetails("Bank transfer", bankText);
    assert.equal(parsedBank.bank.bankName, "Meezan Bank");
    assert.equal(parsedBank.bank.title, "Sarah Jenkins");
    assert.equal(parsedBank.bank.iban, "PK36 SCBL 0000 0011 2345 6702");
  });
});
