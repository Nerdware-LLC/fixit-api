import { User } from "@models/User";
import { prettifyStr, getNonNullObjValuesByKeys } from "@utils";
import type { Resolvers } from "@types";

export const resolvers: Partial<Resolvers> = {
  Query: {
    myProfile: async (parent, args, { user }) => {
      return (await User.getItem(
        { id: user.id, sk: `#DATA#${user.id}` },
        { ProjectionExpression: "profile" }
      )) as any; // FIXME
    },
  },
  Mutation: {
    updateProfile: async (parent, { profile: profileInput }, { user }) => {
      const { profile } = await User.updateItem(
        { id: user.id, sk: `#DATA#${user.id}` },
        {
          profile: getNonNullObjValuesByKeys(
            ["displayName", "givenName", "familyName", "businessName", "photoUrl"],
            profileInput
          ),
        }
      );
      return { ...user.profile, ...profile };
    },
  },
  Profile: {
    displayName: ({ givenName, familyName, businessName }, _, { user: { handle } }) => {
      return businessName
        ? prettifyStr.bizName(businessName)
        : givenName
        ? // prettier-ignore
          `${prettifyStr.capFirstLetterOnly(givenName)}${familyName ? ` ${prettifyStr.capFirstLetterOnly(familyName)}` : ""}`
        : handle;
    },
  },
};
