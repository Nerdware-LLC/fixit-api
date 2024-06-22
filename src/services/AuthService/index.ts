import { AuthToken } from "./AuthToken.js";
import { GoogleOAuth2IDToken } from "./GoogleOAuth2IDToken.js";
import { authenticateUserViaLoginCredentials } from "./authenticateUserViaLoginCredentials.js";
import { preFetchAndSyncUserItems } from "./preFetchAndSyncUserItems.js";
import { resetPassword } from "./resetPassword.js";
import { sendPasswordResetEmail } from "./sendPasswordResetEmail.js";
import { verifyUserIsAuthorizedToAccessPaidContent } from "./verifyUserIsAuthorizedToAccessPaidContent.js";
import { verifyUserIsAuthorizedToPerformThisUpdate } from "./verifyUserIsAuthorizedToPerformThisUpdate.js";

/**
 * #### AuthService
 *
 * This object contains methods which implement business logic related to
 * authentication and authorization.
 */
export const AuthService = {
  /** User authentication methods */
  authenticateUser: {
    viaLoginCredentials: authenticateUserViaLoginCredentials,
    viaAuthHeaderToken: AuthToken.getValidatedRequestAuthTokenPayload,
  },
  /** User authorization methods */
  verifyUserIsAuthorized: {
    toAccessPaidContent: verifyUserIsAuthorizedToAccessPaidContent,
    toPerformThisUpdate: verifyUserIsAuthorizedToPerformThisUpdate,
  },
  preFetchAndSyncUserItems,
  resetPassword,
  sendPasswordResetEmail,
  verifyUserIsAuthorizedToPerformThisUpdate,
  /** AuthToken helper function which creates+returns a new AuthToken. */
  createAuthToken: AuthToken.create,
  /** GoogleOAuth2IDToken helper function which parses a GoogleOAuth2IDToken. */
  parseGoogleOAuth2IDToken: GoogleOAuth2IDToken.parse,
} as const;
