/**
 * Use this function to create regex patterns from arbitrary
 * user-provided string inputs which must be escaped/sanitized.
 */
export const getEscapedRegExp = (string: string, regexFlags: string) => {
  const cleanedStr = string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  return new RegExp(cleanedStr, regexFlags);
};

/* General purpose regex patterns go here. Model-related regex
patterns (e.g., for Item ID Attributes) reside in src/models/ dirs.
Use "REGEX_STR" values via `new RegExp()` syntax. */

export const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/i;

/**
 * Phone number regex pattern. Valid examples:
 * - `(123) 456-7890`
 * - `(123)456-7890`
 * - `123-456-7890`
 * - `123-4567890`
 * - `1234567890`
 */
export const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

// Unix timestamps will be 10 digits until Nov 20 2286
export const UNIX_TIMESTAMP_REGEX_STR = "\\d{10}";

// Example v1 UUID: 2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d
export const UUID_V1_REGEX_STR = "[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}";

/* Location components are stored separately, despite some having patterns which are
currently the exact same and therefore duplicative. This is due to the fact that they
may differ when converted into unicode-based patterns to support i18n. Note that these
patterns all assume spaces have been replaced with underscores.  */
export const LOCATION_REGEX_STRS = {
  COUNTRY: "[a-z-_]{2,}", //            Two or more letters/hyphens/underscores
  REGION: "[a-z-_]{2,}", //             Two or more letters/hyphens/underscores
  CITY: "[a-z-_]{2,}", //               Two or more letters/hyphens/underscores
  STREET_LINE_1: "[a-z0-9-_.]{2,}", //  Two or more letters/hyphens/underscores/numbers/periods
  STREET_LINE_2: "[a-z0-9-_.:#]{2,}" // Two or more letters/hyphens/underscores/numbers/periods/:/#
};
