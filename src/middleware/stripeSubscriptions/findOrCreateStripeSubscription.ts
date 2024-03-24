import { isString, getTypeSafeError } from "@nerdware/ts-type-safety-utils";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { mwAsyncCatchWrapper } from "@/middleware/helpers.js";
import { UserSubscription } from "@/models/UserSubscription/UserSubscription.js";
import { PaymentRequiredError, AuthError } from "@/utils/httpErrors.js";
import { logger } from "@/utils/logger.js";
import type {
  StripeSubscriptionWithClientSecret,
  StripeCustomerWithClientSecret,
} from "@/lib/stripe/types.js";
import type { RestApiRequestBodyByPath } from "@/types/open-api.js";
import type Stripe from "stripe";

/**
 * This middleware serves as the primary endpoint for the checkout/payment process.
 * If the supplied payment details result in a successful payment, or if additional
 * user input is required to confirm the payment (e.g., for [3D-Secure/SCA][3ds-info]),
 * the User is provided with a `checkoutCompletionInfo` object (see the OpenAPI schema),
 * and their auth token payload is updated with the new subscription details. If a
 * non-zero amount is owed (TRIAL/PROMO_CODE) and the payment-intent fails, the request
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
 * invoice is checked — any value other than "succeeded" results in a 402 Payment
 * Required error. If the status is "succeeded", the User's auth token payload is
 * updated with the new subscription details - they're now able to use Fixit SaaS!
 *
 * [3ds-info]: https://stripe.com/docs/payments/3d-secure
 */
export const findOrCreateStripeSubscription = mwAsyncCatchWrapper<
  RestApiRequestBodyByPath["/subscriptions/submit-payment"]
>(async (req, res, next) => {
  if (!res.locals?.authenticatedUser) return next(new AuthError("User not found"));

  try {
    const { paymentMethodID, selectedSubscription, promoCode } = req.body;
    const { authenticatedUser } = res.locals;

    // This will be set if the User already has a valid subscription
    let nonExpiredSubscription: StripeSubscriptionWithClientSecret | null | undefined;

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodID, {
      customer: authenticatedUser.stripeCustomerID,
    });

    // Change the default invoice settings on the customer to the new payment method.
    const { subscriptions } = (await stripe.customers.update(authenticatedUser.stripeCustomerID, {
      invoice_settings: { default_payment_method: paymentMethodID },
      expand: ["subscriptions.data.latest_invoice.payment_intent"],
    })) as Stripe.Response<StripeCustomerWithClientSecret>;

    // See if there's an existing non-expired subscription
    if (!!subscriptions && (subscriptions?.data?.length ?? 0) >= 1) {
      nonExpiredSubscription = subscriptions.data.find(
        (sub) => sub?.id.startsWith("sub") && sub?.status !== "incomplete_expired"
      );
    }

    // If the User already has a valid sub, obtain the values we need from that one, else upsert one.
    const {
      id: subID,
      currentPeriodEnd,
      latest_invoice,
      status: currentSubStatus,
    } = nonExpiredSubscription
      ? UserSubscription.normalizeStripeFields<StripeSubscriptionWithClientSecret>(
          nonExpiredSubscription
        )
      : await UserSubscription.upsertOne({
          user: authenticatedUser,
          selectedSubscription,
          promoCode,
        });

    /* HANDLE TRIAL/PROMO_CODE
    The `latest_invoice` will not have a `payment_intent.id` in checkout situations
    which don't involve an immediate payment — i.e., if the user selected a TRIAL,
    or provided a VIP `promoCode` which grants them 100% off at checkout. */
    if (!latest_invoice?.payment_intent?.id) {
      /* Just to be sure the sub/payment are in the expected state, assertions are
      made regarding the expected TRIAL/PROMO_CODE. If neither conditions apply,
      Stripe should have provided `payment_intent.id`, so an error is thrown. */
      const isTrialSub = selectedSubscription === "TRIAL" && currentSubStatus === "trialing";
      const wasVipPromoCodeApplied =
        !!promoCode && latest_invoice?.discount?.coupon?.percent_off === 100;

      if (!isTrialSub && !wasVipPromoCodeApplied) {
        throw new Error("Stripe Error: Failed to retrieve payment details");
      }

      // For TRIAL/PROMO_CODE subs, `latest_invoice.paid` should be `true` here
      res.locals.checkoutCompletionInfo = {
        isCheckoutComplete: latest_invoice?.paid === true,
      };
    } else {
      // Confirm intent with collected payment method
      const {
        status: paymentStatus,
        client_secret: clientSecret,
        invoice,
      } = await stripe.paymentIntents.confirm(latest_invoice.payment_intent.id, {
        payment_method: paymentMethodID,
        mandate_data: {
          customer_acceptance: {
            type: "online",
            online: {
              ip_address: req.ip!,
              user_agent: req.get("user-agent")!,
            },
          },
        },
        expand: ["invoice"], // expand to get `invoice.paid`
      });

      // Sanity-check: ensure the paymentStatus and clientSecret are strings
      if (!isString(paymentStatus) || !isString(clientSecret)) {
        throw new Error("Stripe Error: payment confirmation failed.");
      }

      const isCheckoutComplete =
        ["succeeded", "requires_action"].includes(paymentStatus) &&
        (invoice as Stripe.Invoice)?.paid === true; // invoice is expanded

      if (!isCheckoutComplete) throw new Error("Your payment was declined.");

      // Update `res.locals.checkoutCompletionInfo`
      res.locals.checkoutCompletionInfo = {
        isCheckoutComplete,
        ...(clientSecret && { clientSecret }),
      };
    }

    // Check the sub's status
    const { status: subStatusAfterPayment } = await stripe.subscriptions.retrieve(subID);

    // Update `res.locals.authenticatedUser` with the new subscription details:
    res.locals.authenticatedUser.subscription = {
      id: subID,
      currentPeriodEnd,
      status: subStatusAfterPayment,
    };

    // If an error occurs, ensure the 402 status code is provided.
  } catch (err: unknown) {
    const error = getTypeSafeError(err);
    logger.stripe(error, "findOrCreateStripeSubscription");
    throw new PaymentRequiredError(error.message);
  }

  next();
});
