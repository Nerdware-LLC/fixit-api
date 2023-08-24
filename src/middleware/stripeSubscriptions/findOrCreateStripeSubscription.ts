import { stripe } from "@/lib/stripe";
import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import { UserSubscription, type UserSubscriptionPriceLabels } from "@/models/UserSubscription";
import { logger, getTypeSafeError, PaymentRequiredError } from "@/utils";

/**
 * This middleware serves as the primary endpoint for the checkout/payment process.
 * If the supplied payment details result in a successful payment, the User's auth
 * token payload is updated with the new subscription details. Otherwise, the request
 * results in a 402 Payment Required error.
 *
 * After checking to make sure the User is authenticated, the Stripe API is used to
 * attach the provided payment method to the customer and set it as their default
 * payment method. The User may already have one ore more subscriptions (e.g., if
 * they previously created a sub but didn't complete the payment process for it),
 * in which case the array of subscriptions returned from Stripe is searched for a
 * subscription that _**is not expired**_.
 *
 * If a non-expired subscription _**is not**_ found, one is upserted into the db.
 * Note that `upsert` is used because a sub may already exist in the db, but it may
 * be _**expired**_, in which case it's desirable to simply overwrite it so the db
 * isn't populated with dangling sub items that will never be used.
 *
 * Once a valid, non-expired subscription has been obtained (either from Stripe or
 * the `upsert` operation), the `status` of the `payment_intent` on the sub's latest
 * invoice is checked - any value other than "succeeded" results in a 402 Payment
 * Required error. If the status is "succeeded", the User's auth token payload is
 * updated with the new subscription details - they're now able to use Fixit SaaS!
 */
export const findOrCreateStripeSubscription = mwAsyncCatchWrapper<{
  body: {
    paymentMethodID: string;
    selectedSubscription: UserSubscriptionPriceLabels;
    promoCode?: string | null | undefined;
  };
}>(async (req, res, next) => {
  if (!req?._authenticatedUser) return next("User not found");

  try {
    const {
      body: { paymentMethodID, selectedSubscription, promoCode },
      _authenticatedUser,
    } = req;

    // FIRST, UPDATE CUSTOMER PAYMENT METHOD

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodID, {
      customer: _authenticatedUser.stripeCustomerID,
    });

    // Change the default invoice settings on the customer to the new payment method.
    const { subscriptions } = await stripe.customers.update(_authenticatedUser.stripeCustomerID, {
      invoice_settings: { default_payment_method: paymentMethodID },
      expand: ["subscriptions.data.latest_invoice.payment_intent"],
    });

    // See if there's an existing non-expired subscription
    const nonExpiredSubscription =
      !!subscriptions && (subscriptions?.data?.length ?? 0) >= 1
        ? subscriptions.data.find(
            (sub) => sub?.id.startsWith("sub") && sub?.status !== "incomplete_expired"
          )
        : null;

    // If the User already has a valid sub, obtain the values we need from that one, else upsert one.
    const {
      id: subID,
      currentPeriodEnd,
      status,
      latest_invoice,
    } = nonExpiredSubscription
      ? UserSubscription.normalizeStripeFields(nonExpiredSubscription)
      : await UserSubscription.upsertOne({
          user: _authenticatedUser,
          selectedSubscription,
          promoCode: promoCode ?? undefined,
        });

    // See if their latest payment succeeded, or was declined.
    if (
      typeof latest_invoice !== "object" ||
      typeof latest_invoice?.payment_intent !== "object" ||
      latest_invoice.payment_intent?.status !== "succeeded"
    ) {
      throw new Error("Your card was declined.");
    }

    req._authenticatedUser.subscription = {
      id: subID,
      currentPeriodEnd,
      status,
    };

    // If an error occurs, ensure the 402 status code is provided.
  } catch (err: unknown) {
    const error = getTypeSafeError(err);
    logger.stripe(error, "findOrCreateStripeSubscription");
    throw new PaymentRequiredError(error.message);
  }

  next();
});
