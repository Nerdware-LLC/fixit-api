import { isSafeInteger, safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { InternalServerError } from "@/utils/httpErrors.js";
import { Cache } from "./Cache.js";
import type Stripe from "stripe";

export type PromoCodesCacheObject = {
  id: Stripe.PromotionCode["id"];
  discount: NonNullable<Stripe.PromotionCode["coupon"]["percent_off"]>;
};

export type PromoCodesCacheEntry = [Stripe.PromotionCode["code"], PromoCodesCacheObject];

// Initialize the promoCodesCache with all active promo codes:

const { data: activePromoCodes } = await stripe.promotionCodes.list({ active: true });

// Ensure at least 1 active promo code was returned from Stripe:
if (!Array.isArray(activePromoCodes) || activePromoCodes.length === 0) {
  throw new InternalServerError(
    "Unable to initialize promoCodesCache — Stripe did not return any active promo codes."
  );
}

const initialCacheEntries: Array<PromoCodesCacheEntry> = activePromoCodes.map(
  (stripePromoCodeObject) => {
    const { id, code: promoCode, coupon } = stripePromoCodeObject;

    /* The `coupon` object type-def specifies "discount" is a nullable
    float, but this app's promoCodes are all integers. If this is somehow
    not the case in the returned Stripe object(s), throw an error. */
    if (!isSafeInteger(coupon.percent_off)) {
      throw new InternalServerError(
        "Unable to initialize promoCodesCache — Stripe returned a PromoCode object " +
          `with an invalid "percent_off": ${safeJsonStringify(stripePromoCodeObject)}`
      );
    }

    return [promoCode, { id, discount: coupon.percent_off }];
  }
);

/**
 * API local cache for Stripe `PromotionCode` objects, keyed by `PromotionCode.code`.
 */
export const promoCodesCache = new Cache<PromoCodesCacheObject>(initialCacheEntries);
