/**
 * Returns a function which takes an unknown input, and returns `true` if the input
 * is a string which conforms to the provided `regex` pattern(s).
 *
 * Implementation note: the `RegExp.prototype.test()` method does not throw an error
 * if the input is not a string, so it's unnecessary to check the input type, hence
 * the `as string` type casts.
 */
export const getRegexValidatorFn = (regexArg: RegExp | Array<RegExp>) => {
  return Array.isArray(regexArg)
    ? (value?: unknown) => regexArg.every((regex) => regex.test(value as string))
    : (value?: unknown) => regexArg.test(value as string);
};

/**
 * An object with methods which return `true` if the given value is a string which
 * conforms to the method's regex pattern.
 */
export const isValid = {
  /** Returns `true` if `value` only contains letters. */
  alphabetic: getRegexValidatorFn(/^[a-zA-Z]+$/),
  /** Returns `true` if `value` only contains letters and/or spaces. */
  alphabeticWithSpaces: getRegexValidatorFn(/^[a-zA-Z\s]+$/),
  /** Returns `true` if `value` only contains numbers. */
  numeric: getRegexValidatorFn(/^[0-9]+$/),
  /** Returns `true` if `value` only contains alphanumeric chars. */
  alphanumeric: getRegexValidatorFn(/^[a-zA-Z0-9]+$/),
  /** Returns `true` if `value` only contains alphanumeric chars and/or spaces. */
  alphanumericWithSpaces: getRegexValidatorFn(/^[a-zA-Z0-9\s]+$/),
  /** Returns `true` if `value` only contains alphanumeric chars, `_`, `-`, and/or `#`. */
  id: getRegexValidatorFn(/^[a-zA-Z0-9-_#]{6,250}$/),
  /** Returns `true` if `value` is a valid absolute HTTP/S URL. */
  url: getRegexValidatorFn(
    /^(http(s):\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]{0,1700})$/i
  ),
  /** Returns `true` if `value` is a valid email address. */
  email: getRegexValidatorFn([
    /**
     * EMAIL REGEX 1: The first email regex pattern below is used to test if a value conforms to
     * the official RFC 5322 email address format. It does NOT, however, check the entire length
     * of the string, nor does it cause `RegExp.prototype.test` to fail if banned characters like
     * zero-width spaces are present. The second regex pattern addresses these limitations.
     */
    /([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"([!]#-[^-~ \t]|(\\[\t -~]))+")@([0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)*|\[((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|IPv6:((((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){6}|::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){5}|[0-9A-Fa-f]{0,4}::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){4}|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):)?(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){3}|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,2}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){2}|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,3}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,4}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::)((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3})|(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3})|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,5}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3})|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,6}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::)|(?!IPv6:)[0-9A-Za-z-]*[0-9A-Za-z]:[!-Z^-~]+)])/,
    /**
     * EMAIL REGEX 2: The email regex pattern below addresses the limitations of the first email
     * regex pattern by accomplishing the following:
     * - Ensures the value does not begin with a period, and does not contain 2+ consecutive periods.
     * - Ensures the number of characters before the `@` is between 1-64.
     * - Ensures the number of characters after the `@` is between 1-255.
     * - Ensures the substring before the `@` only contains alphanumeric chars or . _ % + -
     * - Ensures the substring after the `@` only contains alphanumeric chars or . _
     * - Ensures the TLD only contains letters, and is between 2-64 characters in length.
     */
    /^(?!.*\.{2,})(?!^\.)[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,255}\.[a-zA-Z]{2,64}$/,
  ]),
  /** Returns `true` if `value` is a valid string of US phone number DIGITS (no spaces or special chars). */
  phone: getRegexValidatorFn(/^[1-9]\d{9}$/),
  /** Returns `true` if `value` is a valid social account handle (e.g., "@foo_user"). */
  handle: getRegexValidatorFn(/^@[a-zA-Z0-9_]{3,50}$/),
  /**
   * Returns `true` if `value` is a valid password, which must meet the following conditions:
   * - Contains at least one lowercase letter.
   * - Contains at least one uppercase letter.
   * - Contains at least one number.
   * - Contains at least one of `!`, `@`, `#`, `$`, `%`, `^`, `&`, and/or `*`.
   * - Is at least 6 characters long, and no more than 255 characters long.
   */
  password: getRegexValidatorFn(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,250}$/
  ),
  /** Returns `true` if `value` only contains alphanumeric characters, `.`, `/`, or `+`. */
  token: getRegexValidatorFn(/^[a-zA-Z0-9/.+]+$/),
  /** Returns `true` is `value` only contains valid JSON characters. */
  jsonString: getRegexValidatorFn(
    /**
     * The pattern below works by testing for characters within the ASCII printable
     * range. The permitted-character range begins with `\s` (space char), which is
     * ASCII code 32, and ends with `~` (tilde), which is ASCII code 126.
     */
    /^[\s-~]+$/
  ),
} as const;
