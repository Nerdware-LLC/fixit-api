import { stripe } from "@lib/stripe";
import { UserInputError } from "@utils/httpErrors";
import {
  UserSubscription,
  type UserSubscriptionModelItem,
  type UserSubscriptionPriceLabels,
} from "./UserSubscription";
import type { UserModelItem } from "@models/User";
import type Stripe from "stripe";

/**
 * `upsertOne`
 *
 * **priceID** can be explicitly provided, or it can be looked up if
 * a valid name key is provided ("TRIAL", "MONTHLY", or "ANNUAL") to
 * the **selectedSubscription** property.
 */
export const upsertOne = async function (
  this: typeof UserSubscription,
  {
    user: { id: userID, stripeCustomerID },
    selectedSubscription,
    priceID,
    promoCode,
  }: {
    user: Pick<UserModelItem, "id" | "stripeCustomerID">;
    selectedSubscription?: UserSubscriptionPriceLabels;
    priceID?: string;
    promoCode?: string;
  }
): Promise<Stripe.Response<Stripe.Subscription> & UserSubscriptionModelItem> {
  // Ascertain the subscription's Stripe price ID
  if (!priceID && !!selectedSubscription)
    priceID = UserSubscription.PRICE_IDS[selectedSubscription];

  if (!priceID) throw new UserInputError("Invalid subscription");

  // Ascertain the subscription's Stripe promoCode ID if applicable
  const promoCodeID = UserSubscription.PROMO_CODES?.[promoCode ?? ""];

  // Submit info to Stripe API for new subscription
  const stripeSubObject = await stripe.subscriptions.create({
    customer: stripeCustomerID,
    items: [{ price: priceID }],
    expand: ["latest_invoice.payment_intent", "customer"],
    ...(promoCodeID && { promotion_code: promoCodeID }),
    ...(selectedSubscription === "TRIAL" && { trial_period_days: 14 }),
  });

  // Get the fields needed from the returned object
  const { createdAt, currentPeriodEnd, productID } =
    UserSubscription.normalizeStripeFields(stripeSubObject);

  const userSubscription = {
    userID,
    sk: UserSubscription.getFormattedSK(userID, createdAt),
    id: stripeSubObject.id,
    currentPeriodEnd,
    productID,
    priceID,
    status: stripeSubObject.status,
    createdAt,
  };

  // Upsert the sub info to ensure db is up to date and prevent duplicate user subs.
  const { updatedAt } = await UserSubscription.upsertItem(userSubscription);

  // Return both the API UserSub object and the Stripe response object
  return {
    ...stripeSubObject,
    ...userSubscription,
    updatedAt,
  };
};
