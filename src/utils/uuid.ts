import { v1 as uuidv1 } from "uuid";

/**
 * Generates a unique UUID string with a timestamp based on the current or
 * provided date.
 *
 * @param date - Optional. A `Date` timestamp for the UUID (default: `new Date()`).
 * @returns A unique UUID string with a timestamp based on the provided or current date.
 */
export const getUnixTimestampUUID = (date: Date = new Date()) => {
  return uuidv1({ msecs: date.getTime() });
};
