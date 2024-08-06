import { PasswordResetToken } from "@/models/PasswordResetToken";
import { User } from "@/models/User";
import { UserLogin } from "@/models/UserLogin";
import { UserInputError, InternalServerError } from "@/utils/httpErrors.js";
import type { RestApiRequestBodyByPath } from "@/types/open-api.js";

/**
 * Validates a password-reset token and - if valid - updates the user's password.
 */
export const resetPassword = async ({
  password: newPassword,
  passwordResetToken,
}: RestApiRequestBodyByPath["/auth/password-reset"]) => {
  // Retrieve the password-reset token from the database
  const passwordResetTokenItem = await PasswordResetToken.getItem({
    token: passwordResetToken,
  });

  // Ensure (1) the token exists and (2) it hasn't expired
  if (!PasswordResetToken.isTokenValid(passwordResetTokenItem)) {
    throw new UserInputError(
      "Your password reset link has expired. For security reasons, please request a new password reset, or contact support if the problem persists."
    );
  }

  // Validate the new password, and get an updated UserLogin object with the new pw hash
  const newLocalUserLoginObj = await UserLogin.createLoginLocal(newPassword);

  // Update the User's password
  const updatedUser = await User.updateItem(
    { id: passwordResetTokenItem.userID },
    {
      update: { login: newLocalUserLoginObj },
      ConditionExpression: "login.type = LOCAL", // Should always be the case here
    }
  );

  // If `updatedUser.login.passwordHash` isn't the new pw hash, throw a 500 error
  if (updatedUser.login.passwordHash !== newLocalUserLoginObj.passwordHash) {
    throw new InternalServerError(
      "We're sorry, but we were unable to update your password at this time. Please try again, or contact support if the problem persists."
    );
  }
};
