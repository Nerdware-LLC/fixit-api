import moment from "moment";
import { ItemInputError } from "./customErrors";
import type { DDBSingleTableClient } from "./DDBSingleTableClient";
import type {
  ModelSchemaType,
  ModelSchemaOptions,
  AliasedModelSchemaType,
  ItemTypeFromSchema,
  AliasedItemTypeFromSchema,
  ItemPrimaryKeys,
  ItemNonKeyAttributes,
  ItemOrPartialItemTypes,
  ItemReturnTypes
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
 * 8. **"Required" Checks** — For Model.createItem and Model.upsertItem, items are
 *    checked for attributes configured with `required: true`. Any missing required values
 *    will result in an error.
 *
 * `fromDB`:
 *
 * 1. **Alias Mapping** — Any item keys matching attribute names which are configured
 *    with an "alias" in the Model schema are replaced by the value of their alias.
 *
 * 2. **Attribute-level `fromDB` Modifiers** — Any attributes configured with a
 *    `transformValue.fromDB` method will have that method called with the property's
 *    existing value.
 *
 * 3. **Schema-level `fromDB` Modifiers** — If a `transformItem.fromDB` method is
 *    provided with the Model's schema options, that method is called with the value
 *    of the entire existing item.
 */
export class Model<Schema extends ModelSchemaType> {
  // STATIC PROPERTIES
  private static readonly DEFAULT_MODEL_SCHEMA_OPTS: ModelSchemaOptions = {
    allowUnknownAttributes: false
  };

  // INSTANCE PROPERTIES
  modelName: string;
  schema: Schema;
  schemaOptions: ModelSchemaOptions;
  aliasedSchema: AliasedModelSchemaType<Schema>;
  ddbClient: DDBSingleTableClient;

  constructor(
    modelName: string,
    modelSchema: Schema,
    modelSchemaOptions: ModelSchemaOptions,
    ddbClient: DDBSingleTableClient
  ) {
    this.modelName = modelName;
    this.ddbClient = ddbClient;

    /* TODO Validate schema:
      - Ensure modelSchema has the same table-key configs as TableKeysSchema
      - Ensure no duplicate "alias" values exist                          */
    this.schema = modelSchema;
    this.schemaOptions = {
      ...Model.DEFAULT_MODEL_SCHEMA_OPTS,
      ...modelSchemaOptions
    };

    // prettier-ignore
    this.aliasedSchema = Object.entries(modelSchema).reduce((accum, [attrName, attrConfig]) => ({
      ...accum,
      [attrConfig?.alias ?? attrName]: attrConfig
    }), {} as AliasedModelSchemaType<Schema>);
  }

  // INSTANCE METHODS: wrapped DDBSingleTableClient methods

  readonly getItem = async (
    primaryKeys: ItemPrimaryKeys<Schema>,
    getItemOpts: Parameters<typeof this.ddbClient.getItem>[1]
  ) => {
    const item = await this.ddbClient.getItem<Schema>(primaryKeys, getItemOpts);
    return this.processItemData.fromDB(item);
  };

  readonly batchGetItems = async (
    primaryKeys: Array<ItemPrimaryKeys<Schema>>,
    batchGetItemsOpts: Parameters<typeof this.ddbClient.batchGetItems>[1]
  ) => {
    const items = await this.ddbClient.batchGetItems<Schema>(primaryKeys, batchGetItemsOpts);
    return this.processItemData.fromDB(items);
  };

  // prettier-ignore
  readonly createItem = async (
    item: AliasedItemTypeFromSchema<Schema>,
    createItemOpts: Parameters<typeof this.ddbClient.createItem>[1]
  ) => {
    // TODO Ignored build error: "TS2589: Type instantiation is excessively deep and possibly infinite."
    // @ts-ignore
    const toDBitem = this.processItemData.toDB(item, { shouldCheckRequired: true }) as ItemTypeFromSchema<Schema>;
    await this.ddbClient.createItem<Schema>(toDBitem, createItemOpts);
    /* PutItem ReturnValues can only be NONE or ALL_OLD, so the DDB API will never
    return anything from createItem, so simply pass toDBitem into fromDB.       */
    return this.processItemData.fromDB(toDBitem);
  };

  // prettier-ignore
  readonly upsertItem = async (
    item: Partial<AliasedItemTypeFromSchema<Schema>>,
    upsertItemOpts: Parameters<typeof this.ddbClient.upsertItem>[1]
  ) => {
    // TODO Ignored build error: "TS2589: Type instantiation is excessively deep and possibly infinite."
    // @ts-ignore
    const toDBitem = this.processItemData.toDB(item, { shouldCheckRequired: true }) as Partial<ItemTypeFromSchema<Schema>>;
    const itemAttributes = await this.ddbClient.upsertItem<Schema>(toDBitem, upsertItemOpts);
    return this.processItemData.fromDB(itemAttributes);
  };

  readonly batchUpsertItems = async (
    items: Array<Partial<AliasedItemTypeFromSchema<Schema>>>,
    batchUpsertItemsOpts: Parameters<typeof this.ddbClient.batchUpsertItems>[1]
  ) => {
    // prettier-ignore
    const toDBitems = this.processItemData.toDB(items, { shouldCheckRequired: true }) as Array<Partial<ItemTypeFromSchema<Schema>>>;
    await this.ddbClient.batchUpsertItems<Schema>(toDBitems, batchUpsertItemsOpts);
    return this.processItemData.fromDB(items);
  };

  readonly updateItem = async (
    primaryKeys: ItemPrimaryKeys<Schema>,
    attributesToUpdate: Partial<AliasedItemTypeFromSchema<Schema>>,
    updateItemOpts: Parameters<typeof this.ddbClient.updateItem>[1]
  ) => {
    // prettier-ignore
    const toDBitem = this.processItemData.toDB(attributesToUpdate) as Partial<ItemNonKeyAttributes<Schema>>;
    const itemAttributes = await this.ddbClient.updateItem<Schema>(
      primaryKeys,
      toDBitem,
      updateItemOpts
    );
    return this.processItemData.fromDB(itemAttributes);
  };

  readonly deleteItem = async (
    primaryKeys: ItemPrimaryKeys<Schema>,
    deleteItemOpts: Parameters<typeof this.ddbClient.deleteItem>[1]
  ) => {
    const itemAttributes = await this.ddbClient.deleteItem<Schema>(primaryKeys, deleteItemOpts);
    return this.processItemData.fromDB(itemAttributes);
  };

  readonly batchDeleteItems = async (
    primaryKeys: Array<ItemPrimaryKeys<Schema>>,
    batchDeleteItemsOpts: Parameters<typeof this.ddbClient.batchDeleteItems>[1]
  ) => {
    // prettier-ignore
    await this.ddbClient.batchDeleteItems<Schema>(primaryKeys, batchDeleteItemsOpts);
    return primaryKeys;
  };

  readonly batchUpsertAndDeleteItems = async (
    {
      upsertItems,
      deleteItems
    }: {
      upsertItems: Array<Partial<AliasedItemTypeFromSchema<Schema>>>;
      deleteItems: Array<ItemPrimaryKeys<Schema>>;
    },
    batchUpsertAndDeleteItemsOpts: Parameters<typeof this.ddbClient.batchUpsertAndDeleteItems>[1]
  ) => {
    // prettier-ignore
    const itemsToDB = {
      upsertItems: this.processItemData.toDB(upsertItems, { shouldCheckRequired: true }) as Array<Partial<ItemTypeFromSchema<Schema>>>,
      deleteItems
    }
    await this.ddbClient.batchUpsertAndDeleteItems<Schema>(
      itemsToDB,
      batchUpsertAndDeleteItemsOpts
    );
    /* PutItem ReturnValues can only be NONE or ALL_OLD, so the DDB API will never
    return anything from createItem, so simply pass toDBitem into fromDB.       */
    return {
      upsertItems: this.processItemData.fromDB(itemsToDB.upsertItems),
      deleteItems
    };
  };

  readonly query = async (queryOpts: Parameters<typeof this.ddbClient.query>[0]) => {
    const items = await this.ddbClient.query(queryOpts);
    return this.processItemData.fromDB(items as Array<Partial<ItemTypeFromSchema<Schema>>>);
  };

  readonly scan = async (scanOpts: Parameters<typeof this.ddbClient.scan>[0]) => {
    const items = await this.ddbClient.scan(scanOpts);
    return this.processItemData.fromDB(items as Array<Partial<ItemTypeFromSchema<Schema>>>);
  };

  // PRIVATE INSTANCE METHODS: instance method utilities

  private readonly processItemData = {
    toDB: (
      itemInput: ItemOrPartialItemTypes<Schema> | Array<ItemOrPartialItemTypes<Schema>>,
      { shouldCheckRequired }: { shouldCheckRequired?: boolean } = {}
    ) => {
      return this.applyActionSetToItemData("toDB", itemInput, shouldCheckRequired ?? false);
    },
    fromDB: (
      itemOutput?: ItemOrPartialItemTypes<Schema> | Array<ItemOrPartialItemTypes<Schema>>
    ) => {
      return itemOutput && this.applyActionSetToItemData("fromDB", itemOutput);
    }
  };

  private readonly applyActionSetToItemData = (
    actionSet: "toDB" | "fromDB",
    itemData: ItemOrPartialItemTypes<Schema> | Array<ItemOrPartialItemTypes<Schema>>,
    shouldCheckRequired: boolean = false
  ): ItemReturnTypes<Schema, typeof itemData> => {
    let schemaAdherentItemData;

    if (!Array.isArray(itemData)) {
      const ioActions = this.getActionsSet[actionSet](shouldCheckRequired);

      schemaAdherentItemData = ioActions.reduce((itemAccum, ioAction) => {
        return ioAction(itemAccum as ItemOrPartialItemTypes<Schema>);
      }, itemData as ItemReturnTypes<Schema, typeof itemData>);
      //
    } else {
      const ioActions = this.getActionsSet[actionSet](shouldCheckRequired);
      // For batch items, wrap ioActions in array.map
      schemaAdherentItemData = ioActions.reduce((batchItemsAccum, ioAction) => {
        return batchItemsAccum.map((item) => {
          return ioAction(item as ItemOrPartialItemTypes<Schema>);
        });
      }, itemData as ItemReturnTypes<Schema, typeof itemData>);
    }

    return schemaAdherentItemData;
  };

  // DATABASE ITEM I/O ACTION SETS:

  // prettier-ignore
  private readonly getActionsSet = {
    toDB: (shouldCheckRequired: boolean = false) => [
      // Alias Mapping
      (item: ItemOrPartialItemTypes<Schema>) => this.aliasMapping(item, this.aliasedSchema, "attributeName", "Attribute alias"),
      // Set Defaults
      (item: ItemOrPartialItemTypes<Schema>) => this.setDefaults(item),
      // Attribute-level transformValue.toDB
      (item: ItemOrPartialItemTypes<Schema>) => this.transformValue(item, this.schema, "toDB"),
      // Schema-level transformItem.toDB
      (item: ItemOrPartialItemTypes<Schema>) => this.transformItem(item, "toDB"),
      // Type Checking
      (item: ItemOrPartialItemTypes<Schema>) => this.typeChecking(item),
      // Attribute-level Validation
      (item: ItemOrPartialItemTypes<Schema>) => this.validate(item),
      // Schema-level Validation
      (item: ItemOrPartialItemTypes<Schema>) => this.validateItem(item),
      // Check Required (only createItem, upsertItem, and batchUpsertItems set this to true)
      ...(shouldCheckRequired ? [(item: ItemOrPartialItemTypes<Schema>) => this.checkRequired(item)] : [])
    ],
    fromDB: () => [
      // Alias Mapping
      (item: ItemOrPartialItemTypes<Schema>) => this.aliasMapping(item, this.schema, "alias", "Key"),
      // Attribute-level transformValue.fromDB
      (item: ItemOrPartialItemTypes<Schema>) => this.transformValue(item, this.aliasedSchema, "fromDB"),
      // Schema-level transformItem.fromDB
      (item: ItemOrPartialItemTypes<Schema>) => this.transformItem(item, "fromDB"),
    ]
  };

  // DATABASE ITEM I/O ACTIONS:

  private readonly aliasMapping = (
    item: ItemOrPartialItemTypes<Schema>,
    schema: Schema | AliasedModelSchemaType<Schema>,
    lookupKey: "alias" | "attributeName",
    invalidKeyErrMsgPrefix: "Attribute alias" | "Key"
  ) => {
    // TODO Add recursive functionality for nested schema
    return Object.entries(item).reduce((accum, [key, value]) => {
      if (key in schema) {
        // Identify the attribute's config in the schema/aliasedSchema
        const attributeConfig = schema[key as keyof typeof schema];
        // Get the mapped key ("alias" is optional in schema, hence the fallback to key)
        const mappedKey = attributeConfig?.[lookupKey as keyof typeof attributeConfig] ?? key;
        // Update the item with the mapped key
        accum = { ...accum, [mappedKey as keyof ItemReturnTypes<Schema, typeof item>]: value };
      } else if (this.schemaOptions.allowUnknownAttributes === true) {
        // If schema allows unknown attributes, simply add it to accum
        accum = { ...accum, [key]: value };
      } else {
        throw new ItemInputError(
          `${invalidKeyErrMsgPrefix} "${key}" does not exist on the "${this.modelName}" Model schema, which is explicitly configured to disallow unknown properties.`
        );
      }

      return accum;
    }, {} as ItemReturnTypes<Schema, typeof item>);
  };

  private readonly setDefaults = (item: ItemOrPartialItemTypes<Schema>) => {
    // TODO Add recursive functionality for nested schema
    Object.entries(this.schema).forEach(([schemaKey, attrConfig]) => {
      if (
        // if attribute has a default value, use it if the key is missing or falsey.
        (!Object.prototype.hasOwnProperty.call(item, schemaKey) || !item?.[schemaKey]) &&
        !!attrConfig?.default
      ) {
        item[schemaKey as keyof typeof item] = attrConfig.default;
      }
    });

    return item as ItemReturnTypes<Schema, typeof item>;
  };

  private readonly transformValue = (
    item: ItemOrPartialItemTypes<Schema>,
    schema: Schema | AliasedModelSchemaType<Schema>,
    actionSet: "toDB" | "fromDB"
  ) => {
    // TODO Add recursive functionality for nested schema
    Object.entries(schema).forEach(([schemaKey, attrConfig]) => {
      // if schema has transformValue toDB/fromDB, pass the existing value into the fn
      if (attrConfig?.transformValue?.[actionSet]) {
        // prettier-ignore
        const { [actionSet]: transformValue } = attrConfig.transformValue as Required<typeof attrConfig.transformValue>;
        item[schemaKey as keyof typeof item] = transformValue(item[schemaKey]);
      }
    });

    return item as ItemReturnTypes<Schema, typeof item>;
  };

  private readonly transformItem = (
    item: ItemOrPartialItemTypes<Schema>,
    actionSet: "toDB" | "fromDB"
  ) => {
    // if schemaOptions has transformItem toDB/fromDB, pass the existing item into the fn
    if (this.schemaOptions?.transformItem?.[actionSet]) {
      // prettier-ignore
      const { [actionSet]: transformItem } = this.schemaOptions.transformItem as Required<typeof this.schemaOptions.transformItem>;
      item = transformItem(item);
    }

    return item as ItemReturnTypes<Schema, typeof item>;
  };

  private readonly typeChecking = (item: ItemOrPartialItemTypes<Schema>) => {
    // TODO Add recursive functionality for nested schema
    Object.entries(this.schema).forEach(([schemaKey, attrConfig]) => {
      // If item has schemaKey, check the type of its value (can't check unknown attributes if schema allows for them)
      if (schemaKey in item && !Model.TYPE_CHECK_FNS[attrConfig.type](item[schemaKey])) {
        // Format error message and throw
        const inputKeyName = attrConfig?.alias ?? schemaKey;
        const aliasOf = !!attrConfig?.alias ? `(alias of "${attrConfig?.alias}") ` : "";
        throw new ItemInputError(
          `"${this.modelName}" Model property "${inputKeyName}" ${aliasOf}must be a valid "${attrConfig.type}" type.`
        );
      }
    });

    return item as ItemReturnTypes<Schema, typeof item>;
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

  private readonly validate = (item: ItemOrPartialItemTypes<Schema>) => {
    // TODO Add recursive functionality for nested schema
    Object.entries(this.schema).forEach(([schemaKey, attrConfig]) => {
      // Check if item has schemaKey (can't validate unknown attributes if schema allows for them).
      if (schemaKey in item) {
        // Run "validate" if fn exists, throw error if validation fails.
        if (!!attrConfig?.validate && !attrConfig.validate(item[schemaKey])) {
          const inputKeyName = attrConfig?.alias ?? schemaKey;
          const aliasOf = !!attrConfig?.alias ? `(alias of "${attrConfig?.alias}") ` : "";
          throw new ItemInputError(
            `Input validation failed for "${this.modelName}" Model property "${inputKeyName}" ${aliasOf}.`
          );
        }
      }
    });

    return item as ItemReturnTypes<Schema, typeof item>;
  };

  private readonly validateItem = (item: ItemOrPartialItemTypes<Schema>) => {
    // if schemaOptions has transformItem toDB/fromDB, pass the existing item into the fn
    if (this.schemaOptions?.validateItem && !this.schemaOptions?.validateItem(item)) {
      throw new ItemInputError(`Input validation failed for Item of Model "${this.modelName}".`);
    }

    return item as ItemReturnTypes<Schema, typeof item>;
  };

  private readonly checkRequired = (item: ItemOrPartialItemTypes<Schema>) => {
    // Note: checkRequired is only to be used for createItem, upsertItem. and batchUpsertItems.

    // TODO Add recursive functionality for nested schema
    Object.entries(this.schema).forEach(([schemaKey, attrConfig]) => {
      // Check if item has schemaKey (can't check unknown attributes if schema allows for them).
      if (!(schemaKey in item) && attrConfig?.required === true) {
        const inputKeyName = attrConfig?.alias ?? schemaKey;
        const aliasOf = !!attrConfig?.alias ? `(alias of "${attrConfig?.alias}") ` : "";
        throw new ItemInputError(
          `A value is required for property "${inputKeyName}" ${aliasOf}on the "${this.modelName}" Model.`
        );
      }
    });

    return item as ItemReturnTypes<Schema, typeof item>;
  };
}
