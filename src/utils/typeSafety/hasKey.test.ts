import { hasKey, hasKeys } from "./hasKey";

describe("hasKey()", () => {
  // string key
  test("returns true when the provided object has the provided string key", () => {
    expect(hasKey({ foo: "" }, "foo")).toBe(true);
    expect(hasKey({ "": "" }, "")).toBe(true); // works with empty strings
  });
  test("returns false when the provided object does not have the provided string key", () => {
    expect(hasKey({ foo: "" }, "NOPE")).toBe(false);
  });

  // number key
  test("returns true when the provided object has the provided number key", () => {
    expect(hasKey({ 0: "" }, 0)).toBe(true);
  });
  test("returns false when the provided object does not have the provided number key", () => {
    expect(hasKey({ 0: "" }, 1)).toBe(false);
  });

  // symbol key
  test("returns true when the provided object has the provided symbol key", () => {
    const sym = Symbol("foo");
    expect(hasKey({ [sym]: "" }, sym)).toBe(true);
  });
  test("returns false when the provided object does not have the provided symbol key", () => {
    const sym = Symbol("foo");
    expect(hasKey({ [sym]: "" }, Symbol("NOPE"))).toBe(false);
  });

  // edge cases
  test("returns false when the provided object has no keys", () => {
    expect(hasKey({}, "")).toBe(false);
    expect(hasKey({}, "foo")).toBe(false);
  });

  // destructive test case
  test("throws an error when called with invalid arguments", () => {
    expect(() => hasKey(null as any, "foo")).toThrow();
  });
});

describe("hasKeys()", () => {
  // string keys
  test("returns true when the provided object has all provided string keys", () => {
    expect(hasKeys({ foo: "", bar: "" }, ["foo", "bar"])).toBe(true);
    expect(hasKeys({ foo: "", "": "" }, ["foo", ""])).toBe(true); // works with empty strings
  });
  test("returns false when the provided object has some - but not all - provided string keys", () => {
    expect(hasKeys({ foo: "", bar: "" }, ["foo", "NOPE"])).toBe(false);
  });
  test("returns false when the provided object does not have any of the provided string keys", () => {
    expect(hasKeys({ foo: "", bar: "" }, ["NOPE", "NADA"])).toBe(false);
  });

  // number keys
  test("returns true when the provided object has all provided number keys", () => {
    expect(hasKeys({ 0: "", 1: "" }, [0, 1])).toBe(true);
  });
  test("returns false when the provided object has some - but not all - provided number keys", () => {
    expect(hasKeys({ 0: "", 1: "" }, [0, "NOPE"])).toBe(false);
  });
  test("returns false when the provided object does not have any of the provided number keys", () => {
    expect(hasKeys({ 0: "", 1: "" }, ["NOPE", "NADA"])).toBe(false);
  });

  // symbol keys
  test("returns true when the provided object has all provided symbol keys", () => {
    const sym1 = Symbol("foo");
    const sym2 = Symbol("bar");
    expect(hasKeys({ [sym1]: "", [sym2]: "" }, [sym1, sym2])).toBe(true);
  });
  test("returns false when the provided object has some - but not all - provided symbol keys", () => {
    const sym1 = Symbol("foo");
    const sym2 = Symbol("bar");
    expect(hasKeys({ [sym1]: "", [sym2]: "" }, [sym1, "NOPE"])).toBe(false);
  });
  test("returns false when the provided object does not have any of the provided symbol keys", () => {
    const sym1 = Symbol("foo");
    const sym2 = Symbol("bar");
    expect(hasKeys({ [sym1]: "", [sym2]: "" }, ["NOPE", "NADA"])).toBe(false);
  });

  // mixed-type keys
  test("returns true when the provided object has all provided string/symbol/number keys", () => {
    const sym = Symbol("foo");
    expect(hasKeys({ foo: "", 0: "", [sym]: "" }, ["foo", 0, sym])).toBe(true);
  });
  test("returns false when the provided object has some - but not all - provided string/symbol/number keys", () => {
    const sym = Symbol("foo");
    expect(hasKeys({ foo: "", 0: "", [sym]: "" }, ["foo", 0, Symbol("NOPE")])).toBe(false);
  });
  test("returns false when the provided object does not have any of the provided string/symbol/number keys", () => {
    const sym = Symbol("foo");
    expect(hasKeys({ foo: "", 0: "", [sym]: "" }, ["NOPE", 1, Symbol("NOPE")])).toBe(false);
  });

  // edge cases
  test("returns false when the provided object has no keys", () => {
    expect(hasKeys({}, ["foo"])).toBe(false);
  });
  test("returns true when the provided keys-array is empty", () => {
    expect(hasKeys({}, [])).toBe(true);
    expect(hasKeys({ foo: "" }, [])).toBe(true);
  });

  // destructive test case
  test("throws an error when called with invalid arguments", () => {
    expect(() => hasKeys(null as any, ["foo"])).toThrow();
    expect(() => hasKeys({ foo: "" }, {} as any)).toThrow();
    expect(() => hasKeys({ foo: "" }, null as any)).toThrow();
    expect(() => hasKeys({ foo: "" }, new Set(["foo"]) as any)).toThrow();
  });
});
