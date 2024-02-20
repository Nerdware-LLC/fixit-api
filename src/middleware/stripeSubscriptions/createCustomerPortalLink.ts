import { stripe } from "@/lib/stripe";
import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import type { RestApiRequestBodyByPath } from "@/types/open-api";

/**
 * This middleware creates a Stripe Customer Portal link, which allows the User to
 * manage their subscription and payment methods.
 */
export const createCustomerPortalLink = mwAsyncCatchWrapper<
  RestApiRequestBodyByPath["/subscriptions/customer-portal"]
>(async (req, res, next) => {
  if (!res.locals?.authenticatedUser) return next("User not found");

  const stripeLink = await stripe.billingPortal.sessions.create({
    customer: res.locals.authenticatedUser.stripeCustomerID,
    return_url: req.body.returnURL,
  });

  res.json({ stripeLink: stripeLink.url });
});
