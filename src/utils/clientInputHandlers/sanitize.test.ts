import { sanitize } from "./sanitize";

/** Regex pattern which matches all zero-width characters and ASCII/unicode control characters. */
// eslint-disable-next-line no-control-regex
const ZERO_WIDTH_AND_CONTROL_CHAR_REGEX = /[\u200B-\u200D\uFEFF\u0000-\u001F\u007F-\u009F]/g;

const ZERO_WIDTH_SPACE = `\u200B`;
const NULL_CONTROL_CHAR = `\u0000`;

describe("clientInputHandlers: sanitize", () => {
  test("alphabetic() removes all non-alphabetic characters", () => {
    const input = `ab c${ZERO_WIDTH_SPACE}1 23${NULL_CONTROL_CHAR}~!@#$%^&*()_+-={}|:"<>?[]\\;',./`;
    const result = sanitize.alphabetic(input);
    expect(result).toBe("abc");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("alphabeticWithSpaces() removes all non-alphabetic/space characters", () => {
    const input = `ab c${ZERO_WIDTH_SPACE}1 23${NULL_CONTROL_CHAR}~!@#$%^&*()_+-={}|:"<>?[]\\;',./`;
    const result = sanitize.alphabeticWithSpaces(input);
    expect(result).toBe("ab c");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("numeric() removes all non-numeric characters", () => {
    const input = `ab c${ZERO_WIDTH_SPACE}1 23${NULL_CONTROL_CHAR}~!@#$%^&*()_+-={}|:"<>?[]\\;',./`;
    const result = sanitize.numeric(input);
    expect(result).toBe("123");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("alphanumeric() removes all non-alphanumeric characters", () => {
    const input = `ab c${ZERO_WIDTH_SPACE}1 23${NULL_CONTROL_CHAR}~!@#$%^&*()_+-={}|:"<>?[]\\;',./`;
    const result = sanitize.alphanumeric(input);
    expect(result).toBe("abc123");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("alphanumericWithSpaces() removes all non-alphanumeric/space characters", () => {
    const input = `ab c${ZERO_WIDTH_SPACE}1 23${NULL_CONTROL_CHAR}~!@#$%^&*()_+-={}|:"<>?[]\\;',./`;
    const result = sanitize.alphanumericWithSpaces(input);
    expect(result).toBe("ab c1 23");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("id() removes all non-ID characters", () => {
    const input = `ab c${ZERO_WIDTH_SPACE}1 23${NULL_CONTROL_CHAR}~!@#$%^&*()_+-={}|:"<>?[]\\;',./`;
    const result = sanitize.id(input);
    expect(result).toBe("abc123#_-");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("url() removes all non-URL characters", () => {
    const input = `<>https://www.exa mple.com${ZERO_WIDTH_SPACE}/path?query=value${NULL_CONTROL_CHAR}#fragment<>%^*{}|"`;
    const result = sanitize.url(input);
    expect(result).toBe("https://www.example.com/path?query=value#fragment");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("email() removes all non-email characters", () => {
    const input = `foo_1+bar${NULL_CONTROL_CHAR}@gma il.com${ZERO_WIDTH_SPACE}~!#$%^&*()={}|:"<>?[]\\;',/`;
    const result = sanitize.email(input);
    expect(result).toBe("foo_1+bar@gmail.com");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("phone() removes all non-phone/non-numeric characters", () => {
    const input = `ab c${ZERO_WIDTH_SPACE}1 23${NULL_CONTROL_CHAR}~!@#$%^&*()_+-={}|:"<>?[]\\;',./`;
    const result = sanitize.phone(input);
    expect(result).toBe("123");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("handle() removes all non-handle characters", () => {
    const input = `@${ZERO_WIDTH_SPACE}foo_ user${NULL_CONTROL_CHAR}~!#$%^&*()+-={}|:"<>?[]\\;',./`;
    const result = sanitize.handle(input);
    expect(result).toBe("@foo_user");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("password() removes all disallowed password characters", () => {
    const input = `ab c${ZERO_WIDTH_SPACE}1 23${NULL_CONTROL_CHAR}~!@#$%^&*()_+-={}|:"<>?[]\\;',./`;
    const result = sanitize.password(input);
    expect(result).toBe("abc123!@#$%^&*");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });

  test("token() removes all non-token characters", () => {
    const input = `ab c${ZERO_WIDTH_SPACE}1 23${NULL_CONTROL_CHAR}~!@#$%^&*()_+-={}|:"<>?[]\\;',./`;
    const result = sanitize.token(input);
    expect(result).toBe("abc123+./");
    expect(result).not.toMatch(ZERO_WIDTH_AND_CONTROL_CHAR_REGEX);
  });
});
