import { LOCATION_REGEX_STRS as LOC } from "@utils/regex";

/**
 * Location Composite Value Pattern:
 *
 * `[COUNTRY]#[STATE]#[CITY]#[STREET_LINE_1]#[STREET_LINE_2]`
 *
 * Regex Pattern:
 *
 * `^([a-z-_]{2,})(#[a-z-_]{2,})(#[a-z-_]{2,})(#[a-z0-9-_.]{2,})(#[a-z0-9-_.#]{2,})?$`
 *
 * - Note: location names which use non-latin-alphabetic characters are not yet supported at this time.
 *
 * // IDEA Add unicode regex patterns to support internationalization (e.g., /[\p{Alpha}\p{M}\p{Nd}\p{Pc}\p{Join_C}]/u).
 */
export const LOCATION_COMPOSITE_REGEX = new RegExp(
  `^(${LOC.COUNTRY})(#${LOC.REGION})(#${LOC.CITY})(#${LOC.STREET_LINE_1})(#${LOC.STREET_LINE_2})?$`,
  "i" // <-- Makes all location field patterns case-insensitive
);
