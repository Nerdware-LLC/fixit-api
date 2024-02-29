import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./typeDefs.js";

export const fixitSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
