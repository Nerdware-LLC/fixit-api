import { AuthService } from "@/services/AuthService";
import type { ApiController } from "@/controllers/types.js";

/**
 * This controller refreshes a user's AuthToken (if valid).
 *
 * > Endpoint: `POST /api/auth/token`
 */
export const refreshAuthToken: ApiController<"/auth/token"> = async (req, res, next) => {
  try {
    // Validate and decode the AuthToken from the 'Authorization' header:
    const authenticatedUser = await AuthService.getValidatedRequestAuthTokenPayload(req);

    // Pre-fetch User items:
    const { userItems, userSubscription, userStripeConnectAccount } =
      await AuthService.preFetchAndSyncUserItems({ authenticatedUserID: authenticatedUser.id });

    // Create a new AuthToken for the user:
    const newAuthToken = AuthService.createAuthToken({
      ...authenticatedUser,
      subscription: userSubscription,
      stripeConnectAccount: userStripeConnectAccount,
    });

    // Send response:
    res.status(200).json({
      token: newAuthToken.toString(),
      userItems,
    });
  } catch (err) {
    next(err);
  }
};
