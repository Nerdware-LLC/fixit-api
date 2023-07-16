/**
 * Use this function to create regex patterns from arbitrary user-provided string
 * inputs which must be escaped/sanitized.
 */
export const getEscapedRegExp = (string: string, regexFlags: string) => {
  const cleanedStr = string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  return new RegExp(cleanedStr, regexFlags);
};

/*
  General purpose regex patterns go here. Model-scoped regex patterns, such as those used to
  define the pattern/format of Item ID Attributes, reside in their respective src/models/ dirs.
  NOTE: Use "REGEX_STR" values via `new RegExp()` syntax.
*/

/**
 * Regex pattern for validating email addresses.
 * Source: https://www.abstractapi.com/guides/email-address-pattern-validation
 *
 * Known limitations of this regex pattern:
 * - Doesn't allow Unicode characters
 * - Doesn't check for the entire length of the email address to be less than or equal to 253 characters
 * - Ignores [obsolete syntax-related rules](https://datatracker.ietf.org/doc/html/rfc5322#section-4)
 */
export const EMAIL_REGEX =
  /([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"([!]#-[^-~ \t]|(\\[\t -~]))+")@([0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)*|\[((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|IPv6:((((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){6}|::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){5}|[0-9A-Fa-f]{0,4}::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){4}|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):)?(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){3}|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,2}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){2}|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,3}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,4}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::)((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3})|(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3})|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,5}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3})|(((0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}):){0,6}(0|[1-9A-Fa-f][0-9A-Fa-f]{0,3}))?::)|(?!IPv6:)[0-9A-Za-z-]*[0-9A-Za-z]:[!-Z^-~]+)])/;

/**
 * Regex pattern for validating US phone numbers.
 * - The value must be a string of 10 digit characters
 * - The first digit must be between 1 and 9 (US area codes never begin with 0)
 * - The value must not contain any non-digit characters
 *
 * For validation purposes, all non-digit characters must first be stripped from the
 * string (first convert this --> `"(123) 456-7890"` into this --> `"1234567890"`).
 */
export const US_PHONE_DIGITS_REGEX = /^[1-9]\d{9}$/;

/**
 * Regex pattern for validating Unix timestamps.
 *
 * > Unix timestamps will be 10 digits until Nov 20 2286
 */
export const UNIX_TIMESTAMP_REGEX_STR = "\\d{10}";

/**
 * Regex pattern for validating UUID v1
 *
 * Example v1 UUID: `2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d`
 */
export const UUID_V1_REGEX_STR = "[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}";
