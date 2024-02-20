import { normalize } from "./normalize";

describe("clientInputHandlers: normalize", () => {
  describe("normalize.currencyStrToInt()", () => {
    test("returns the correct integer value for a currency string arg with two decimal places", () => {
      const result = normalize.currencyStrToInt("123.45");
      expect(result).toBe(12345);
    });
  });

  test("returns the correct integer value for a currency string arg without decimal places", () => {
    const result = normalize.currencyStrToInt("123");
    expect(result).toBe(12300);
  });

  test("returns NaN for a non-numeric string arg", () => {
    const result = normalize.currencyStrToInt("abc");
    expect(result).toBeNaN();
  });

  test("returns 0 for an empty string arg", () => {
    const result = normalize.currencyStrToInt("");
    expect(result).toBe(0);
  });
});

describe("normalize.phone()", () => {
  test("removes all non-numeric characters from the input", () => {
    const result = normalize.phone("  (888) 123-4567  ");
    expect(result).toBe("8881234567");
  });
});
