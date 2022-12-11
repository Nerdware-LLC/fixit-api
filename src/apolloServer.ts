import { ApolloServer, type BaseContext } from "@apollo/server";
import { schema } from "@graphql/schema";
import { ENV } from "@server/env";
import type { Request } from "express";
import type { FixitApiAuthTokenPayload } from "./utils";

const apolloServer = new ApolloServer<ApolloServerResolverContext>({
  typeDefs: schema.typeDefs,
  resolvers: schema.resolvers,
  csrfPrevention: true,
  introspection: !ENV.IS_PROD,
  plugins: [
    ...(ENV.NODE_ENV === "development"
      ? // prettier-ignore
        [
          // Plugin to enable Schema Reporting, which keeps the schema up to date (note: does not work with Federated schemas)
          (await import("@apollo/server/plugin/schemaReporting")).ApolloServerPluginSchemaReporting(),
          (await import("@apollo/server/plugin/landingPage/default")).ApolloServerPluginLandingPageLocalDefault({ embed: true }),
          (await import("@apollo/server/plugin/inlineTrace")).ApolloServerPluginInlineTrace()
        ]
      : [(await import("@apollo/server/plugin/disabled")).ApolloServerPluginLandingPageDisabled()])
  ],
  ...(ENV.NODE_ENV === "test" && (await import("@graphql/__tests__/utils/mocks"))) // { mocks, mockEntireSchema }
});

// Run required init logic for integrating with Express
await apolloServer.start();

export { apolloServer };

/**
 * The context available to all GQL resolvers.
 */
export interface ApolloServerResolverContext extends BaseContext, Partial<Request> {
  user: FixitApiAuthTokenPayload;
}
