/**
 * Regex patterns for validating `Location` components.
 *
 * Location components are stored separately, despite some having patterns which are
 * currently the exact same and therefore duplicative. This is due to the fact that they
 * may differ when converted into unicode-based patterns to support i18n. Note that these
 * patterns all assume spaces have been replaced with underscores.
 */
export const LOCATION_REGEX_STRS = {
  COUNTRY: "[a-z-_]{2,}", //             Two or more letters/hyphens/underscores
  REGION: "[a-z-_]{2,}", //              Two or more letters/hyphens/underscores
  CITY: "[a-z-_]{2,}", //                Two or more letters/hyphens/underscores
  STREET_LINE_1: "[a-z0-9-_.]{2,}", //   Two or more letters/hyphens/underscores/numbers/periods
  STREET_LINE_2: "[a-z0-9-_.:#]{2,}", // Two or more letters/hyphens/underscores/numbers/periods/:/#
};

// Shortened name for interpolation in LOCATION_COMPOSITE_REGEX
const LOC = LOCATION_REGEX_STRS;

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
