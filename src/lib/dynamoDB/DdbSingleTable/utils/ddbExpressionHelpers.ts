import { DdbSingleTableError } from "./errors";

/**
 * This function creates "tokens" to be used as stand-ins for attribute names and values
 * in DDB-API expressions like `UpdateExpression`, `KeyConditionExpression`, etc. These
 * tokens are also therefore used as keys in the `ExpressionAttributeNames` and
 * `ExpressionAttributeValues` objects.
 *
 * The tokens are created by removing all non-alphanumeric characters from the provided
 * `attrName`, and then adding a num-sign prefix to the EA-Names key and a colon prefix
 * to the the EA-Values key.
 *
 * @return An object with keys `attrNamesKey` and `attrValuesKey`, to be used as keys in
 * `ExpressionAttributeNames` and `ExpressionAttributeValues` objects, respectively.
 * @throws Error if the `attrName` is empty or falsy.
 *
 * @example
 * ```ts
 * getExpressionAttrKeys("foo-1");
 * // returns { attrNamesKey: "#foo1", attrValuesKey: ":foo1" }
 * ```
 */
export const getExpressionAttrTokens = (attrName: string) => {
  if (!attrName) {
    throw new DdbSingleTableError("getExpressionAttrTokens requires a non-empty attrName arg");
  }
  // Remove non-letter chars from the attribute name
  const attrNameLetters = attrName.replace(/[^a-z0-9]/gi, "");
  return {
    attrNamesToken: `#${attrNameLetters}`,
    attrValuesToken: `:${attrNameLetters}`,
  };
};
