import type Stripe from "stripe";
import { stripe } from "@lib/stripe";
import { UserSubscription, UserSubscriptionType, type UserType } from "@models";
import { catchAsyncMW, logger, getTypeSafeErr, PaymentRequiredError } from "@utils";

// req.originalUrl = "/subscriptions/submit-payment"

export const findOrCreateStripeSubscription = catchAsyncMW(async (req, res, next) => {
  try {
    const {
      body: { paymentMethodID, selectedSubscription, promoCode },
      _user
    } = req as {
      body: UpdateCustomerPaymentMethodReqBody;
      _user: UserType;
    };

    // FIRST, UPDATE CUSTOMER PAYMENT METHOD

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodID, {
      customer: _user.stripeCustomerID
    });

    // Change the default invoice settings on the customer to the new payment method.
    const { subscriptions } = await stripe.customers.update(_user.stripeCustomerID, {
      invoice_settings: { default_payment_method: paymentMethodID },
      expand: ["subscriptions.data.latest_invoice.payment_intent"]
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
      productID,
      priceID,
      status,
      latest_invoice
    } = !!nonExpiredSubscription
      ? UserSubscription.normalizeStripeFields(nonExpiredSubscription)
      : await UserSubscription.upsertOne({
          user: _user,
          selectedSubscription,
          promoCode
        });

    // See if their latest payment succeeded, or was declined.
    // prettier-ignore
    if (((latest_invoice as Stripe.Invoice)?.payment_intent as Stripe.PaymentIntent)?.status !== "succeeded") {
      throw new Error("Your card was declined.");
    }

    (req._user as UserType).subscription = {
      id: subID,
      currentPeriodEnd,
      productID,
      priceID,
      status
    } as UserSubscriptionType;

    // If an error occurs, ensure the 402 status code is provided.
  } catch (err: ErrorLike) {
    const error = getTypeSafeErr(err);
    logger.stripe(error, "updateCustomerPaymentMethod");
    throw new PaymentRequiredError(error.message);
  }

  next();
});

interface UpdateCustomerPaymentMethodReqBody {
  paymentMethodID: string;
  selectedSubscription: keyof typeof UserSubscription.PRICE_IDS;
  promoCode?: keyof typeof UserSubscription.PROMO_CODES;
}
