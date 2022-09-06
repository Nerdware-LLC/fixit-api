/**
 * This function takes an object in the shape returned by the Stripe API
 * and normalizes the keys+values used by the DynamoDB table. Note that
 * fields NOT used by the DynamoDB schema are NOT modified - for example,
 * `obj.latest_invoice` will remain `obj.latest_invoice`.
 */
export const normalizeStripeFields = ({ created, current_period_end, items, ...rest }) => ({
  ...(created && { createdAt: created }),
  ...(current_period_end && { currentPeriodEnd: new Date(current_period_end * 1000) }),
  ...(items && {
    productID: items.data[0].price.product,
    priceID: items.data[0].price.id
  }),
  ...rest
});
