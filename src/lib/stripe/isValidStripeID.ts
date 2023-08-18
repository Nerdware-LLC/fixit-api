import { getRegexValidatorFn } from "@/utils/clientInputHandlers/validate";

/**
 * An object with methods which return `true` if the given value is a string which
 * conforms to the method's regex pattern.
 *
 * Implementation Note:
 * Stripe does not specify a max length for their ID values; the `150` max length
 * in the patterns below merely sets a concrete ceiling which we can be certain will
 * never cause a valid ID to be rejected, but will facilitate the early rejection of
 * large/improperly-formed values.
 */
export const isValidStripeID = {
  /** Returns `true` if `value` is a valid Stripe ConnectAccount ID (e.g., `"acct_123abc123ABC"`). */
  connectAccount: getRegexValidatorFn(/^acct_[a-zA-Z0-9]{10,150}$/),
  /** Returns `true` if `value` is a valid Stripe Customer ID (e.g., `"cus_123abc123ABC"`). */
  customer: getRegexValidatorFn(/^cus_[a-zA-Z0-9]{10,150}$/),
  /** Returns `true` if `value` is a valid Stripe PaymentIntent ID (e.g., `"pi_123abc123ABC"`). */
  paymentIntent: getRegexValidatorFn(/^pi_[a-zA-Z0-9]{10,150}$/),
  /** Returns `true` if `value` is a valid Stripe PaymentMethod ID (e.g., `"pm_123abc123ABC"`). */
  paymentMethod: getRegexValidatorFn(/^pm_[a-zA-Z0-9]{10,150}$/),
  /** Returns `true` if `value` is a valid Stripe Price ID (e.g., `"price_123abc123ABC"`). */
  price: getRegexValidatorFn(/^price_[a-zA-Z0-9]{10,150}$/),
  /** Returns `true` if `value` is a valid Stripe Product ID (e.g., `"prod_123abc123ABC"`). */
  product: getRegexValidatorFn(/^prod_[a-zA-Z0-9]{10,150}$/),
  /** Returns `true` if `value` is a valid Stripe Subscription ID (e.g., `"sub_123abc123ABC"`). */
  subscription: getRegexValidatorFn(/^sub_[a-zA-Z0-9]{10,150}$/),
};
