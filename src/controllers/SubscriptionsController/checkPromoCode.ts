import { sanitizeAlphabetic, isValidAlphabetic } from "@nerdware/ts-string-helpers";
import { z as zod } from "zod";
import { ApiController } from "@/controllers/ApiController.js";
import { AuthService } from "@/services/AuthService";
import { CheckoutService } from "@/services/CheckoutService";

/**
 * This controller returns a Stripe Customer Portal link, which allows the User to
 * manage their subscription and payment methods.
 *
 * > Endpoint: `POST /api/subscriptions/check-promo-code`
 */
export const checkPromoCode = ApiController<"/subscriptions/check-promo-code">(
  // Req body schema:
  zod
    .object({
      promoCode: zod.string().transform(sanitizeAlphabetic).refine(isValidAlphabetic),
    })
    .strict(),
  // Controller logic:
  async (req, res) => {
    // Validate the request (don't need to use the decoded payload, just validate the token)
    await AuthService.authenticateUser.viaAuthHeaderToken(req);

    // Get the provided `promoCode`:
    const { promoCode } = req.body;

    // Get the promo code info:
    const promoCodeInfo = CheckoutService.checkPromoCode({ promoCode });

    // Send response:
    res.status(200).json({ promoCodeInfo });
  }
);
