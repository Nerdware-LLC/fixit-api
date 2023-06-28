import { hasKey } from "@utils/typeSafety";
import { SchemaValidationError } from "./utils";
import type {
  ModelSchemaType,
  TableKeysSchemaType,
  BaseAttributeConfigProperties,
  KeyAttributeConfig,
  MergeModelAndTableKeysSchema,
} from "./types";

/**
 * This function merges the provided TableKeysSchema and (Partial) ModelSchema,
 * excludes key-attribute config properties that are not mergeable, and returns
 * a complete ModelSchema.
 *
 * The following key-attribute config properties are excluded:
 * - `isHashKey`
 * - `isRangeKey`
 * - `index`
 */
export const getMergedModelSchema = <
  TableKeysSchema extends TableKeysSchemaType,
  ModelSchema extends ModelSchemaType<TableKeysSchema>
>({
  tableKeysSchema,
  modelSchema,
  modelName,
}: {
  tableKeysSchema: TableKeysSchema;
  modelSchema: ModelSchema;
  modelName?: string;
}) => {
  const mergedModelSchema: Record<string, Record<string, any>> = { ...modelSchema };

  for (const keyAttrName in tableKeysSchema) {
    const { isHashKey, isRangeKey, index, ...keyAttrConfig } = tableKeysSchema[keyAttrName];

    // Check if ModelSchema contains keyAttrName
    if (hasKey(modelSchema, keyAttrName)) {
      // If ModelSchema contains keyAttrName, check if it contains mergeable config properties.
      KEY_ATTR_CONFIGS.MERGEABLE.forEach((attrConfigName) => {
        if (hasKey(modelSchema[keyAttrName], attrConfigName)) {
          // If ModelSchema contains `keyAttrName` AND a mergeable property, ensure it matches TableKeysSchema.
          if (modelSchema[keyAttrName][attrConfigName] !== keyAttrConfig[attrConfigName]) {
            // Derive a string that identifies the ModelSchema if possible
            const modelIdString = modelName ? `the "${modelName}"` : "a";
            throw new SchemaValidationError(
              `The "${attrConfigName}" value of key attribute "${keyAttrName}" ` +
                `defined in ${modelIdString} ModelSchema does not match the ` +
                `"${attrConfigName}" value defined in the TableKeysSchema.`
            );
          }
        } else {
          // If ModelSchema contains `keyAttrName`, but NOT a mergeable config property, add it.
          mergedModelSchema[keyAttrName][attrConfigName] = keyAttrConfig[attrConfigName];
        }
      });
    } else {
      // If ModelSchema does NOT contain keyAttrName, add it.
      mergedModelSchema[keyAttrName] = keyAttrConfig;
    }
  }

  // Ensure the returned schema doesn't contain NO_MERGE configs.
  for (const attrName in mergedModelSchema) {
    KEY_ATTR_CONFIGS.NO_MERGE.forEach((attrConfigName) => {
      if (hasKey(mergedModelSchema[attrName], attrConfigName)) {
        delete mergedModelSchema[attrName][attrConfigName];
      }
    });
  }

  return mergedModelSchema as MergeModelAndTableKeysSchema<TableKeysSchema, ModelSchema>;
};

const KEY_ATTR_CONFIGS = {
  MERGEABLE: ["type", "required"] satisfies Array<keyof BaseAttributeConfigProperties>,
  NO_MERGE: ["isHashKey", "isRangeKey", "index"] satisfies Array<keyof KeyAttributeConfig>,
} as const;
