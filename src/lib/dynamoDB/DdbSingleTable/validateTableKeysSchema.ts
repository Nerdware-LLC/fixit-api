import { SchemaValidationError } from "./utils";
import type { TableKeysSchemaType, DdbTableProperties, DdbTableIndexes } from "./types";

/**
 * This function validates the provided `TableKeysSchema`, and if valid, returns an
 * object specifying the `tableHashKey`, `tableRangeKey`, and `indexes`.
 *
 * This function performs the following validation checks:
 *
 * 1. Ensure all key/index attributes specify `isHashKey`, `isRangeKey`, or `index`.
 * 2. Ensure exactly 1 table hash key, and 1 table range key are specified.
 * 3. Ensure all key/index attribute `type`s are "string", "number", or "Buffer" (S/N/B in the DDB API).
 * 4. Ensure all key/index attributes are `required`.
 * 5. Ensure there are no duplicate index names.
 * 6. If tableConfigs.billingMode is "PAY_PER_REQUEST", ensure indexes don't set `throughput`.
 */
export const validateTableKeysSchema = function ({
  tableKeysSchema,
  tableConfigs,
}: {
  tableKeysSchema: TableKeysSchemaType;
  tableConfigs: DdbTableProperties;
}) {
  const { tableHashKey, tableRangeKey, indexes } = Object.entries(tableKeysSchema).reduce(
    (
      accum: {
        tableHashKey: string | null;
        tableRangeKey: string | null;
        indexes: DdbTableIndexes;
      },
      [keyAttrName, { isHashKey, isRangeKey, index, type, required }]
    ) => {
      // Ensure all key/index attributes specify `isHashKey`, `isRangeKey`, or `index`
      if (isHashKey !== true && isRangeKey !== true && index === undefined) {
        throw new SchemaValidationError(
          `TableKeysSchema attribute "${keyAttrName}" is not configured as a key or index.`
        );
      }
      // Ensure all key/index attribute `type`s are "string", "number", or "Buffer" (S/N/B in DDB)
      if (!["string", "number", "Buffer"].includes(type)) {
        throw new SchemaValidationError(
          `TableKeysSchema attribute "${keyAttrName}" has an invalid "type" value (must be "string", "number", or "Buffer").`
        );
      }
      // Ensure all key/index attributes are `required`
      if (required !== true) {
        throw new SchemaValidationError(
          `The "${keyAttrName}" key/index attribute does not specify "required: true".`
        );
      }
      // Check for table hashKey
      if (isHashKey === true) {
        // Throw error if table hashKey already exists
        if (accum.tableHashKey) {
          throw new SchemaValidationError(
            `TableKeysSchema specifies multiple hash keys ("${accum.tableHashKey}" and "${keyAttrName}").`
          );
        }
        accum.tableHashKey = keyAttrName;
      }
      // Check for table rangeKey
      if (isRangeKey === true) {
        // Throw error if table rangeKey already exists
        if (accum.tableRangeKey) {
          throw new SchemaValidationError(
            `TableKeysSchema specifies multiple range keys ("${accum.tableRangeKey}" and "${keyAttrName}").`
          );
        }
        accum.tableRangeKey = keyAttrName;
      }
      // Check for index
      if (index) {
        // Ensure index name is unique
        if (Object.prototype.hasOwnProperty.call(accum.indexes, index.name)) {
          throw new SchemaValidationError(
            `TableKeysSchema specifies multiple indexes with the same name ("${index.name}").`
          );
        }
        // If tableConfigs.billingMode is "PAY_PER_REQUEST", ensure indexes don't set `throughput`
        if (tableConfigs.billingMode === "PAY_PER_REQUEST" && index.throughput) {
          throw new SchemaValidationError(
            `TableKeysSchema index "${keyAttrName}" cannot specify "throughput" when tableConfigs.billingMode is "PAY_PER_REQUEST".`
          );
        }
        accum.indexes[index.name] = {
          name: index.name,
          type: index?.global === true ? "GLOBAL" : "LOCAL",
          indexPK: keyAttrName,
          ...(index?.rangeKey && { indexSK: index.rangeKey }),
        };
      }
      return accum;
    },
    { tableHashKey: null, tableRangeKey: null, indexes: {} }
  );

  // Ensure table hashKey and rangeKey exist
  if (!tableHashKey || !tableRangeKey) {
    const { keyType, keyConfig } = !tableHashKey
      ? { keyType: "hash", keyConfig: "isHashKey" }
      : { keyType: "range", keyConfig: "isRangeKey" };
    throw new SchemaValidationError(
      `TableKeysSchema does not specify a ${keyType} key (must specify exactly one attribute with "${keyConfig}: true").`
    );
  }

  return {
    tableHashKey,
    tableRangeKey,
    indexes,
  };
};
