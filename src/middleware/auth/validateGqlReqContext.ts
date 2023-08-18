import { UserSubscription } from "@/models/UserSubscription";
import { ENV } from "@/server/env";
import { AuthToken } from "@/utils/AuthToken";
import { GqlAuthError, GqlPaymentRequiredError } from "@/utils/httpErrors";
import type { ApolloServerResolverContext } from "@/apolloServer";
import type { Request } from "express";

/**
 * This middleware validates and authenticates requests on the /api route, and ensures that
 * no request reaches any GQL resolver unless the following are all true:
 *
 *   1. The request contains a valid unexpired AuthToken which was signed by the relevant key.
 *   2. The AuthToken payload contains required User information.
 *   3. The User's subscription is both active and unexpired.
 *
 * If all authentication criteria are met, the User's information is attached to the GQL
 * resolvers' context object.
 *
 * @returns The context object made available to all GQL resolvers.
 */
const validateGqlRequest = async ({
  req,
}: {
  req: Request;
}): Promise<ApolloServerResolverContext> => {
  // Authenticate the user
  const tokenPayload = await AuthToken.getValidatedRequestAuthTokenPayload(req).catch(() => {
    /* If err, re-throw as Apollo 401 auth error. By default, errors thrown from
    apollo context-init fn return to client with http status code 500, so an "http"
    extension is added here to ensure the status code is properly set to 401.    */
    throw new GqlAuthError("Authentication required");
  });

  // Ensure the User's subscription is active and not expired
  try {
    UserSubscription.validateExisting(tokenPayload.subscription);
  } catch (err) {
    // If err, re-throw as GQL 402 error
    throw new GqlPaymentRequiredError("Payment required");
  }

  return {
    ...req,
    user: tokenPayload,
  };
};

/**
 * This function tests for whether or not an incoming request is a MANUAL
 * schema-update introspection query, submitted either via the Rover CLI or from
 * Apollo Studio, with the former being the method usedfor updating the "staging"
 * and "prod" variants in the CI pipeline.
 *
 * During development, however, the "current" variant of the Fixit schema is
 * updated via PUSH event at server startup using the APOLLO_KEY and
 * APOLLO_GRAPH_REF env vars.
 */
const isIntrospectionQuery = ({
  req,
}: {
  req: Request<unknown, unknown, { operationName?: string; query?: string }>;
}): boolean => {
  // Manual schema-update introspection queries submitted from Apollo Studio:
  const isIntrospectionQueryFromApolloStudio =
    req.get("origin") === "https://studio.apollographql.com" &&
    !!req?.body?.query &&
    /query IntrospectionQuery/.test(req.body.query);

  // Manual schema-update introspection queries submitted via Rover CLI:
  const isIntrospectionQueryFromRoverCLI =
    (/^rover/.test(req.get("user-agent") ?? "") || req.hostname === "localhost") &&
    !!req?.body?.operationName &&
    req.body.operationName === "GraphIntrospectQuery";

  return isIntrospectionQueryFromApolloStudio || isIntrospectionQueryFromRoverCLI;
};

/**
 * This MW is used to create "context" within ApolloServer.
 * - Permits ApolloStudio and ApolloSandbox introspection queries in the dev env.
 */
export const validateGqlReqContext =
  /^dev/i.test(ENV.NODE_ENV) === false
    ? validateGqlRequest
    : async ({ req }: { req: Request }) => {
        return isIntrospectionQuery({ req })
          ? (req as ApolloServerResolverContext)
          : await validateGqlRequest({ req });
      };
