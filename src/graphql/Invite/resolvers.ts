import { GenericSuccessResponse } from "@graphql/_common";
import { GqlUserInputError } from "@utils/customErrors";
import { EMAIL_REGEX, US_PHONE_DIGITS_REGEX } from "@utils/regex";
import type { Resolvers } from "@types";

export const resolvers: Partial<Resolvers> = {
  Mutation: {
    createInvite: async (parent, { phoneOrEmail }, { user }) => {
      if (typeof phoneOrEmail !== "string" || phoneOrEmail.length === 0)
        throw new GqlUserInputError("Unable to create invite with the provided value.");

      // Determine if arg is a valid US phone or email address
      const argType = US_PHONE_DIGITS_REGEX.test(phoneOrEmail)
        ? "phone"
        : EMAIL_REGEX.test(phoneOrEmail)
        ? "email"
        : null;

      if (argType === "phone") {
        // FIXME text SMS invite
      } else if (argType === "email") {
        // FIXME email invite
      } else {
        throw new GqlUserInputError("Unable to create invite with the provided value.");
      }

      return new GenericSuccessResponse({ wasSuccessful: true });
    },
  },
};
