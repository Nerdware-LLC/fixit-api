import { Profile } from "@/models/Profile";
import { User } from "@/models/User";
import { createProfileZodSchema } from "./helpers.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Resolvers = {
  Query: {
    myProfile: async (_parent, _args, { user }) => {
      const result = await User.getItem({ id: user.id });
      // The user's token fields are used as a fallback if User.getItem fails for some reason
      return result?.profile ?? user.profile;
    },
  },
  Mutation: {
    updateProfile: async (_parent, { profile: profileInput }, { user }) => {
      // Sanitize and validate the provided profileInput
      profileInput = createProfileZodSchema.parse(profileInput);

      const result = await User.updateItem(
        { id: user.id },
        {
          update: {
            profile: Profile.fromParams(profileInput),
          },
        }
      );

      return {
        ...user.profile,
        ...result.profile,
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
