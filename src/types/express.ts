import type { UserItem } from "@/models/User/User.js";
import type { UserSubscriptionItem } from "@/models/UserSubscription/index.js";
import type { FixitApiAuthTokenPayload } from "@/utils/AuthToken.js";
import type { AllRestApiResponses } from "./open-api.js";

/**
 * This type contains every Express `res.locals` field used by internal REST middleware.
 */
export type RestApiLocals = {
  // LOCALS WHICH STORE DATA FOR DOWNSTREAM MIDDLEWARE:

  /** An AuthToken payload object from an authenticated request's auth token. */
  authenticatedUser?: FixitApiAuthTokenPayload | undefined;
  /** A User object from the database. */
  user?: UserItem | undefined;
  /** A UserSubscription object from the database (e.g., for sub-updating mw). */
  userSubscription?: UserSubscriptionItem | undefined;

  // LOCALS ASSOCIATED WITH A RESPONSE OBJECT:

  /** A stringified and encoded Fixit API {@link AuthToken}. */
  authToken?: AllRestApiResponses["token"] | undefined;
  /** A Stripe Customer dashboard link, or Stripe Connect Account flow link. */
  stripeLink?: AllRestApiResponses["stripeLink"] | undefined;
  /** A promo code's validity and discount percentage (if valid/applicable). */
  promoCodeInfo?: AllRestApiResponses["promoCodeInfo"] | undefined;
  /** A User's pre-fetched WorkOrders, Invoices, and Contacts (used on logins). */
  userItems?: AllRestApiResponses["userItems"] | undefined;
  /** An object containing checkout-completion info. */
  checkoutCompletionInfo?: AllRestApiResponses["checkoutCompletionInfo"] | undefined;
};
