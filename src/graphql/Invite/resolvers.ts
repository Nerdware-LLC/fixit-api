import { GenericSuccessResponse } from "@graphql/_common";
import { GqlUserInputError } from "@utils/customErrors";
import { EMAIL_REGEX, US_PHONE_DIGITS_REGEX } from "@utils/regex";
import type { Resolvers } from "@types";

export const resolvers: Partial<Resolvers> = {
  Mutation: {
    createInvite: (parent, { phoneOrEmail }) => {
      if (typeof phoneOrEmail !== "string" || phoneOrEmail.length === 0)
        throw new GqlUserInputError("Unable to create invite with the provided input.");

      // Determine if arg is a valid US phone or email address
      const argType = US_PHONE_DIGITS_REGEX.test(phoneOrEmail)
        ? "phone"
        : EMAIL_REGEX.test(phoneOrEmail)
        ? "email"
        : null;

      if (argType === "phone") {
        // Send text SMS invite
      } else if (argType === "email") {
        // Send email invite
      } else {
        throw new GqlUserInputError("Unable to create invite with the provided input.");
      }

      return new GenericSuccessResponse({ wasSuccessful: true });
    },
  },
};
