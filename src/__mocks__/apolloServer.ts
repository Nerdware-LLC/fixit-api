import { addMocksToSchema } from "@graphql-tools/mock";
import { fixitSchema } from "@graphql/schema";
import { createApolloServer } from "@/createApolloServer";

/**
 * ### MOCK APOLLO SERVER
 *
 * Docs:
 * - https://www.apollographql.com/docs/apollo-server/testing/mocking
 * - https://www.apollographql.com/docs/apollo-server/testing/testing
 */
export const apolloServer = await createApolloServer({
  schema: addMocksToSchema({ schema: fixitSchema }),
});
