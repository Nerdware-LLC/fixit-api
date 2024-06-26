import { promoCodesCache } from "@/lib/cache/promoCodesCache.js";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { UserInputError } from "@/utils/httpErrors.js";
import {
  UserSubscription,
  type UserSubscriptionItem,
  type SubscriptionPriceLabels,
} from "./UserSubscription.js";
import type { StripeSubscriptionWithClientSecret } from "@/lib/stripe/types.js";
import type { UserItem } from "@/models/User/User.js";
import type Stripe from "stripe";

/**
 * `upsertOne`
 *
 * **priceID** can be explicitly provided, or it can be looked up if a valid name key is
 * provided ("TRIAL", "MONTHLY", or "ANNUAL") to the **selectedSubscription** property.
 */
export const upsertOne = async function (
  this: typeof UserSubscription,
  {
    user: { id: userID, stripeCustomerID },
    selectedSubscription,
    priceID,
    promoCode,
  }: {
    user: Pick<UserItem, "id" | "stripeCustomerID">;
    selectedSubscription?: SubscriptionPriceLabels;
    priceID?: string | undefined;
    promoCode?: string | undefined;
  }
): Promise<Stripe.Response<StripeSubscriptionWithClientSecret> & UserSubscriptionItem> {
  // Ascertain the subscription's Stripe price ID
  if (!priceID && !!selectedSubscription) {
    priceID = UserSubscription.PRICE_IDS[selectedSubscription];
  }

  if (!priceID) throw new UserInputError("Invalid subscription");

  // Ascertain the subscription's Stripe promoCode ID if applicable
  const promoCodeID = promoCodesCache.get(promoCode ?? "")?.id;

  // Submit info to Stripe API for new subscription
  const stripeSubObject = (await stripe.subscriptions.create({
    customer: stripeCustomerID,
    items: [{ price: priceID }],
    ...(promoCodeID && { promotion_code: promoCodeID }),
    ...(selectedSubscription === "TRIAL" && { trial_period_days: 14 }),
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent", "customer"],
  })) as Stripe.Response<StripeSubscriptionWithClientSecret>;

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
