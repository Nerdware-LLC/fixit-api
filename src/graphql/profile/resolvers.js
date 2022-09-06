import { User } from "@models/User";
import { prettifyStr, getObjValuesByKeys } from "@utils";

export const resolvers = {
  Query: {
    myProfile: async (parent, args, { user }) => {
      return await User.get({ id: user.id, sk: `#DATA#${user.id}` }, { attributes: "profile" });
    }
    // TODO Rm'd "profile" query, make sure this isn't being used on client
  },
  Mutation: {
    updateProfile: async (parent, { profile: profileInput }, { user }) => {
      const profile = getObjValuesByKeys(
        ["givenName", "familyName", "businessName", "photoUrl"],
        profileInput
      );

      return await User.update(
        { id: user.id, sk: `#DATA#${user.id}` },
        { profile },
        { attributes: "profile" }
      );
    }
  },
  Profile: {
    displayName: async ({ givenName, familyName, businessName }) => {
      let displayName;

      if (businessName) {
        displayName = prettifyStr.bizName(businessName);
      } else if (givenName && familyName) {
        // prettier-ignore
        displayName = `${prettifyStr.capFirstLetterOnly(givenName)} ${prettifyStr.capFirstLetterOnly(familyName)}`;
      } else {
        // FIXME default/fallback "displayName" value
      }

      return displayName;
    }
  }
};
