import { sanitizeURL, isValidURL } from "@nerdware/ts-string-helpers";
import { getRequestBodySanitizer } from "@/controllers/_helpers";
import { AccountService } from "@/services/AccountService";
import { AuthService } from "@/services/AuthService";
import type { ApiController } from "@/controllers/types.js";

/**
 * This controller returns a Stripe Customer Portal link, which allows the User to
 * manage their subscription and payment methods.
 *
 * > Endpoint: `POST /api/subscriptions/customer-portal`
 */
export const createCustomerBillingPortalLink: ApiController<
  "/subscriptions/customer-portal"
> = async (req, res, next) => {
  try {
    // Validate and decode the AuthToken from the 'Authorization' header:
    const authenticatedUser = await AuthService.getValidatedRequestAuthTokenPayload(req);

    // Get the provided `returnURL`:
    const { returnURL } = sanitizeCreateCustomerBillingPortalLinkRequest(req);

    // Get the Stripe link:
    const { url: stripeLink } = await AccountService.createCustomerBillingPortalLink({
      authenticatedUser,
      returnURL,
    });

    // Send response:
    res.status(201).json({ stripeLink });
  } catch (err) {
    next(err);
  }
};

const sanitizeCreateCustomerBillingPortalLinkRequest =
  getRequestBodySanitizer<"/subscriptions/customer-portal">({
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
