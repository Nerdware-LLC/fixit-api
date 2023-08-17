import { mockClient } from "aws-sdk-client-mock";
import merge from "lodash.merge";
import { hasKey } from "@utils/typeSafety";
import { findUnaliasedMockItem, UNALIASED_MOCKS } from "./_helpers";
import type {
  GetCommandInput,
  GetCommandOutput,
  BatchGetCommandInput,
  BatchGetCommandOutput,
  PutCommandInput,
  PutCommandOutput,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  UpdateCommandInput,
  UpdateCommandOutput,
  DeleteCommandInput,
  DeleteCommandOutput,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommandInput,
  ScanCommandOutput,
} from "@aws-sdk/lib-dynamodb";

const {
  DynamoDBDocumentClient: _DynamoDBDocumentClient,
  GetCommand,
  BatchGetCommand,
  PutCommand,
  BatchWriteCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} = await vi.importActual<typeof import("@aws-sdk/lib-dynamodb")>("@aws-sdk/lib-dynamodb");

/** Thin wrapper to provide better type inference for our fake DDB command fns. */
const fakeDdbCommandFn = <CmdInput, CmdOutput>(
  fn: (args: RequireNecessaryKeys<CmdInput>) => Omit<CmdOutput, "$metadata">
) => fn;

const DynamoDBDocumentClient = {
  from: vi.fn(() =>
    mockClient(_DynamoDBDocumentClient)
      .on(GetCommand)
      .callsFake(
        fakeDdbCommandFn<GetCommandInput, GetCommandOutput>(({ Key }) => {
          return {
            Item: findUnaliasedMockItem(Key),
          };
        })
      )
      .on(BatchGetCommand)
      .callsFake(
        fakeDdbCommandFn<BatchGetCommandInput, BatchGetCommandOutput>(({ RequestItems }) => {
          const [tableName, { Keys = [] }] = Object.entries(RequestItems)[0];
          return {
            Responses: {
              [tableName]: Keys.reduce((mockItems: Array<Record<string, unknown>>, primaryKeys) => {
                const mockItem = findUnaliasedMockItem(primaryKeys);
                if (mockItem) mockItems.push(mockItem);
                return mockItems;
              }, []),
            },
          };
        })
      )
      .on(PutCommand)
      .callsFake(
        fakeDdbCommandFn<PutCommandInput, PutCommandOutput>(({ Item: { pk, sk, ...item } }) => {
          return {
            Attributes: {
              ...findUnaliasedMockItem({ pk, sk }),
              ...item,
            },
          };
        })
      )
      .on(BatchWriteCommand)
      .callsFake(
        fakeDdbCommandFn<BatchWriteCommandInput, BatchWriteCommandOutput>(() => {
          // BatchWrite doesn't return items/attributes unless they're "unprocessed".
          return {};
        })
      )
      .on(UpdateCommand)
      .callsFake(
        fakeDdbCommandFn<UpdateCommandInput, UpdateCommandOutput>(
          ({
            Key,
            UpdateExpression,
            ExpressionAttributeNames: EANs = {},
            ExpressionAttributeValues: EAVs = {},
          }) => {
            /* Here, an attempt is made to find the existing mockItem, parse the UpdateExpression,
            and apply some basic operations to the mockItem to simulate the Update operation. This
            implementation should suit a variety of use cases - mock individually as needed.    */
            const existingItem = findUnaliasedMockItem(Key);
            const returnedItem: Record<string, unknown> = { ...existingItem };
            // Remove commas to simplify parsing
            const updateExprNoCommas = UpdateExpression.replace(/,/g, "");
            // Iterate through matched SET/REMOVE/ADD/DELETE clauses
            for (const matchArray of updateExprNoCommas.matchAll(
              /(SET|REMOVE|ADD|DELETE)\s[^(SET|REMOVE|ADD|DELETE)]*/g
            )) {
              const clause = matchArray[0].trim();
              const indexOfFirstSpace = clause.indexOf(" ");
              const action = clause.substring(0, indexOfFirstSpace); // SET|REMOVE|ADD|DELETE
              const actionAttrs = clause.substring(indexOfFirstSpace + 1); // #attrName = :attrValue

              const getAttrKV = (statement: string, separator: string = " "): [string, string] => {
                let [attrName, attrValue] = statement.split(separator);
                attrName = hasKey(EANs, attrName) ? EANs[attrName] : attrName;
                attrValue = hasKey(EAVs, attrValue) ? EAVs[attrValue] : attrValue;
                return [attrName, attrValue];
              };

              switch (action) {
                case "SET":
                  Array.from(actionAttrs.matchAll(/\S+\s=\s\S+/g)).forEach((setStatement) => {
                    const [attrName, attrValueToSet] = getAttrKV(setStatement[0], " = ");
                    if (
                      typeof attrValueToSet !== "object" ||
                      attrValueToSet === null ||
                      Array.isArray(attrValueToSet)
                    ) {
                      returnedItem[attrName] = attrValueToSet;
                    } else {
                      returnedItem[attrName] = merge(returnedItem[attrName], attrValueToSet);
                    }
                  });
                  break;
                case "REMOVE":
                  actionAttrs.split(" ").forEach((attrToRemove) => {
                    attrToRemove = hasKey(EANs, attrToRemove) ? EANs[attrToRemove] : attrToRemove;
                    if (hasKey(returnedItem, attrToRemove)) delete returnedItem[attrToRemove];
                  });
                  break;
                case "ADD":
                  Array.from(actionAttrs.matchAll(/\S+\s\S+/g)).forEach((addStatement) => {
                    const [attrName, attrValueToAdd] = getAttrKV(addStatement[0]);
                    returnedItem[attrName] = hasKey(returnedItem, attrName)
                      ? Array.isArray(returnedItem[attrName])
                        ? [...(returnedItem[attrName] as Array<unknown>), ...attrValueToAdd]
                        : Number(returnedItem[attrName]) + Number(attrValueToAdd)
                      : attrValueToAdd;
                  });
                  break;
                case "DELETE":
                  Array.from(actionAttrs.matchAll(/\S+\s\S+/g)).forEach((delStatement) => {
                    const [attrName, attrValueToDelete] = getAttrKV(delStatement[0]);
                    if (hasKey(returnedItem, attrName) && Array.isArray(returnedItem[attrName])) {
                      returnedItem[attrName] = (returnedItem[attrName] as Array<unknown>).filter(
                        (value) => value !== attrValueToDelete
                      );
                    }
                  });
                  break;
                default:
                  throw new Error(
                    `[MOCK:lib-dynamodb] Unknown UpdateExpression clause action: "${action}"`
                  );
              }
            }
            return {
              Attributes: returnedItem,
            };
          }
        )
      )
      .on(DeleteCommand)
      .callsFake(
        fakeDdbCommandFn<DeleteCommandInput, DeleteCommandOutput>(({ Key }) => {
          return {
            Attributes: findUnaliasedMockItem(Key),
          };
        })
      )
      .on(QueryCommand)
      .callsFake(
        fakeDdbCommandFn<QueryCommandInput, QueryCommandOutput>(
          ({
            KeyConditionExpression,
            ExpressionAttributeNames: EANs = {},
            ExpressionAttributeValues: EAVs = {},
          }) => {
            /* As with the updateItem cmd, an attempt is made to find the existing
            mockItem(s) by parsing the KeyConditionExpression. This implementation
            should suit a variety of use cases - mock individually as needed.   */

            // Helper fn splits a KeyExpr clause, and checks EANs/EAVs for aliases.
            const getAttrKVs = (clause: string, sep: string | RegExp): [string, ...string[]] => {
              const [attrName, ...values] = clause.split(sep);
              return [
                hasKey(EANs, attrName) ? EANs[attrName] : attrName,
                ...values.map((value) => (hasKey(EAVs, value) ? EAVs[value] : value)),
              ];
            };

            const keyConditionClauses = KeyConditionExpression.split(" AND ");
            // Map the clauses to functions which will be used to filter UNALIASED_MOCKS.
            const clauseFilterFunctions = keyConditionClauses.map((clause) => {
              // Define the filter function for this clause.
              let clauseFilterFn: <T extends Record<string, unknown>>(item: T) => boolean;

              if (/\S+ BETWEEN \S+ AND \S+/.test(clause)) {
                // BETWEEN clause: rm "BETWEEN" and "AND" keywords, then split on remaining spaces.
                const [attrName, lowerBound, upperBound] = getAttrKVs(
                  clause.replace(/(?<=\s)(BETWEEN|AND)\s/g, ""),
                  " "
                );
                // Set the filter function and attributeName for this clause.
                clauseFilterFn = (item) =>
                  hasKey(item, attrName) &&
                  (typeof item[attrName] === "string" || typeof item[attrName] === "number") &&
                  item[attrName] >= lowerBound &&
                  item[attrName] <= upperBound;
              } else if (/^begins_with/.test(clause)) {
                // begins_with clause: rm "begins_with" keyword, parens, and spaces, then split on comma.
                const [attrName, attrValue] = getAttrKVs(
                  clause.replace(/begins_with|[()\s]/g, ""),
                  ","
                );
                clauseFilterFn = (item) =>
                  hasKey(item, attrName) &&
                  typeof item[attrName] === "string" &&
                  (item[attrName] as string).startsWith(attrValue);
              } else {
                // All other clauses: split on the operator.
                const [attrName, operator, attrValue] = getAttrKVs(clause, /\s(=|<|<=|>|>=)\s/);
                const operatorFn: (existingValue: string | number) => boolean =
                  operator === "="
                    ? (existingValue) => existingValue === attrValue
                    : operator === "<"
                    ? (existingValue) => existingValue < attrValue
                    : operator === "<="
                    ? (existingValue) => existingValue <= attrValue
                    : operator === ">"
                    ? (existingValue) => existingValue > attrValue
                    : operator === ">="
                    ? (existingValue) => existingValue >= attrValue
                    : () => false;
                clauseFilterFn = (item) =>
                  hasKey(item, attrName) &&
                  (typeof item[attrName] === "string" || typeof item[attrName] === "number") &&
                  operatorFn(item[attrName] as string | number);
              }
              return clauseFilterFn;
            });

            return {
              Items: UNALIASED_MOCKS.filter((mockItem) =>
                clauseFilterFunctions.every((clauseFilterFn) => clauseFilterFn(mockItem))
              ),
            };
          }
        )
      )
      .on(ScanCommand)
      .callsFake(
        fakeDdbCommandFn<ScanCommandInput, ScanCommandOutput>(() => {
          return {
            Items: UNALIASED_MOCKS,
          };
        })
      )
  ),
};

export {
  DynamoDBDocumentClient,
  GetCommand,
  BatchGetCommand,
  PutCommand,
  BatchWriteCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
};

/** Modifies DDB-cmd input types for mocking purposes. */
type RequireNecessaryKeys<T> = Omit<T, "ExpressionAttributeValues"> & {
  [K in keyof T as K extends
    | "Key"
    | "Item"
    | "RequestItems"
    | "UpdateExpression"
    | "KeyConditionExpression"
    ? K
    : never]-?: Exclude<T[K], undefined>;
} & {
  ExpressionAttributeValues?: Record<string, string>;
};
