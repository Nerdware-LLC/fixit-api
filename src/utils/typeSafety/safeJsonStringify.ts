/**
 * This function is a safe version of `JSON.stringify` which will not throw
 * an error if the input contains circular references or BigInts.
 */
export const safeJsonStringify: typeof JSON.stringify = (input: unknown, replacer, space) => {
  const circularSet = new WeakSet<object>();

  const customReplacer = (key: string, value: unknown) => {
    const { stringified, shouldAddRef = false } =
      typeof value === "bigint"
        ? { stringified: `${value.toString()}n` }
        : typeof value === "object" && value !== null
        ? circularSet.has(value)
          ? { stringified: "[Circular]" }
          : { stringified: value, shouldAddRef: true }
        : { stringified: value };

    if (shouldAddRef) circularSet.add(value as object);

    return stringified;
  };

  return JSON.stringify(
    input,
    typeof replacer === "function"
      ? (key, val) => customReplacer(key, replacer(key, val))
      : customReplacer,
    space
  );
};
