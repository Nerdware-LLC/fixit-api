import { intToCurrencyStr, intToCurrencyRoundedStr } from "./currency";
import { getTimeStr, getDateStr, getDateAndTimeStr } from "./dateTime";
import { capitalize, prettifyPhoneNum } from "./strings";

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
