import { isString } from "@nerdware/ts-type-safety-utils";
import { v4 as uuidv4, v5 as uuidv5, version as uuidVersion } from "uuid";
import { ENV } from "@/server/env";

/**
 * Generates a random v4 UUID string (_**the result is not reproducible**_).
 */
export const getRandomUUIDv4 = () => uuidv4();

/**
 * Generates a reproducible v5 UUID string using the provided `input` and the app's UUID namespace.
 */
export const getUUIDv5 = (input: string) => uuidv5(input, ENV.UUID_NAMESPACE);

///////////////////////////////////////////////////////////////////////////////
// UUID Validation:

/** Checks if the provided `value` is a valid UUID string _**of any version**_. */
export const isValidUUID = (value: unknown): value is string => {
  return isString(value) && UUID_REGEX.test(value);
};

/** Checks if the provided `value` is a valid **v4** UUID string. */
export const isValidUUIDv4 = (value: unknown) => isValidUUID(value) && uuidVersion(value) === 4;

/** Checks if the provided `value` is a valid **v5** UUID string. */
export const isValidUUIDv5 = (value: unknown) => isValidUUID(value) && uuidVersion(value) === 5;

/**
 * Regex for validating UUID strings.
 * @source https://github.com/uuidjs/uuid/blob/6dcb15b86357afdf29ae2dabf5b2a8afab83c2c0/src/regex.js
 */
export const UUID_REGEX =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
