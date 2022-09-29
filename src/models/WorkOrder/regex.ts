import { USER_ID_REGEX_STR } from "@models/User";
import { UNIX_TIMESTAMP_REGEX_STR, LOCATION_REGEX_STRS as LOC } from "@utils/regex";

export const WORK_ORDER_ID_REGEX_STR = `WO#${USER_ID_REGEX_STR}#${UNIX_TIMESTAMP_REGEX_STR}`;
export const WORK_ORDER_ID_REGEX = new RegExp(`^${WORK_ORDER_ID_REGEX_STR}$`);

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
 * // TODO Add unicode regex patterns to support internationalization (e.g., /[\p{Alpha}\p{M}\p{Nd}\p{Pc}\p{Join_C}]/u).
 */
export const LOCATION_COMPOSITE_REGEX = new RegExp(
  `^(${LOC.COUNTRY})(#${LOC.REGION})(#${LOC.CITY})(#${LOC.STREET_LINE_1})(#${LOC.STREET_LINE_2})?$`,
  "i" // <-- Makes all location field patterns case-insensitive
);

export const WO_CHECKLIST_ITEM_ID_REGEX = new RegExp(
  `^${WORK_ORDER_ID_REGEX_STR}#CHECKLIST_ITEM#${UNIX_TIMESTAMP_REGEX_STR}$`
);
