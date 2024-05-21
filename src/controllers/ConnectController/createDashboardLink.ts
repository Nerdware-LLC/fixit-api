import { getAuthHeaderToken } from "@/controllers/_helpers";
import { AccountService } from "@/services/AccountService";
import { AuthService } from "@/services/AuthService";
import type { ApiController } from "@/controllers/types.js";

/**
 * This controller returns a Stripe customer dashboard link for an authenticated user.
 *
 * > Endpoint: `GET /api/connect/dashboard-link`
 */
// prettier-ignore
export const createDashboardLink: ApiController<"/connect/dashboard-link">
  = async (req, res, next) => {
    try {
      // Get the AuthToken from the request header:
      const authToken = getAuthHeaderToken(req);

      // Validate and decode the AuthToken:
      const authenticatedUser = await AuthService.validateAndDecodeAuthToken(authToken);

      // Get the Stripe customer dashboard link:
      const { url: stripeLink } = await AccountService.createDashboardLink({ authenticatedUser });

      // Send response:
      res.status(201).json({ stripeLink });
    } catch (err) {
      next(err);
    }
  };
