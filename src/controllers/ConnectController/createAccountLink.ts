import { sanitizeURL, isValidURL } from "@nerdware/ts-string-helpers";
import { getRequestBodySanitizer } from "@/controllers/_helpers";
import { AccountService } from "@/services/AccountService";
import { AuthService } from "@/services/AuthService";
import type { ApiController } from "@/controllers/types.js";

/**
 * This controller returns a Stripe ConnectAccount link for an authenticated user.
 *
 * > Endpoint: `POST /api/connect/account-link`
 */
export const createAccountLink: ApiController<"/connect/account-link"> = async (req, res, next) => {
  try {
    // Validate and decode the AuthToken from the 'Authorization' header:
    const authenticatedUser = await AuthService.getValidatedRequestAuthTokenPayload(req);

    // Get the provided `returnURL`:
    const { returnURL } = sanitizeCreateAccountLinkRequest(req);

    // Get the Stripe AccountLink:
    const { url: stripeLink } = await AccountService.createStripeConnectAccountLink({
      authenticatedUser,
      returnURL,
    });

    // Send response:
    res.status(201).json({ stripeLink });
  } catch (err) {
    next(err);
  }
};

const sanitizeCreateAccountLinkRequest = getRequestBodySanitizer<"/connect/account-link">({
  requestBodySchema: {
    returnURL: {
      type: "string",
      required: true,
      nullable: false,
      sanitize: sanitizeURL,
      validate: isValidURL,
    },
  },
});
