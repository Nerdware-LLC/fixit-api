import { ApolloServer } from "@apollo/server";
import { schema } from "@graphql/schema";
import { ENV } from "@server/env";

const apolloServer = new ApolloServer({
  typeDefs: schema.typeDefs,
  resolvers: schema.resolvers,
  csrfPrevention: true,
  ...(ENV.IS_PROD
    ? { introspection: false }
    : {
        introspection: true,
        plugins: [
          await import("@apollo/server/plugin/landingPage/default").then(
            ({ ApolloServerPluginLandingPageLocalDefault }) => {
              return ApolloServerPluginLandingPageLocalDefault({ embed: true });
            }
          )
        ],
        ...(await import("@graphql/__tests__/utils/mocks")) // { mocks, mockEntireSchema }
      })
});

// Run required init logic for integrating with Express
await apolloServer.start();

export { apolloServer };
