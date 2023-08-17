import dayjs from "dayjs";
import { hasKey, safeJsonStringify } from "@utils/typeSafety";
import {
  hasDefinedProperty,
  isType,
  ItemInputError,
  getAttrErrID,
  stringifyNestedSchema,
} from "./utils";
import type {
  IOHookActionMethod,
  RecursiveIOActionMethod,
  ModelSchemaType,
  SchemaEntries,
} from "./types";

/**
 * An object with various methods used to validate and transform items to/from the db.
 *
 * @type {IOHookActions}
 * @property {RecursiveIOActionMethod} recursivelyApplyIOHookAction - Applies any given `ioAction` to nested attributes of type "map" or "array".
 * @property {IOHookActionMethod} aliasMapping - Swaps attribute-names with their corresponding aliases.
 * @property {IOHookActionMethod} setDefaults - Applies attribute default values/functions when creating items.
 * @property {IOHookActionMethod} transformValues - Transforms attribute values using `transformValue` functions.
 * @property {IOHookActionMethod} transformItem - Transforms an entire item using the `transformItem` method.
 * @property {IOHookActionMethod} typeChecking - Checks item properties for conformance with their respective attribute "type".
 * @property {IOHookActionMethod} validate - Validates an item's individual properties using attribute's respective `"validate"` functions.
 * @property {IOHookActionMethod} validateItem - Validates an item in its entirety using the `validateItem` method.
 * @property {IOHookActionMethod} convertJsTypes - Converts JS types to DynamoDB types and vice versa.
 * @property {IOHookActionMethod} checkRequired - Checks an item for the existence of properties marked `required` in the schema.
 */
export const ioHookActions: IOHookActions = Object.freeze({
  /**
   * Applies any given `ioAction` to nested attributes of type "map" or "array".
   */
  recursivelyApplyIOHookAction: function (ioAction, itemValue, { schema: nestedSchema, ...ctx }) {
    /* See if nested schema is an array or an object. Nested values can only be set if
    parent already exists, so itemValue is also checked (if !exists, do nothing). Note
    that `ioAction` must be called using the `call` prototype method to ensure the fn
    doesn't lose its "this" context. */
    if (isType.array(nestedSchema) && isType.array(itemValue)) {
      /* For both ARRAYs and TUPLEs, since `IOHookActionMethod`s require `item` to
      be an object, array values and their respective nested schema are provided as
      the value to a wrapper object with an arbitrary key of "_".  */

      // Determine TUPLE or ARRAY
      // prettier-ignore
      if (nestedSchema.length > 1 && nestedSchema.length === itemValue.length) {
        // TUPLE
        itemValue = itemValue.map((tupleEl, index) =>
          ioAction.call(this, { _: tupleEl }, {
            schema: { _: nestedSchema[index] } as ModelSchemaType,
            schemaEntries: [["_", nestedSchema[index]]] as SchemaEntries,
            ...ctx,
          })._
        );
      } else {
        // ARRAY
        itemValue = itemValue.map((arrayEl) =>
          ioAction.call(this, { _: arrayEl }, {
            schema: { _: nestedSchema[0] } as ModelSchemaType,
            schemaEntries: [["_", nestedSchema[0]]] as SchemaEntries,
            ...ctx,
          })._
        );
      }
    } else if (isType.map(nestedSchema) && isType.map(itemValue)) {
      // MAP
      itemValue = ioAction.call(this, itemValue, {
        schema: nestedSchema,
        schemaEntries: Object.entries(nestedSchema),
        ...ctx,
      });
    }
    // Return itemValue with schema-defined updates, if any.
    return itemValue;
  },

  /**
   * This `IOHookActionMethod` swaps attribute-names with their corresponding
   * aliases:
   * - `toDB`: replaces "alias" keys with attribute names
   * - `fromDB`: replaces attribute names with "alias" keys
   */
  aliasMapping: function (item, { schema, schemaOptions, ioDirection, modelName, ...ctx }) {
    const aliasMap =
      ioDirection === "toDB" ? ctx.aliasesToAttributesMap : ctx.attributesToAliasesMap;

    return Object.entries(item).reduce((accum: Record<string, unknown>, [itemKey, value]) => {
      if (hasDefinedProperty(aliasMap, itemKey)) {
        // If itemKey is in the aliasMap, update the item with the mapped key
        accum[aliasMap[itemKey]] = value;
      } else if (
        hasDefinedProperty(schema, itemKey) ||
        schemaOptions.allowUnknownAttributes === true ||
        (Array.isArray(schemaOptions.allowUnknownAttributes) &&
          schemaOptions.allowUnknownAttributes.includes(itemKey))
      ) {
        // Else if itemKey is an attribute OR schema allows the unknown attribute, simply add K-V as-is
        accum[itemKey] = value;
      } else {
        throw new ItemInputError(`${modelName} item contains unknown property: "${itemKey}"`);
      }
      return accum;
    }, {});
  },

  /**
   * This `IOHookActionMethod` applies any `"default"`s defined in the schema in
   * the course of "create" operations. Attribute default values/functions are used
   * when the item either does not have the attribute (as determined by
   * `hasOwnProperty`), or the attribute value is `null` or `undefined`.
   *
   * > `UpdateItem` skips this action by default, since it is not a "create" operation.
   */
  setDefaults: function (item, { schemaEntries, parentItem = item, ...ctx }) {
    schemaEntries.forEach(([attrName, attrConfig]) => {
      // If a default is defined, and item[attrName] is null/undefined, use the default
      if (hasKey(attrConfig, "default") && !hasDefinedProperty(item, attrName)) {
        // hasKey/hasOwnProperty is used since default can be 0, false, etc.
        const attrDefault = attrConfig.default;
        // Check if "default" is a function, and if so, call it to get the "default" value
        item[attrName] = typeof attrDefault === "function" ? attrDefault(parentItem) : attrDefault;
      }
      // Run recursively on nested attributes if parent value exists
      if (attrConfig?.schema && hasDefinedProperty(item, attrName)) {
        item[attrName] = this.recursivelyApplyIOHookAction(this.setDefaults, item[attrName], {
          parentItem,
          ...ctx,
          schema: attrConfig.schema, // <-- overwrites ctx.schema with the nested schema
        });
      }
    });
    return item;
  },

  /**
   * This `IOHookActionMethod` uses `transformValue` functions (if defined) to
   * transform attribute values before they are validated, converted to DynamoDB
   * types, etc.
   */
  transformValues: function (item, { schemaEntries, ioDirection, ...ctx }) {
    schemaEntries.forEach(([attrName, attrConfig]) => {
      // See if a transformValue fn is defined
      const transformValue = attrConfig?.transformValue?.[ioDirection];
      // If schema has transformValue toDB/fromDB, pass the existing value into the fn
      if (hasKey(item, attrName) && typeof transformValue === "function") {
        // Get new value; any type mismatches are caught later by the `typeChecking` method
        const transformedValue = transformValue(item[attrName]);
        // If transformedValue is not undefined, add it to item
        if (transformedValue !== undefined) item[attrName] = transformedValue;
      }
      // Run recursively on nested attributes if parent value exists
      if (attrConfig?.schema && hasDefinedProperty(item, attrName)) {
        item[attrName] = this.recursivelyApplyIOHookAction(this.transformValues, item[attrName], {
          parentItem: item,
          ioDirection,
          ...ctx,
          schema: attrConfig.schema, // <-- overwrites ctx.schema with the nested schema
        });
      }
    });
    return item;
  },

  /**
   * This `IOHookActionMethod` uses the `transformItem` method (if defined in the
   * Model's schema options), to transform an entire item before it is sent to
   * the database. This is useful for potentially adding/removing/renaming item
   * properties, however **it may necessitate providing explicit Model type params
   * for `ItemOutput` and/or `ItemInput`, depending on the changes made.**
   */
  transformItem: function (item, { schemaOptions, ioDirection }) {
    // If schemaOptions has transformItem toDB/fromDB, pass the existing item into the fn
    const transformItem = schemaOptions?.transformItem?.[ioDirection];
    // If the new item has type mismatches, they're caught by the `typeChecking` method
    if (typeof transformItem === "function") item = transformItem(item);
    return item;
  },

  /**
   * This `IOHookActionMethod` checks item properties for conformance with their
   * respective attribute "type" as defined in the schema.
   */
  typeChecking: function (item, { schemaEntries, modelName, ioDirection, ...ctx }) {
    schemaEntries.forEach(([attrName, attrConfig]) => {
      /* If item has schemaKey and the value is truthy */
      if (hasDefinedProperty(item, attrName)) {
        // Check the type of its value (can't check unknown attributes if schema allows for them)
        if (
          !isType[attrConfig.type](item[attrName], attrConfig?.oneOf ?? attrConfig?.schema ?? [])
        ) {
          // Throw error if there's a type mismatch
          throw new ItemInputError(
            `Invalid type of value provided for ${getAttrErrID(modelName, attrName, attrConfig)}.` +
              `\nExpected: ${attrConfig.type} ` +
              (attrConfig.type === "enum"
                ? `(oneOf: ${JSON.stringify(attrConfig.oneOf)})`
                : ["map", "array", "tuple"].includes(attrConfig.type)
                ? `(schema: ${stringifyNestedSchema(attrConfig.schema as any)})`
                : "") +
              `\nReceived: ${safeJsonStringify(item[attrName])}`
          );
        }
        // Run recursively on nested attributes
        if (attrConfig?.schema) {
          this.recursivelyApplyIOHookAction(this.typeChecking, item[attrName], {
            parentItem: item,
            ioDirection,
            modelName,
            ...ctx,
            schema: attrConfig.schema, // <-- overwrites ctx.schema with the nested schema
          });
        }
      }
    });
    return item;
  },

  /**
   * This `IOHookActionMethod` validates an item's individual properties using
   * attribute's respective `"validate"` functions provided in the schema.
   */
  validate: function (item, { schemaEntries, modelName, ...ctx }) {
    schemaEntries.forEach(([attrName, attrConfig]) => {
      /* Check if item has schemaKey and value is neither null/undefined
      (can't validate unknown attributes if schema allows for them).  */
      if (hasDefinedProperty(item, attrName)) {
        // Run "validate" fn if defined in the schema
        if (!!attrConfig?.validate && !attrConfig.validate(item[attrName])) {
          // Throw error if validation fails
          throw new ItemInputError(
            `Invalid value for ${getAttrErrID(modelName, attrName, attrConfig)}.`
          );
        }
        // Run recursively on nested attributes
        if (attrConfig?.schema) {
          this.recursivelyApplyIOHookAction(this.validate, item[attrName], {
            parentItem: item,
            modelName,
            ...ctx,
            schema: attrConfig.schema, // <-- overwrites ctx.schema with the nested schema
          });
        }
      }
    });
    return item;
  },

  /**
   * This `IOHookActionMethod` uses the `validateItem` method provided in the
   * Model schema options to validate an item in its entirety.
   */
  validateItem: function (item, { schemaOptions, modelName }) {
    // if schemaOptions has transformItem toDB/fromDB, pass the existing item into the fn
    if (schemaOptions?.validateItem && !schemaOptions?.validateItem(item)) {
      throw new ItemInputError(`Invalid ${modelName} item.`);
    }
    return item;
  },

  /**
   * This `IOHookActionMethod` converts JS types to DynamoDB types and vice versa.
   *
   * - `"Date"` Attributes
   *   - `toDB`: JS Date objects are converted to unix timestamps
   *   - `fromDB`: Unix timestamps are converted to JS Date objects
   * - `"Buffer"` Attributes
   *   - `toDB`: NodeJS Buffers are converted to binary strings
   *   - `fromDB`: Binary data is converted into NodeJS Buffers
   */
  convertJsTypes: function (item, { schemaEntries, ioDirection, ...ctx }) {
    schemaEntries.forEach(([attrName, attrConfig]) => {
      if (hasDefinedProperty(item, attrName)) {
        const itemValue = item[attrName];
        const attrType = attrConfig.type;
        let convertedValue: unknown = undefined;

        if (attrType === "Date") {
          // For "Date" attributes, convert Date objects to unix timestamps and vice versa.
          if (ioDirection === "toDB" && isType.Date(itemValue)) {
            // toDB, convert Date objects to unix timestamps (Math.floor(new Date(value).getTime() / 1000))
            convertedValue = moment(itemValue).unix();
          } else if (
            ioDirection === "fromDB" &&
            isType.number(itemValue) &&
            moment(itemValue).isValid()
          ) {
            // fromDB, convert unix timestamps to Date objects
            convertedValue = new Date(itemValue * 1000);
          }
        } else if (attrType === "Buffer") {
          // For "Buffer" attributes, convert Buffers to binary and vice versa.
          if (ioDirection === "toDB" && isType.Buffer(itemValue)) {
            // toDB, convert Buffer objects to binary
            convertedValue = itemValue.toString("binary");
          } else if (ioDirection === "fromDB" && isType.string(itemValue)) {
            // fromDB, convert binary to Buffer objects
            convertedValue = Buffer.from(itemValue, "binary");
          }
        } else if ((attrType === "map" || attrType === "array") && attrConfig?.schema) {
          // Run recursively on nested attributes
          convertedValue = this.recursivelyApplyIOHookAction(this.convertJsTypes, itemValue, {
            parentItem: item,
            ioDirection,
            ...ctx,
            schema: attrConfig.schema, // <-- overwrites ctx.schema with the nested schema
          });
        }
        // Update the value if necessary
        if (convertedValue) item[attrName] = convertedValue;
      }
    });
    return item;
  },

  /**
   * This `IOHookActionMethod` checks an item for the existence of properties
   * marked `required` in the schema, and throws an error if a required property is
   * not present (as indicated by `hasOwnProperty`), or its value is `null` or
   * `undefined`. This check occurs by default for the following Model methods:
   *
   * - `createItem`
   * - `upsertItem`
   * - `batchUpsertItems`
   * - `batchUpsertAndDeleteItems` (only the `upsertItems` clause)
   */
  checkRequired: function (item, { schemaEntries, modelName, ioDirection, ...ctx }) {
    schemaEntries.forEach(([attrName, attrConfig]) => {
      // Check if item is missing a required field
      if (attrConfig?.required === true && !hasDefinedProperty(item, attrName)) {
        // Throw error if required field is missing
        throw new ItemInputError(
          `A value is required for ${getAttrErrID(modelName, attrName, attrConfig)}.`
        );
      }
      // Run recursively on nested attributes if parent exists
      if (attrConfig?.schema && hasDefinedProperty(item, attrName)) {
        this.recursivelyApplyIOHookAction(this.checkRequired, item[attrName], {
          parentItem: item,
          ioDirection,
          modelName,
          ...ctx,
          schema: attrConfig.schema, // <-- overwrites ctx.schema with the nested schema
        });
      }
    });
    return item;
  },
});

export type IOHookActions = Readonly<
  {
    recursivelyApplyIOHookAction: RecursiveIOActionMethod;
  } & Record<
    | "aliasMapping"
    | "setDefaults"
    | "transformValues"
    | "transformItem"
    | "typeChecking"
    | "validate"
    | "validateItem"
    | "convertJsTypes"
    | "checkRequired",
    IOHookActionMethod
  >
>;
