import { pinpointClient } from "@/lib/pinpointClient";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { User, type UserItem } from "@/models/User";
import { ENV } from "@/server/env";
import { AuthError } from "@/utils/httpErrors.js";

/**
 * ### AuthService: sendPasswordResetEmail
 *
 * Sends a password-reset email to the user's email address.
 */
export const sendPasswordResetEmail = async ({ email }: Pick<UserItem, "email">) => {
  // Ensure the user exists
  const [user] = await User.query({ where: { email }, limit: 1 });

  if (!user) throw new AuthError("User not found");

  /* A password-reset email is only sent if the user exists and their login type is LOCAL.
  Regardless of whether this is the case, the response is always the same: a 200 status code.
  This is a defense-in-depth measure to prevent leaking info about a user's existence. */
  if (user.login.type === "LOCAL") {
    // Make the password reset token (the model sets TTL of 15 minutes)
    const { token: passwordResetToken } = await PasswordResetToken.createItem({ userID: user.id });

    await pinpointClient.sendMessages({
      to: email,
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
};
