import type {
  ModelSchemaType,
  ModelSchemaOptions,
  ModelSchemaNestedAttributes,
  SchemaEntries,
} from "./schemaTypes";

/**
 * Labels indicating the direction data is flowing - either to or from the database.
 */
export type IODirection = "toDB" | "fromDB";

/**
 * The context object passed to IO hook actions.
 */
interface BaseIOActionContext {
  /** The calling Model's name. */
  modelName: string;
  /** The calling Model's schema options. */
  schemaOptions: ModelSchemaOptions;
  /** `"toDB"` or `"fromDB"` */
  ioDirection: IODirection;
  /** Map of attribute names to their respective aliases (or name if none). */
  attributesToAliasesMap: Record<string, string>;
  /** Map of attribute aliases to their respective attribute names. */
  aliasesToAttributesMap: Record<string, string>;
  /** The parent item to which an attribute belongs. */
  parentItem?: Record<string, unknown>;
}
export interface IOActionContext extends BaseIOActionContext {
  schema: ModelSchemaType;
  /** Ordered array of schema entries. See {@link SchemaEntries}. */
  schemaEntries: SchemaEntries;
}
export interface RecursiveIOActionContext extends BaseIOActionContext {
  schema: ModelSchemaNestedAttributes;
}

export type IOHookActionMethod = (
  item: Record<string, unknown>,
  context: IOActionContext
) => Record<string, unknown>;

export type RecursiveIOActionMethod = (
  ioAction: IOHookActionMethod,
  itemValue: Required<unknown>,
  ctx: RecursiveIOActionContext
) => Required<unknown>;
