import { isSafeInteger } from "@nerdware/ts-type-safety-utils";
import dayjs, { type ConfigType as DayJsCtorParamType } from "dayjs";

/**
 * This type reflects values that can be converted to a valid DayJS timestamp.
 *
 * The `dayjs` constructor accepts {@link DayJsCtorParamType|multiple arg types};
 * this type excludes `null` and `undefined` from the union of permitted values
 * since they'll never result in a valid timestamp.
 */
export type ValidTimestamp = Exclude<DayJsCtorParamType, null | undefined>;

/**
 * `typeof` strings of value-types which should not be provided to the `dayjs`
 * constructor in {@link isValidTimestamp}.
 */
const INVALID_TIMESTAMP_VALUE_TYPES = new Set([
  "symbol", //  <-- causes `dayjs()` to throw
  "bigint", //  <-- causes `dayjs()` to throw
  "boolean", // <-- causes false positives in `dayjs.isValid`
]);

/**
 * This `dayjs` helper checks if the provided `value` is a valid type which may be converted into
 * a timestamp.
 *
 * @param value - The value to check.
 * @param onlyAllow13DigitNumbers - If `true`, only 13-digit numbers are considered valid (see below).
 *
 * ### Numerical Timestamp Range
 *
 * If `onlyAllow13DigitNumbers` is `true` (default: `true`), the fn will only consider 13-digit
 * numbers to be valid timestamps. This setting ensures unix timestamps — _in SECONDS_ — are not
 * accidentally interpreted as milliseconds. If this fn is used to validate timestamps in seconds,
 * or if the fn is being used to validate timestamps out of the lower/upper bounds of the 13-digit
 * range, set `onlyAllow13DigitNumbers` to `false`.
 *
 * **13 Digit Timestamp Range:**
 *
 * - **Lower Bound:** `1000000000000` (Sun Sep 09 2001 01:46:40 GMT+0000)
 * - **Upper Bound:** `9999999999999` (Tue Nov 20 2286 17:46:39 GMT+0000)
 *
 * ### `dayjs.isValid` Notes:
 *
 * - The fn will only throw when given a `Symbol` or `BigInt`.
 * - The fn will return `false` for `null`, `""` (empty string), and invalid objects.
 * - The fn will return `true` for `undefined` and `0`, which for this project's purposes are not
 *   valid timestamps, so the conditional contains a truthy-check to weed out these false positives.
 */
export const isValidTimestamp = (
  value?: unknown,
  onlyAllow13DigitNumbers: boolean = true
): value is ValidTimestamp => {
  // Check for values types that break the dayjs ctor:
  if (!value || INVALID_TIMESTAMP_VALUE_TYPES.has(typeof value)) {
    return false;
  }

  // If onlyAllow13DigitNumbers is true, check for non-13-digit numbers:
  if (isSafeInteger(value) && onlyAllow13DigitNumbers && `${value}`.length !== 13) {
    return false;
  }

  // `value` is cast to any, bc the previous checks ensure it won't throw
  return dayjs(value as DayJsCtorParamType).isValid();
};

/**
 * Regex pattern for validating Unix timestamps of either 9 or 10 digits. The first
 * digit must be a non-zero integer. The 9-10 digit restriction results in the date
 * range shown below, which suits the needs of this application better than a more
 * generalized Unix timestamp regex pattern.
 * - Min: `100000000`  = `Saturday, Mar  3, 1973  9:46:40 am UTC`
 * - Max: `9999999999` = `Saturday, Nov 20, 2286 17:46:39 pm UTC`
 */
export const UNIX_TIMESTAMP_REGEX = /^[1-9]\d{8,9}$/;
