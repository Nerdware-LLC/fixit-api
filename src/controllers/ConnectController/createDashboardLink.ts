import { ApiController } from "@/controllers/ApiController.js";
import { AccountService } from "@/services/AccountService";
import { AuthService } from "@/services/AuthService";

/**
 * This controller returns a Stripe customer dashboard link for an authenticated user.
 *
 * > Endpoint: `GET /api/connect/dashboard-link`
 */
export const createDashboardLink = ApiController<"/connect/dashboard-link">(async (req, res) => {
  // Validate and decode the AuthToken from the request header:
  const authenticatedUser = await AuthService.authenticateUser.viaAuthHeaderToken(req);

  // Get the Stripe customer dashboard link:
  const { url: stripeLink } = await AccountService.createDashboardLink({ authenticatedUser });

  // Send response:
  res.status(201).json({ stripeLink });
});
