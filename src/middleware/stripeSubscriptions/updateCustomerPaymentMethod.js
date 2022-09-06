import { stripe } from "@lib/stripe";
import { catchAsyncMW, logger, PaymentRequiredError } from "@utils";

// prettier-ignore
export const updateCustomerPaymentMethod = catchAsyncMW(async (req, res, next) => {
  try {
    const {
      body: { paymentMethodID },
      _user: { stripeCustomerID }
    } = req;

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodID, {
      customer: stripeCustomerID
    });

    // Change the default invoice settings on the customer to the new payment method
    const { subscriptions } = await stripe.customers.update(stripeCustomerID, {
      invoice_settings: { default_payment_method: paymentMethodID },
      expand: ["subscriptions.data.latest_invoice.payment_intent"]
    });

    /* Since Stripe returns an up to date list of the user's "subscriptions", the
    list var gets attached to the req object here so the next middleware function
    (findOrCreateStripeSubscription) doesn't have to make an additional call to the
    Stripe API (it uses the subs to discern whether or not the user has a current
    valid/unexpired sub, and creates a new one if not).                        */
    if ((subscriptions?.data?.length ?? 0) >= 1) {
      req._stripeCustomerSubscriptions = subscriptions.data;
    }

    next();
  } catch (error) {
    logger.stripe(error, "updateCustomerPaymentMethod");
    // re-throw to format error with 402 status
    throw new PaymentRequiredError(error.message);
  }
});
