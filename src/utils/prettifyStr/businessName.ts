import { capitalizeFirstLetterOnly as capFirst } from "./capitalizeFirstLetterOnly";

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
  const bizNameWordArray = rawBizName.split(" ");
  const eachWordFirstLetterCapd = bizNameWordArray.map((word) => {
    return /^(llc|inc|co|corp|ltd|lp)\.?$/i.test(word) ? word.toUpperCase() : capFirst(word);
  });

  return eachWordFirstLetterCapd.join(" ");
};
