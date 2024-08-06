/**
 * Capitalizes the first letter of `str`, and makes all other letters lowercase.
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalize = <S extends string>(str: S) => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}` as Capitalize<S>;
};
