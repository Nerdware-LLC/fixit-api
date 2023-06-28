import type {
  ModelSchemaType,
  ModelSchemaOptions,
  ModelSchemaNestedAttributes,
} from "./schemaTypes";

export type IODirection = "toDB" | "fromDB";

interface BaseIOActionContext {
  modelName: string;
  schemaOptions: ModelSchemaOptions;
  ioDirection: IODirection; // previously "actionSet"
  attributesToAliasesMap: Record<string, string>;
  aliasesToAttributesMap: Record<string, string>;
}
export interface IOActionContext extends BaseIOActionContext {
  schema: ModelSchemaType;
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
