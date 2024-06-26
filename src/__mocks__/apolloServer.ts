import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { addMocksToSchema } from "@graphql-tools/mock";
import { fixitSchema } from "@/graphql/schema.js";
import type { ApolloServerResolverContext } from "@/apolloServer.js";

/**
 * ### MOCK APOLLO SERVER
 *
 * For testing, `schema` is wrapped in `addMocksToSchema` from `@graphql-tools/mock`.
 *
 * Docs:
 * - https://www.apollographql.com/docs/apollo-server/testing/mocking
 * - https://www.apollographql.com/docs/apollo-server/testing/testing
 */
export const apolloServer = new ApolloServer<ApolloServerResolverContext>({
  schema: addMocksToSchema({
    schema: fixitSchema,
    mocks: {
      // Manually created mocks can go here
    },
    preserveResolvers: true,
  }),
  csrfPrevention: false,
  introspection: false,
  plugins: [ApolloServerPluginLandingPageDisabled()],
});

// Run required init logic for integrating with Express
await apolloServer.start();
