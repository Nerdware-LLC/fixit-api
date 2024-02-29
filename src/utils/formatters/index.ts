import { intToCurrencyStr, intToCurrencyRoundedStr } from "./currency.js";
import { getTimeStr, getDateStr, getDateAndTimeStr } from "./dateTime.js";
import { capitalize, prettifyPhoneNum } from "./strings.js";

/**
 * A utility object with helper methods for formatting data as "pretty" strings for display.
 */
export const fmt = {
  // currency
  intToCurrencyStr,
  intToCurrencyRoundedStr,
  // dateTime
  getTimeStr,
  getDateStr,
  getDateAndTimeStr,
  // strings
  capitalize,
  prettifyPhoneNum,
} as const;
