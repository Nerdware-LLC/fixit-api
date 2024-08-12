import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./typeDefs.js";

/**
 * Fixit API GraphQL Schema
 */
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
