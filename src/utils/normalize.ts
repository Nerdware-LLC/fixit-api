/**
 * An object with methods for formatting values for data-normalization purposes.
 */
export const normalize = {
  /**
   * Converts a currency amount string to an integer.
   * - Removes the decimal point if the string has two decimal places.
   * - Appends '00' to the string if it does not have two decimal places.
   * - Removes all commas, spaces, and dollar signs.
   *
   * | From this &nbsp; | To this |
   * | :--------------- | :------ |
   * | `"$25.99"`       | `2599`  |
   * | `"$ 25.00"`      | `2500`  |
   * | `"$25"`          | `2500`  |
   *
   * @param currencyStr - The currency amount as a string.
   * @returns The currency amount as an integer.
   */
  currencyStrToInt: (currencyStr: string): number => {
    // If the string has two decimal places, remove the decimal point, otherwise append '00'.
    currencyStr = /\.\d{2}$/.test(currencyStr) ? currencyStr.replace(".", "") : `${currencyStr}00`;
    // Remove all commas, spaces, and dollar signs.
    currencyStr = currencyStr.replace(/[\s,$]/g, "");
    // Return the integer representation of the string.
    return parseInt(currencyStr, 10);
  },

  /**
   * Removes all non-numeric characters from a phone number string.
   * - Example: converts `"(888) 123-4567"` into `"8881234567"`
   *
   * @param phoneNumber - The phone number as a string.
   * @returns The phone number with all non-numeric characters removed.
   */
  phone: (phoneNumber: string): string => {
    return phoneNumber.replace(/\D/g, "");
  },
} as const;
