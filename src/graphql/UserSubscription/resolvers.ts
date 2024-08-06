import { UserSubscriptionService } from "@/services/UserSubscriptionService";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Resolvers = {
  Query: {
    mySubscription: async (parent, args, { user }) => {
      return await UserSubscriptionService.findUsersSubscription({
        authenticatedUserID: user.id,
      });
    },
  },
};
