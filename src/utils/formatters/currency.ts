import { sanitizeNumeric } from "@nerdware/ts-string-helpers";
import { isSafeInteger, safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { i18nFormats } from "./i18n.js";
import type { SupportedLocale } from "./i18n.js";

/**
 * Converts the provided `currencyStr` into an integer.
 *
 * > - If `currencyStr` has two decimal places, the decimal point is removed.
 * > - If `currencyStr` does not have two decimal places, `"00"` is appended to the string.
 *
 * ```ts
 * currencyStrToInt("$25.99"); //   2599
 * currencyStrToInt("$ 25.00"); //  2500
 * currencyStrToInt("$25"); //      2500
 * currencyStrToInt("$2,500"); // 250000
 * ```
 *
 * @param currencyStr - The currency amount as a string.
 * @returns The currency amount as an integer.
 * @throws If `currencyStr` is not a valid currency string.
 */
export const currencyStrToInt = (currencyStr: string): number => {
  // Validate the input:
  if (!/^\$?\s?(\d{1,3}(,\d{3})*(\.\d{2})?)$/.test(currencyStr))
    throw new Error(
      `Invalid value: expected a currency string, but received ${safeJsonStringify(currencyStr)}`
    );

  // If the string has two decimal places, remove the decimal point, otherwise append '00'.
  const centageStr = /\.\d{2}$/.test(currencyStr)
    ? currencyStr.replace(".", "")
    : `${currencyStr}00`;

  // Remove all non-digit chars
  const centageDigitsStr = sanitizeNumeric(centageStr);

  // Return the integer representation of the string.
  return parseInt(centageDigitsStr, 10);
};

/**
 * Converts an integer representing a currency's _minor unit_ into a currency-formatted string.
 *
 * > The _minor unit_ is the smallest denomination of a currency, e.g., cents for USD.
 *
 * ```ts
 * intToCurrencyStr(123456); //  "$1,234.56"
 * intToCurrencyStr(123456,  //  "$1,235"
 *   { shouldRound: true }
 * );
 * ```
 *
 * @param minorCurrencyUnitInteger - The integer representing the currency amount in the minor unit.
 * @param options - The options for formatting the currency string.
 * @returns The currency-formatted string.
 * @throws If the `minorCurrencyUnitInteger` is not a safe integer.
 */
export const intToCurrencyStr = (
  minorCurrencyUnitInteger: number,
  {
    locale = "enUS",
    shouldRound = false,
  }: {
    locale?: SupportedLocale;
    shouldRound?: boolean;
  } = {}
) => {
  if (!isSafeInteger(minorCurrencyUnitInteger))
    throw new Error(
      `Invalid value: expected a safe integer, but received ${safeJsonStringify(minorCurrencyUnitInteger)}`
    );

  const intlNumberFormat = shouldRound
    ? i18nFormats[locale].number.currencyRounded
    : i18nFormats[locale].number.currency;

  return intlNumberFormat.format(minorCurrencyUnitInteger / 100);
};
