import { UserSubscription } from "@/models/UserSubscription/UserSubscription.js";
import { ENV } from "@/server/env";
import { AuthToken, type FixitApiAuthTokenPayload } from "@/utils/AuthToken.js";
import { GqlAuthError, GqlPaymentRequiredError } from "@/utils/httpErrors.js";
import type { ApolloServerContext, GqlApiRequestObject } from "@/apolloServer.js";

/** Extracts `req` properties for the GQL context object. */
const getRequestPropsForGqlContext = (
  { body, hostname, ip, ips, method, originalUrl, path, protocol, subdomains }: GqlApiRequestObject
) => ({ body, hostname, ip, ips, method, originalUrl, path, protocol, subdomains }); // prettier-ignore

/** Validates and authenticates the user from the incoming request object. */
const getValidatedGqlApiUser = async (req: GqlApiRequestObject) => {
  // Authenticate the user
  const tokenPayload = await AuthToken.getValidatedRequestAuthTokenPayload(req).catch(() => {
    // If err, re-throw as GQL 401 error
    throw new GqlAuthError("Authentication required");
  });

  // Ensure the User's subscription is active and not expired
  try {
    UserSubscription.validateExisting(tokenPayload.subscription);
  } catch {
    // If err, re-throw as GQL 402 error
    throw new GqlPaymentRequiredError("Payment required");
  }

  return tokenPayload as FixitApiAuthTokenPayload<true, true>;
};

/**
 * This function tests for whether or not an incoming request is a MANUAL schema-update
 * introspection query submitted either via the Rover CLI or from Apollo Studio.
 *
 * > `Rover CLI Introspection:` Used to update graph variants in the CI pipeline.
 *
 * > `Apollo Studio Introspection:` Used to update the dev variant of the Fixit schema via
 *   PUSH event at server startup using the APOLLO_KEY and APOLLO_GRAPH_REF env vars.
 */
const isIntrospectionQuery = (req: GqlApiRequestObject): boolean => {
  // Manual schema-update introspection queries submitted from Apollo Studio:
  const isIntrospectionQueryFromApolloStudio =
    req.get("origin") === "https://studio.apollographql.com" &&
    !!req.body?.query?.includes("query IntrospectionQuery");

  // Manual schema-update introspection queries submitted via Rover CLI:
  const isIntrospectionQueryFromRoverCLI =
    ((req.get("user-agent") ?? "").startsWith("rover") || req.hostname === "localhost") &&
    req?.body?.operationName === "GraphIntrospectQuery";

  return isIntrospectionQueryFromApolloStudio || isIntrospectionQueryFromRoverCLI;
};

/**
 * This middleware validates and authenticates requests on the /api route, and ensures that
 * no request reaches any GQL resolver unless the following are all true:
 *
 *   1. The request contains a valid unexpired AuthToken which was signed by the relevant key.
 *   2. The AuthToken payload contains required User information.
 *   3. The User's subscription is both active and unexpired.
 *
 * If all criteria are met, the User's information is attached to the GQL context object,
 * along with useful properties from the request object.
 *
 * > In `development` environments, introspection queries are permitted.
 */
export const getValidatedGqlContext = ENV.IS_DEV
  ? async ({ req }: { req: GqlApiRequestObject }) => ({
      req: getRequestPropsForGqlContext(req),
      user: isIntrospectionQuery(req)
        ? ({} as unknown as ApolloServerContext["user"])
        : await getValidatedGqlApiUser(req),
    })
  : async ({ req }: { req: GqlApiRequestObject }) => ({
      req: getRequestPropsForGqlContext(req),
      user: await getValidatedGqlApiUser(req),
    });
