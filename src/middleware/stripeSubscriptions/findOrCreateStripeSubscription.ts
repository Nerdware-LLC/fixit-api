import { stripe } from "@/lib/stripe";
import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import { UserSubscription, type UserSubscriptionPriceLabels } from "@/models/UserSubscription";
import { logger, getTypeSafeError, PaymentRequiredError } from "@/utils";

/**
 * `req.originalUrl = "/api/subscriptions/submit-payment"`
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
