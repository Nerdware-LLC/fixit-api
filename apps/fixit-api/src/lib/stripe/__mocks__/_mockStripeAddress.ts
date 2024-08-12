import type Stripe from "stripe";

/**
 * Returns a mock Stripe Address object.
 * @see https://docs.stripe.com/api/terminal/locations/create
 */
export const mockStripeAddress = (
  mockAddressParams: Partial<Stripe.Address> = {}
): Stripe.Address => ({
  country: null,
  state: null,
  city: null,
  postal_code: null,
  line1: null,
  line2: null,
  ...mockAddressParams,
});
