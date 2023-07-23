import merge from "lodash.merge";
import { hasKey } from "@utils/typeSafety";
import { ioHookActions } from "./ioHookActions";
import { DdbSingleTableError, ItemInputError } from "./utils";
import { validateModelSchema } from "./validateModelSchema";
import type { PartialDeep } from "type-fest";
import type { DdbSingleTableClient } from "./DdbSingleTableClient";
import type { ItemConditionals } from "./generateKeyConditionExpression";
import type {
  // Model schema types:
  ModelSchemaType,
  ModelSchemaOptions,
  SchemaEntries,
  // IO-Action types:
  IODirection,
  IOActionSetFn,
  IOActionContext,
  IOBehavioralOpts,
  // Item types:
  ItemInputType,
  ItemOutputType,
  DynamoDbItemType,
  AliasedItemPrimaryKeys,
  // DdbST types:
  DdbTableIndexes,
  // Util types:
  MaybePartialItem,
  OneOrMoreMaybePartialItems,
  AscertainTypeFromOneOrMoreMaybePartialItems,
  PartialItemIfProjectionExpression,
  // Client-method parameter types:
  GetItemOpts,
  BatchGetItemsOpts,
  CreateItemOpts,
  UpsertItemOpts,
  BatchUpsertItemsOpts,
  UpdateItemOpts,
  DeleteItemOpts,
  BatchDeleteItemsOpts,
  BatchUpsertAndDeleteItemsOpts,
  QueryOpts,
  ScanOpts,
} from "./types";

/**
 * Each Model instance is provided with a set of CRUD methods featuring parameter
 * and return types which reflect the Model's schema. Model instance methods wrap
 * a corresponding method of the DdbSingleTableClient instance with sets of
 * "{@link IOActionSetFn|IO Hook Actions}" which use the Model's schema to provide
 * functionality related to database-IO like alias mapping, value validation, etc.
 *
 * There are two sets of IO-Actions, grouped by data flow directionality:
 * 1. **`toDB`**: IO-Actions executed on objects being _sent to_ the database.
 *    - Only used for _write_ operations.
 * 2. **`fromDB`**: IO-Actions executed on objects being _returned from_ the database.
 *    - Used for both _read_ AND _write_ operations which return 1+ items.
 *
 * The IO-Actions undertaken for each set are listed below in order of execution. Note
 * that some IO-Actions are skipped by certain methods, depending on the method's purpose.
 * For example, objects provided to `Model.updateItem` are not subjected to `"required"`
 * checks, since the method is intended to update individual properties of existing items.
 * _See **{@link ioHookActions}** for more info an any of the IO-Actions listed below._
 *
 * **`toDB`**:
 * 1. **`Alias Mapping`** — Replaces "alias" keys with attribute names.
 * 2. **`Set Defaults`** — Applies defaults defined in the schema.
 * 3. **`Attribute toDB Modifiers`** — Runs your `transformValue.toDB` fns.
 * 4. **`Item toDB Modifier`** — Runs your `transformItem.toDB` fn.
 * 5. **`Type Checking`** — Checks properties for conformance with their `"type"`.
 * 6. **`Attribute Validation`** — Validates individual item properties.
 * 7. **`Item Validation`** — Validates an item in its entirety.
 * 8. **`Convert JS Types`** — Converts JS types into DynamoDB types.
 * 9. **`"Required" Checks`** — Checks for the existence of `"required"` attributes.
 *
 * **`fromDB`**:
 * 1. **`Convert JS Types`** — Converts DynamoDB types into JS types.
 * 2. **`Attribute fromDB Modifiers`** — Runs your `transformValue.fromDB` fns.
 * 3. **`Item fromDB Modifier`** — Runs your `transformItem.fromDB` fn.
 * 4. **`Alias Mapping`** — Replaces attribute names with "alias" keys.
 *
 * #### Ordering of Attributes
 * Both `toDB` and `fromDB` IO-Actions which process individual attributes always
 * process attributes in the same order:
 *   1. The table hash key is always processed first.
 *   2. The table sort key is always processed second.
 *   3. Any index PKs are processed after the table SK.
 *   4. All other attributes are then processed in the order they are defined in the schema.
 *
 * Aside from ensuring predictable execution, this consistency also opens up design
 * opportunities for your various schema. For example, if you have a schema which uses a
 * function to dynamically generate a default value for an `id` attribute which is used as
 * the table hash key, other non-key attributes may be defined using the item's generated
 * `id` value.
 *
 * @class
 * @template Schema - The Model's schema type.
 * @template ItemOutput - The type of items returned by the Model's methods.
 * @template ItemInput - The type of items accepted by the Model's methods.
 * @template AliasedKeyArgs - The type of PK args for methods like `getItem`.
 * @param {string} modelName - The name of the Model.
 * @param {Schema} modelSchema - The Model's schema.
 * @param {ModelSchemaOptions} [modelSchemaOptions] - Options for the Model's schema.
 */
export class Model<
  Schema extends ModelSchemaType,
  ItemOutput extends Record<string, any> = ItemOutputType<Schema>,
  ItemInput extends Record<string, any> = ItemInputType<Schema>,
  AliasedKeyArgs extends AliasedItemPrimaryKeys<Schema> = AliasedItemPrimaryKeys<Schema>
> {
  // STATIC PROPERTIES & METHODS

  private static readonly DEFAULT_MODEL_SCHEMA_OPTS: ModelSchemaOptions = {
    allowUnknownAttributes: false,
    autoAddCreatedAt: { enabled: true, attrName: "createdAt" },
  };

  // INSTANCE PROPERTIES

  readonly modelName: string;
  readonly schema: Schema;
  readonly schemaEntries: SchemaEntries;
  readonly schemaOptions: ModelSchemaOptions;
  readonly attributesToAliasesMap: Record<string, string>;
  readonly aliasesToAttributesMap: Record<string, string>;
  readonly tableHashKey: string;
  readonly tableRangeKey: string;
  readonly indexes: DdbTableIndexes;
  readonly ddbClient: DdbSingleTableClient;

  constructor(
    modelName: string,
    modelSchema: Schema,
    /** {@link ModelSchemaOptions} and table+index properties from a `DdbSingleTable` instance */
    {
      tableHashKey,
      tableRangeKey,
      indexes,
      ddbClient,
      ...modelSchemaOptions
    }: ModelSchemaOptions & {
      tableHashKey: string;
      tableRangeKey: string;
      indexes: DdbTableIndexes;
      ddbClient: DdbSingleTableClient;
    }
  ) {
    // Validate the Model schema and obtain the Model's alias maps
    const { attributesToAliasesMap, aliasesToAttributesMap } = validateModelSchema({
      modelName,
      modelSchema,
    });

    this.modelName = modelName;
    this.schema = modelSchema;
    this.schemaOptions = merge(Model.DEFAULT_MODEL_SCHEMA_OPTS, modelSchemaOptions);
    this.attributesToAliasesMap = attributesToAliasesMap;
    this.aliasesToAttributesMap = aliasesToAttributesMap;
    this.tableHashKey = tableHashKey;
    this.tableRangeKey = tableRangeKey;
    this.indexes = indexes;
    this.ddbClient = ddbClient;

    // Cache sorted schema entries for IOHookActions
    this.schemaEntries = Object.entries(modelSchema).sort(([attrNameA], [attrNameB]) => {
      return attrNameA === tableHashKey // Sort tableHashKey to the front
        ? -1
        : attrNameB === tableHashKey
        ? 1
        : attrNameA === tableRangeKey // tableRangeKey goes after tableHashKey
        ? -1
        : attrNameB === tableRangeKey
        ? 1
        : attrNameA in indexes // index PKs, if any, go after tableRangeKey
        ? -1
        : attrNameB in indexes
        ? 1
        : 0; // For all other attributes the order is unchanged
    });
  }

  // INSTANCE METHODS: wrapped DdbSingleTableClient methods

  readonly getItem = async <CmdArgs extends GetItemOpts | undefined>(
    primaryKeys: AliasedKeyArgs,
    getItemOpts?: CmdArgs
  ) => {
    const toDBpks = this.processKeyArgs(primaryKeys);
    const item = await this.ddbClient.getItem(toDBpks, getItemOpts);
    if (item) {
      return this.processItemData.fromDB(item) as PartialItemIfProjectionExpression<
        CmdArgs,
        ItemOutput
      >;
    }
  };

  readonly batchGetItems = async (
    primaryKeys: Array<AliasedKeyArgs>,
    batchGetItemsOpts?: BatchGetItemsOpts
  ) => {
    const toDBpks = primaryKeys.map((pks) => this.processKeyArgs(pks));
    const items = await this.ddbClient.batchGetItems(toDBpks, batchGetItemsOpts);
    return this.processItemData.fromDB(items ?? []) as Array<ItemOutput>;
  };

  readonly createItem = async (item: ItemInput, createItemOpts?: CreateItemOpts) => {
    // Get "createdAt" auto-add options from schemaOptions
    const { enabled = true, attrName = "createdAt" } = this.schemaOptions.autoAddCreatedAt || {};
    // Add "createdAt" timestamp if not disabled
    const toDBitem = this.processItemData.toDB({
      ...(enabled && { [attrName]: new Date() }),
      ...item,
    });
    await this.ddbClient.createItem(toDBitem, createItemOpts);
    /* ddbClient.createItem uses PutItem, the ReturnValues of which can only be
    "NONE" or "ALL_OLD", so the above `ddbClient` call will never return anything,
    which is why the `toDBitem` is passed into `processItemData.fromDB`. */
    return this.processItemData.fromDB(toDBitem) as ItemOutput;
  };

  readonly upsertItem = async (
    item: MaybePartialItem<ItemInput>,
    upsertItemOpts?: UpsertItemOpts
  ) => {
    const toDBitem = this.processItemData.toDB(item);
    const itemAttributes = await this.ddbClient.upsertItem(toDBitem, upsertItemOpts);
    // Upon Item creation, `itemAttributes` would be undefined, hence the below merge logic
    return this.processItemData.fromDB(merge(toDBitem, itemAttributes ?? {})) as ItemOutput;
  };

  readonly batchUpsertItems = async (
    items: Array<MaybePartialItem<ItemInput>>,
    batchUpsertItemsOpts?: BatchUpsertItemsOpts
  ) => {
    const toDBitems = this.processItemData.toDB(items);
    await this.ddbClient.batchUpsertItems(toDBitems, batchUpsertItemsOpts);
    return this.processItemData.fromDB(items ?? []) as Array<ItemOutput>;
  };

  readonly updateItem = async (
    primaryKeys: AliasedKeyArgs,
    attributesToUpdate: PartialDeep<ItemInput>,
    updateItemOpts?: UpdateItemOpts
  ) => {
    const toDBpks = this.processKeyArgs(primaryKeys);
    const toDBitem = this.processItemData.toDB(attributesToUpdate as Partial<ItemInput>, {
      shouldSetDefaults: false,
      shouldTransformItem: false,
      shouldCheckRequired: false,
    });
    const itemAttributes = await this.ddbClient.updateItem(toDBpks, toDBitem, updateItemOpts);
    if (!itemAttributes) throw new DdbSingleTableError("Failed to update item.");
    return this.processItemData.fromDB(itemAttributes) as ItemOutput;
  };

  readonly deleteItem = async (primaryKeys: AliasedKeyArgs, deleteItemOpts?: DeleteItemOpts) => {
    const toDBpks = this.processKeyArgs(primaryKeys);
    const itemAttributes = await this.ddbClient.deleteItem(toDBpks, deleteItemOpts);
    if (!itemAttributes) throw new DdbSingleTableError("Failed to delete item.");
    return this.processItemData.fromDB(itemAttributes) as ItemOutput;
  };

  readonly batchDeleteItems = async (
    primaryKeys: Array<AliasedKeyArgs>,
    batchDeleteItemsOpts?: BatchDeleteItemsOpts
  ) => {
    const toDBpks = primaryKeys.map((pks) => this.processKeyArgs(pks));
    await this.ddbClient.batchDeleteItems(toDBpks, batchDeleteItemsOpts);
    return primaryKeys;
  };

  readonly batchUpsertAndDeleteItems = async (
    {
      upsertItems,
      deleteItems,
    }: {
      upsertItems: Array<MaybePartialItem<ItemInput>>;
      deleteItems: Array<AliasedKeyArgs>;
    },
    batchUpsertAndDeleteItemsOpts?: BatchUpsertAndDeleteItemsOpts
  ) => {
    const itemsToDB = {
      upsertItems: this.processItemData.toDB(upsertItems),
      deleteItems: deleteItems.map((pks) => this.processKeyArgs(pks)),
    };

    await this.ddbClient.batchUpsertAndDeleteItems(itemsToDB, batchUpsertAndDeleteItemsOpts);

    // BatchWrite does not return items, so the input params are formatted for return.
    return {
      upsertItems: this.processItemData.fromDB(itemsToDB.upsertItems ?? []) as Array<ItemOutput>,
      deleteItems,
    };
  };

  // IDEA - Restrict QueryOpts.IndexName to only be a valid index name for the table.
  readonly query = async <CmdArgs extends QueryOpts | undefined>({
    where,
    ...otherQueryOpts
  }: QueryOpts<ItemInput>) => {
    // If Where-API object is provided, unalias the keys
    where &&= ioHookActions.aliasMapping(where, {
      ioDirection: "toDB",
      modelName: this.modelName,
      schema: this.schema,
      schemaEntries: this.schemaEntries,
      schemaOptions: this.schemaOptions,
      attributesToAliasesMap: this.attributesToAliasesMap,
      aliasesToAttributesMap: this.aliasesToAttributesMap,
    }) as ItemConditionals<ItemInput>;
    // Run the query
    const items = await this.ddbClient.query({ where, ...otherQueryOpts });
    // If `items` is undefined, return an empty array instead of undefined
    return this.processItemData.fromDB(items ?? []) as Array<
      PartialItemIfProjectionExpression<CmdArgs, ItemOutput>
    >;
  };

  // IDEA - Restrict ScanOpts.IndexName to only be a valid index name for the table.
  readonly scan = async <CmdArgs extends ScanOpts | undefined>(scanOpts?: CmdArgs) => {
    const items = await this.ddbClient.scan(scanOpts);
    // If `items` is undefined, return an empty array instead of undefined
    return this.processItemData.fromDB(items ?? []) as Array<
      PartialItemIfProjectionExpression<CmdArgs, ItemOutput>
    >;
  };

  // INSTANCE METHOD UTILS:

  /**
   * Item-transforming action sets grouped by data flow directionality.
   *
   * | `Method` | Description                                                     | Read/Write Usage                   |
   * | :------- | :-------------------------------------------------------------: | :--------------------------------: |
   * | `toDB`   | Actions executed on objects being _sent to_ the database.       | Only used for _writes_             |
   * | `fromDB` | Actions executed on objects being _returned from_ the database. | Used for both _reads_ AND _writes_ |
   */
  readonly processItemData = {
    toDB: <ItemArgs extends OneOrMoreMaybePartialItems<ItemInput>>(
      itemInput: ItemArgs,
      { shouldSetDefaults = true, shouldTransformItem = true, shouldCheckRequired = true } = {}
    ) => {
      return this.applyActionSetToItemData(itemInput, "toDB", {
        shouldSetDefaults,
        shouldTransformItem,
        shouldCheckRequired,
      }) as unknown as AscertainTypeFromOneOrMoreMaybePartialItems<
        ItemArgs,
        ItemInput,
        DynamoDbItemType<Schema>
      >;
    },

    fromDB: <ItemArgs extends OneOrMoreMaybePartialItems<DynamoDbItemType<Schema>>>(
      itemOutput: ItemArgs | Record<string, any> | Array<Record<string, any>>,
      { shouldTransformItem = true } = {}
    ) => {
      return this.applyActionSetToItemData(itemOutput as ItemArgs, "fromDB", {
        shouldTransformItem,
      }) as unknown as AscertainTypeFromOneOrMoreMaybePartialItems<
        ItemArgs,
        DynamoDbItemType<Schema>,
        ItemOutput
      >;
    },
  };

  /**
   * This method obtains and calls IO-hook actions for a given action set, and
   * handles type coercion.
   */
  private readonly applyActionSetToItemData = <
    ItemArgs extends OneOrMoreMaybePartialItems<Record<string, unknown>>,
    Directionality extends IODirection
  >(
    itemData: ItemArgs,
    ioDirection: Directionality,
    { shouldSetDefaults = true, shouldTransformItem = true, shouldCheckRequired = true } = {}
  ) => {
    // Get list of ioActions to apply to item/items
    const ioActions = this.getActionsSet[ioDirection](
      {
        ioDirection,
        modelName: this.modelName,
        schema: this.schema,
        schemaEntries: this.schemaEntries,
        schemaOptions: this.schemaOptions,
        attributesToAliasesMap: this.attributesToAliasesMap,
        aliasesToAttributesMap: this.aliasesToAttributesMap,
      },
      { shouldSetDefaults, shouldTransformItem, shouldCheckRequired }
    );

    // Define fn for applying ioActions to item/items
    const itemDataReducer: Parameters<typeof ioActions.reduce<ItemArgs>>[0] = !Array.isArray(
      itemData
    )
      ? (itemAccum: ItemArgs, ioAction) => {
          return ioAction(itemAccum as Record<string, unknown>) as ItemArgs;
        }
      : (batchItemsAccum: ItemArgs, ioAction) => {
          return (batchItemsAccum as Array<{}>).map((item) => ioAction(item)) as ItemArgs;
        };

    return ioActions.reduce(itemDataReducer, itemData);
  };

  // DATABASE I/O HOOK ACTION SETS:

  private readonly getActionsSet: Record<
    IODirection,
    (ioContext: IOActionContext, opts?: IOBehavioralOpts) => Array<IOActionSetFn>
  > = {
    toDB: (
      ioContext,
      { shouldSetDefaults = true, shouldTransformItem = true, shouldCheckRequired = true } = {}
    ) => {
      return [
        // Alias Mapping
        (item) => ioHookActions.aliasMapping(item, ioContext),
        // Apply Defaults
        ...(shouldSetDefaults
          ? ([(item) => ioHookActions.setDefaults(item, ioContext)] satisfies [IOActionSetFn])
          : []),
        // Attribute-level transformValue.toDB
        (item) => ioHookActions.transformValues(item, ioContext),
        // Schema-level transformItem.toDB
        ...(shouldTransformItem
          ? ([(item) => ioHookActions.transformItem(item, ioContext)] satisfies [IOActionSetFn])
          : []),
        // Type Checking
        (item) => ioHookActions.typeChecking(item, ioContext),
        // Attribute-level Validation
        (item) => ioHookActions.validate(item, ioContext),
        // Item-level Validation
        (item) => ioHookActions.validateItem(item, ioContext),
        // Convert JS Types
        (item) => ioHookActions.convertJsTypes(item, ioContext),
        // Check Required
        ...(shouldCheckRequired
          ? ([(item) => ioHookActions.checkRequired(item, ioContext)] satisfies [IOActionSetFn])
          : []),
      ];
    },
    fromDB: (ioContext, { shouldTransformItem = true } = {}) => [
      // Convert JS Types
      (item) => ioHookActions.convertJsTypes(item, ioContext),
      // Attribute-level transformValue.fromDB
      (item) => ioHookActions.transformValues(item, ioContext),
      // Schema-level transformItem.fromDB
      ...(shouldTransformItem
        ? ([(item) => ioHookActions.transformItem(item, ioContext)] satisfies [IOActionSetFn])
        : []),
      // Alias Mapping
      (item) => ioHookActions.aliasMapping(item, ioContext),
    ],
  };

  /**
   * This internal Model method takes key-args from public methods like `Model.getItem`,
   * unaliases the keys, and applies defaults to the key-args if necessary, thereby
   * allowing the calling method to only require the _necessary_ keys. For example, if
   * the `sk` value is derived using a `default` function that returns a string using the
   * `pk` value, then the caller only needs to provide the `pk`.
   */
  private readonly processKeyArgs = (primaryKeyArgs: Record<string, unknown>) => {
    // Unalias primaryKeyArgs and apply defaults
    return [this.tableHashKey, this.tableRangeKey].reduce(
      (args, keyAttrName) => {
        // See if args contains keyAttrName
        if (!Object.prototype.hasOwnProperty.call(args, keyAttrName)) {
          // See if keyAttrName has an alias
          const keyAlias = this.attributesToAliasesMap?.[keyAttrName];
          if (keyAlias && hasKey(args, keyAlias)) {
            // If args contains keyAttrName's alias, unalias it.
            args[keyAttrName] = args[keyAlias];
            delete args[keyAlias];
          } else if (hasKey(this.schema[keyAttrName], "default")) {
            /* At this point, we know args contains neither keyAttrName nor its alias. As
            a fallback, keyAttrName's `default` is used if one is defined in the schema. */
            const attrDefault = this.schema[keyAttrName].default;
            args[keyAttrName] = typeof attrDefault === "function" ? attrDefault(args) : attrDefault;
          } else {
            // If there's no key value, and there's no default, throw an error.
            throw new ItemInputError(`Missing required key attribute "${keyAttrName}".`);
          }
        }
        return args;
      },
      { ...primaryKeyArgs }
    );
  };
}
