import { sanitizeURL, isValidURL } from "@nerdware/ts-string-helpers";
import { z as zod } from "zod";
import { ApiController } from "@/controllers/ApiController.js";
import { AccountService } from "@/services/AccountService";
import { AuthService } from "@/services/AuthService";

/**
 * This schema defines a `req.body` object with a required `returnURL` string property.
 */
export const returnUrlReqBodySchema = zod
  .object({
    returnURL: zod.string().transform(sanitizeURL).refine(isValidURL),
  })
  .strict();

/**
 * This controller returns a Stripe ConnectAccount link for an authenticated user.
 *
 * > Endpoint: `POST /api/connect/account-link`
 */
export const createAccountLink = ApiController<"/connect/account-link">(
  // Req body schema:
  returnUrlReqBodySchema,
  // Controller logic:
  async (req, res) => {
    // Validate and decode the AuthToken from the 'Authorization' header:
    const authenticatedUser = await AuthService.authenticateUser.viaAuthHeaderToken(req);

    // Get the provided `returnURL`:
    const { returnURL } = req.body;

    // Get the Stripe AccountLink:
    const { url: stripeLink } = await AccountService.createStripeConnectAccountLink({
      authenticatedUser,
      returnURL,
    });

    // Send response:
    res.status(201).json({ stripeLink });
  }
);
