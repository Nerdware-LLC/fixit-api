import { intToCurrencyStr, intToCurrencyRoundedStr } from "./currency";

describe("formatters/currency", () => {
  describe("intToCurrencyStr()", () => {
    // Valid inputs:
    test("returns a string with the correct currency format for a positive integer input", () => {
      expect(intToCurrencyStr(123456)).toBe("$1,234.56");
    });
    test("returns a string with the correct currency format for a negative integer input", () => {
      expect(intToCurrencyStr(-123456)).toBe("-$1,234.56");
    });
    test("returns a string with the correct currency format for a zero input", () => {
      expect(intToCurrencyStr(0)).toBe("$0.00");
    });
    test("returns a string with the correct currency format for a small integer input", () => {
      expect(intToCurrencyStr(1)).toBe("$0.01");
    });
    test("returns a string with the correct currency format for a large integer input", () => {
      expect(intToCurrencyStr(1234567890)).toBe("$12,345,678.90");
    });
    // Invalid inputs:
    test("throws an error when called with a number which is not a safe integer input", () => {
      expect(() => intToCurrencyStr(1234.56)).toThrow();
      expect(() => intToCurrencyStr(NaN)).toThrow();
      expect(() => intToCurrencyStr(-NaN)).toThrow();
      expect(() => intToCurrencyStr(Infinity)).toThrow();
      expect(() => intToCurrencyStr(-Infinity)).toThrow();
    });
    test("throws an error when called with a non-number input", () => {
      expect(() => intToCurrencyStr("abc" as any)).toThrow();
      expect(() => intToCurrencyStr(null as any)).toThrow();
      expect(() => intToCurrencyStr(undefined as any)).toThrow();
    });
  });

  describe("intToCurrencyRoundedStr()", () => {
    // Valid inputs:
    test("returns a string with the correct currency format for a positive integer input", () => {
      expect(intToCurrencyRoundedStr(123456)).toBe("$1,235");
    });
    test("returns a string with the correct currency format for a negative integer input", () => {
      expect(intToCurrencyRoundedStr(-123456)).toBe("-$1,235");
    });
    test("returns a string with the correct currency format for a zero input", () => {
      expect(intToCurrencyRoundedStr(0)).toBe("$0");
    });
    test("returns a string with the correct currency format for a small integer input", () => {
      expect(intToCurrencyRoundedStr(1)).toBe("$0");
    });
    test("returns a string with the correct currency format for a large integer input", () => {
      expect(intToCurrencyRoundedStr(1234567890)).toBe("$12,345,679");
    });
    // Invalid inputs:
    test("throws an error when called with a number which is not a safe integer input", () => {
      expect(() => intToCurrencyRoundedStr(1234.56)).toThrow();
      expect(() => intToCurrencyRoundedStr(NaN)).toThrow();
      expect(() => intToCurrencyRoundedStr(-NaN)).toThrow();
      expect(() => intToCurrencyRoundedStr(Infinity)).toThrow();
      expect(() => intToCurrencyRoundedStr(-Infinity)).toThrow();
    });
    test("throws an error when called with a non-number input", () => {
      expect(() => intToCurrencyRoundedStr("abc" as any)).toThrow();
      expect(() => intToCurrencyRoundedStr(null as any)).toThrow();
      expect(() => intToCurrencyRoundedStr(undefined as any)).toThrow();
    });
  });
});
