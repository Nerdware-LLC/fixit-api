import type Stripe from "stripe";
import { stripe } from "@lib/stripe";
import type { Model } from "@lib/dynamoDB";
import type { UserType } from "@models/User/types";
import { UserInputError } from "@utils/customErrors";
import { UserSubscription } from "./UserSubscription";
import type { UserSubscriptionType } from "./types";

/**
 * `upsertOne`
 *
 * **priceID** can be explicitly provided, or it can be looked up if
 * a valid name key is provided ("TRIAL", "MONTHLY", or "ANNUAL") to
 * the **selectedSubscription** property.
 */
export const upsertOne = async function (
  this: InstanceType<typeof Model>,
  {
    user: { id: userID, stripeCustomerID },
    selectedSubscription = "", // empty string to prevent lookup errors when missing
    priceID,
    promoCode
  }: {
    user: { id: UserType["id"]; stripeCustomerID: UserType["stripeCustomerID"] };
    selectedSubscription?: keyof typeof UserSubscription.PRICE_IDS | "";
    priceID?: typeof UserSubscription.PRICE_IDS[keyof typeof UserSubscription.PRICE_IDS];
    promoCode?: keyof typeof UserSubscription.PROMO_CODES;
  }
) {
  // Ascertain the subscription's Stripe price ID
  if (!priceID) {
    // prettier-ignore
    priceID = UserSubscription.PRICE_IDS?.[selectedSubscription as keyof typeof UserSubscription.PRICE_IDS];
  }

  if (!priceID) throw new UserInputError("Invalid subscription");

  // Ascertain the subscription's Stripe promoCode ID if applicable
  const promoCodeID = UserSubscription.PROMO_CODES?.[promoCode ?? ""];

  // Submit info to Stripe API for new subscription
  const stripeSubObject = await stripe.subscriptions.create({
    customer: stripeCustomerID,
    items: [{ price: priceID }],
    expand: ["latest_invoice.payment_intent", "customer"],
    ...(promoCodeID && { promotion_code: promoCodeID }),
    ...(selectedSubscription === "TRIAL" && { trial_period_days: 14 })
  });

  // Get the fields needed from the returned object
  // prettier-ignore
  const { createdAt, currentPeriodEnd, productID } = UserSubscription.normalizeStripeFields(stripeSubObject);

  const userSubscription = {
    userID,
    id: stripeSubObject.id,
    currentPeriodEnd,
    productID,
    priceID,
    status: stripeSubObject.status,
    createdAt
  };

  // Upsert the sub info to ensure db is up to date and prevent duplicate user subs.
  const { updatedAt } = await UserSubscription.upsertItem(userSubscription);

  // Return both the API UserSub object and the Stripe response object
  return {
    ...stripeSubObject,
    ...userSubscription,
    updatedAt
  } as Stripe.Response<Stripe.Subscription> & UserSubscriptionType;
};
