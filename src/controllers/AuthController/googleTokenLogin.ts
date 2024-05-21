import { getRequestBodySanitizer, type FieldConfig } from "@/controllers/_helpers";
import { AuthService } from "@/services/AuthService";
import { LOGIN_CREDENTIALS_REQ_BODY_SCHEMA } from "./_common.js";
import type { ApiController } from "@/controllers/types.js";

/**
 * This controller method logs in a user using a Google ID Token.
 * This endpoint is used for Google OAuth2 OneTap login.
 *
 * > Endpoint: `POST /api/auth/google-token`
 */
export const googleTokenLogin: ApiController<"/auth/google-token"> = async (req, res, next) => {
  try {
    const { googleIDToken } = sanitizeGoogleTokenLoginRequest(req);

    // Parse the Google ID Token:
    const { email, googleID } = await AuthService.parseGoogleOAuth2IDToken(googleIDToken);

    // Authenticate the user:
    const authenticatedUser = await AuthService.authenticateUserLogin({ email, googleID });

    // Pre-fetch User items:
    const { userItems, userSubscription, userStripeConnectAccount } =
      await AuthService.preFetchAndSyncUserItems({ authenticatedUserID: authenticatedUser.id });

    // Create a new AuthToken for the user:
    const authToken = AuthService.createAuthToken({
      ...authenticatedUser,
      subscription: userSubscription,
      stripeConnectAccount: userStripeConnectAccount,
    });

    // Send response:
    res.status(200).json({
      token: authToken.toString(),
      userItems,
    });
  } catch (err) {
    next(err);
  }
};

const sanitizeGoogleTokenLoginRequest = getRequestBodySanitizer<"/auth/google-token">({
  requestBodySchema: {
    googleIDToken: {
      ...LOGIN_CREDENTIALS_REQ_BODY_SCHEMA.googleIDToken,
      required: true,
    } as FieldConfig<string>,
    // The `sanitize` and `validate` fns in the shared defs are typed using `string | undefined`
  },
});
