import {
  getRandomUUIDv4,
  getUUIDv5,
  isValidUUID,
  isValidUUIDv4,
  isValidUUIDv5,
  UUID_REGEX,
} from "./uuid.js";

describe("UUID", () => {
  describe("getRandomUUIDv4()", () => {
    test("returns a valid UUID string", () => {
      expect(getRandomUUIDv4()).toMatch(UUID_REGEX);
    });
  });

  describe("getUUIDv5()", () => {
    test("returns a valid UUID string", () => {
      expect(getUUIDv5("foo")).toMatch(UUID_REGEX);
    });

    test("returns the same UUIDs for calls with the same input", () => {
      const result1 = getUUIDv5("foo");
      const result2 = getUUIDv5("foo");
      expect(result1).toStrictEqual(result2);
    });
  });

  describe("isValidUUID()", () => {
    test("returns true when called with a valid UUID string of any version", () => {
      // The 1/2/3/4/5 is the UUID version, the 8 reflects the UUID variant
      expect(isValidUUID("aaaaaaaa-aaaa-1aaa-8aaa-aaaaaaaaaaaa")).toBe(true);
      expect(isValidUUID("aaaaaaaa-aaaa-2aaa-8aaa-aaaaaaaaaaaa")).toBe(true);
      expect(isValidUUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toBe(true);
      expect(isValidUUID("aaaaaaaa-aaaa-5aaa-8aaa-aaaaaaaaaaaa")).toBe(true);
      expect(isValidUUID("aaaaaaaa-aaaa-5aaa-8aaa-aaaaaaaaaaaa")).toBe(true);
    });

    test("returns false when called with a value that is not a valid UUID string", () => {
      expect(isValidUUID("")).toBe(false);
      expect(isValidUUID("foo")).toBe(false);
      expect(isValidUUID(1)).toBe(false);
      expect(isValidUUID(0)).toBe(false);
      expect(isValidUUID(true)).toBe(false);
      expect(isValidUUID(false)).toBe(false);
      expect(isValidUUID(undefined)).toBe(false);
      expect(isValidUUID(null)).toBe(false);
    });
  });

  describe("isValidUUIDv4()", () => {
    test("returns true when called with a valid v4 UUID string", () => {
      // The 4 is the UUID version (v4), and the 8 reflects the UUID variant
      expect(isValidUUIDv4("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toBe(true);
    });

    test("returns false when called with a UUID of version 1, 2, 3, or 5", () => {
      // The 1/2/3/4 is the UUID version, and the 8 reflects the UUID variant
      expect(isValidUUIDv4("aaaaaaaa-aaaa-1aaa-8aaa-aaaaaaaaaaaa")).toBe(false);
      expect(isValidUUIDv4("aaaaaaaa-aaaa-2aaa-8aaa-aaaaaaaaaaaa")).toBe(false);
      expect(isValidUUIDv4("aaaaaaaa-aaaa-3aaa-8aaa-aaaaaaaaaaaa")).toBe(false);
      expect(isValidUUIDv4("aaaaaaaa-aaaa-5aaa-8aaa-aaaaaaaaaaaa")).toBe(false);
    });

    test("returns false when called with a value that is not a valid UUID string", () => {
      expect(isValidUUIDv4("")).toBe(false);
      expect(isValidUUIDv4("foo")).toBe(false);
      expect(isValidUUIDv4(1)).toBe(false);
      expect(isValidUUIDv4(0)).toBe(false);
      expect(isValidUUIDv4(true)).toBe(false);
      expect(isValidUUIDv4(false)).toBe(false);
      expect(isValidUUIDv4(undefined)).toBe(false);
      expect(isValidUUIDv4(null)).toBe(false);
    });
  });

  describe("isValidUUIDv5()", () => {
    test("returns true when called with a valid v5 UUID string", () => {
      // The 5 is the UUID version (v5), and the 8 reflects the UUID variant
      expect(isValidUUIDv5("aaaaaaaa-aaaa-5aaa-8aaa-aaaaaaaaaaaa")).toBe(true);
    });

    test("returns false when called with a UUID of version 1, 2, 3, or 4", () => {
      // The 1/2/3/4 is the UUID version, and the 8 reflects the UUID variant
      expect(isValidUUIDv5("aaaaaaaa-aaaa-1aaa-8aaa-aaaaaaaaaaaa")).toBe(false);
      expect(isValidUUIDv5("aaaaaaaa-aaaa-2aaa-8aaa-aaaaaaaaaaaa")).toBe(false);
      expect(isValidUUIDv5("aaaaaaaa-aaaa-3aaa-8aaa-aaaaaaaaaaaa")).toBe(false);
      expect(isValidUUIDv5("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toBe(false);
    });

    test("returns false when called with a value that is not a valid UUID string", () => {
      expect(isValidUUIDv5("")).toBe(false);
      expect(isValidUUIDv5("foo")).toBe(false);
      expect(isValidUUIDv5(1)).toBe(false);
      expect(isValidUUIDv5(0)).toBe(false);
      expect(isValidUUIDv5(true)).toBe(false);
      expect(isValidUUIDv5(false)).toBe(false);
      expect(isValidUUIDv5(undefined)).toBe(false);
      expect(isValidUUIDv5(null)).toBe(false);
    });
  });
});
