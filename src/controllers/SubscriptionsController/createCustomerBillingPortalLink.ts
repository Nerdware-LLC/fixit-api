import { ApiController } from "@/controllers/ApiController.js";
import { returnUrlReqBodySchema } from "@/controllers/ConnectController/createAccountLink";
import { AccountService } from "@/services/AccountService";
import { AuthService } from "@/services/AuthService";

/**
 * This controller returns a Stripe Customer Portal link, which allows the User to
 * manage their subscription and payment methods.
 *
 * > Endpoint: `POST /api/subscriptions/customer-portal`
 */
export const createCustomerBillingPortalLink = ApiController<"/subscriptions/customer-portal">(
  // Req body schema:
  returnUrlReqBodySchema,
  // Controller logic:
  async (req, res) => {
    // Validate and decode the AuthToken from the 'Authorization' header:
    const authenticatedUser = await AuthService.authenticateUser.viaAuthHeaderToken(req);

    // Get the provided `returnURL`:
    const { returnURL } = req.body;

    // Get the Stripe link:
    const { url: stripeLink } = await AccountService.createCustomerBillingPortalLink({
      authenticatedUser,
      returnURL,
    });

    // Send response:
    res.status(201).json({ stripeLink });
  }
);
