/**
 * Converts the first character of the provided string arg
 * to uppercase, and lowercases the rest.
 */
export const capitalizeFirstLetterOnly = (string: string) => {
  return `${string.charAt(0).toUpperCase()}${string.slice(1).toLowerCase()}`;
};
