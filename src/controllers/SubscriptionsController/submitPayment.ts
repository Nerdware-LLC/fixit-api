import { sanitizeAlphabetic } from "@nerdware/ts-string-helpers";
import { z as zod } from "zod";
import { ApiController } from "@/controllers/ApiController.js";
import { pricesCache } from "@/lib/cache/pricesCache.js";
import { promoCodesCache } from "@/lib/cache/promoCodesCache.js";
import { isValidStripeID, sanitizeStripeID } from "@/lib/stripe/helpers.js";
import { SUBSCRIPTION_ENUMS } from "@/models/UserSubscription/enumConstants.js";
import { AuthService } from "@/services/AuthService";
import { CheckoutService } from "@/services/CheckoutService";

/**
 * This controller returns
 *
 * > Endpoint: `POST /api/subscriptions/submit-payment`
 */
export const submitPayment = ApiController<"/subscriptions/submit-payment">(
  // Req body schema:
  zod
    .object({
      selectedSubscription: zod
        .enum(SUBSCRIPTION_ENUMS.PRICE_NAMES)
        .transform(sanitizeAlphabetic)
        .refine(pricesCache.has),
      paymentMethodID: zod
        .string()
        .transform(sanitizeStripeID)
        .refine(isValidStripeID.paymentMethod),
      promoCode: zod
        .string()
        .optional()
        .transform((value) => (value ? sanitizeAlphabetic(value) : value))
        .refine((value) => (value ? promoCodesCache.has(value) : value === undefined)),
    })
    .strict(),
  // Controller logic:
  async (req, res) => {
    // Validate and decode the AuthToken from the 'Authorization' header:
    const authenticatedUser = await AuthService.authenticateUser.viaAuthHeaderToken(req);

    // Get the provided args:
    const { paymentMethodID, selectedSubscription, promoCode } = req.body;

    // Get the Stripe link:
    const { checkoutCompletionInfo, subscription } = await CheckoutService.processPayment({
      user: authenticatedUser,
      selectedSubscription,
      paymentMethodID,
      promoCode,
      request: {
        ip: req.ip!,
        userAgent: req.get("User-Agent")!,
      },
    });

    // Update the user's AuthToken with new subscription info:
    const newAuthToken = AuthService.createAuthToken({ ...authenticatedUser, subscription });

    // Send response:
    res.status(201).json({
      checkoutCompletionInfo,
      token: newAuthToken.toString(),
    });
  }
);
