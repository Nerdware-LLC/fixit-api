import { getRequestBodySanitizer } from "@/controllers/_helpers";
import { AuthService } from "@/services/AuthService";
import { LOGIN_CREDENTIALS_REQ_BODY_SCHEMA, requirePasswordOrGoogleIDToken } from "./_common.js";
import type { ApiController } from "@/controllers/types.js";
import type { ParsedGoogleOAuth2IDTokenFields } from "@/services/AuthService/GoogleOAuth2IDToken.js";

/**
 * This controller method logs in a user.
 *
 * > Endpoint: `POST /api/auth/login`
 */
export const login: ApiController<"/auth/login"> = async (req, res, next) => {
  try {
    const { email, password, googleIDToken, expoPushToken } = sanitizeLoginRequest(req);

    // If a `googleIDToken` is provided, parse it:
    const { googleID }: Partial<ParsedGoogleOAuth2IDTokenFields> = googleIDToken
      ? await AuthService.parseGoogleOAuth2IDToken(googleIDToken)
      : {};

    // Authenticate the user:
    const authenticatedUser = await AuthService.authenticateUserLogin({
      email,
      password,
      googleID,
    });

    // Pre-fetch User items:
    const { userItems, userSubscription, userStripeConnectAccount } =
      await AuthService.preFetchAndSyncUserItems({
        authenticatedUserID: authenticatedUser.id,
        expoPushToken,
      });

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

const sanitizeLoginRequest = getRequestBodySanitizer<"/auth/login">({
  requestBodySchema: LOGIN_CREDENTIALS_REQ_BODY_SCHEMA,
  validateRequestBody: requirePasswordOrGoogleIDToken,
});
