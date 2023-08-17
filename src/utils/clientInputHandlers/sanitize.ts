/**
 * Returns a sanitizer function that removes undesired characters from a string
 * input using the provided `regex`.
 *
 * @param regex - The regular expression used to match the undesired characters.
 * @returns A function that takes a string input and returns the sanitized string.
 */
const getSanitizerFn = (regex: RegExp) => {
  return (str: string): string => str.replace(regex, "").trim();
};

/**
 * An object with methods which take a string input, and return the string
 * with all undesired characters removed. Each method name describes the
 * type of characters which _**WILL REMAIN**_ after sanitization.
 *
 * For all methods, the following types of characters are removed:
 *   - Zero-width characters (`U+200B`, `U+200C`, `U+200D`, and `U+FEFF`)
 *   - Control characters (`U+0000` to `U+001F` and `U+007F` to `U+009F`)
 */
export const sanitize = {
  /** Removes all non-alphabetic characters from `str`. */
  alphabetic: getSanitizerFn(/[^a-zA-Z]/g),
  /** Removes all non-alphabetic/space characters from `str`. */
  alphabeticWithSpaces: getSanitizerFn(/[^a-zA-Z\s]/g),
  /** Removes all non-numeric characters from `str`. */
  numeric: getSanitizerFn(/[^0-9]/g),
  /** Removes all non-alphanumeric characters from `str`. */
  alphanumeric: getSanitizerFn(/[^a-zA-Z0-9]/g),
  /** Removes all non-alphanumeric/space characters from `str`. */
  alphanumericWithSpaces: getSanitizerFn(/[^a-zA-Z0-9\s]/g),
  /** Removes non-alphanumeric characters from `str` which are not `_`, `-`, or `#`. */
  id: getSanitizerFn(/[^a-zA-Z0-9-_#]/g),
  /** Removes all non-URL characters from `str`. */
  url: getSanitizerFn(/[^a-zA-Z0-9-._~:/?#[\]@!$&'()+,;=]/g),
  /** Removes all non-email characters from `str`. */
  email: getSanitizerFn(/[^a-zA-Z0-9-._@+]/g),
  /** Removes all non-digit characters from `str` (converts `"(888) 123-4567"` into `"8881234567"`). */
  phone: getSanitizerFn(/[^0-9]/g),
  /** Remove all non-handle characters from `str` (e.g., "@foo_user"). */
  handle: getSanitizerFn(/[^a-zA-Z0-9_@]/g),
  /** Remove non-alphanumeric characters from `str` which are not `!`, `@`, `#`, `$`, `%`, `^`, `&`, or `*`. */
  password: getSanitizerFn(/[^a-zA-Z0-9!@#$%^&*]/g),
  /** Remove non-alphanumeric characters from `str` which are not `.`, `/`, or `+`. */
  token: getSanitizerFn(/[^a-zA-Z0-9/.+]/g),
  /** Remove non-JSON characters from `str`. */
  jsonString: getSanitizerFn(
    /**
     * The pattern below works by removing all characters outside of the ASCII printable
     * range. The permitted-character range begins with `\s` (space char), which is ASCII
     * code 32, and ends with `~` (tilde), which is ASCII code 126.
     */
    /[^\s-~]/g
  ),
} as const;
