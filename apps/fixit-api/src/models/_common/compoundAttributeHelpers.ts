import { isPlainObject, isString } from "@nerdware/ts-type-safety-utils";

/** Compound attribute field delimeter. */
export const DELIMETER = "#";

/**
 * Formats an individual {@link CompoundAttrRegexComponent|component} of a compound attribute's
 * regex pattern. The following modifications are made to the provided regex pattern:
 *
 * - Removes any `^` and `$` position assertions
 * - If the provided `regexComponent` is a config object with `required: false`, the regex
 *   pattern is grouped with a `?` quantifier.
 */
const formatCompoundAttrRegexComponent = (regexComponent: CompoundAttrRegexComponent): string => {
  const { regex, required } = isPlainObject(regexComponent)
    ? regexComponent
    : { regex: regexComponent, required: true };

  // Get the regex pattern source
  let source = isString(regex) ? regex : regex.source;

  // Remove any `^` and `$` position assertions
  source = source.replace(/(^\^?|\$?$)/g, "");
  // If the component is optional, group it with a `?` quantifier
  if (!required) source = `(${source})?`;

  return source;
};

/**
 * A component of a compound attribute's regex pattern. Can be a `RegExp` object, a regex pattern
 * string, or a config object that includes a regex pattern and a `required` flag.
 */
export type CompoundAttrRegexComponent = RegExp | string | CompoundAttrRegexComponentConfig;

/** A config object for a compound attribute's regex component. */
export type CompoundAttrRegexComponentConfig = {
  regex: RegExp | string;
  required: boolean;
};

/**
 * Returns a `RegExp` object that can be used to validate a compound attribute value.
 *
 * > _This app uses `"#"` as the delimeter for compound attribute field values._
 *
 * @param regexComponents - An array of `RegExp` objects, regex-pattern strings, and/or
 *   regex-pattern config objects which include a regex pattern and a `required` flag.
 *   These patterns are used to validate the individual components of the compound attribute.
 *   They must be provided in the order they appear in the compound attribute.
 *   > **Note:**
 *   > - If a provided `RegExp` object has flags, they are ignored.
 *   > - Any `^` and/or `$` position assertions are removed.
 *   > - To have a component be optional, provide a config object with a `required: false` flag.
 *
 * @param regexFlags - Optional flags to pass to the `RegExp` constructor.
 * @returns A `RegExp` object that reflects a combination of the provided `componentRegex` patterns.
 * @example
 * ```ts
 * getCompoundAttrRegex( // This example would return /^foo#bar#(baz)?$/i
 *   [
 *     '^foo$', // <-- `^` and `$` position assertions are removed
 *     /bar/u, //  <-- flags are ignored
 *     {
 *       regex: 'baz', //   <-- can be RegExp or string
 *       required: false // <-- optional regex component
 *     }
 *   ],
 *   'i'
 * ); // => /^foo#bar#(baz)?$/i
 * ```
 */
export const getCompoundAttrRegex = (
  regexComponents: Array<CompoundAttrRegexComponent>,
  { regexFlags = "" }: { regexFlags?: string } = {}
): RegExp => {
  const regexSourceStrings = regexComponents.map(formatCompoundAttrRegexComponent);
  return new RegExp(`^${regexSourceStrings.join(DELIMETER)}$`, regexFlags);
};

/**
 * Converts an ordered array of values into a compound attribute string.
 *
 * > If a value is `null` or `undefined`, it is treated as an empty string.
 * >
 * > If the values may include problematic characters like spaces or `#` characters (the delimeter),
 * > set `shouldUrlEncode` to `true` to encode the values using `encodeURIComponent`.
 */
export const getCompoundAttrString = (
  orderedValues: Array<string | null | undefined>,
  { shouldUrlEncode = false }: { shouldUrlEncode?: boolean } = {}
) => {
  return orderedValues
    .map(
      // prettier-ignore
      shouldUrlEncode
        ? (value) => (value ? encodeURIComponent(value) : "")
        : (value) => value ?? ""
    )
    .join(DELIMETER);
};

/**
 * Converts a compound attribute string into an ordered array of string values.
 *
 * > Set `shouldUrlDecode` to `true` to decode the values using `decodeURIComponent`.
 */
export const parseCompoundAttrString = (
  compoundAttrStr: string,
  { shouldUrlDecode = false }: { shouldUrlDecode?: boolean } = {}
) => {
  const orderedValues = compoundAttrStr.split(DELIMETER);
  return shouldUrlDecode
    ? orderedValues.map((value) => (value ? decodeURIComponent(value) : ""))
    : orderedValues;
};
