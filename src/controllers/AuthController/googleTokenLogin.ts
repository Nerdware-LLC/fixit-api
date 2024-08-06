import { sanitizeJWT, isValidJWT } from "@nerdware/ts-string-helpers";
import { z as zod } from "zod";
import { ApiController } from "@/controllers/ApiController.js";
import { AuthService } from "@/services/AuthService";

/**
 * This controller method logs in a user using a Google ID Token.
 * This endpoint is used for Google OAuth2 OneTap login.
 *
 * > Endpoint: `POST /api/auth/google-token`
 */
export const googleTokenLogin = ApiController<"/auth/google-token">(
  // Req body schema:
  zod
    .object({
      googleIDToken: zod.string().transform(sanitizeJWT).refine(isValidJWT, {
        message: "Invalid Google ID Token",
      }),
    })
    .strict(),
  // Controller logic:
  async (req, res) => {
    const { googleIDToken } = req.body;

    // Parse the Google ID Token:
    const { email, googleID } = await AuthService.parseGoogleOAuth2IDToken(googleIDToken);

    // Authenticate the user:
    const authenticatedUser = await AuthService.authenticateUser.viaLoginCredentials({
      email,
      googleID,
    });

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
  }
);
