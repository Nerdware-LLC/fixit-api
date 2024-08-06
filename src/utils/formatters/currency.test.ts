import { currencyStrToInt, intToCurrencyStr } from "./currency.js";

describe("formatters/currency", () => {
  /**
   * Regex for asserting the error msg thrown from currency formatter
   * functions when they're called with an invalid value.
   */
  const INVALID_VALUE_ERR_MSG_REGEX = /invalid value/i;

  describe("intToCurrencyStr()", () => {
    // VALID INPUTS (no rounding)

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

    // VALID INPUTS (with rounding)

    test("returns a string with the correct rounded currency format for a positive integer input", () => {
      expect(intToCurrencyStr(123456, { shouldRound: true })).toBe("$1,235");
    });
    test("returns a string with the correct rounded currency format for a negative integer input", () => {
      expect(intToCurrencyStr(-123456, { shouldRound: true })).toBe("-$1,235");
    });
    test("returns a string with the correct rounded currency format for a zero input", () => {
      expect(intToCurrencyStr(0, { shouldRound: true })).toBe("$0");
    });
    test("returns a string with the correct rounded currency format for a small integer input", () => {
      expect(intToCurrencyStr(1, { shouldRound: true })).toBe("$0");
    });
    test("returns a string with the correct rounded currency format for a large integer input", () => {
      expect(intToCurrencyStr(1234567890, { shouldRound: true })).toBe("$12,345,679");
    });

    // INVALID INPUTS (no rounding)

    test("throws an error when called with a floating point number", () => {
      expect(() => intToCurrencyStr(1234.56)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
    test("throws an error when called with NaN", () => {
      expect(() => intToCurrencyStr(NaN)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
    test("throws an error when called with -NaN", () => {
      expect(() => intToCurrencyStr(-NaN)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
    test("throws an error when called with Infinity", () => {
      expect(() => intToCurrencyStr(Infinity)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
    test("throws an error when called with -Infinity", () => {
      expect(() => intToCurrencyStr(-Infinity)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
    test("throws an error when called with a non-numeric string", () => {
      expect(() => intToCurrencyStr("abc" as any)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
    test("throws an error when called with null", () => {
      expect(() => intToCurrencyStr(null as any)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
    test("throws an error when called with undefined", () => {
      expect(() => intToCurrencyStr(undefined as any)).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });

    // INVALID INPUTS (with rounding)

    test("throws an error when called with a number which is not a safe integer input", () => {
      expect(() => intToCurrencyStr(1234.56, { shouldRound: true })).toThrow(
        INVALID_VALUE_ERR_MSG_REGEX
      );
      expect(() => intToCurrencyStr(NaN, { shouldRound: true })).toThrow(
        INVALID_VALUE_ERR_MSG_REGEX
      );
      expect(() => intToCurrencyStr(-NaN, { shouldRound: true })).toThrow(
        INVALID_VALUE_ERR_MSG_REGEX
      );
      expect(() => intToCurrencyStr(Infinity, { shouldRound: true })).toThrow(
        INVALID_VALUE_ERR_MSG_REGEX
      );
      expect(() => intToCurrencyStr(-Infinity, { shouldRound: true })).toThrow(
        INVALID_VALUE_ERR_MSG_REGEX
      );
    });
    test("throws an error when called with a non-number input", () => {
      expect(() => intToCurrencyStr("abc" as any, { shouldRound: true })).toThrow(
        INVALID_VALUE_ERR_MSG_REGEX
      );
      expect(() => intToCurrencyStr(null as any, { shouldRound: true })).toThrow(
        INVALID_VALUE_ERR_MSG_REGEX
      );
      expect(() => intToCurrencyStr(undefined as any, { shouldRound: true })).toThrow(
        INVALID_VALUE_ERR_MSG_REGEX
      );
    });
  });

  describe("currencyStrToInt()", () => {
    test("returns the correct integer value for a currency string arg with two decimal places", () => {
      expect(currencyStrToInt("$ 123.45")).toBe(12345);
      expect(currencyStrToInt("$123.45")).toBe(12345);
      expect(currencyStrToInt("123.45")).toBe(12345);

      expect(currencyStrToInt("$ 123,456,789.99")).toBe(12345678999);
      expect(currencyStrToInt("$123,456,789.99")).toBe(12345678999);
      expect(currencyStrToInt("123,456,789.99")).toBe(12345678999);
    });

    test("returns the correct integer value for a currency string arg without decimal places", () => {
      expect(currencyStrToInt("$ 123")).toBe(12300);
      expect(currencyStrToInt("$123")).toBe(12300);
      expect(currencyStrToInt("123")).toBe(12300);

      expect(currencyStrToInt("$ 123,456,789")).toBe(12345678900);
      expect(currencyStrToInt("$123,456,789")).toBe(12345678900);
      expect(currencyStrToInt("123,456,789")).toBe(12345678900);
    });

    test("throws an error when called with a non-numeric string arg", () => {
      expect(() => currencyStrToInt("abc")).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });

    test("throws an error when the arg is improperly formatted with just 1 decimal place", () => {
      expect(() => currencyStrToInt("$1.2")).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });

    test("throws an error when the arg is improperly formatted with 3 decimal places", () => {
      expect(() => currencyStrToInt("$1.234")).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });

    test("throws an error when the arg is improperly formatted with a missing comma", () => {
      expect(() => currencyStrToInt("$1234")).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });

    test("throws an error when the arg is improperly formatted with 2 adjacent commas", () => {
      expect(() => currencyStrToInt("$1,,234")).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });

    test("throws an error when the arg is improperly formatted with 2 spaces after the $", () => {
      expect(() => currencyStrToInt("$  123")).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });

    test("throws an error when called with an empty string", () => {
      expect(() => currencyStrToInt("")).toThrow(INVALID_VALUE_ERR_MSG_REGEX);
    });
  });
});
