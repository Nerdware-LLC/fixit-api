import { hasKey } from "@/utils/typeSafety";
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
}: {
  tableKeysSchema: TableKeysSchema;
  modelSchema: ModelSchema;
}) => {
  // Ensure unknown/invalid attr configs are not present in the Model schema
  Object.entries(modelSchema).forEach(([modelAttrName, modelAttrConfig]) => {
    Object.keys(modelAttrConfig).forEach((modelAttrConfigKey) => {
      if (!MODEL_ATTR_CONFIG_PROPERTY_NAMES.includes(modelAttrConfigKey)) {
        throw new SchemaValidationError(
          `Invalid Model schema: attribute "${modelAttrName}" contains unknown property "${modelAttrConfigKey}".`
        );
      }
    });
  });

  const mergedModelSchema: Record<string, Record<string, any>> = { ...modelSchema };

  for (const keyAttrName in tableKeysSchema) {
    const { isHashKey, isRangeKey, index, ...keyAttrConfig } = tableKeysSchema[keyAttrName];

    // Check if ModelSchema contains keyAttrName
    if (hasKey(modelSchema, keyAttrName)) {
      // If ModelSchema contains keyAttrName, check if it contains mergeable config properties.
      KEY_ATTR_CONFIG_PROPERTY_NAMES.MERGEABLE.forEach((attrConfigName) => {
        if (hasKey(modelSchema[keyAttrName], attrConfigName)) {
          // If ModelSchema contains `keyAttrName` AND a mergeable property, ensure it matches TableKeysSchema.
          if (modelSchema[keyAttrName][attrConfigName] !== keyAttrConfig[attrConfigName]) {
            // Throw error if ModelSchema key attrConfig has a config mismatch
            throw new SchemaValidationError(
              `Invalid "${attrConfigName}" value found in ModelSchema for key attribute ` +
                `"${keyAttrName}" does not match the value provided in the TableKeysSchema.`
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
    KEY_ATTR_CONFIG_PROPERTY_NAMES.NO_MERGE.forEach((attrConfigName) => {
      if (hasKey(mergedModelSchema[attrName], attrConfigName)) {
        delete mergedModelSchema[attrName][attrConfigName];
      }
    });
  }

  return mergedModelSchema as MergeModelAndTableKeysSchema<TableKeysSchema, ModelSchema>;
};

const KEY_ATTR_CONFIG_PROPERTY_NAMES = {
  MERGEABLE: ["type", "required"] satisfies Array<keyof BaseAttributeConfigProperties>,
  NO_MERGE: ["isHashKey", "isRangeKey", "index"] satisfies Array<keyof KeyAttributeConfig>,
} as const;

const MODEL_ATTR_CONFIG_PROPERTY_NAMES = [
  "alias",
  "type",
  "oneOf",
  "schema",
  "required",
  "default",
  "validate",
  "transformValue",
];
