import { isString, getTypeSafeError } from "@nerdware/ts-type-safety-utils";
import { eventEmitter } from "@/events/eventEmitter.js";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { SUBSCRIPTION_PRICE_NAMES as SUB_PRICE_NAMES } from "@/models/UserSubscription/enumConstants.js";
import { UserSubscriptionService } from "@/services/UserSubscriptionService";
import { PaymentRequiredError } from "@/utils/httpErrors.js";
import { logger } from "@/utils/logger.js";
import type {
  StripeSubscriptionWithClientSecret,
  StripeCustomerWithClientSecret,
} from "@/lib/stripe/types.js";
import type { UserSubscriptionItem } from "@/models/UserSubscription";
import type { CreateSubscriptionParams } from "@/services/UserSubscriptionService/createSubscription.js";
import type { CheckoutCompletionInfo, AuthTokenPayload } from "@/types/open-api.js";
import type Stripe from "stripe";
import type { Simplify, OverrideProperties, SetOptional } from "type-fest";

/**
 * `UserSubscriptionService`.{@link processCheckoutPayment} params
 */
export type ProcessCheckoutPaymentParams = Simplify<
  {
    paymentMethodID: string;
    request: { ip: string; userAgent: string };
  } & OverrideProperties<CreateSubscriptionParams, { user: AuthTokenPayload }>
>;

export type CheckoutFlowSubscriptionFields = SetOptional<
  UserSubscriptionItem,
  "sk" | "createdAt" | "updatedAt"
>;

/**
 * This function processes checkout payments. If the supplied payment details result
 * in a successful payment, or if additional user input is required to confirm the
 * payment (e.g., for [3D-Secure/SCA][3ds-info]), this function returns an object
 * containing {@link CheckoutCompletionInfo}, as well as `subscription` data. If a
 * non-zero amount is owed (TRIAL/PROMO_CODE) and the payment-intent fails, the
 * function throws a 402 Payment Required error.
 *
 * The Stripe API is used to attach the provided payment function to the user/customer
 * and set it as their default payment function. The User may already have one ore more
 * subscriptions (e.g., if they previously created a subscription but didn't complete
 * the payment process for it), in which case the array of subscriptions returned from
 * Stripe is searched for a subscription that _**is not expired**_.
 *
 * If a non-expired subscription _**is not**_ found, one is upserted into the db.
 * Note that `upsert` is used because a sub may already exist in the db, but it may be
 * _**expired**_, in which case it's desirable to simply overwrite it so the db isn't
 * populated with dangling sub items that will never be used.
 *
 * Once a valid, non-expired subscription has been obtained (either from Stripe or the
 * `upsert` operation), the `status` of the `payment_intent` on the sub's latest invoice
 * is checked — any value other than "succeeded" results in a 402 Payment Required error.
 * If the status is "succeeded", the checkout/payment succeeded.
 *
 * [3ds-info]: https://stripe.com/docs/payments/3d-secure
 */
export const processCheckoutPayment = async (
  {
    user,
    paymentMethodID,
    selectedSubscription,
    promoCode,
    request
  }: ProcessCheckoutPaymentParams // prettier-ignore
): Promise<{
  checkoutCompletionInfo: NonNullable<CheckoutCompletionInfo>;
  subscription: CheckoutFlowSubscriptionFields;
}> => {
  // Vars to hold the returned values:
  let checkoutCompletionInfo: NonNullable<CheckoutCompletionInfo>;
  let subscription: CheckoutFlowSubscriptionFields;
  // Var to hold intermediary values:
  let latestInvoice: StripeSubscriptionWithClientSecret["latest_invoice"];
  let amountPaid: number;

  try {
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodID, { customer: user.stripeCustomerID });

    // Change the default invoice settings on the customer to the new payment method
    const { subscriptions } = (await stripe.customers.update(user.stripeCustomerID, {
      invoice_settings: { default_payment_method: paymentMethodID },
      expand: ["subscriptions.data.latest_invoice.payment_intent"],
    })) as Stripe.Response<StripeCustomerWithClientSecret>;

    let nonExpiredSubscription: StripeSubscriptionWithClientSecret | undefined;

    // See if there's an existing non-expired subscription
    if (subscriptions.data.length >= 1) {
      nonExpiredSubscription = subscriptions.data.find(
        (sub) => sub.id.startsWith("sub") && sub.status !== "incomplete_expired"
      );
    }

    // If the User already has a valid sub, obtain the values we need from that one:
    // prettier-ignore
    if (nonExpiredSubscription) {
      // Normalize and destruct the nonExpiredSubscription object
      const { latest_invoice, id, currentPeriodEnd, status, productID, priceID, createdAt } =
        UserSubscriptionService.normalizeStripeFields(nonExpiredSubscription);

      // Update the subscription and latestInvoice objects
      subscription = { userID: user.id, id, currentPeriodEnd, status, productID, priceID, createdAt };
      latestInvoice = latest_invoice;
    } else {
      // If the User does not have a valid sub, create one:
      const { userSubscription, stripeSubscriptionObject } =
        await UserSubscriptionService.createSubscription({ user, selectedSubscription, promoCode });

      // Update the subscription and latestInvoice objects
      subscription = userSubscription;
      latestInvoice = stripeSubscriptionObject.latest_invoice;
    }

    /* HANDLE TRIAL/PROMO_CODE
    The `latest_invoice` will not have a `payment_intent.id` in checkout situations
    which don't involve an immediate payment — i.e., if the user selected a TRIAL,
    or provided a VIP `promoCode` which grants them 100% off at checkout. */
    if (!latestInvoice.payment_intent?.id) {
      /* Just to be sure the sub/payment are in the expected state, assertions are
      made regarding the expected TRIAL/PROMO_CODE. If neither conditions apply,
      Stripe should have provided `payment_intent.id`, so an error is thrown. */
      const isTrialSub =
        selectedSubscription === SUB_PRICE_NAMES.TRIAL && subscription.status === "trialing";
      const wasVipPromoCodeApplied =
        !!promoCode && latestInvoice.discount?.coupon.percent_off === 100;

      if (!isTrialSub && !wasVipPromoCodeApplied)
        throw new Error("Stripe Error: Failed to retrieve payment details");

      // Update checkoutCompletionInfo:
      checkoutCompletionInfo = {
        isCheckoutComplete: latestInvoice.paid === true,
        // Note: for TRIAL/PROMO_CODE subs, `latest_invoice.paid` should be `true` here
      };

      // Set `amountPaid` to the amount received by the payment intent
      amountPaid = latestInvoice.payment_intent?.amount_received ?? 0;
    } else {
      // Confirm intent with collected payment method
      const {
        status: paymentStatus,
        client_secret: clientSecret,
        invoice,
        amount_received,
      } = (await stripe.paymentIntents.confirm(latestInvoice.payment_intent.id, {
        payment_method: paymentMethodID,
        mandate_data: {
          customer_acceptance: {
            type: "online",
            online: {
              ip_address: request.ip,
              user_agent: request.userAgent,
            },
          },
        },
        expand: ["invoice"], // expand to get `invoice.paid`
      })) as Stripe.Response<OverrideProperties<Stripe.PaymentIntent, { invoice: Stripe.Invoice }>>;

      // Sanity-check: ensure the paymentStatus and clientSecret are strings
      if (!isString(paymentStatus) || !isString(clientSecret))
        throw new Error("Stripe Error: payment confirmation failed.");

      const isCheckoutComplete =
        ["succeeded", "requires_action"].includes(paymentStatus) && invoice.paid === true;

      if (!isCheckoutComplete) throw new Error("Your payment was declined.");

      // Update checkoutCompletionInfo:
      checkoutCompletionInfo = {
        isCheckoutComplete,
        ...(clientSecret && { clientSecret }),
      };

      // Update the amountPaid value:
      amountPaid = amount_received;
    }

    // Check the sub's status
    const { status: subStatusAfterPayment } = await stripe.subscriptions.retrieve(subscription.id);

    // Update the `CheckoutFlowSubscriptionFields` object with the new sub details:
    subscription.status = subStatusAfterPayment;

    // If an error occurs, ensure the 402 status code is provided.
  } catch (err: unknown) {
    const error = getTypeSafeError(err);
    logger.stripe(error, "processCheckoutPayment");
    throw new PaymentRequiredError(error.message);
  }

  // Emit the CheckoutCompleted event with payment details:
  eventEmitter.emitCheckoutCompleted({
    user,
    priceName: selectedSubscription,
    paymentIntentID: latestInvoice.payment_intent?.id,
    amountPaid,
  });

  return {
    checkoutCompletionInfo,
    subscription,
  };
};
