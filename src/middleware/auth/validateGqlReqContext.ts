import { UserSubscription } from "@models/UserSubscription";
import { AuthToken, GqlAuthError, GqlPaymentRequiredError } from "@utils";
import { ENV } from "@server";
import type { Request } from "express";
import type { ApolloServerResolverContext } from "../../apolloServer";

const validateGqlRequest = async ({
  req
}: {
  req: Request;
}): Promise<ApolloServerResolverContext> => {
  // Authenticate the user
  const user = await AuthToken.getValidatedRequestAuthTokenPayload(req).catch((err) => {
    throw new GqlAuthError(); // If err, re-throw as Apollo 401 auth error
  });

  // Ensure the User's subscription is active and not expired
  try {
    UserSubscription.validateExisting(user.subscription);
  } catch (err) {
    throw new GqlPaymentRequiredError(); // If err, re-throw as Apollo 402 error
  }

  return {
    ...req,
    user
  };
};

const isIntrospectionQuery = ({ req }: { req: Request }) => {
  // FIXME below does not work to allow Rover-CLI introspection queries thru
  return /query IntrospectionQuery/.test(req?.body?.query);
};

/**
 * This MW is used to create "context" within ApolloServer.
 * - Permits ApolloStudio and ApolloSandbox introspection queries in the dev env.
 */
export const validateGqlReqContext =
  ENV.NODE_ENV !== "development"
    ? validateGqlRequest
    : async ({ req }: { req: Request }) => {
        return isIntrospectionQuery({ req })
          ? (req as ApolloServerResolverContext)
          : ((await validateGqlRequest({ req })) as ApolloServerResolverContext);
      };
