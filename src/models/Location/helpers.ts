import { getCompoundAttrRegex } from "@/models/_common";

/** Sanitizes a user-provided street-address string by removing any non-permitted chars. */
export const sanitizeStreetAddress = (value: string): string => {
  return value.replace(/[^\p{Script=Latin}\s\d'.:,#-]/giu, "").trim();
};

/** Returns a boolean indicating whether a user-provided street-address string is valid. */
export const isValidStreetAddress = (value: string): boolean => {
  return /^[\p{Script=Latin}\s\d'.:,#-]{2,}$/iu.test(value);
};

/**
 * Regex pattern for validating place-name strings which have been URL-encoded to get rid of spaces.
 *
 * This pattern requires a minimum of two characters, and permits the following characters:
 *
 * - Unicode Latin-script characters ([see table][wikipedia-latin-chars])
 *   - `\p{Script=Latin}` is used as a more i18n-friendly alternative to `[a-zA-Z]`
 * - Apostrophes (`'`)
 * - Periods (`.`)
 * - Hyphens (`-`)
 * - Percent signs (`%`)
 * - Numbers (`0-9`)
 * - Underscores (`_`)
 *
 * [wikipedia-latin-chars]: https://en.wikipedia.org/w/index.php?title=Latin_script_in_Unicode&oldid=1210023145#Table_of_characters
 */
const URL_ENCODED_PLACE_NAME_REGEX = /[\p{Script=Latin}%0-9'._-]{2,}/iu;

/**
 * Regex pattern string for validating street-address strings (line 1 or line 2) which have been
 * URL-encoded to get rid of spaces.
 *
 * This pattern requires a minimum of two characters, and permits all characters permitted in the
 * {@link URL_ENCODED_PLACE_NAME_REGEX} pattern, as well as the following characters:
 *
 * - Colons (`:`)
 * - Commas (`,`)
 * - Number signs (`#`)
 */
const URL_ENCODED_STREET_ADDRESS_REGEX = /[\p{Script=Latin}%0-9'._:,#-]{2,}/iu;

/**
 * Location Composite Value Pattern:
 *
 * `[COUNTRY]#[STATE]#[CITY]#[STREET_LINE_1]#[STREET_LINE_2]`
 */
export const LOCATION_COMPOUND_STR_REGEX = getCompoundAttrRegex(
  [
    URL_ENCODED_PLACE_NAME_REGEX, //     country
    URL_ENCODED_PLACE_NAME_REGEX, //     state/region
    URL_ENCODED_PLACE_NAME_REGEX, //     city
    URL_ENCODED_STREET_ADDRESS_REGEX, // street line 1
    {
      regex: URL_ENCODED_STREET_ADDRESS_REGEX, // street line 2
      required: false,
    },
  ],
  { regexFlags: "iu" }
);
