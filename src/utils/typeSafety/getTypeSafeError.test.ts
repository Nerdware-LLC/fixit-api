import { getTypeSafeError, getErrorMessage } from "./getTypeSafeError";

describe("getTypeSafeError()", () => {
  test("returns an Error instance when called with an Error object", () => {
    const result = getTypeSafeError(new Error("test"));
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("test");
  });
  test("returns an Error instance when called with null", () => {
    const result = getTypeSafeError(null, { fallBackErrMsg: "test" });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("test");
  });
  test("returns an Error instance when called with undefined", () => {
    const result = getTypeSafeError(undefined, { fallBackErrMsg: "test" });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("test");
  });
  test(`returns an Error instance with "message" set to a string provided as the first argument`, () => {
    const result = getTypeSafeError("test");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("test");
  });
  test(`returns an instance of a provided "ErrorClass" when called with null`, () => {
    class TestErrorExtensionClass extends Error {
      constructor() {
        super("test");
      }
    }
    const result = getTypeSafeError(null, { ErrorClass: TestErrorExtensionClass });
    expect(result).toBeInstanceOf(TestErrorExtensionClass);
    expect(result.message).toBe("test");
  });
  test(`returns an Error instance with a "message" that includes the stringified payload when called with an object that doesn't contain a "message" property`, () => {
    const input = { test: "test" };
    const result = getTypeSafeError(input);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toContain(JSON.stringify(input));
  });
});

describe("getErrorMessage()", () => {
  test("returns a string argument as-is", () => {
    expect(getErrorMessage("test")).toBe("test");
  });
  test(`returns the "message" property of an Error-like object`, () => {
    expect(getErrorMessage(new Error("test"))).toBe("test");
    expect(getErrorMessage({ message: "test" })).toBe("test");
  });
  test("returns undefined when called with anything other than a string or Error-like object", () => {
    expect(getErrorMessage(123)).toBeUndefined();
    expect(getErrorMessage([])).toBeUndefined();
    expect(getErrorMessage(["test"])).toBeUndefined();
    expect(getErrorMessage({ test: "test" })).toBeUndefined();
    expect(getErrorMessage(() => {})).toBeUndefined();
    expect(getErrorMessage(null)).toBeUndefined();
    expect(getErrorMessage(undefined)).toBeUndefined();
    expect(getErrorMessage(new Set(["test"]))).toBeUndefined();
    expect(getErrorMessage(new Map([["test", "test"]]))).toBeUndefined();
  });
});
