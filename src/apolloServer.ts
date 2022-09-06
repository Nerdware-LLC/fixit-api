import { ApolloServer, AuthenticationError } from "apollo-server-express";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { schema } from "@graphql/schema";
import { UserSubscription } from "@models/UserSubscription";
import { ENV } from "@server/env";
import { AuthToken, ApolloPaymentRequiredError } from "@utils";

const apolloServer = new ApolloServer({
  typeDefs: schema.typeDefs,
  resolvers: schema.resolvers,
  debug: false, // <-- turn on for verbose ApolloErrors
  csrfPrevention: true,
  cache: "bounded",
  context: async ({ req }) => {
    const user = {};
    // FIXME
    if (false) {
      // Authenticate the user
      const user = await AuthToken.getValidatedRequestAuthTokenPayload(req).catch((err) => {
        throw new AuthenticationError(err); // If err, re-throw as Apollo 401 auth error
      });

      // Ensure the User's subscription is active and not expired
      UserSubscription.validateExisting(user.subscription).catch((err: ErrorLike) => {
        throw new ApolloPaymentRequiredError(err); // If err, re-throw as Apollo 402 error
      });
    }

    return {
      ...req,
      user
    };
  },
  // Env-dependent configs:
  plugins: !ENV.IS_PROD ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })] : [],
  introspection: !ENV.IS_PROD,
  mockEntireSchema: ENV.NODE_ENV === "test" // TODO Update mocks, see graphql/mocks and utils/faker.
});

// Run required init logic for integrating with Express
await apolloServer.start();

export { apolloServer };
