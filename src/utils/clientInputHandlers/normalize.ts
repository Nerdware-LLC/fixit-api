import { i18nFormats } from "@/utils/i18n";

/**
 * An object with methods for formatting values for data-normalization purposes.
 */
export const normalize = {
  /**
   * Converts a currency amount string to an integer.
   * - Removes the decimal point if the string has two decimal places.
   * - Appends '00' to the string if it does not have two decimal places.
   *
   * | From this &nbsp; | To this |
   * | :--------------- | :------ |
   * | `"$25.99"`       | `2599`  |
   * | `"$ 25.00"`      | `2500`  |
   * | `"$25"`          | `2500`  |
   *
   * @param {string} currencyStr - The currency amount as a string.
   * @returns {number} - The currency amount as an integer.
   */
  currencyStrToInt: (currencyStr: string): number => {
    currencyStr = /\d\.\d{2}$/.test(currencyStr)
      ? currencyStr.replace(".", "")
      : `${currencyStr}00`;
    return parseInt(currencyStr, 10);
  },

  /**
   * Converts an integer representing a currency amount to a formatted string.
   * - Divides the integer by 100.
   * - Formats the resulting number as a currency string using the 'currencyFmt' object.
   * - Example: converts `123456` into `"$1,234.56"`
   *
   * @param {number} int - The integer representing the currency amount.
   * @returns {string} - The currency amount as a formatted string.
   */
  intToCurrencyStr: (int: number): string => {
    return i18nFormats.number.currency.enUS.format(int / 100);
  },

  /**
   * Removes all non-numeric characters from a phone number string.
   * - Example: converts `"(888) 123-4567"` into `"8881234567"`
   *
   * @param {string} phoneNumber - The phone number as a string.
   * @returns {string} - The phone number with all non-numeric characters removed.
   */
  phone: (phoneNumber: string): string => {
    return phoneNumber.replace(/\D/g, "");
  },
};
