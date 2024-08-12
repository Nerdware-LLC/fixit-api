import { unwrapResolverError } from "@apollo/server/errors";
import { HTTP_ERROR_CONFIGS, type HttpError } from "@/utils/httpErrors.js";
import { logger } from "@/utils/logger.js";
import type { ApolloServerContext } from "@/apolloServer.js";
import type {
  GraphQLFormattedErrorWithExtensions,
  GraphQLErrorCustomExtensions as GqlErrorExtensions,
} from "@/types/graphql.js";
import type { ApolloServerOptions } from "@apollo/server";

/**
 * ### ApolloServer `formatError` function
 *
 * This function formats errors for GQL client responses.
 * The returned GraphQLFormattedError contains the following extensions:
 *
 * - `code` — GraphQLError code, e.g. `BAD_USER_INPUT`, the value for which is determined using the
 *   following order of precedence:
 *
 *   1. If the `gqlFormattedError` arg provided by Apollo contains a _truthy_ `extensions.code` value,
 *      it is retained (note: Apollo's typing implies `code` could be explicitly `undefined`).
 *   2. If the original error contains an {@link HttpError} `statusCode` property, `code` is set to
 *      the associated `extensions.code` value (e.g. `BAD_USER_INPUT` for 400).
 *   3. If no other `code` value is found, `code` is set to `INTERNAL_SERVER_ERROR`.
 *
 * - `http` — An object containing the following properties:
 *
 *   - `status` — The HTTP status code associated with the error, e.g. 400, 401, 500, etc.
 *     The value for this property is determined using the following order of precedence:
 *
 *     1. If the `gqlFormattedError` arg contains `extensions.http.status`, it is retained.
 *     2. If the original error contains a `status`, that value is used.
 *     3. If no other `statusCode` value is found, `statusCode` is set to 500.
 *
 * See https://www.apollographql.com/docs/apollo-server/data/errors/#for-client-responses
 */
export const formatApolloError: NonNullable<
  ApolloServerOptions<ApolloServerContext>["formatError"]
> = (
  gqlFormattedError,
  originalErrorOrWrappedError // Apollo wraps the originalError in a GraphQLError if thrown from a resolver
): GraphQLFormattedErrorWithExtensions => {
  // If the originalError is wrapped in a GraphQLError, unwrap it
  const originalError = unwrapResolverError(originalErrorOrWrappedError) ?? {};

  // See if the originalError has an HttpError `statusCode`, default to 500
  const { statusCode: httpErrorStatusCode = 500 } =
    originalError as { statusCode?: HttpError["statusCode"] }; // prettier-ignore

  // If the statusCode >= 500, log the error
  if (httpErrorStatusCode >= 500) {
    logger.error(
      { gqlFormattedError, originalErrorOrWrappedError },
      `[ApolloServer.formatError] INTERNAL SERVER ERROR`
    );
  }

  // Look up the error config for the statusCode
  const httpErrorGqlExtensions = HTTP_ERROR_CONFIGS[httpErrorStatusCode]?.gqlErrorExtensions;

  // Check for unhandled statusCodes (should never happen, but just in case)
  if (!httpErrorGqlExtensions) {
    logger.error(
      { gqlFormattedError, originalErrorOrWrappedError },
      `[ApolloServer.formatError] UNEXPECTED HTTP STATUS CODE: "${httpErrorStatusCode}"`
    );
  }

  const gqlFormattedErrorExts: Partial<GqlErrorExtensions> = gqlFormattedError.extensions ?? {};

  // Must return a GraphQLFormattedError object
  return {
    ...gqlFormattedError,
    // EXTS: Keep original if present, else try statusCode, else 500/INTERNAL_SERVER_ERROR.
    extensions: {
      // Apollo's typing implies `code` could be explicitly `undefined`, which is why spread syntax is not used here.
      code:
        gqlFormattedErrorExts.code ??
        httpErrorGqlExtensions?.code ??
        HTTP_ERROR_CONFIGS[500].gqlErrorExtensions.code,
      http: {
        status: gqlFormattedErrorExts.http?.status ?? httpErrorStatusCode,
      },
    },
  };
};
