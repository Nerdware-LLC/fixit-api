/**
 * A utility object with helper methods for "normalizing" client input before its saved to the db.
 *
 * @method currencyStrToInt
 * @method phone
 */
export const normalizeInput = {
  /**
   * Converts a currency string into a cent-based integer.
   * Examples:
   *
   * | From this &nbsp; | To this |
   * | :--------------- | :------ |
   * | `"$25.99"`       | `2599`  |
   * | `"$ 25.00"`      | `2500`  |
   * | `"$25"`          | `2500`  |
   */
  currencyStrToInt: (currencyAmountStr: string): number => {
    return /\.\d{2}$/.test(currencyAmountStr)
      ? parseInt(currencyAmountStr.replace(".", ""), 10) // Remove decimal
      : parseInt(`${currencyAmountStr}00`, 10); // No decimal, append 00
  },

  /**
   * Removes all non-digit characters from phone number strings.
   *
   * Example: converts `"(888) 123-4567"` into `"8881234567"`
   */
  phone: (rawPhone: string) => {
    return rawPhone.replace(/\D+/g, ""); // save only the digits
  }
};
