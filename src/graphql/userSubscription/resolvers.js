import { UserSubscription } from "@models/UserSubscription";

export const resolvers = {
  Query: {
    mySubscription: async (parent, args, { user }) => {
      const subs = await UserSubscription.queryUserSubscriptions(user.id);

      /* Although unlikely, it is possible for users to have multiple subs.
      To guard against these edge cases, this query returns the most recently
      created subscription with an "active" status. See below comment.  */

      return subs.reduce((bestSubSoFar, currentSub) => {
        /*
          currentSub win conditions in order of precedence:
            - currentSub is 1st in subs array
            - currentSub.status is "active" and bestSubSoFar is NOT "active"
            - currentSub.status is "active" and created more recently than bestSubSoFar
            - neither are "active", and currentSub was updated more recently than bestSubSoFar
        */

        // prettier-ignore
        if (bestSubSoFar === null) {
          bestSubSoFar = currentSub;

        } else if (currentSub.status === "active" && (bestSubSoFar.status !== "active" || wasCreatedEarlier(currentSub, bestSubSoFar))) {

          bestSubSoFar = currentSub;

        } else if (bestSubSoFar.status !== "active" && wasUpdatedLater(currentSub, bestSubSoFar)) {

          bestSubSoFar = currentSub;
        }

        return bestSubSoFar;
      }, null);
    }
  }
};

// Below: quick utils for making above boolean expressions a little easier to read

const wasCreatedEarlier = ({ createdAt: createdAt_1 }, { createdAt: createdAt_2 }) => {
  return createdAt_1 < createdAt_2;
};

const wasUpdatedLater = ({ updatedAt: updatedAt_1 }, { updatedAt: updatedAt_2 }) => {
  return updatedAt_1 > updatedAt_2;
};
