import { ApolloServer, type ApolloServerOptionsWithSchema, type BaseContext } from "@apollo/server";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginInlineTrace } from "@apollo/server/plugin/inlineTrace";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { fixitSchema } from "@graphql/schema";
import { ENV } from "@server/env";
import type { FixitApiAuthTokenPayload } from "@utils/AuthToken";
import type { Request } from "express";

/**
 * This function creates an ApolloServer instance with the provided `schema`, and
 * runs the required init logic for integrating with Express before returning it.
 *
 * - If no `schema` is provided, the default Fixit schema will be used.
 * - For testing, wrap `schema` in `addMocksToSchema` from `@graphql-tools/mock`.
 *   Apollo docs on testing/mocking:
 *   https://www.apollographql.com/docs/apollo-server/testing/mocking#adding-mocks-to-your-schema
 */
export const createApolloServer = async (
  { schema }: Pick<ApolloServerOptionsWithSchema<ApolloServerResolverContext>, "schema"> = {
    schema: fixitSchema,
  }
) => {
  const apolloServer = new ApolloServer<ApolloServerResolverContext>({
    schema,
    csrfPrevention: true,
    introspection: ENV.NODE_ENV === "development",
    plugins: [
      ...(ENV.NODE_ENV === "development"
        ? [ApolloServerPluginLandingPageLocalDefault(), ApolloServerPluginInlineTrace()]
        : [ApolloServerPluginLandingPageDisabled()]),
    ],
  });

  // Run required init logic for integrating with Express
  await apolloServer.start();

  return apolloServer;
};

/**
 * The context available to all GQL resolvers.
 */
export interface ApolloServerResolverContext extends BaseContext, Partial<Request> {
  user: FixitApiAuthTokenPayload;
}
