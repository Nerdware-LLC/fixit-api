/** `string` type guard function */
export const isString = (value: unknown): value is string => typeof value === "string";
/** `number` type guard function */
export const isNumber = (value: unknown): value is number => Number.isSafeInteger(value);
/** `boolean` type guard function */
export const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
/** `function` type guard function */
export const isFunction = (value: unknown): value is boolean => typeof value === "function";
/** `BigInt` type guard function */
export const isBigInt = (value: unknown): value is bigint => typeof value === "bigint";
/** `Buffer` type guard function */
export const isBuffer = (value: unknown): value is Buffer => Buffer.isBuffer(value);
/** `Symbol` type guard function */
export const isSymbol = (value: unknown): value is symbol => typeof value === "symbol";
/** `undefined` type guard function */
export const isUndefined = (value: unknown): value is undefined => typeof value === "undefined";
/** `null` type guard function */
export const isNull = (value: unknown): value is null => value === null;
/** `Array` type guard function */
export const isArray = (value: unknown): value is Array<unknown> => Array.isArray(value);
/** `Date` type guard function */
export const isDate = (value: unknown): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};
/** `Object` type guard fn which tests if `value` is a `Record<>` object (e.g. `{ foo: "bar" }`). */
export const isRecordObject = <KeyTypes extends PropertyKey = string>(
  value: unknown
): value is Record<KeyTypes, unknown> => {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
};

/** Type guard functions */
export const isType = {
  string: isString,
  number: isNumber,
  boolean: isBoolean,
  function: isFunction,
  bigint: isBigInt,
  Buffer: isBuffer,
  symbol: isSymbol,
  undefined: isUndefined,
  null: isNull,
  array: isArray,
  Array: isArray,
  object: isRecordObject,
  Object: isRecordObject,
  date: isDate,
  Date: isDate,
};
