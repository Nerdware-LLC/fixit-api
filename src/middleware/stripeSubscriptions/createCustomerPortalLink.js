import { stripe } from "@lib/stripe";
import { ENV } from "@server/env";
import { catchAsyncMW } from "@utils/middlewareWrappers";

const RETURN_URL = `${ENV.CONFIG.SELF_URI}${ENV.STRIPE.CUSTOMER_PORTAL_REDIRECT_ROUTE}`;

// req.originalUrl = "/subscriptions/customer-portal"
export const createCustomerPortalLink = catchAsyncMW(async (req, res) => {
  const stripeLink = await stripe.billingPortal.sessions.create({
    customer: req._user.stripeCustomerID,
    return_url: RETURN_URL
  });

  res.json({ stripeLink });
});
