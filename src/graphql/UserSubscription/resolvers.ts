import {
  UserSubscription,
  type UserSubscriptionItem,
} from "@/models/UserSubscription/UserSubscription.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Partial<Resolvers> = {
  Query: {
    mySubscription: async (_parent, _args, { user }) => {
      /*
          Although unlikely, it is possible for users to have multiple subs.
          To guard against these edge cases, this query returns the most recently
          created subscription with an "active" status. See below comment.

          currentSub win conditions in order of precedence:
            - currentSub is 1st in subs array
            - currentSub.status is "active" and subToReturn is NOT "active"
            - currentSub.status is "active" and created more recently than subToReturn
            - neither are "active", and currentSub was updated more recently than subToReturn
        */
      return (
        await UserSubscription.query({
          where: {
            userID: user.id,
            sk: { beginsWith: UserSubscription.SK_PREFIX },
          },
        })
      ).reduce((subToReturn, currentSub) => {
        if (!subToReturn) {
          subToReturn = currentSub;
        } else if (
          currentSub.status === "active" &&
          (subToReturn.status !== "active" || wasCreatedEarlier(currentSub, subToReturn))
        ) {
          subToReturn = currentSub;
        } else if (subToReturn.status !== "active" && wasUpdatedLater(currentSub, subToReturn)) {
          subToReturn = currentSub;
        }
        return subToReturn;
      });
    },
  },
};

// Below: quick utils for making above boolean expressions a little easier to read

const wasCreatedEarlier = (
  { createdAt: createdAt_1 }: UserSubscriptionItem,
  { createdAt: createdAt_2 }: UserSubscriptionItem
) => {
  return createdAt_1 < createdAt_2;
};

const wasUpdatedLater = (
  { updatedAt: updatedAt_1 }: UserSubscriptionItem,
  { updatedAt: updatedAt_2 }: UserSubscriptionItem
) => {
  return updatedAt_1 > updatedAt_2;
};
