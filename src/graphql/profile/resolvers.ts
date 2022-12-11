import { User } from "@models/User";
import { prettifyStr, getObjValuesByKeys } from "@utils";
import type { Resolvers } from "@/types/graphql";

export const resolvers: Partial<Resolvers> = {
  Query: {
    myProfile: async (parent, args, { user }) => {
      return (await User.getItem(
        { id: user.id, sk: `#DATA#${user.id}` },
        { ProjectionExpression: "profile" }
      )) as any; // FIXME
    }
  },
  Mutation: {
    updateProfile: async (parent, { profile: profileInput }, { user }) => {
      const profile = getObjValuesByKeys(
        ["givenName", "familyName", "businessName", "photoUrl"],
        profileInput
      );

      // prettier-ignore
      return await User.updateItem(
        { id: user.id, sk: `#DATA#${user.id}` },
        { profile },
        { ProjectionExpression: "profile" } as any // FIXME
      ) as any // FIXME
    }
  },
  Profile: {
    displayName: async ({ givenName, familyName, businessName }) => {
      let displayName = "";

      if (businessName) {
        displayName = prettifyStr.bizName(businessName);
      } else if (givenName && familyName) {
        // prettier-ignore
        displayName = `${prettifyStr.capFirstLetterOnly(givenName)} ${prettifyStr.capFirstLetterOnly(familyName)}`;
      } else if (givenName) {
        displayName = `${prettifyStr.capFirstLetterOnly(givenName)}`;
      }

      return displayName;
    }
  }
};
