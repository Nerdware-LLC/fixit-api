import { isValid } from "./validate";

describe("clientInputHandlers: isValid", () => {
  describe("isValid.alphabetic()", () => {
    // positive test case:
    test("returns true when given a string containing only letters", () => {
      expect(isValid.alphabetic("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")).toBe(true);
    });
    // negative test cases:
    test("returns false when given a string containing a space", () => {
      expect(isValid.alphabetic("abc ")).toBe(false);
    });
    test("returns false when given a string containing numbers", () => {
      expect(isValid.alphabetic("abc123")).toBe(false);
    });
    test("returns false when given a string containing a null unicode character", () => {
      expect(isValid.alphabetic("abc\u0000")).toBe(false);
    });
  });

  describe("isValid.alphabeticWithSpaces()", () => {
    // positive test case:
    test("returns true when given a string containing only letters and/or spaces", () => {
      expect(
        isValid.alphabeticWithSpaces("abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ")
      ).toBe(true);
    });
    // negative test cases:
    test("returns false when given a string containing a special character", () => {
      expect(isValid.alphabeticWithSpaces("abc def ~")).toBe(false);
    });
    test("returns false when given a string containing numbers", () => {
      expect(isValid.alphabeticWithSpaces("abc def 123")).toBe(false);
    });
    test("returns false when given a string containing a null unicode character", () => {
      expect(isValid.alphabeticWithSpaces("abc def \u0000")).toBe(false);
    });
  });

  describe("isValid.numeric()", () => {
    // positive test case:
    test("returns true when given a string containing only numeric characters", () => {
      expect(isValid.numeric("0123456789")).toBe(true);
    });
    // negative test cases:
    test("returns false when given a string containing a space", () => {
      expect(isValid.numeric("123 ")).toBe(false);
    });
    test("returns false when given a string containing letters", () => {
      expect(isValid.numeric("123abc")).toBe(false);
    });
    test("returns false when given a string containing a null unicode character", () => {
      expect(isValid.numeric("123\u0000")).toBe(false);
    });
  });

  describe("isValid.alphanumeric()", () => {
    // positive test case:
    test("returns true when given a string containing only alphanumeric characters", () => {
      expect(
        isValid.alphanumeric("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
      ).toBe(true);
    });
    // negative test cases:
    test("returns false when given a string containing a space", () => {
      expect(isValid.alphanumeric("abc123 ")).toBe(false);
    });
    test("returns false when given a string containing a special character", () => {
      expect(isValid.alphanumeric("abc123~")).toBe(false);
    });
    test("returns false when given a string containing a null unicode character", () => {
      expect(isValid.alphanumeric("abc123\u0000")).toBe(false);
    });
  });

  describe("isValid.alphanumericWithSpaces()", () => {
    // positive test case:
    test("returns true when given a string containing only alphanumeric characters and/or spaces", () => {
      expect(
        isValid.alphanumericWithSpaces(
          "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789"
        )
      ).toBe(true);
    });
    // negative test cases:
    test("returns false when given a string containing a special character", () => {
      expect(isValid.alphanumericWithSpaces("abc 123~")).toBe(false);
    });
    test("returns false when given a string containing a null unicode character", () => {
      expect(isValid.alphanumericWithSpaces("abc 123\u0000")).toBe(false);
    });
  });

  describe("isValid.id()", () => {
    // positive test case:
    test(`returns true when given a string containing only alphanumeric characters, "-", "_", and/or "#"`, () => {
      expect(isValid.id("fake-id#abc_123")).toBe(true);
    });
    // negative test cases:
    test("returns false when given a string containing fewer than 6 characters", () => {
      expect(isValid.id("12345")).toBe(false);
    });
    test("returns false when given a string containing more than 250 characters", () => {
      expect(isValid.id(Array(255).join("x"))).toBe(false);
    });
    test("returns false when given a string containing a space", () => {
      expect(isValid.id("fake-id#abc 123")).toBe(false);
    });
    test("returns false when given a string containing a disallowed special character", () => {
      expect(isValid.id("fake-id#abc_123.456!")).toBe(false);
    });
    test("returns false when given a string containing a null unicode character", () => {
      expect(isValid.id("fake-id#abc_123\u0000")).toBe(false);
    });
  });

  describe("isValid.url()", () => {
    // positive test case:
    test("returns true when given a valid absolute HTTP/S URL string", () => {
      expect(isValid.url("https://example.com/foo/path?query=value#anchor-name")).toBe(true);
    });
    // negative test cases:
    test("returns false when given a URL without a protocol prefix", () => {
      expect(isValid.url("example.com/foo")).toBe(false);
    });
    test("returns false when given a URL with a protocol other than HTTP/S", () => {
      expect(isValid.url("ftp://example.com/")).toBe(false);
    });
    test("returns false when given a URL which exceeds the max length", () => {
      expect(isValid.url(`https://example.com/${Array(2000).join("x")}`)).toBe(false);
    });
    test("returns false when given an absolute HTTP/S URL string which includes a null unicode character", () => {
      expect(isValid.url("https://example.com/\u0000")).toBe(false);
    });
  });

  describe("isValid.email()", () => {
    // positive test case:
    test("returns true when given a valid email address string", () => {
      expect(isValid.email("foo.bar_1+baz@gmail.com")).toBe(true);
    });
    // negative test cases:
    test("returns false when given an email address beginning with a period", () => {
      expect(isValid.email(".foo.bar_1+baz@gmail.com")).toBe(false);
    });
    test("returns false when given an email address with two consecutive periods", () => {
      expect(isValid.email("foo..bar_1+baz@gmail.com")).toBe(false);
    });
    test("returns false when given an email address with an invalid TLD", () => {
      expect(isValid.email("foo.bar_1+baz@gmail.c")).toBe(false);
    });
    test("returns false when given an email address with any component which exceeds the max length", () => {
      expect(isValid.email(`${Array(66).join("x")}@gmail.com`)).toBe(false);
      expect(isValid.email(`foo.bar_1+baz@${Array(257).join("x")}.com`)).toBe(false);
      expect(isValid.email(`foo.bar_1+baz@gmail.${Array(66).join("x")}`)).toBe(false);
    });
    test("returns false when given an email address which includes a null unicode character", () => {
      expect(isValid.email("foo.bar_1+baz@gmail.com\u0000")).toBe(false);
    });
  });

  describe("isValid.phone()", () => {
    // positive test case:
    test("returns true when given a valid US phone-digits string", () => {
      expect(isValid.phone("8881234567")).toBe(true);
    });
    // negative test cases:
    test("returns false when given a US phone-digits string with spaces", () => {
      expect(isValid.phone("888 123 4567")).toBe(false);
    });
    test("returns false when given a US phone-digits string with hyphens", () => {
      expect(isValid.phone("888-123-4567")).toBe(false);
    });
    test("returns false when given a US phone-digits string with parentheses", () => {
      expect(isValid.phone("(888)1234567")).toBe(false);
    });
    test("returns false when given a US phone-digits string which begins with a zero", () => {
      expect(isValid.phone("0888123456")).toBe(false);
    });
    test("returns false when given a US phone-digits string with too many digits", () => {
      expect(isValid.phone("88812345678")).toBe(false);
    });
    test("returns false when given a US phone-digits string which includes a null unicode character", () => {
      expect(isValid.phone("8881234567\u0000")).toBe(false);
    });
  });

  describe("isValid.handle()", () => {
    // positive test case:
    test("returns true when given a valid social media handle string", () => {
      expect(isValid.handle("@foo_user1")).toBe(true);
    });
    // negative test cases:
    test(`returns false when given a string which does not begin with an "@" character`, () => {
      expect(isValid.handle("foo_user1")).toBe(false);
    });
    test(`returns false when given a string with an "@" character in an incorrect position`, () => {
      expect(isValid.handle("foo@user1")).toBe(false);
      expect(isValid.handle("@foo@user1")).toBe(false);
    });
    test("returns false when given a string containing an invalid special character", () => {
      expect(isValid.handle("@foo-user1")).toBe(false);
      expect(isValid.handle("@foo.user1")).toBe(false);
      expect(isValid.handle("@foo!user1")).toBe(false);
    });
    test("returns false when given a string which is too short", () => {
      expect(isValid.handle("@fo")).toBe(false);
    });
    test("returns false when given a string which exceeds the max length", () => {
      expect(isValid.handle(`@${Array(52).join("x")}`)).toBe(false);
    });
    test("returns false when given a string which includes a null unicode character", () => {
      expect(isValid.handle("@foo_user1\u0000")).toBe(false);
    });
  });

  describe("isValid.password()", () => {
    // positive test case:
    test("returns true when given a valid password string", () => {
      expect(isValid.password("123abcABC!@#$%^&*")).toBe(true);
    });
    // negative test cases:
    test("returns false when given a string which does not contain at least 1 lowercase letter", () => {
      expect(isValid.password("123ABC!@#$%^&*")).toBe(false);
    });
    test("returns false when given a string which does not contain at least 1 uppercase letter", () => {
      expect(isValid.password("123abc!@#$%^&*")).toBe(false);
    });
    test("returns false when given a string which does not contain at least 1 number", () => {
      expect(isValid.password("abcABC!@#$%^&*")).toBe(false);
    });
    test("returns false when given a string which does not contain at least 1 special character", () => {
      expect(isValid.password("123abcABC")).toBe(false);
    });
    test("returns false when given a string which contains an invalid special character", () => {
      expect(isValid.password("-123abcABC!@#$%^&*")).toBe(false);
      expect(isValid.password("_123abcABC!@#$%^&*")).toBe(false);
    });
    test("returns false when given a string with fewer than 6 characters", () => {
      expect(isValid.password("12aA!")).toBe(false);
    });
    test("returns false when given a string with more than 250 characters", () => {
      expect(isValid.password(`1aA!${Array(250).join("x")}`)).toBe(false);
    });
  });

  describe("isValid.token()", () => {
    // positive test case:
    test("returns true when given a string which only contains valid token characters", () => {
      expect(isValid.token("123.abc.ABC+0.0/0")).toBe(true);
    });
    // negative test cases:
    test("returns false when given a string which contains a space", () => {
      expect(isValid.token("123 abc.ABC+0.0/0")).toBe(false);
    });
    test("returns false when given a string which contains a hyphen", () => {
      expect(isValid.token("123-abc.ABC+0.0/0")).toBe(false);
    });
    test("returns false when given a string which contains an underscore", () => {
      expect(isValid.token("123_abc.ABC+0.0/0")).toBe(false);
    });
  });
});
