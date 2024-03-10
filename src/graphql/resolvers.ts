import { isFunction } from "@nerdware/ts-type-safety-utils";
import deepMerge from "lodash.merge";
import { logger } from "@/utils/logger.js";
import * as contact from "./Contact/resolvers.js";
import * as fixitUser from "./FixitUser/resolvers.js";
import * as invoice from "./Invoice/resolvers.js";
import * as profile from "./Profile/resolvers.js";
import * as user from "./User/resolvers.js";
import * as userSubscription from "./UserSubscription/resolvers.js";
import * as workOrder from "./WorkOrder/resolvers.js";
import * as dateTimeCustomScalar from "./_customScalars/DateTime/resolvers.js";
import * as emailCustomScalar from "./_customScalars/Email/resolvers.js";

/**
 * Fixit API GQL Schema Resolvers
 * - Each resolver is wrapped with a try/catch error-logger
 */
export const resolvers = Object.fromEntries(
  Object.entries(
    deepMerge(
      // CUSTOM SCALARS
      dateTimeCustomScalar.resolvers,
      emailCustomScalar.resolvers,
      // INTERFACES
      fixitUser.resolvers,
      // CONCRETE TYPES
      contact.resolvers,
      invoice.resolvers,
      profile.resolvers,
      user.resolvers,
      userSubscription.resolvers,
      workOrder.resolvers
    )
  ).map(([resolverType, resolversOfType]) => {
    // resolverType is either "Query" or "Mutation"
    return [
      resolverType,
      Object.fromEntries(
        Object.entries(resolversOfType as Record<string, any>).map(([resolverName, resolver]) => {
          // For scalar resolvers and whatnot, "resolver" won't be a function, just continue to next.
          if (!isFunction(resolver)) return [resolverName, resolver];

          // Resolver ID example: "QUERY:WorkOrder"
          const resolverLogID = `${resolverType.toUpperCase()}:${resolverName}`;

          /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */

          /* Note: none of the sync resolver functions use `return new Promise...`, so this
            logic using the resolver's constructor.name property works for this use case.  */
          const wrappedResolverFn =
            resolver.constructor.name === "AsyncFunction"
              ? async (...args: unknown[]) => {
                  return await resolver(...args).catch((err: unknown) => {
                    logger.error(err, resolverLogID); // Log error and re-throw as-is
                    throw err;
                  });
                }
              : (...args: unknown[]) => {
                  try {
                    return resolver(...args);
                  } catch (err: unknown) {
                    logger.error(err, resolverLogID); // Log error and re-throw as-is
                    throw err;
                  }
                };

          return [resolverName, wrappedResolverFn];
        })
      ),
    ];
  })
);
