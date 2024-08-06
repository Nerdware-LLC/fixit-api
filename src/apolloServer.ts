import { ApolloServer, type ContextFunction, type BaseContext } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { getTypeSafeError } from "@nerdware/ts-type-safety-utils";
import { GraphQLError } from "graphql";
import { formatApolloError } from "@/graphql/GraphQLError/helpers.js";
import { schema } from "@/graphql/schema.js";
import { ENV } from "@/server/env";
import { AuthService } from "@/services/AuthService";
import { HTTP_ERROR_CONFIGS, type HttpError } from "@/utils/httpErrors.js";
import type { AuthTokenPayload } from "@/types/open-api.js";
import type { Request } from "express";
import type { Server as HttpServer } from "node:http";

export const apolloServer = new ApolloServer<ApolloServerContext>({
  schema,
  formatError: formatApolloError,
  csrfPrevention: true,
  introspection: ENV.IS_DEV,
  includeStacktraceInErrorResponses: !ENV.IS_PROD,
  status400ForVariableCoercionErrors: true,
}) as ApolloServerWithContext;

/**
 * `ApolloServer<ApolloServerContext>` with a custom `configurePlugins` method.
 */
export type ApolloServerWithContext = ApolloServer<ApolloServerContext> & {
  /** When called, this function adds env-appropriate plugins to the ApolloServer instance. */
  configurePlugins: (params: { httpServer: HttpServer }) => Promise<void>;
};

apolloServer.configurePlugins = async ({ httpServer }) => {
  apolloServer.addPlugin(ApolloServerPluginDrainHttpServer({ httpServer }));
  apolloServer.addPlugin(
    ENV.IS_DEV
      ? (await import("@apollo/server/plugin/inlineTrace")).ApolloServerPluginInlineTrace()
      : (await import("@apollo/server/plugin/disabled")).ApolloServerPluginLandingPageDisabled()
  );
};

///////////////////////////////////////////////////////////////////////////////
// ApolloServer Context

/**
 * The `context` object available to all ApolloServer resolvers and plugins.
 */
export type ApolloServerContext = BaseContext & {
  req: ApolloServerContextRequestFields;
  user: AuthTokenPayload;
};

/**
 * ApolloServer `context.req` — contains properties from the Express `req` object.
 */
export type ApolloServerContextRequestFields = Pick<
  Request<Record<string, string>, unknown, Record<string, unknown>>,
  "body" | "hostname" | "ip" | "ips" | "method" | "originalUrl" | "path" | "protocol" | "subdomains"
>;

/**
 * This function is an [ApolloServer `context` function][apollo-context-fn]
 * which is provided to Apollo's [`expressMiddleware`][apollo-express-mw] — the
 * entrypoint for the GraphQL API.
 *
 * The function validates and authenticates requests on the /api route, and ensures
 * that no request reaches any GQL resolver unless the following are all true:
 *
 *   1. The request contains a valid unexpired AuthToken which was signed by the relevant key.
 *   2. The AuthToken payload contains required User information.
 *   3. The User's subscription is both active and unexpired.
 *
 * If all criteria are met, the User's information is attached to the GQL context object,
 * along with useful properties from the request object.
 *
 * [apollo-express-mw]: https://www.apollographql.com/docs/apollo-server/api/express-middleware
 * [apollo-context-fn]: https://www.apollographql.com/docs/apollo-server/data/context/#the-context-function
 */
export const getAuthenticatedApolloContext: ContextFunction<
  [{ req: Request }],
  ApolloServerContext
> = async ({ req }): Promise<ApolloServerContext> => {
  try {
    // Authenticate the user
    const authenticatedUser = await AuthService.authenticateUser.viaAuthHeaderToken(req);
    // Ensure the User is authorized to access paid content
    AuthService.verifyUserIsAuthorized.toAccessPaidContent({ authenticatedUser });
    // Return the ApolloServer context object
    return {
      user: authenticatedUser,
      req: {
        body: req.body as Record<string, unknown>,
        hostname: req.hostname,
        ip: req.ip,
        ips: req.ips,
        method: req.method,
        originalUrl: req.originalUrl,
        path: req.path,
        protocol: req.protocol,
        subdomains: req.subdomains,
      },
    };
  } catch (err) {
    const error = getTypeSafeError(err);
    // Expected error.statusCode values: 401 or 403 (default to 401 if undefined for whatever reason)
    const errorStatusCode = (error as Partial<HttpError>).statusCode ?? 401;
    // Get the HTTP-error-config for the statusCode
    const httpErrorConfig = HTTP_ERROR_CONFIGS[errorStatusCode] ?? HTTP_ERROR_CONFIGS[401];
    // Re-throw as GraphQLError (ApolloServer's formatError fn is not called for ctx-fn errors)
    throw new GraphQLError(httpErrorConfig.defaultErrorMsg, {
      extensions: httpErrorConfig.gqlErrorExtensions,
    });
  }
};
