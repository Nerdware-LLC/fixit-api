import moment from "moment";
import { hasDefinedProperty, isType, ItemInputError } from "./utils";
import type { IOHookActionMethod, RecursiveIOActionMethod, ModelSchemaType } from "./types";

export const ioHookActions: Readonly<
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
> = Object.freeze({
  /**
   * Applies any given `ioAction` to nested attributes of type "map" or "array".
   */
  recursivelyApplyIOHookAction: function (ioAction, itemValue, { schema: nestedSchema, ...ctx }) {
    /* See if nested schema is an array or an object. Nested values can only be set if
    parent already exists, so itemValue is also checked (if !exists, do nothing).  */
    if (isType.array(nestedSchema) && isType.array(itemValue)) {
      /* If schema.length === 1, apply that config to all elements in the array.
      Note that since `IOHookActionMethod`s require `item` to be an object, array
      elements and their nested attrConfigs are given an arbitrary key of "_". */
      itemValue = itemValue.map(
        nestedSchema.length === 1
          ? (el) => ioAction({ _: el }, { schema: { _: nestedSchema[0] } as ModelSchemaType, ...ctx })._
          : (el, i) => ioAction({ _: el }, { schema: { _: nestedSchema[i] } as ModelSchemaType, ...ctx })._ // prettier-ignore
      );
    } else if (isType.map(nestedSchema) && isType.map(itemValue)) {
      itemValue = ioAction(itemValue, { schema: nestedSchema, ...ctx });
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
        schemaOptions.allowUnknownAttributes === true
      ) {
        // Else if itemKey is an attribute OR schema allows unknown attributes, simply add K-V as-is
        accum[itemKey] = value;
      } else {
        const keyTypeLabel = ioDirection === "toDB" ? "Attribute alias" : "Key";
        throw new ItemInputError(
          `${keyTypeLabel} "${itemKey}" does not exist on the "${modelName}" Model schema, which does not allow unknown properties.`
        );
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
  setDefaults: function (item, { schema, ...ctx }) {
    Object.entries(schema).forEach(([attrName, attrConfig]) => {
      // For each attrConfig, first see if a default is defined
      const attrDefault = attrConfig?.default;
      // If !!default, and item[attrName] is null/undefined, use the default
      if (!!attrDefault && !hasDefinedProperty(item, attrName)) {
        // Check if "default" is a function, and if so, call it to get the "default" value
        item[attrName] = typeof attrDefault === "function" ? attrDefault(item) : attrDefault;
      }
      // Run recursively on nested attributes if parent value exists
      if (attrConfig?.schema && hasDefinedProperty(item, attrName)) {
        item[attrName] = this.recursivelyApplyIOHookAction(this.setDefaults, item[attrName], {
          schema: attrConfig.schema,
          ...ctx,
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
  transformValues: function (item, { schema, ioDirection, ...ctx }) {
    Object.entries(schema).forEach(([attrName, attrConfig]) => {
      // See if a transformValue fn is defined
      const transformValue = attrConfig?.transformValue?.[ioDirection];
      // If schema has transformValue toDB/fromDB, pass the existing value into the fn
      if (typeof transformValue === "function") {
        // Get new value; any type mismatches are caught later by the `typeChecking` method
        const transformedValue = transformValue(item[attrName]);
        // If transformedValue is not undefined, add it to item
        if (transformedValue !== undefined) item[attrName] = transformedValue;
      }
      // Run recursively on nested attributes if parent value exists
      if (attrConfig?.schema && hasDefinedProperty(item, attrName)) {
        item[attrName] = this.recursivelyApplyIOHookAction(this.transformValues, item[attrName], {
          schema: attrConfig.schema,
          ioDirection,
          ...ctx,
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
  typeChecking: function (item, { schema, modelName, ioDirection, ...ctx }) {
    Object.entries(schema).forEach(([attrName, attrConfig]) => {
      /* If item has schemaKey and the value is truthy */
      if (hasDefinedProperty(item, attrName)) {
        // Check the type of its value (can't check unknown attributes if schema allows for them)
        if (!isType[attrConfig.type](item[attrName], attrConfig?.oneOf ?? [])) {
          // String to identify the attribute in the err msg
          const propertyIdentifierStr = attrConfig?.alias
            ? `"${attrConfig.alias}" (alias of "${attrName}")`
            : `"${attrName}"`;
          throw new ItemInputError(
            `"${modelName}" Model property ${propertyIdentifierStr} must be a valid "${attrConfig.type}" type.`
          );
        }
        // Run recursively on nested attributes
        if (attrConfig?.schema) {
          this.recursivelyApplyIOHookAction(this.typeChecking, item[attrName], {
            schema: attrConfig.schema,
            modelName,
            ioDirection,
            ...ctx,
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
  validate: function (item, { schema, modelName, ...ctx }) {
    Object.entries(schema).forEach(([attrName, attrConfig]) => {
      /* Check if item has schemaKey and value is neither null/undefined
      (can't validate unknown attributes if schema allows for them).  */
      if (hasDefinedProperty(item, attrName)) {
        // Run "validate" if fn exists, throw error if validation fails.
        if (!!attrConfig?.validate && !attrConfig.validate(item[attrName])) {
          // String to identify the attribute in the err msg
          const propertyIdentifierStr = attrConfig?.alias
            ? `"${attrConfig.alias}" (alias of "${attrName}")`
            : `"${attrName}"`;
          throw new ItemInputError(
            `Input validation failed for "${modelName}" Model property ${propertyIdentifierStr}.`
          );
        }
        // Run recursively on nested attributes
        if (attrConfig?.schema) {
          this.recursivelyApplyIOHookAction(this.validate, item[attrName], {
            schema: attrConfig.schema,
            modelName,
            ...ctx,
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
      throw new ItemInputError(`Input validation failed for Item of Model "${modelName}".`);
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
  convertJsTypes: function (item, { schema, ioDirection, ...ctx }) {
    Object.entries(schema).forEach(([attrName, attrConfig]) => {
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
            schema: attrConfig.schema,
            ioDirection,
            ...ctx,
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
  checkRequired: function (item, { schema, modelName, ioDirection, ...ctx }) {
    Object.entries(schema).forEach(([attrName, attrConfig]) => {
      // Check if item is missing a required field
      if (attrConfig?.required === true && !hasDefinedProperty(item, attrName)) {
        // String to identify the attribute in the err msg
        const propertyIdentifierStr = attrConfig?.alias
          ? `"${attrConfig.alias}" (alias of "${attrName}")`
          : `"${attrName}"`;
        throw new ItemInputError(
          `A value is required for property ${propertyIdentifierStr} on the "${modelName}" Model.`
        );
      }
      // Run recursively on nested attributes if parent exists
      if (attrConfig?.schema && hasDefinedProperty(item, attrName)) {
        this.recursivelyApplyIOHookAction(this.checkRequired, item[attrName], {
          modelName,
          ioDirection,
          schema: attrConfig.schema,
          ...ctx,
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
