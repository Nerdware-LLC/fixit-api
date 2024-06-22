import { ApolloServer } from "@apollo/server";
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginSchemaReportingDisabled,
  ApolloServerPluginUsageReportingDisabled,
} from "@apollo/server/plugin/disabled";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { addMocksToSchema } from "@graphql-tools/mock";
import { formatApolloError } from "@/graphql/GraphQLError/helpers.js";
import { schema } from "@/graphql/schema.js";
import type { ApolloServerContext, ApolloServerWithContext } from "@/apolloServer.js";

/**
 * ### MOCK APOLLO SERVER
 *
 * For testing, `schema` is wrapped in `addMocksToSchema` from `@graphql-tools/mock`.
 *
 * Docs:
 * - https://www.apollographql.com/docs/apollo-server/testing/mocking
 * - https://www.apollographql.com/docs/apollo-server/testing/testing
 */
export const apolloServer = new ApolloServer<ApolloServerContext>({
  schema: addMocksToSchema({
    schema,
    mocks: {
      // Manually created mocks can go here
    },
    preserveResolvers: true,
  }),
  formatError: formatApolloError,
  csrfPrevention: false,
  introspection: false,
  includeStacktraceInErrorResponses: true,
  status400ForVariableCoercionErrors: true,
}) as ApolloServerWithContext;

apolloServer.configurePlugins = async ({ httpServer }) => {
  apolloServer.addPlugin(ApolloServerPluginDrainHttpServer({ httpServer }));
  // Disable the landing-page and all reporting plugins:
  apolloServer.addPlugin(ApolloServerPluginLandingPageDisabled());
  apolloServer.addPlugin(ApolloServerPluginSchemaReportingDisabled());
  apolloServer.addPlugin(ApolloServerPluginUsageReportingDisabled());
  // No dynamic import needed - return explicit Promise
  return Promise.resolve();
};

// Export the actual `getAuthenticatedApolloContext` fn:
const { getAuthenticatedApolloContext } =
  await vi.importActual<typeof import("@/apolloServer.js")>("@/apolloServer.js");

export { getAuthenticatedApolloContext };
