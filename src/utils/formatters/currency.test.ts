import { intToCurrencyStr, intToCurrencyRoundedStr } from "./currency.js";

describe("formatters/currency", () => {
  /**
   * Regex for asserting the error msg thrown from currency formatter
   * functions when they're called with an invalid value.
   */
  const INVALID_VALUE_ERR_MSG_REGEX = /invalid value/;

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
      const INVALID_VALUE_ERR_MSG_REGEX = /invalid value/;

      expect(() => intToCurrencyStr(1234.56)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyStr(NaN)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyStr(-NaN)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyStr(Infinity)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyStr(-Infinity)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
    test("throws an error when called with a non-number input", () => {
      expect(() => intToCurrencyStr("abc" as any)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyStr(null as any)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyStr(undefined as any)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
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
      expect(() => intToCurrencyRoundedStr(1234.56)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyRoundedStr(NaN)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyRoundedStr(-NaN)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyRoundedStr(Infinity)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyRoundedStr(-Infinity)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
    test("throws an error when called with a non-number input", () => {
      expect(() => intToCurrencyRoundedStr("abc" as any)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyRoundedStr(null as any)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
      expect(() => intToCurrencyRoundedStr(undefined as any)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
  });
});
