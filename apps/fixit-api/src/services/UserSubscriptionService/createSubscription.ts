import { promoCodesCache } from "@/lib/cache/promoCodesCache.js";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { UserSubscription, type UserSubscriptionItem } from "@/models/UserSubscription";
import { SUBSCRIPTION_PRICE_NAMES as SUB_PRICE_NAMES } from "@/models/UserSubscription/enumConstants.js";
import { UserInputError } from "@/utils/httpErrors.js";
import { normalizeStripeFields } from "./normalizeStripeFields.js";
import type { StripeSubscriptionWithClientSecret } from "@/lib/stripe/types.js";
import type { UserItem } from "@/models/User";
import type { SubscriptionPriceName } from "@/types/graphql.js";
import type Stripe from "stripe";

/**
 * `UserSubscriptionService`.{@link createSubscription} params
 */
export type CreateSubscriptionParams = {
  user: Pick<UserItem, "id" | "stripeCustomerID">;
  selectedSubscription: SubscriptionPriceName;
  promoCode?: string | undefined;
};

/**
 * Creates a new {@link Stripe.Subscription|Subscription} via Stripe for the
 * provided user, and upserts the subscription info to the database.
 */
export const createSubscription = async ({
  user: { id: userID, stripeCustomerID },
  selectedSubscription,
  promoCode,
}: CreateSubscriptionParams): Promise<{
  userSubscription: UserSubscriptionItem;
  stripeSubscriptionObject: Stripe.Response<StripeSubscriptionWithClientSecret>;
}> => {
  // Ascertain the subscription's Stripe price ID
  const priceID = UserSubscription.PRICE_IDS[selectedSubscription];
  // Sanity check - ensure a priceID exists for the selected subscription
  if (!priceID) throw new UserInputError("Invalid subscription");

  // Ascertain the subscription's Stripe promoCode ID if applicable
  const promoCodeID = promoCodesCache.get(promoCode ?? "")?.id;

  // Submit info to Stripe API for new subscription
  const stripeSubObject = (await stripe.subscriptions.create({
    customer: stripeCustomerID,
    items: [{ price: priceID }],
    ...(promoCodeID && { promotion_code: promoCodeID }),
    ...(selectedSubscription === SUB_PRICE_NAMES.TRIAL && { trial_period_days: 14 }),
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent", "customer"],
  })) as Stripe.Response<StripeSubscriptionWithClientSecret>;

  // Get the fields needed from the returned object
  const { createdAt, currentPeriodEnd, productID } = normalizeStripeFields(stripeSubObject);

  // Upsert the sub info to ensure db is up to date and prevent duplicate user subs.
  const userSubscription = await UserSubscription.upsertItem({
    userID,
    id: stripeSubObject.id,
    currentPeriodEnd,
    productID,
    priceID,
    status: stripeSubObject.status,
    createdAt,
  });

  // Return both the API UserSub object and the Stripe response object
  return {
    userSubscription,
    stripeSubscriptionObject: stripeSubObject,
  };
};
