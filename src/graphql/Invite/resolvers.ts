import { sanitizeEmail, isValidPhone, isValidEmail } from "@nerdware/ts-string-helpers";
import { MutationResponse } from "@/graphql/_responses";
import { pinpointClient } from "@/lib/pinpointClient";
import { UserInputError } from "@/utils/httpErrors.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Resolvers = {
  Mutation: {
    createInvite: async (_parent, { phoneOrEmail }, { user }) => {
      // Sanitize phoneOrEmail
      phoneOrEmail = sanitizeEmail(phoneOrEmail); // <-- works bc the fn allows digit chars

      // Get the sender's name for usage in the invite message template
      const {
        profile: { givenName, familyName, displayName },
      } = user;

      const inviteSenderDisplayName =
        givenName && familyName ? `${givenName} ${familyName}` : givenName ?? displayName;

      // SEE IF THE ARG IS A PHONE NUMBER OR EMAIL ADDRESS
      if (isValidPhone(phoneOrEmail)) {
        const phone = phoneOrEmail;

        // Send text SMS invite
        await pinpointClient.sendMessages({
          to: phone,
          ChannelType: "SMS",
          TemplateConfiguration: {
            SMSTemplate: {
              Name: "fixit-user-invitation-sms",
            },
          },
          MessageConfiguration: {
            SMSMessage: {
              Substitutions: {
                senderDisplayName: [inviteSenderDisplayName],
              },
            },
          },
        });
      } else if (isValidEmail(phoneOrEmail)) {
        // Assign email (`as string` bc TS infers "not a string" due to `isValidPhone` check above)
        const email = phoneOrEmail as string;

        // Send email invite
        await pinpointClient.sendMessages({
          to: email,
          ChannelType: "EMAIL",
          TemplateConfiguration: {
            EmailTemplate: {
              Name: "fixit-user-invitation-email",
            },
          },
          MessageConfiguration: {
            EmailMessage: {
              Substitutions: {
                senderDisplayName: [inviteSenderDisplayName],
              },
            },
          },
        });
      } else {
        throw new UserInputError(
          "Unable to send invite — the provided input must be a valid phone number or email address."
        );
      }

      return new MutationResponse({ success: true });
    },
  },
};
