import { sanitizePhone } from "@nerdware/ts-string-helpers";

/**
 * Formats a phone number string into a "pretty" format.
 * @param phoneNum The phone number string to format.
 * @returns The formatted phone number string.
 */
export const prettifyPhoneNumStr = (phoneNum: string): string => {
  const phoneDigits = sanitizePhone(phoneNum);
  return `(${phoneDigits.substring(0, 3)}) ${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6, 11)}`;
};
