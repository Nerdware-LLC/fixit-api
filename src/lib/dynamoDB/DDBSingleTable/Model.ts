import moment from "moment";
import { DDBSingleTableError, SchemaValidationError, ItemInputError } from "./customErrors";
import type { DDBSingleTable as DDBSingleTableClass } from "./DDBSingleTable";
import type { DDBSingleTableClient } from "./DDBSingleTableClient";
import type {
  // Model schema types:
  ModelSchemaType,
  AliasedModelSchemaType,
  ModelSchemaOptions,
  // Item types:
  ItemTypeFromSchema, //              base item generic type
  AliasedItemTypeFromSchema, //       base aliased item generic type
  AnySingleItemType, //               union of all single item types
  AnyBatchItemsType, //               union of all item-array types
  AnyItemOrBatchItemsType, //         union of all item/item-array types
  // Item attribute types:
  ItemPrimaryKeys,
  ItemNonKeyAttributes,
  // Item attribute alias mapping types:
  ReturnFromItemAliasing,
  AliasMappingItemKey,
  AliasMappingItemValue,
  ReturnFromIOHookActionsSet
} from "./types";

/**
 * Each Model instance is provided with a set of CRUD methods featuring parameter
 * and return types which reflect the Model's schema. Model instance methods wrap
 * a corresponding method of the DDBSingleTableClient instance with sets of actions
 * which use the Model's schema to provide functionality related to database-IO like
 * alias mapping, value validation, etc.
 *
 * There are two sets of actions, grouped by data flow directionality:
 * 1. `toDB`: Actions executed on objects being _sent to_ the database.
 *    - Only used for _write_ operations.
 * 2. `fromDB`: Actions executed on objects being _returned from_ the database.
 *    - Used for both _read_ AND _write_ operations which return 1+ items.
 *
 * The actions undertaken for each set are listed below in execution order:
 *
 * `toDB`:
 *
 * 1. **Alias Mapping** — Any item keys matching attribute "alias" values are replaced
 *    by their respective attribute names.
 *
 * 2. **Set Defaults** — Any attribute properties which have a "default" value in the
 *    Model schema and which are not defined on the item object (as determined by
 *    `hasOwnProperty`) are set to their default value.
 *
 * 3. **Attribute-level `toDB` Modifiers** — Any attributes configured with a
 *    `transformValue.toDB` method will have that method called with the property's
 *    existing value.
 *
 * 4. **Schema-level `toDB` Modifiers** — If a `transformItem.toDB` method is
 *    provided with the Model's schema options, that method is called with the value
 *    of the entire existing item.
 *
 * 5. **Type Checking** — Attribute values are checked for conformance with their "type".
 *
 * 6. **Attribute-level Validation** — Attribute values are passed into their "validate"
 *    functions if one was provided in the schema.
 *
 * 7. **Schema-level Validation** — If the Model's schema options include a `validateItem`
 *    function, the entire item will be passed into it for validation.
 *
 * 8. **Convert JS Types** — Date objects are converted into Unix timestamps, and NodeJS
 *    Buffers are converted into binary.
 *
 * 9. **"Required" Checks** — For Model.createItem and Model.upsertItem, items are
 *    checked for attributes configured with `required: true`. Any missing required values
 *    will result in an error.
 *
 * `fromDB`:
 *
 * 1. **Alias Mapping** — Any item keys matching attribute names which are configured
 *    with an "alias" in the Model schema are replaced by the value of their alias.
 *
 * 2. **Convert JS Types** — Unix timestamps are converted to Date objects, and binary
 *    values are converted to NodeJS Buffers.
 *
 * 3. **Attribute-level `fromDB` Modifiers** — Any attributes configured with a
 *    `transformValue.fromDB` method will have that method called with the property's
 *    existing value.
 *
 * 4. **Schema-level `fromDB` Modifiers** — If a `transformItem.fromDB` method is
 *    provided with the Model's schema options, that method is called with the value
 *    of the entire existing item.
 */
export class Model<
  Schema extends ModelSchemaType,
  AliasedSchema extends AliasedModelSchemaType<Schema> = AliasedModelSchemaType<Schema>,
  ItemType extends ItemTypeFromSchema<Schema> = ItemTypeFromSchema<Schema>,
  AliasedItem extends AliasedItemTypeFromSchema<Schema> = AliasedItemTypeFromSchema<Schema>,
  PrimaryKeyAttributes extends ItemPrimaryKeys<Schema> = ItemPrimaryKeys<Schema>,
  PrimaryKeyAliases extends ItemPrimaryKeys<AliasedSchema> = ItemPrimaryKeys<AliasedSchema>
> {
  // STATIC PROPERTIES
  private static readonly DEFAULT_MODEL_SCHEMA_OPTS: ModelSchemaOptions = {
    allowUnknownAttributes: false
  };

  // INSTANCE PROPERTIES
  modelName: string;
  schema: Schema;
  schemaOptions: ModelSchemaOptions;
  aliasedSchema: AliasedSchema;
  ddbClient: DDBSingleTableClient;

  constructor(
    ddbSingleTable: InstanceType<typeof DDBSingleTableClass>,
    modelName: string,
    modelSchema: Schema,
    modelSchemaOptions: ModelSchemaOptions
  ) {
    // Ensure all table keys are present in the schema and that "type" is the same if provided.
    Object.keys(ddbSingleTable.tableKeysSchema).forEach((tableKey) => {
      if (!(tableKey in modelSchema)) {
        throw new SchemaValidationError(
          `"${modelName}" Model schema does not contain key attribute "${tableKey}".`
        );
      }

      // Ensure the Model schema doesn't specify an invalid "type" in key configs.
      if (
        Object.prototype.hasOwnProperty.call(modelSchema[tableKey], "type") &&
        modelSchema[tableKey].type !== ddbSingleTable.tableKeysSchema[tableKey].type
      ) {
        throw new SchemaValidationError(
          `"${modelName}" Model schema defines a different "type" for "${tableKey}" than is specified in the Table Keys Schema.`
        );
      }
    });

    this.ddbClient = ddbSingleTable.ddbClient;
    this.modelName = modelName;
    this.schema = modelSchema;
    this.schemaOptions = {
      ...Model.DEFAULT_MODEL_SCHEMA_OPTS,
      ...modelSchemaOptions
    };

    /*   Validate Model schema:
      1. Ensure all keys are present in the schema (completed by DDBSingleTable.model method)
      2. Ensure all "alias" values are unique
      3. Ensure "default" values comply with "type" */
    this.aliasedSchema = Object.entries(modelSchema).reduce((accum, [attrName, attrConfig]) => {
      // If "alias" isn't assigned, use the Schema key.
      const alias: keyof AliasedSchema = attrConfig?.alias ?? (attrName as keyof AliasedSchema);

      // If alias already exists in accum, there's a dupe alias in the schema, throw error.
      if (alias in accum) {
        throw new SchemaValidationError(
          // prettier-ignore
          `"${modelName}" Model schema contains duplicate alias "${alias as string}"; all alias values must be unique within the schema.`
        );
      }

      // If a "default" is provided, ensure its type matches that defined by "type"
      if (attrConfig?.default && !Model.TYPE_CHECK_FNS[attrConfig.type](attrConfig.default)) {
        throw new ItemInputError(
          `"${this.modelName}" Model property "${attrName}" must be a valid "${attrConfig.type}" type.`
        );
      }

      accum[alias] = attrConfig as AliasedSchema[keyof AliasedSchema];

      return accum;
    }, {} as AliasedSchema);
  }

  // INSTANCE METHODS: wrapped DDBSingleTableClient methods

  readonly getItem = async (
    primaryKeys: PrimaryKeyAliases,
    getItemOpts?: Parameters<typeof this.ddbClient.getItem>[1]
  ) => {
    const toDBpks = this.aliasMapping(primaryKeys, this.aliasedSchema) as PrimaryKeyAttributes;
    const item = await this.ddbClient.getItem<Schema>(toDBpks, getItemOpts);
    return this.processItemData.fromDB(item);
  };

  readonly batchGetItems = async (
    primaryKeys: Array<PrimaryKeyAliases>,
    batchGetItemsOpts?: Parameters<typeof this.ddbClient.batchGetItems>[1]
  ) => {
    // prettier-ignore
    const toDBpks = primaryKeys.map((pks) => this.aliasMapping(pks, this.aliasedSchema)) as Array<PrimaryKeyAttributes>;
    const items = await this.ddbClient.batchGetItems<Schema>(toDBpks, batchGetItemsOpts);
    return this.processItemData.fromDB(items);
  };

  // prettier-ignore
  readonly createItem = async (
    item: AliasedItem,
    createItemOpts?: Parameters<typeof this.ddbClient.createItem>[1]
  ) => {
    // TODO Ignored build error: "TS2589: Type instantiation is excessively deep and possibly infinite."
    const toDBitem = this.processItemData.toDB(item, { shouldCheckRequired: true }) as ItemType;
    await this.ddbClient.createItem<Schema>(toDBitem, createItemOpts);
    /* PutItem ReturnValues can only be NONE or ALL_OLD, so the DDB API will never
    return anything from createItem, so simply pass toDBitem into fromDB.       */
    return this.processItemData.fromDB(toDBitem);
  };

  // prettier-ignore
  readonly upsertItem = async (
    item: Partial<AliasedItem>,
    upsertItemOpts?: Parameters<typeof this.ddbClient.upsertItem>[1]
  ) => {
    const toDBitem = this.processItemData.toDB(item, { shouldCheckRequired: true }) as Partial<ItemType>;
    const itemAttributes = await this.ddbClient.upsertItem<Schema>(toDBitem, upsertItemOpts);
    return this.processItemData.fromDB(itemAttributes);
  };

  readonly batchUpsertItems = async (
    items: Array<Partial<AliasedItem>>,
    batchUpsertItemsOpts?: Parameters<typeof this.ddbClient.batchUpsertItems>[1]
  ) => {
    // prettier-ignore
    const toDBitems = this.processItemData.toDB(items, { shouldCheckRequired: true }) as Array<Partial<ItemType>>;
    await this.ddbClient.batchUpsertItems<Schema>(toDBitems, batchUpsertItemsOpts);
    return this.processItemData.fromDB(items);
  };

  // prettier-ignore
  readonly updateItem = async (
    primaryKeys: PrimaryKeyAliases,
    attributesToUpdate: Partial<AliasedItem>,
    updateItemOpts?: Parameters<typeof this.ddbClient.updateItem>[1]
  ) => {
    const toDBpks = this.aliasMapping(primaryKeys, this.aliasedSchema) as PrimaryKeyAttributes;
    const toDBitem = this.processItemData.toDB(attributesToUpdate) as Partial<ItemNonKeyAttributes<Schema>>;
    const itemAttributes = await this.ddbClient.updateItem<Schema>(toDBpks, toDBitem, updateItemOpts);
    return this.processItemData.fromDB(itemAttributes);
  };

  readonly deleteItem = async (
    primaryKeys: PrimaryKeyAliases,
    deleteItemOpts?: Parameters<typeof this.ddbClient.deleteItem>[1]
  ) => {
    const toDBpks = this.aliasMapping(primaryKeys, this.aliasedSchema) as PrimaryKeyAttributes;
    const itemAttributes = await this.ddbClient.deleteItem<Schema>(toDBpks, deleteItemOpts);
    return this.processItemData.fromDB(itemAttributes);
  };

  readonly batchDeleteItems = async (
    primaryKeys: Array<PrimaryKeyAliases>,
    batchDeleteItemsOpts?: Parameters<typeof this.ddbClient.batchDeleteItems>[1]
  ) => {
    // prettier-ignore
    const toDBpks = primaryKeys.map((pks) => this.aliasMapping(pks, this.aliasedSchema)) as Array<PrimaryKeyAttributes>;
    await this.ddbClient.batchDeleteItems<Schema>(toDBpks, batchDeleteItemsOpts);
    return primaryKeys;
  };

  readonly batchUpsertAndDeleteItems = async (
    {
      upsertItems,
      deleteItems
    }: {
      upsertItems: Array<Partial<AliasedItem>>;
      deleteItems: Array<PrimaryKeyAliases>;
    },
    batchUpsertAndDeleteItemsOpts?: Parameters<typeof this.ddbClient.batchUpsertAndDeleteItems>[1]
  ) => {
    // prettier-ignore
    const itemsToDB = {
      upsertItems: this.processItemData.toDB(upsertItems, { shouldCheckRequired: true }) as Array<Partial<ItemType>>,
      deleteItems: deleteItems.map((pks) => this.aliasMapping(pks, this.aliasedSchema)) as Array<PrimaryKeyAttributes>
    };
    await this.ddbClient.batchUpsertAndDeleteItems<Schema>(
      itemsToDB,
      batchUpsertAndDeleteItemsOpts
    );
    // BatchWrite does not return items, so the input params are formatted for return.
    return {
      upsertItems: this.processItemData.fromDB(itemsToDB.upsertItems),
      deleteItems
    };
  };

  readonly query = async ({
    KeyConditionExpression,
    ...otherQueryOpts
  }: Parameters<typeof this.ddbClient.query>[0]) => {
    // Replace any aliases in KeyConditionExpression with their attribute names.
    if (KeyConditionExpression && typeof KeyConditionExpression === "string") {
      KeyConditionExpression = Object.entries(this.aliasedSchema).reduce(
        (unaliasedKeyExpr, [alias, attrConfig]) => {
          // Create regex from alias, replace alias with attributeName from aliasedSchema.
          const aliasRegex = new RegExp(`(?<![:a-zA-Z])${alias}\\b`, "g");

          unaliasedKeyExpr = unaliasedKeyExpr.replace(
            aliasRegex,
            (attrConfig as { attributeName: string }).attributeName
          );

          return unaliasedKeyExpr;
        },
        KeyConditionExpression
      );
    }

    const items = await this.ddbClient.query({ KeyConditionExpression, ...otherQueryOpts });
    return this.processItemData.fromDB(items as Array<Partial<ItemTypeFromSchema<Schema>>>);
  };

  readonly scan = async (scanOpts: Parameters<typeof this.ddbClient.scan>[0] = {}) => {
    const items = await this.ddbClient.scan(scanOpts);
    return this.processItemData.fromDB(items as Array<Partial<ItemTypeFromSchema<Schema>>>);
  };

  // OTHER PUBLIC INSTANCE METHODS

  readonly addModelMethod = (methodName: string, methodFn: (...args: any[]) => any) => {
    // Ensure 'methodName' is not already present, throw error if so.
    if (Object.prototype.hasOwnProperty.call(this, methodName)) {
      throw new DDBSingleTableError(
        `Failed to add method "${methodName}" to "${this.modelName}" Model; a method with that name already exists.`
      );
    }

    Object.defineProperty(this, methodName, {
      value: methodFn.bind(methodFn),
      writable: false,
      enumerable: false,
      configurable: false
    });
  };

  // PRIVATE INSTANCE METHODS: instance method utilities

  private readonly processItemData = {
    toDB: (
      itemInput: AnyItemOrBatchItemsType<Schema>,
      { shouldCheckRequired }: { shouldCheckRequired?: boolean } = {}
    ) => {
      return this.applyActionSetToItemData("toDB", itemInput, shouldCheckRequired ?? false);
    },
    fromDB: (itemOutput?: AnyItemOrBatchItemsType<Schema>) => {
      return itemOutput && this.applyActionSetToItemData("fromDB", itemOutput);
    }
  };

  private readonly applyActionSetToItemData = (
    actionSet: "toDB" | "fromDB",
    itemData: AnyItemOrBatchItemsType<Schema>,
    shouldCheckRequired = false
  ) => {
    // Get list of ioActions to apply to item/items
    const ioActions = this.getActionsSet[actionSet](shouldCheckRequired);

    // Define fn for applying ioActions to item/items
    const itemDataReducer = !Array.isArray(itemData)
      ? (itemAccum: AnySingleItemType<Schema>, ioAction: typeof ioActions[number]) => {
          return ioAction(itemAccum as any);
        }
      : (batchItemsAccum: AnyBatchItemsType<Schema>, ioAction: typeof ioActions[number]) => {
          return batchItemsAccum.map((item) => ioAction(item as any));
        };

    // Ignored 'reduce not callable' parser flag; there's a known issue with calling reduce on an array of methods (link below).
    // https://github.com/microsoft/TypeScript/issues/36390#issuecomment-840082057
    // @ts-ignore
    // prettier-ignore
    return ioActions.reduce(itemDataReducer, itemData) as ReturnFromIOHookActionsSet<
      Schema,
      typeof itemData
    >;
  };

  // DATABASE I/O HOOK ACTION SETS:

  // prettier-ignore
  private readonly getActionsSet = {
    toDB: (shouldCheckRequired = false) => [
      // Alias Mapping
      (item: AliasedItem | Partial<AliasedItem>) => this.aliasMapping(item, this.aliasedSchema),
      // Set Defaults
      (item: ItemType | Partial<ItemType>) => this.setDefaults(item),
      // Attribute-level transformValue.toDB
      (item: ItemType | Partial<ItemType>) => this.transformValue(item, this.schema, "toDB"),
      // Schema-level transformItem.toDB
      (item: ItemType | Partial<ItemType>) => this.transformItem(item, "toDB"),
      // Type Checking
      (item: ItemType | Partial<ItemType>) => this.typeChecking(item),
      // Attribute-level Validation
      (item: ItemType | Partial<ItemType>) => this.validate(item),
      // Schema-level Validation
      (item: ItemType | Partial<ItemType>) => this.validateItem(item),
      // Convert JS Types
      (item: ItemType | Partial<ItemType>) => this.convertJsTypes(item, this.schema, "toDB"),
      // Check Required (only createItem, upsertItem, and batchUpsertItems set this to true)
      ...(shouldCheckRequired ? [(item: ItemType | Partial<ItemType>) => this.checkRequired(item)] : [])
    ],
    fromDB: () => [
      // Alias Mapping
      (item: ItemType | Partial<ItemType>) => this.aliasMapping(item, this.schema),
      // Convert JS Types
      (item: AliasedItem | Partial<AliasedItem>) => this.convertJsTypes(item, this.aliasedSchema, "fromDB"),
      // Attribute-level transformValue.fromDB
      (item: AliasedItem | Partial<AliasedItem>) => this.transformValue(item, this.aliasedSchema, "fromDB"),
      // Schema-level transformItem.fromDB
      (item: AliasedItem | Partial<AliasedItem>) => this.transformItem(item, "fromDB"),
    ]
  };

  // DATABASE I/O HOOK ACTIONS:

  // prettier-ignore
  private readonly aliasMapping = <Item extends AnySingleItemType<Schema> | PrimaryKeyAttributes | PrimaryKeyAliases>(
    item: Item,
    schema: Schema | AliasedSchema,
    lookupKey: "alias" | "attributeName" = schema === this.schema ? "alias" : "attributeName",
    invalidKeyErrMsgPrefix: "Attribute alias" | "Key" = schema === this.schema ? "Key" : "Attribute alias"
  ) => {
    // TODO Add recursive functionality for nested schema
    return Object.entries(item).reduce((accum, [key, value]) => {
      if (key in schema) {
        // Identify the attribute's config in the schema/aliasedSchema
        const attributeConfig = schema[key as keyof typeof schema];
        // Get the mapped key ("alias" is optional in schema, hence the fallback to key)
        const mappedKey = attributeConfig?.[lookupKey as keyof typeof attributeConfig] ?? key;
        // Update the item with the mapped key
        accum[mappedKey as AliasMappingItemKey<typeof schema, any>] = value as AliasMappingItemValue<typeof schema, any>;
      } else if (this.schemaOptions.allowUnknownAttributes === true) {
        // If schema allows unknown attributes, simply add it to accum
        accum[key as AliasMappingItemKey<typeof schema, any>] = value as AliasMappingItemValue<typeof schema, any>;
      } else {
        throw new ItemInputError(
          `${invalidKeyErrMsgPrefix} "${key}" does not exist on the "${this.modelName}" Model schema, which is explicitly configured to disallow unknown properties.`
        );
      }

      return accum;
    }, {} as ReturnFromItemAliasing<typeof schema, any>);
  };

  private readonly setDefaults = <Item extends ItemType | Partial<ItemType>>(item: Item) => {
    // TODO Add recursive functionality for nested schema
    Object.entries(this.schema).forEach(([schemaKey, attrConfig]) => {
      // if attribute has a default value, use it if the key is missing or the value is null/undefined.
      // prettier-ignore
      if (
          attrConfig?.default && (
            !Object.prototype.hasOwnProperty.call(item, schemaKey) ||
            [null, undefined].includes(item?.[schemaKey as keyof typeof item])
          )
        ) {
          // "default" values are validated upon Model init at runtime to ensure defaults comply with "type"
          item[schemaKey as keyof typeof item] = attrConfig.default as unknown as typeof item[keyof typeof item];
        }
    });

    return item;
  };

  private readonly transformValue = <Item extends AnySingleItemType<Schema>>(
    item: Item,
    schema: Schema | AliasedSchema,
    actionSet: "toDB" | "fromDB"
  ) => {
    // TODO Add recursive functionality for nested schema
    Object.entries(schema).forEach(([schemaKey, attrConfig]) => {
      // if schema has transformValue toDB/fromDB, pass the existing value into the fn
      if (typeof attrConfig?.transformValue?.[actionSet] === "function" && schemaKey in item) {
        const transformValue = attrConfig.transformValue[actionSet];
        /* Model "transformValue" fns are not validated, but type mismatches will be caught by the
        typeChecking action at runtime. Note: non-null assertion used to call transformValue below
        because the if-clause ensures that it's here, but the TS parser isn't inferring that it's
        not undefined.  */
        item[schemaKey as keyof typeof item] = transformValue!(
          item[schemaKey]
        ) as typeof item[keyof typeof item];
      }
    });

    return item;
  };

  private readonly transformItem = <Item extends AnySingleItemType<Schema>>(
    item: Item,
    actionSet: "toDB" | "fromDB"
  ) => {
    // if schemaOptions has transformItem toDB/fromDB, pass the existing item into the fn
    if (typeof this.schemaOptions?.transformItem?.[actionSet] === "function") {
      const transformItem = this.schemaOptions.transformItem[actionSet];
      /* Model "transformItem" fns are not validated, but type mismatches will be caught by the
      typeChecking action at runtime. Note: non-null assertion used to call transformItem below
      because the if-clause ensures that it's here, but the TS parser isn't inferring that it's
      not undefined.  */
      item = transformItem!(item) as typeof item;
    }

    return item;
  };

  private readonly typeChecking = <Item extends ItemType | Partial<ItemType>>(item: Item) => {
    // TODO Add recursive functionality for nested schema
    Object.entries(this.schema).forEach(([schemaKey, attrConfig]) => {
      // If item has schemaKey, check the type of its value (can't check unknown attributes if schema allows for them)
      if (schemaKey in item && !Model.TYPE_CHECK_FNS[attrConfig.type](item[schemaKey])) {
        // Format error message and throw
        const inputKeyName = attrConfig?.alias ?? schemaKey;
        const aliasOf = attrConfig?.alias ? `(alias of "${attrConfig?.alias}") ` : "";
        throw new ItemInputError(
          `"${this.modelName}" Model property "${inputKeyName}" ${aliasOf}must be a valid "${attrConfig.type}" type.`
        );
      }
    });

    return item;
  };

  // Static typeChecking() util:
  private static readonly TYPE_CHECK_FNS = {
    string: (input: unknown) => typeof input === "string",
    number: (input: unknown) => Number.isSafeInteger(input),
    boolean: (input: unknown) => typeof input === "boolean",
    Buffer: (input: unknown) => Buffer.isBuffer(input),
    Date: (input: unknown) => !!input && moment(input).isValid(),
    map: (input: unknown) => typeof input === "object" && !Array.isArray(input) && input !== null,
    array: (input: unknown) => Array.isArray(input)
  };

  private readonly convertJsTypes = <Item extends AnySingleItemType<Schema>>(
    item: Item,
    schema: Schema | AliasedSchema,
    actionSet: "toDB" | "fromDB"
  ) => {
    // TODO Add recursive functionality for nested schema

    Object.entries(item).forEach(([key, value]) => {
      if (key in schema) {
        const attrType = (
          schema[key as keyof typeof schema] as { type: Schema[keyof Schema]["type"] }
        ).type;

        let convertedValue;

        if (attrType === "Date") {
          // For "Date" attributes, convert Date objects to unix timestamps and vice versa.

          if (actionSet === "toDB" && (value as any) instanceof Date) {
            // toDB, convert Date objects to unix timestamps (Math.floor(new Date(value).getTime() / 1000))
            convertedValue = moment(value).unix();
          } else if (actionSet === "fromDB" && moment(value).isValid()) {
            // fromDB, convert unix timestamps to Date objects
            convertedValue = moment(value).toDate();
          }
        } else if (attrType === "Buffer") {
          // For "Buffer" attributes, convert Buffers to binary and vice versa.

          if (actionSet === "toDB" && Buffer.isBuffer(value)) {
            // toDB, convert Buffer objects to binary
            convertedValue = (value as Buffer).toString("binary");
          } else if (actionSet === "fromDB" && typeof value === "string") {
            // fromDB, convert binary to Buffer objects
            convertedValue = Buffer.from(value, "binary");
          }
        }

        // Update the value if necessary
        if (convertedValue) (item[key as keyof typeof item] as any) = convertedValue;
      }
    });

    return item;
  };

  private readonly validate = <Item extends ItemType | Partial<ItemType>>(item: Item) => {
    // TODO Add recursive functionality for nested schema
    Object.entries(this.schema).forEach(([schemaKey, attrConfig]) => {
      // Check if item has schemaKey (can't validate unknown attributes if schema allows for them).
      if (schemaKey in item) {
        // Run "validate" if fn exists, throw error if validation fails.
        if (!!attrConfig?.validate && !attrConfig.validate(item[schemaKey])) {
          const inputKeyName = attrConfig?.alias ?? schemaKey;
          const aliasOf = attrConfig?.alias ? `(alias of "${attrConfig?.alias}") ` : "";
          throw new ItemInputError(
            `Input validation failed for "${this.modelName}" Model property "${inputKeyName}" ${aliasOf}.`
          );
        }
      }
    });

    return item;
  };

  private readonly validateItem = <Item extends ItemType | Partial<ItemType>>(item: Item) => {
    // if schemaOptions has transformItem toDB/fromDB, pass the existing item into the fn
    if (this.schemaOptions?.validateItem && !this.schemaOptions?.validateItem(item)) {
      throw new ItemInputError(`Input validation failed for Item of Model "${this.modelName}".`);
    }

    return item;
  };

  private readonly checkRequired = <Item extends ItemType | Partial<ItemType>>(item: Item) => {
    // Note: checkRequired is only to be used for createItem, upsertItem. and batchUpsertItems.

    // TODO Add recursive functionality for nested schema
    Object.entries(this.schema).forEach(([schemaKey, attrConfig]) => {
      // Check if item has schemaKey (can't check unknown attributes if schema allows for them).
      if (!(schemaKey in item) && attrConfig?.required === true) {
        const inputKeyName = attrConfig?.alias ?? schemaKey;
        const aliasOf = attrConfig?.alias ? `(alias of "${attrConfig?.alias}") ` : "";
        throw new ItemInputError(
          `A value is required for property "${inputKeyName}" ${aliasOf}on the "${this.modelName}" Model.`
        );
      }
    });

    return item;
  };
}
