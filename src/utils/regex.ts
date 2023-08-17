/**
 * Use this function to create regex patterns from arbitrary user-provided string
 * inputs which must be escaped/sanitized.
 */
export const getEscapedRegExp = (string: string, regexFlags: string) => {
  const cleanedStr = string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  return new RegExp(cleanedStr, regexFlags);
};

/**
 * Regex pattern string for creating RegExps which validate values which include a v1 UUID.
 * - Example: `2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d`
 * - Use this in template literals defining other regex patterns which include v1 UUIDs.
 */
export const UUID_V1_REGEX_STR = "[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}";

/** Regex pattern for validating a v1 UUID (e.g., `"2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d"`). */
export const UUID_V1_REGEX = new RegExp(`^${UUID_V1_REGEX_STR}$`, "i");
