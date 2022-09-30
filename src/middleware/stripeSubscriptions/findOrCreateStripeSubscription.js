import { stripe } from "@lib/stripe";
import { UserSubscription } from "@models";
import { catchAsyncMW, ClientInputError, PaymentRequiredError } from "@utils";

// req.originalUrl = "/subscriptions/submit-payment"

export const findOrCreateStripeSubscription = catchAsyncMW(async (req, res, next) => {
  const { body, _user, _stripeCustomerSubscriptions } = req;

  let currentSubscription;

  // See if user already has a subscription that's not expired
  const nonExpiredSubscription =
    (_stripeCustomerSubscriptions?.length ?? 0) >= 1
      ? _stripeCustomerSubscriptions.find(
          (sub) => sub?.id.startsWith("sub") && sub?.status !== "incomplete_expired"
        )
      : null;

  if (nonExpiredSubscription) {
    // If so, use the non-expired subscription as the "current" subscription to test
    currentSubscription = UserSubscription.normalizeStripeFields(nonExpiredSubscription);
  } else {
    /* If the user doesn't have a valid subscription, validate req.body
    inputs and create a new subscription with the provided values.   */
    const priceID = UserSubscription.PRICE_IDS?.[body.selectedSubscription];
    if (!priceID) throw new ClientInputError("Invalid subscription");

    const promoCodeID = UserSubscription.PROMO_CODES?.[body?.promoCode];
    const isTrialSub = body.selectedSubscription === "TRIAL";

    // Submit info to Stripe API for new subscription
    const createSubResult = await stripe.subscriptions.create({
      customer: _user.stripeCustomerID,
      items: [{ price: priceID }],
      expand: ["latest_invoice.payment_intent", "customer"],
      ...(promoCodeID && { promotion_code: promoCodeID }),
      ...(isTrialSub && { trial_period_days: 14 })
    });

    // Use the returned result as the "current" subscription to test
    currentSubscription = UserSubscription.normalizeStripeFields(createSubResult);

    // Upsert the sub info to ensure db is up to date and prevent duplicate user subs
    await UserSubscription.updateItem(
      {
        userID: _user.id,
        sk: `SUBSCRIPTION#${_user.id}#${currentSubscription.createdAt}`
      },
      {
        id: currentSubscription.id,
        currentPeriodEnd: currentSubscription.currentPeriodEnd,
        productID: currentSubscription.productID,
        priceID: currentSubscription.priceID,
        status: currentSubscription.status,
        createdAt: currentSubscription.createdAt
      }
    );
  }

  // Destructure currentSubscription
  const {
    id: subID,
    currentPeriodEnd,
    productID,
    priceID,
    status,
    latest_invoice
  } = currentSubscription;

  // See if their latest payment succeeded
  const isSubStatusAcceptable = ["active", "trialing"].includes(status);
  const wasPaymentDeclined =
    !isSubStatusAcceptable && latest_invoice.payment_intent.status !== "succeeded";

  if (wasPaymentDeclined) {
    throw new PaymentRequiredError("Your card was declined.");
  } else {
    req._user.subscription = {
      id: subID,
      currentPeriodEnd,
      productID,
      priceID,
      status
    };
  }

  next();
});
