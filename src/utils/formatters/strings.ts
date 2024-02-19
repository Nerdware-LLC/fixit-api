import { isValidPhone } from "@nerdware/ts-string-helpers";

/**
 * Formats a phone number string into a "pretty" format.
 *
 * @param phoneNum The phone number string to format.
 * @param shouldValidate Whether or not to validate the input before formatting it (defaults to `true`).
 * @returns The formatted phone number string.
 * @throws If `shouldValidate` is `true` and the input is invalid.
 */
export const prettifyPhoneNum = (phoneNum: string, shouldValidate: boolean = true) => {
  if (shouldValidate && !isValidPhone(phoneNum as unknown)) {
    throw new Error(`Phone number formatter received an invalid value: ${phoneNum}`);
  }

  return `(${phoneNum.substring(0, 3)}) ${phoneNum.substring(3, 6)}-${phoneNum.substring(6, 11)}`;
};

/**
 * Capitalizes the first letter of `str`, and makes all other letters lowercase.
 *
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalize = <S extends string>(str: S) => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}` as Capitalize<S>;
};

/**
 * For each word in the provided string arg, unless the word is included in the
 * list below, the first letter is capitalized and the rest are lowercased. The
 * common acronyms listed below are entirely uppercased.
 *
 * Common business name acronyms which are uppercased:
 * - LLC
 * - INC
 * - CO
 * - CORP
 * - LTD
 * - LP
 */
export const prettifyBizName = (rawBizName: string) => {
  return rawBizName
    .split(" ")
    .map((word) =>
      /^(llc|inc|co|corp|ltd|lp)\.?$/i.test(word) ? word.toUpperCase() : capitalize(word)
    )
    .join(" ");
};
