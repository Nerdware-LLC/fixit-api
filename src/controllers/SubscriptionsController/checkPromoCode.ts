import { sanitizeAlphabetic, isValidAlphabetic } from "@nerdware/ts-string-helpers";
import { getRequestBodySanitizer } from "@/controllers/_helpers";
import { AuthService } from "@/services/AuthService";
import { CheckoutService } from "@/services/CheckoutService";
import type { ApiController } from "@/controllers/types.js";

/**
 * This controller returns a Stripe Customer Portal link, which allows the User to
 * manage their subscription and payment methods.
 *
 * > Endpoint: `POST /api/subscriptions/check-promo-code`
 */
// prettier-ignore
export const checkPromoCode: ApiController<"/subscriptions/check-promo-code">
  = async (req, res, next) => {
    try {
      // Validate the request (don't need to use the decoded payload, just validate the token)
      await AuthService.getValidatedRequestAuthTokenPayload(req);

      // Get the provided `promoCode`:
      const { promoCode } = sanitizeCheckPromoCodeRequest(req);

      // Get the promo code info:
      const promoCodeInfo = CheckoutService.checkPromoCode({ promoCode });

      // Send response:
      res.status(200).json({ promoCodeInfo });
    } catch (err) {
      next(err);
    }
  };

const sanitizeCheckPromoCodeRequest = getRequestBodySanitizer<"/subscriptions/check-promo-code">({
  requestBodySchema: {
    promoCode: {
      type: "string",
      required: true,
      nullable: false,
      sanitize: sanitizeAlphabetic,
      validate: isValidAlphabetic,
    },
  },
});
