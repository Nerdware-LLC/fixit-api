import { sanitizeAlphabetic, sanitizeID } from "@nerdware/ts-string-helpers";
import { getRequestBodySanitizer, type FieldSanitizerFn } from "@/controllers/_helpers";
import { pricesCache } from "@/lib/cache/pricesCache.js";
import { promoCodesCache } from "@/lib/cache/promoCodesCache.js";
import { isValidStripeID } from "@/lib/stripe/helpers.js";
import { AuthService } from "@/services/AuthService";
import { CheckoutService } from "@/services/CheckoutService";
import type { ApiController } from "@/controllers/types.js";
import type { SubscriptionPriceName } from "@/types/graphql.js";

/**
 * This controller returns
 *
 * > Endpoint: `POST /api/subscriptions/submit-payment`
 */
// prettier-ignore
export const submitPayment: ApiController<"/subscriptions/submit-payment">
  = async (req, res, next) => {
    try {
      // Validate and decode the AuthToken from the 'Authorization' header:
      const authenticatedUser = await AuthService.getValidatedRequestAuthTokenPayload(req);

      // Get the provided args:
      const { paymentMethodID, selectedSubscription, promoCode } = sanitizeSubmitPaymentRequest(req);

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
    } catch (err) {
      next(err);
    }
  };

const sanitizeSubmitPaymentRequest = getRequestBodySanitizer<"/subscriptions/submit-payment">({
  requestBodySchema: {
    selectedSubscription: {
      type: "string",
      required: true,
      nullable: false,
      sanitize: sanitizeAlphabetic as FieldSanitizerFn<SubscriptionPriceName>,
      validate: pricesCache.has,
    },
    paymentMethodID: {
      type: "string",
      required: true,
      nullable: false,
      sanitize: sanitizeID,
      validate: isValidStripeID.paymentMethod,
    },
    promoCode: {
      type: "string",
      required: false,
      nullable: false,
      sanitize: sanitizeAlphabetic,
      validate: promoCodesCache.has,
    },
  },
});
