import { InvalidExpressionError, getExpressionAttrTokens, isType } from "./utils";
import type { ExpressionAttributeDicts } from "./types";

/**
 * This function uses the provided `itemAttributes` to generate the following
 * `query` args:
 *
 * - `KeyConditionExpression`
 * - `ExpressionAttributeNames`
 * - `ExpressionAttributeValues`
 */
export const generateKeyConditionExpression = <ItemType extends Record<string, unknown>>({
  where,
}: GenerateKeyConditionExpressionArgs<ItemType>) => {
  // Convert `where` into entries, ensure length is not greater than 2
  const whereEntries = Object.entries(where);

  if (whereEntries.length > 2) {
    throw new InvalidExpressionError({
      expressionName: "KeyConditionExpression",
      invalidValue: where,
      invalidValueDescription: "Where-API object",
      problem: `KeyConditionExpressions can only include hash and sort keys, but the Where-API object contains more than two K-V pairs`,
    });
  }

  const { KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
    whereEntries.reduce(
      (
        accum: { KeyConditionExpression: string } & ExpressionAttributeDicts,
        [attrName, whereConditional]
      ) => {
        // Derive and append the appropriate KeyConditionExpression clause

        // Determine the where-operator type
        let whereOperator: WhereApiOperator;
        let whereComparator: WhereApiComparator;

        if (!isType.map(whereConditional)) {
          // If the whereConditional is not an obj, ensure it's a string/number
          if (!isType.string(whereConditional) && !isType.number(whereConditional)) {
            throw new InvalidExpressionError({
              expressionName: "KeyConditionExpression",
              invalidValue: whereConditional,
              invalidValueDescription: "Where-API object",
              problem: `Where-API object for attribute "${attrName}" contains an invalid value for short-hand "eq" expression`,
            });
          }
          whereOperator = "eq";
          whereComparator = whereConditional;
        } else {
          // Validate the Where-API object
          if (!isValidWhereObject(whereConditional)) {
            throw new InvalidExpressionError({
              expressionName: "KeyConditionExpression",
              invalidValue: whereConditional,
              invalidValueDescription: "Where-API object",
              problem: `Where-API object for attribute "${attrName}" contains invalid keys and/or values`,
            });
          }

          const whereConditionalEntries = Object.entries(whereConditional) as Array<
            [WhereApiOperator, WhereApiComparator]
          >;

          // Ensure there's only one entry here
          if (whereConditionalEntries.length !== 1) {
            throw new InvalidExpressionError({
              expressionName: "KeyConditionExpression",
              invalidValue: whereConditional,
              invalidValueDescription: "Where-API object",
              problem:
                `KeyConditionExpressions can only include one logical operator per key, but the ` +
                `Where-API object for attribute "${attrName}" contains more than one operator`,
            });
          }

          [whereOperator, whereComparator] = whereConditionalEntries[0];
        }

        // Get the keys for ExpressionAttribute{Names,Values}
        const { attrNamesToken, attrValuesToken } = getExpressionAttrTokens(attrName);
        // Update ExpressionAttributeNames
        accum.ExpressionAttributeNames[attrNamesToken] = attrName;
        // Update ExpressionAttributeValues
        const eavKeysAdded: Array<string> = [];
        // For "between" operators, the comparator is an array, so we need to add 2 EAV
        if (isType.array(whereComparator)) {
          const [lowerBoundOperand, upperBoundOperand] = whereComparator;
          const lowerBoundEavToken = `${attrValuesToken}LowerBound`;
          const upperBoundEavToken = `${attrValuesToken}UpperBound`;
          accum.ExpressionAttributeValues[lowerBoundEavToken] = lowerBoundOperand;
          accum.ExpressionAttributeValues[upperBoundEavToken] = upperBoundOperand;
          eavKeysAdded.push(lowerBoundEavToken, upperBoundEavToken);
        } else {
          accum.ExpressionAttributeValues[attrValuesToken] = whereComparator;
          eavKeysAdded.push(attrValuesToken);
        }

        // Get the KCE clause
        const keyConditionExpressionClause = WHERE_OPERATOR_TO_EXPRESSION[whereOperator](
          attrNamesToken,
          eavKeysAdded
        );

        // Add the clause to the accum
        accum.KeyConditionExpression +=
          accum.KeyConditionExpression.length === 0
            ? keyConditionExpressionClause
            : ` AND ${keyConditionExpressionClause}`;

        return accum;
      },
      {
        KeyConditionExpression: "",
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
      }
    );

  // If neither are equality clauses, throw an error (KCE requires at least 1 equality clause)
  if (!/\s=\s/.test(KeyConditionExpression)) {
    throw new InvalidExpressionError({
      expressionName: "KeyConditionExpression",
      invalidValue: where,
      invalidValueDescription: "Where-API object",
      problem: `KeyConditionExpressions must include an equality check on a table/index hash key`,
    });
  }

  return {
    KeyConditionExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  };
};

/**
 * - `namesKey` is a key of ExpressionAttributeNames
 * - `valuesKeys` is a tuple of 1-2 keys of ExpressionAttributeValues
 *   - `between` operations require 2 EAV keys
 *   - all other operations require 1 EAV key
 */
export const WHERE_OPERATOR_TO_EXPRESSION = {
  eq: (namesKey: string, valuesKeys: string[]) => `${namesKey} = ${valuesKeys[0]}`,
  lt: (namesKey: string, valuesKeys: string[]) => `${namesKey} < ${valuesKeys[0]}`,
  lte: (namesKey: string, valuesKeys: string[]) => `${namesKey} <= ${valuesKeys[0]}`,
  gt: (namesKey: string, valuesKeys: string[]) => `${namesKey} > ${valuesKeys[0]}`,
  gte: (namesKey: string, valuesKeys: string[]) => `${namesKey} >= ${valuesKeys[0]}`,
  between: (namesKey: string, valuesKeys: string[]) =>
    `${namesKey} BETWEEN ${valuesKeys[0]} AND ${valuesKeys[1]}`,
  beginsWith: (namesKey: string, valuesKeys: string[]) =>
    `begins_with( ${namesKey}, ${valuesKeys[0]} )`,
} as const;

export const isValidWhereObject = (input: unknown): input is WhereApiObject => {
  if (!isType.map(input)) return false;

  let isValid: boolean = true;

  for (const key in input) {
    const inputValue = input[key];

    if (key === "beginsWith") {
      // For "beginsWith", value must be a string
      if (!isType.string(inputValue)) {
        isValid = false;
        break;
      }
    } else if (key === "between") {
      // For "between", value must be `[string, string]` or `[number, number]`
      if (
        !isType.array(inputValue) ||
        inputValue?.length !== 2 ||
        !(
          (isType.string(inputValue[0]) && isType.string(inputValue[1])) ||
          (isType.number(inputValue[0]) && isType.number(inputValue[1]))
        )
      ) {
        isValid = false;
        break;
      }
    } else if (["eq", "lt", "lte", "gt", "gte"].includes(key)) {
      // If the operator is one of these, value must be a string or number
      if (!isType.string(inputValue) && !isType.number(inputValue)) {
        isValid = false;
        break;
      }
    } else {
      // Else the key is not a valid Where-Operator
      isValid = false;
      break;
    }
  }

  return isValid;
};

/**
 * ```ts
 * const queryResults = await FooModel.query({
 *   where: {
 *     myHashKey: "x", // equivalent to `myHashKey: { eq: "x" }`
 *     mySortKey: {
 *         between: ["#USER#123", "~"]
 *     },
 *   },
 * });
 * ```
 */
export type GenerateKeyConditionExpressionArgs<ItemType extends Record<string, unknown>> = {
  where: ItemConditionals<ItemType>;
};

/**
 * Keys of attribute names to {@link WhereApiObject | WhereAPI objects }.
 * > Keys which aren't `where` operators are treated as `eq` expressions.
 */
export type ItemConditionals<ItemType extends Record<string, unknown>> = {
  [Key in keyof ItemType]?: string | number | WhereApiObject;
};

export type WhereApiOperator = keyof WhereApiObject;
export type WhereApiComparator = Required<WhereApiObject>[WhereApiOperator];

/**
 * Keys which aren't `where` operators are treated as {@link eq} expressions.
 */
export interface WhereApiObject {
  /** Equals (`fooKey === x`) */
  eq?: string | number;
  /** Less than (`fooKey < x`) */
  lt?: string | number;
  /** Less than or equal to (`fooKey <= x`) */
  lte?: string | number;
  /** Greater than (`fooKey > x`) */
  gt?: string | number;
  /** Greater than or equal to (`fooKey >= x`) */
  gte?: string | number;
  /** `fooKey BETWEEN x AND z` */
  between?: [string, string] | [number, number];
  /** `begins_with( fooKey, "fooVal" )` */
  beginsWith?: string;
}
