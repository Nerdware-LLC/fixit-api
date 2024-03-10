import { promoCodesCache } from "@/lib/cache/promoCodesCache.js";
import { mwCatchWrapper } from "@/middleware/helpers.js";
import type { RestApiRequestBodyByPath } from "@/types/open-api.js";

/**
 * This middlware serves as an endpoint which receives a `promoCode` string, and responds with
 * information regarding the `promoCode`s validity and discount percentage (if valid/applicable).
 */
export const checkPromoCode = mwCatchWrapper<
  RestApiRequestBodyByPath["/subscriptions/check-promo-code"]
>((req, res) => {
  // Destructure req.body
  const { promoCode: maybePromoCode } = req.body;

  const maybeDiscountPercentage = promoCodesCache.get(maybePromoCode)?.discount;

  res.json({
    promoCodeInfo: {
      value: maybePromoCode,
      isValidPromoCode: !!maybeDiscountPercentage,
      ...(!!maybeDiscountPercentage && { discountPercentage: maybeDiscountPercentage }),
    },
  });
});
