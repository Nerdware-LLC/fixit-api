import type { GraphQLFormattedError } from "graphql";
import type { Merge, Except } from "type-fest";
import type {
  GraphQlErrorCode,
  GraphQlErrorCustomExtensions,
  GraphQlErrorCustomHttpExtension,
} from "./__codegen__/graphql.js";

export * from "./__codegen__/graphql.js";

/* For some reason, the gql codegen package is converting "GraphQL" into "GraphQl"
in the generated types. These exports ensure the correct names are available, and
__typename is also removed. */
export type GraphQLErrorCode = GraphQlErrorCode;
export type GraphQLErrorCustomExtensions = Except<GraphQlErrorCustomExtensions, "__typename">;
export type GraphQLErrorCustomHttpExtension = Except<GraphQlErrorCustomHttpExtension, "__typename">;

/** Alias of {@link GraphQLErrorCustomExtensions}. */
export type GraphQLErrorExtensions = GraphQLErrorCustomExtensions;

/** A {@link GraphQLFormattedError} with the app's {@link GraphQLErrorCustomExtensions}. */
export type GraphQLFormattedErrorWithExtensions = Merge<
  GraphQLFormattedError,
  { extensions: GraphQLErrorCustomExtensions }
>;
