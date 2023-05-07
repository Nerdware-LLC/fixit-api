import { stripe } from "@lib/stripe";
import { catchAsyncMW, type APIRequestWithAuthenticatedUserData } from "@utils";

// req.originalUrl = "/api/connect/dashboard-link"
export const createDashboardLink = catchAsyncMW<APIRequestWithAuthenticatedUserData>(
  async (req, res) => {
    // This link is used for sending user to their Stripe dashboard
    const stripeLink = await stripe.accounts.createLoginLink(req._user.stripeConnectAccount.id);

    res.json({ stripeLink: stripeLink.url });
  }
);

/* EXAMPLE ACCOUNT LOGIN LINK RESPONSE OBJ

  {
    "object": "login_link",
    "created": 1495580507,
    "url": "https://stripe.com/express/Ln7FfnNpUcCU"
  }

*/
