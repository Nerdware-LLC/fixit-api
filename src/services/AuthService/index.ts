import { AuthToken } from "./AuthToken.js";
import { GoogleOAuth2IDToken } from "./GoogleOAuth2IDToken.js";
import { authenticateUserLogin } from "./authenticateUserLogin.js";
import { preFetchAndSyncUserItems } from "./preFetchAndSyncUserItems.js";
import { resetPassword } from "./resetPassword.js";
import { sendPasswordResetEmail } from "./sendPasswordResetEmail.js";

/**
 * #### AuthService
 *
 * This object contains methods which implement business logic related to
 * authentication and authorization.
 */
export const AuthService = {
  authenticateUserLogin,
  preFetchAndSyncUserItems,
  resetPassword,
  sendPasswordResetEmail,
  // AuthToken
  createAuthToken: AuthToken.create,
  validateAndDecodeAuthToken: AuthToken.validateAndDecode,
  getValidatedRequestAuthTokenPayload: AuthToken.getValidatedRequestAuthTokenPayload,
  // GoogleOAuth2IDToken
  parseGoogleOAuth2IDToken: GoogleOAuth2IDToken.parse,
} as const;
