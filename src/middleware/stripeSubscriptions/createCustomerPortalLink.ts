import { stripe } from "@/lib/stripe";
import { mwAsyncCatchWrapper } from "@/middleware/helpers";

/**
 * This middleware creates a Stripe Customer Portal link, which allows the User to
 * manage their subscription and payment methods.
 */
export const createCustomerPortalLink = mwAsyncCatchWrapper<{ body: { returnURL: string } }>(
  async (req, res, next) => {
    if (!req?._authenticatedUser) return next("User not found");

    const stripeLink = await stripe.billingPortal.sessions.create({
      customer: req._authenticatedUser.stripeCustomerID,
      return_url: req.body.returnURL,
    });

    res.json({ stripeLink: stripeLink.url });
  }
);
