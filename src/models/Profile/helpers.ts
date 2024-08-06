import { isValidHandle, isValidURL, isValidName } from "@nerdware/ts-string-helpers";
import { isString } from "@nerdware/ts-type-safety-utils";

/**
 * Sanitizes a `displayName` value by removing any characters that are not permitted.
 *
 * Permitted Characters:
 * - `givenName`/`familyName`/`businessName` characters:
 *   - `\p{Script=Latin}`, white space, apostrophes, periods, and hyphens
 * - `handle` characters:
 *   - `0-9`, `@`, and `_`
 */
export const sanitizeDisplayName = (displayName?: string | null | undefined) => {
  return displayName ? displayName.trim().replace(/[^\s\p{Script=Latin}0-9@_'.-]/giu, "") : "";
};

/**
 * Returns `true` if `displayName` is a valid `Profile` name value or a valid `handle`.
 */
export const isValidDisplayName = (displayName: string) => {
  return isValidName(displayName) || isValidHandle(displayName);
};

/**
 * Returns `true` if `value` is a valid absolute http/https/s3 URL for `Profile.photoUrl`.
 */
export const isValidProfilePhotoUrl = (value?: unknown) => {
  return isString(value)
    ? isValidURL(value) && /^(http(s)?|s3):\/\//.test(value)
    : value === null || value === undefined;
};
