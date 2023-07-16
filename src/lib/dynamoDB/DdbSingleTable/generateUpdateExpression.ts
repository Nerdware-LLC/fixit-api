import { getExpressionAttrTokens } from "./utils/ddbExpressionHelpers";
import type { ExpressionAttributeDicts } from "./types";

/**
 * This function uses the provided `itemAttributes` to generate the following
 * `updateItem` args:
 *
 * - `UpdateExpression` (may include `"SET"` and/or `"REMOVE"` clauses)
 * - `ExpressionAttributeNames`
 * - `ExpressionAttributeValues`
 *
 * Attribute names and values in the `UpdateExpression` are replaced with token
 * placeholders, which here are derived by removing all non-letter characters from
 * the key, and then adding a num-sign prefix to the EA-Names token and a colon
 * prefix to the the EA-Values token. For example, an attribute `"foo-1"` would yield
 * clause `"#foo = :foo"` in the `UpdateExpression`.
 *
 * `UpdateExpression` Clauses:
 * - The `"SET"` clause includes all attributes which are _not_ explicitly `undefined`.
 * - The `"REMOVE"` clause includes all attributes which are explicitly set to `undefined`.
 * - If **{@link GenerateUpdateExpressionOpts|nullHandling}** is `"REMOVE"` (default),
 *   then attributes with `null` values are added to the `"REMOVE"` clause, otherwise
 *   they are added to the `"SET"` clause.
 */
export const generateUpdateExpression = (
  itemAttributes: { [attrName: string]: unknown },
  { nullHandling }: GenerateUpdateExpressionOpts = {}
  // IDEA Try adding a `nullHandling` option to Schema-types for per-attribute control.
) => {
  const shouldAddToRemoveClause =
    nullHandling !== "SET"
      ? (value: unknown) => value === undefined || value === null
      : (value: unknown) => value === undefined;

  const { updateExpressionClauses, ExpressionAttributeNames, ExpressionAttributeValues } =
    Object.entries(itemAttributes).reduce(
      (
        accum: ExpressionAttributeDicts & {
          updateExpressionClauses: { SET: string; REMOVE: string };
        },
        [attributeName, attributeValue]
      ) => {
        // Get the keys for ExpressionAttribute{Names,Values}
        const { attrNamesToken, attrValuesToken } = getExpressionAttrTokens(attributeName);
        // Always update ExpressionAttributeNames
        accum.ExpressionAttributeNames[attrNamesToken] = attributeName;
        // Derive and append the appropriate UpdateExpression clause
        if (shouldAddToRemoveClause(attributeValue)) {
          accum.updateExpressionClauses.REMOVE += `${attrNamesToken}, `;
        } else {
          accum.updateExpressionClauses.SET += `${attrNamesToken} = ${attrValuesToken}, `;
          // Only add to EAV if attrValue will be used, otherwise DDB will throw error
          accum.ExpressionAttributeValues[attrValuesToken] = attributeValue;
        }

        return accum;
      },
      {
        updateExpressionClauses: { SET: "", REMOVE: "" },
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
      }
    );

  // Combine the clauses into UpdateExpression (slice to rm last comma+space)
  const UpdateExpression = [
    ...(updateExpressionClauses.SET.length > 0
      ? [`SET ${updateExpressionClauses.SET.slice(0, -2)}`]
      : []),
    ...(updateExpressionClauses.REMOVE.length > 0
      ? [`REMOVE ${updateExpressionClauses.REMOVE.slice(0, -2)}`]
      : []),
  ].join(" ");

  return {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  };
};

export interface GenerateUpdateExpressionOpts {
  /** Enable/disable auto-generation of `UpdateExpression`s (true by default). */
  enabled?: boolean;
  /**
   * Defines the `UpdateExpression` clause to which `null` values are added:
   * - `"REMOVE"`: `null` values will be added to the `REMOVE` clause (default).
   *   - _On `null`, attributes are removed from the db_
   * - `"SET"`: `null` values will be added to the `SET` clause.
   *   - _On `null`, attribute values are set to `null` in the db_
   */
  nullHandling?: "SET" | "REMOVE";
}
