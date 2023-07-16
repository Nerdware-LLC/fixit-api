import { hasKey } from "@utils/typeSafety";
import { isType, SchemaValidationError } from "./utils";
import type { ModelSchemaType, KeyAttributeConfig } from "./types";

/**
 * This function validates the provided Model schema, and if valid, returns the
 * ModelSchema with TableKeysSchema merged in, as well as the Model's alias maps.
 *
 * This function performs the following validation checks:
 *
 * 1. Ensure ModelSchema does not specify key-attribute configs which are only
 *    valid in the TableKeysSchema (e.g. "isHashKey", "isRangeKey", "index").
 * 2. Ensure all "alias" values are unique.
 * 3. Ensure a "type" is specified for all attributes.
 * 4. Ensure "default" values comply with "type".
 * 5. Ensure "map" and "array" attributes include a valid "schema" config.
 * 6. Ensure "enum" attributes include a valid "oneOf" config.
 */
export const validateModelSchema = function <ModelSchema extends ModelSchemaType>({
  modelName,
  modelSchema,
}: {
  modelName: string;
  modelSchema: ModelSchema;
}) {
  const { attributesToAliasesMap, aliasesToAttributesMap } = Object.entries(modelSchema).reduce(
    (
      accum: Record<"attributesToAliasesMap" | "aliasesToAttributesMap", Record<string, string>>,
      [attrName, { alias, type, schema, oneOf = [], default: defaultValue, ...attrConfigs }]
    ) => {
      // Ensure ModelSchema doesn't include key/index configs which are only valid in the TableKeysSchema
      (["isHashKey", "isRangeKey", "index"] satisfies Array<keyof KeyAttributeConfig>).forEach(
        (keyConfigProperty) => {
          if (hasKey(attrConfigs, keyConfigProperty)) {
            throw new SchemaValidationError(
              `${modelName} Model schema attribute "${attrName}" includes an ` +
                `"${keyConfigProperty}" config, which is only valid in a TableKeysSchema.`
            );
          }
        }
      );

      // If an "alias" is specified, ensure it's unique, and add it to the alias maps
      if (alias) {
        // If alias already exists in accum, there's a dupe alias in the schema, throw error
        if (alias in accum.aliasesToAttributesMap) {
          throw new SchemaValidationError(
            `${modelName} Model schema contains duplicate alias "${alias}".`
          );
        }

        // Add attrName/alias to the alias maps
        accum.attributesToAliasesMap[attrName] = alias;
        accum.aliasesToAttributesMap[alias] = attrName;
      }

      // Ensure "type" was provided
      if (!type) {
        throw new SchemaValidationError(
          `${modelName} Model schema attribute "${attrName}" does not specify a "type".`
        );
      }

      // Validate nested "map", "array", and "tuple" types
      if (["map", "array", "tuple"].includes(type)) {
        // Ensure nested types define a nested "schema"
        if (!schema) {
          throw new SchemaValidationError(
            `${modelName} Model schema attribute "${attrName}" is of type ` +
              `"${type}", but does not specify a nested "schema".`
          );
        }
        // Ensure nested "schema" type matches the "map"/"array" type
        if (
          (type === "map" && !isType.map(schema)) ||
          (type === "array" && !isType.array(schema)) ||
          (type === "tuple" && !isType.array(schema))
        ) {
          throw new SchemaValidationError(
            `${modelName} Model schema attribute "${attrName}" is of type "${type}", ` +
              `but its nested "schema" is not an ${type === "map" ? "object" : "array"}.`
          );
        }
      }

      // Ensure "enum" types define a "oneOf" array with at least 1 element
      if (type === "enum" && (!Array.isArray(oneOf) || oneOf.length === 0)) {
        throw new SchemaValidationError(
          `${modelName} Model schema attribute "${attrName}" is of type "${type}", ` +
            `but does not specify a valid "oneOf" array.`
        );
      }

      // If "default" is specified and it's not a function, ensure its type matches the attr's defined "type"
      if (
        !!defaultValue &&
        typeof defaultValue !== "function" &&
        !isType[type](defaultValue, oneOf)
      ) {
        throw new SchemaValidationError(
          `${modelName} Model schema attribute "${attrName}" specifies a "default" ` +
            `which does not match the attribute's "type" (${type}).`
        );
      }

      return accum;
    },
    { attributesToAliasesMap: {}, aliasesToAttributesMap: {} }
  );

  return {
    attributesToAliasesMap,
    aliasesToAttributesMap,
  };
};
