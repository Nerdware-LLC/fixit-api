import { ENV } from "@server/env";

const {
  FIXIT_SUBSCRIPTION: { productID, priceIDs, promoCodes }
} = ENV.STRIPE.BILLING;

export class UserSubscriptionEnums {
  static PRODUCT_IDS = Object.freeze({ FIXIT_SUBSCRIPTION: productID });
  static PRICE_IDS = priceIDs;
  static PROMO_CODES = promoCodes;
}
