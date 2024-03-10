import { i18nFormats } from "./i18n.js";
import type { SupportedLocale } from "./i18n.js";

export type NumberToStringFormatter = (num: number, intlNumberFormat: Intl.NumberFormat) => string;
export type NumberToLocaleStringFormatter = (num: number, locale?: SupportedLocale) => string;

const validateAndFormatInt: NumberToStringFormatter = (value, intlNumberFormat) => {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Currency formatter received an invalid value: ${value}`);
  }

  return intlNumberFormat.format(value / 100);
};

/**
 * Converts an integer into a string formatted as a currency amount.
 * > The `int` is divided by 100.
 *
 * ```ts
 * formatIntToCurrencyStr(123456); //  "$1,234.56"
 * ```
 *
 * @param int - The integer representing a currency amount.
 * @returns The currency amount as a formatted string.
 * @throws If `int` is not a safe integer.
 */
export const intToCurrencyStr: NumberToLocaleStringFormatter = (int, locale = "enUS") => {
  return validateAndFormatInt(int, i18nFormats[locale].number.currency);
};

/**
 * Converts an integer into a string formatted as a currency amount, rounded to the nearest dollar.
 * > The `int` is divided by 100.
 *
 * ```ts
 * formatIntToCurrencyRoundedStr(123456); // "$1,235"
 * ```
 *
 * @param int - The integer representing a currency amount.
 * @returns The currency amount as a formatted string, rounded to the nearest dollar.
 * @throws If `int` is not a safe integer.
 */
export const intToCurrencyRoundedStr: NumberToLocaleStringFormatter = (int, locale = "enUS") => {
  return validateAndFormatInt(int, i18nFormats[locale].number.currencyRounded);
};
