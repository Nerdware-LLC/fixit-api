import { Profile } from "@models/Profile";
import { User } from "@models/User";
import type { Resolvers } from "@types";

export const resolvers: Partial<Resolvers> = {
  Query: {
    myProfile: async (parent, args, { user }) => {
      const getItemResult = await User.getItem({
        id: user.id,
        sk: User.getFormattedSK(user.id),
      });

      // The user's token fields are used as a fallback if User.getItem fails for some reason
      return getItemResult?.profile ?? user.profile;
    },
  },
  Mutation: {
    updateProfile: async (parent, { profile: profileInput }, { user }) => {
      const { profile: updatedProfile } = await User.updateItem(
        { id: user.id, sk: User.getFormattedSK(user.id) },
        {
          profile: Object.fromEntries(
            Object.entries(profileInput).filter((entry) => typeof entry[1] === "string")
          ),
        }
      );
      return { ...user.profile, ...updatedProfile };
    },
  },
  Profile: {
    displayName: ({ givenName, familyName, businessName }, _, { user: { handle } }) => {
      return Profile.getDisplayNameFromArgs({
        handle,
        businessName,
        givenName,
        familyName,
      });
    },
  },
};
