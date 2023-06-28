import { hasKey } from "@utils/typeSafety";

/**
 * Type-checking functions for DdbSingleTable
 */
export const isType = Object.freeze({
  string: (input: unknown): input is string => typeof input === "string",
  number: (input: unknown): input is number => Number.isSafeInteger(input),
  boolean: (input: unknown): input is boolean => typeof input === "boolean",
  Buffer: (input: unknown): input is Buffer => Buffer.isBuffer(input),
  Date: (input: unknown): input is Date => input instanceof Date && !isNaN(input.getTime()),
  array: (input: unknown): input is Array<unknown> => Array.isArray(input),
  /** Test if `input` is a record/dictionary-like object (e.g. `{ foo: "bar" }`) */
  map: (input: unknown): input is Record<string, unknown> =>
    typeof input === "object" && !Array.isArray(input) && input !== null,
  enum: <EnumValues extends ReadonlyArray<string>>(
    input: unknown,
    allowedValues: EnumValues
  ): input is EnumValues[number] => typeof input === "string" && allowedValues.includes(input),
});

/**
 * A type-guard which returns a boolean indicating whether the following are all true:
 *
 * 1. `obj` is a truthy object
 * 2. `obj` has the provided `key` as an own-property
 * 3. `obj[key]` is neither `null` nor undefined
 */
export const hasDefinedProperty = <Obj extends Record<PropertyKey, any>, Key extends PropertyKey>(
  obj: Obj,
  key: Key
): obj is Obj & Record<Key, NonNullable<unknown>> => {
  return hasKey(obj, key) && obj[key] !== null && obj[key] !== undefined;
};
