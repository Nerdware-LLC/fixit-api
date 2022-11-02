import { UserSubscription } from "@models/UserSubscription";
import { AuthToken, GqlAuthError, GqlPaymentRequiredError } from "@utils";
import type { Request } from "express";

// This MW is used to create "context" within ApolloServer

export const validateGqlReqContext = async ({ req }: { req: Request }) => {
  // TODO The below context-init checks currently break Apollo introspection

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
