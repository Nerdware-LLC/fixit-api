import { isValidPhone, isValidEmail } from "@nerdware/ts-string-helpers";
import { GenericSuccessResponse } from "@/graphql/_common";
import { GqlUserInputError } from "@/utils/httpErrors";
import type { Resolvers } from "@/types";

export const resolvers: Partial<Resolvers> = {
  Mutation: {
    createInvite: (_parent, { phoneOrEmail }) => {
      if (typeof phoneOrEmail !== "string" || phoneOrEmail.length === 0) {
        throw new GqlUserInputError("Unable to create invite with the provided input.");
      }

      // Determine if arg is a valid US phone or email address
      const argType = isValidPhone(phoneOrEmail)
        ? "phone"
        : isValidEmail(phoneOrEmail)
          ? "email"
          : null;

      if (argType === "phone") {
        // Send text SMS invite
      } else if (argType === "email") {
        // Send email invite
      } else {
        throw new GqlUserInputError(
          "Unable to send invite - a valid phone number or email address must be provided."
        );
      }

      return new GenericSuccessResponse({ wasSuccessful: true });
    },
  },
};
