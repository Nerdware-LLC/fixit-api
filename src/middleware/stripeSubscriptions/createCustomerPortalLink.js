import { stripe } from "@lib/stripe";
import { ENV } from "@server/env";
import { catchAsyncMW } from "@utils/middlewareWrappers";

// req.originalUrl = "/subscriptions/customer-portal"
export const createCustomerPortalLink = catchAsyncMW(async (req, res) => {
  const stripeLink = await stripe.billingPortal.sessions.create({
    customer: req._user.stripeCustomerID,
    return_url: `${ENV.CONFIG.SELF_URI}/customer-portal`
  });

  res.json({ stripeLink });
});
