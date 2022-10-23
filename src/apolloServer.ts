import { ApolloServer, AuthenticationError } from "apollo-server-express";
import { schema } from "@graphql/schema";
import { UserSubscription } from "@models/UserSubscription";
import { ENV } from "@server/env";
import { AuthToken, ApolloPaymentRequiredError } from "@utils";

const envDependentApolloServerConfigs = ENV.IS_PROD
  ? { introspection: false }
  : {
      introspection: true,
      plugins: [
        await import("apollo-server-core").then(({ ApolloServerPluginLandingPageLocalDefault }) => {
          return ApolloServerPluginLandingPageLocalDefault({ embed: true });
        })
      ],
      ...(await import("@graphql/__tests__/utils/mocks")) // { mocks, mockEntireSchema }
    };

const apolloServer = new ApolloServer({
  typeDefs: schema.typeDefs,
  resolvers: schema.resolvers,
  debug: false, // <-- turn on for verbose ApolloErrors
  csrfPrevention: true,
  cache: "bounded",
  context: async ({ req }) => {
    // TODO The below context-init checks currently break Apollo introspection

    // Authenticate the user
    const user = await AuthToken.getValidatedRequestAuthTokenPayload(req).catch((err) => {
      throw new AuthenticationError(err); // If err, re-throw as Apollo 401 auth error
    });

    // Ensure the User's subscription is active and not expired
    try {
      UserSubscription.validateExisting(user.subscription);
    } catch (err) {
      throw new ApolloPaymentRequiredError(err); // If err, re-throw as Apollo 402 error
    }

    return {
      ...req,
      user
    };
  },
  ...envDependentApolloServerConfigs
});

// Run required init logic for integrating with Express
await apolloServer.start();

export { apolloServer };
