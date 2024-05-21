import { promoCodesCache } from "@/lib/cache/promoCodesCache.js";
import type { PromoCodeInfo } from "@/types/open-api.js";

/**
 * This checks the provided `promoCode`s validity and discount percentage (if valid/applicable).
 */
export const checkPromoCode = ({
  promoCode: promoCodeValueToCheck,
}: {
  promoCode: string;
}): PromoCodeInfo => {
  const maybeDiscountPercentage = promoCodesCache.get(promoCodeValueToCheck)?.discount;

  return {
    value: promoCodeValueToCheck,
    isValidPromoCode: !!maybeDiscountPercentage,
    ...(!!maybeDiscountPercentage && { discountPercentage: maybeDiscountPercentage }),
  };
};
