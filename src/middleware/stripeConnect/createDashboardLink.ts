import { stripe } from "@lib/stripe";
import { catchAsyncMW, logger, type APIRequestWithAuthenticatedUserData } from "@utils";

// req.originalUrl = "/stripe/connect/dashboard-link"
export const createDashboardLink = catchAsyncMW<APIRequestWithAuthenticatedUserData>(
  async (req, res) => {
    logger.stripe("creating dashboard link...");

    // This link is used for sending user to their Stripe dashboard
    const stripeLink = await stripe.accounts.createLoginLink(req._user.stripeConnectAccount.id);

    res.json({ stripeLink });
  }
);

/* EXAMPLE ACCOUNT LOGIN LINK RESPONSE OBJ

  {
    "object": "login_link",
    "created": 1495580507,
    "url": "https://stripe.com/express/Ln7FfnNpUcCU"
  }

*/
