import { ApolloServer } from "@apollo/server";
import { fixitSchema } from "@/graphql/schema.js";
import { ENV } from "@/server/env";
import type { FixitApiAuthTokenPayload } from "@/utils/AuthToken.js";
import type { Request } from "express";

export const apolloServer = new ApolloServer<ApolloServerContext>({
  schema: fixitSchema,
  csrfPrevention: true,
  introspection: ENV.NODE_ENV === "development",
  includeStacktraceInErrorResponses: !ENV.IS_PROD,
  status400ForVariableCoercionErrors: true,
  plugins: [
    ...(ENV.NODE_ENV === "development"
      ? [(await import("@apollo/server/plugin/inlineTrace")).ApolloServerPluginInlineTrace()]
      : [(await import("@apollo/server/plugin/disabled")).ApolloServerPluginLandingPageDisabled()]),
  ],
});

// Run required init logic for integrating with Express
await apolloServer.start();

/**
 * The `context` object available to all ApolloServer resolvers and plugins.
 */
export type ApolloServerContext = {
  /** The properties from the `req` object that are included in the ApolloServer `context` object. */
  req: Pick<
    GqlApiRequestObject,
    "body" | "hostname" | "ip" | "ips" | "method" | "originalUrl" | "path" | "protocol" | "subdomains" // prettier-ignore
  >;
  /** The authenticated User (properties acquired from their AuthToken payload. */
  user: FixitApiAuthTokenPayload<true, true>;
};

/**
 * The `req` object for GQL API requests.
 */
export type GqlApiRequestObject = Request<
  Record<string, string>,
  unknown,
  { [key: string]: unknown; query?: string; operationName?: string }
>;
