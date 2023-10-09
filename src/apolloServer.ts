import { ApolloServer, type BaseContext } from "@apollo/server";
import { fixitSchema } from "@/graphql/schema";
import { ENV } from "@/server/env";
import type { FixitApiAuthTokenPayload } from "@/utils/AuthToken";
import type { Request } from "express";

export const apolloServer = new ApolloServer<ApolloServerResolverContext>({
  schema: fixitSchema,
  csrfPrevention: true,
  introspection: ENV.NODE_ENV === "development",
  plugins: [
    ...(ENV.NODE_ENV === "development"
      ? [(await import("@apollo/server/plugin/inlineTrace")).ApolloServerPluginInlineTrace()]
      : [(await import("@apollo/server/plugin/disabled")).ApolloServerPluginLandingPageDisabled()]),
  ],
});

// Run required init logic for integrating with Express
await apolloServer.start();

/**
 * The execution context object available to all GQL resolvers.
 */
export interface ApolloServerResolverContext extends BaseContext, Partial<Request> {
  /** The currently authenticated User's AuthToken payload. */
  user: FixitApiAuthTokenPayload;
}
