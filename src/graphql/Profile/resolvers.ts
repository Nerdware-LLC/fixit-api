import { Profile } from "@/models/Profile/Profile.js";
import { User } from "@/models/User/User.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Partial<Resolvers> = {
  Query: {
    myProfile: async (_parent, _args, { user }) => {
      const result = await User.getItem({ id: user.id });
      // The user's token fields are used as a fallback if User.getItem fails for some reason
      return result?.profile ?? user.profile;
    },
  },
  Mutation: {
    updateProfile: async (_parent, { profile: profileInput }, { user }) => {
      const result = await User.updateItem(
        { id: user.id, sk: User.getFormattedSK(user.id) },
        {
          update: {
            profile: Profile.fromParams(profileInput),
          },
        }
      );

      return {
        ...user.profile,
        ...(result?.profile ?? {}),
      };
    },
  },
  Profile: {
    displayName: ({ givenName, familyName, businessName }, _args, { user: { handle } }) => {
      return Profile.getDisplayName({
        handle,
        businessName,
        givenName,
        familyName,
      });
    },
  },
};
