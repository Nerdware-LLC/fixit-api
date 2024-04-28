import { pinpointClient } from "@/lib/pinpointClient";
import { mwAsyncCatchWrapper } from "@/middleware/helpers.js";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { ENV } from "@/server/env";
import type { RestApiRequestBodyByPath } from "@/types/open-api.js";

/**
 * This middleware sends a password-reset email to the user's email address.
 */
export const sendPasswordResetEmail = mwAsyncCatchWrapper<
  RestApiRequestBodyByPath["/auth/password-reset-init"]
>(async (req, res) => {
  /* A password-reset email is only sent if the user exists and their login type is LOCAL.
  Regardless of whether this is the case, the response is always the same: a 200 status code.
  This is a defense-in-depth measure to prevent leaking info about a user's existence. */
  if (res.locals?.user?.login.type === "LOCAL") {
    // Make the password reset token (the model sets TTL of 15 minutes)
    const { token: passwordResetToken } = await PasswordResetToken.createItem({
      userID: res.locals.user.id,
    });

    await pinpointClient.sendMessages({
      to: req.body.email,
      ChannelType: "EMAIL",
      TemplateConfiguration: {
        EmailTemplate: {
          Name: "password-reset-email",
        },
      },
      MessageConfiguration: {
        EmailMessage: {
          Substitutions: {
            passwordResetHREF: [
              `${ENV.WEB_CLIENT.URL}/reset-password?token=${passwordResetToken}`, // prettier-ignore
            ],
          },
        },
      },
    });
  }

  res.sendStatus(200);
});
