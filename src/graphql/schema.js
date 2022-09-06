import merge from "lodash.merge";
import { logger } from "@utils/logger";
import { root, deleteMutationResponse } from "./_common";
import * as customScalars from "./_customScalars";
import * as contact from "./contact";
import * as fixitUser from "./fixitUser";
import * as invoice from "./invoice";
import * as phoneContact from "./phoneContact";
import * as profile from "./profile";
import * as stripeConnectAccount from "./stripeConnectAccount";
import * as user from "./user";
import * as userSubscription from "./userSubscription";
import * as workOrder from "./workOrder";

export const schema = {
  typeDefs: [
    // EXTENDABLE ROOT TYPES
    root.typeDefs,
    // CUSTOM SCALARS & MUTATION RESPONSES
    customScalars.typeDefs,
    deleteMutationResponse.typeDefs,
    // INTERFACES
    fixitUser.typeDefs,
    // CONCRETE TYPES
    contact.typeDefs,
    invoice.typeDefs,
    profile.typeDefs,
    stripeConnectAccount.typeDefs,
    user.typeDefs,
    userSubscription.typeDefs,
    workOrder.typeDefs,
    workOrder.mutationTypeDefs,
    // CLIENT-SPECIFIC
    phoneContact.typeDefs
  ],
  // Wrap each resolver with a catch err-logger
  resolvers: Object.fromEntries(
    Object.entries(
      merge(
        // CUSTOM SCALARS
        customScalars.resolvers,
        // INTERFACES
        fixitUser.resolvers,
        // CONCRETE TYPES
        contact.resolvers,
        invoice.resolvers,
        profile.resolvers,
        user.resolvers,
        userSubscription.resolvers,
        workOrder.resolvers,
        // CLIENT-SPECIFIC
        phoneContact.resolvers
      )
    ).map(([resolverType, resolversOfType]) => {
      // resolverType is either "Query" or "Mutation"
      return [
        resolverType,
        Object.fromEntries(
          Object.entries(resolversOfType).map(([resolverName, resolver]) => {
            // For scalar resolvers and whatnot, "resolver" won't be a function, just continue to next.
            if (typeof resolver !== "function") return [resolverName, resolver];

            // Resolver ID example: "QUERY:WorkOrder"
            const resolverLogID = `${resolverType.toUpperCase()}:${resolverName}`;

            /* Note: none of the sync resolver functions use `return new Promise...`, so this
            logic using the resolver's constructor.name property works for this use case.  */
            const wrappedResolverFn =
              resolver.constructor.name === "AsyncFunction"
                ? async (...args) => {
                    return await resolver(...args).catch((err) => {
                      // Log error and re-throw as-is
                      logger.error(err, resolverLogID);
                      throw err;
                    });
                  }
                : (...args) => {
                    try {
                      return resolver(...args);
                    } catch (err) {
                      // Log error and re-throw as-is
                      logger.error(err, resolverLogID);
                      throw err;
                    }
                  };

            return [resolverName, wrappedResolverFn];
          })
        )
      ];
    })
  )
};
