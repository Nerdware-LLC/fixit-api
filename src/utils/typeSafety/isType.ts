/** Type guard functions */
export const isType = {
  string: (input: unknown): input is string => typeof input === "string",
  number: (input: unknown): input is number => Number.isSafeInteger(input),
  boolean: (input: unknown): input is boolean => typeof input === "boolean",
  Buffer: (input: unknown): input is Buffer => Buffer.isBuffer(input),
  Date: (input: unknown): input is Date => input instanceof Date && !isNaN(input.getTime()),
  Array: (input: unknown): input is Array<unknown> => Array.isArray(input),
  /** Test if `input` is a record/dictionary-like object (e.g. `{ foo: "bar" }`) */
  Object: (input: unknown): input is Record<string, unknown> =>
    typeof input === "object" && !Array.isArray(input) && input !== null,
};
