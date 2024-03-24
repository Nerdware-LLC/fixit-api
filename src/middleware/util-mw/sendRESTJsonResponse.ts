import type { RestApiRequestHandler } from "@/middleware/helpers.js";

/**
 * This middleware is a fallback response handler which reads the `res.locals` object and returns
 * an appropriate response based on the provided fields as described in the table below.
 *
 * #### Why take this approach?
 *
 * It is often the case that a given middleware function may generate data that needs to be
 * returned to the client, _but_ that middlware may be used in multiple routes/endpoints, and
 * it isn't aware of what impact (if any) other middleware in the chain may have on the response.
 * Perhaps other functions also need to add data to the response, or perhaps they need to read
 * the data it generates. For example, the `auth/login` and `auth/token` endpoints both respond
 * with a `token` BUT may also include pre-fetched `userItems`.
 *
 * To address this issue and allow greater flexibility in regard to middleware design, middleware
 * functions which generate data for the response and/or other middleware add their data to the
 * `res.locals` object for down-stream consumption.
 *
 * Conversely, some middleware functions will call `res.json` directly if they're designed to work
 * within a particular request-response cycle that's limited in scope. For example, the purpose of
 * the `subscriptions/customer-portal` endpoint is solely to provide a Stripe Customer Portal link,
 * so the implementing middleware can send the `stripeLink` response without needing to worry about
 * other middleware impacting the response.
 *
 * | `res.locals` Field       | Resultant Response Field                                    |
 * | :----------------------- | :---------------------------------------------------------- |
 * | `authToken`              | `token: res.locals.authToken`                               |
 * | `promoCodeInfo`          | `promoCodeInfo: res.locals.promoCodeInfo`                   |
 * | `checkoutCompletionInfo` | `checkoutCompletionInfo: res.locals.checkoutCompletionInfo` |
 * | `stripeLink`             | `stripeLink: res.locals.stripeLink`                         |
 * | `userItems`              | `userItems: res.locals.userItems`                           |
 */
export const sendRESTJsonResponse: RestApiRequestHandler = (req, res) => {
  // Get available `res.locals` fields which are associated with a response field:
  const { authToken, promoCodeInfo, checkoutCompletionInfo, stripeLink, userItems } = res.locals;

  // "token" | "promoCodeInfo" | "checkoutPaymentInfo" | "stripeLink" | "userItems"

  res.json({
    ...(!!authToken && { token: authToken }),
    ...(!!promoCodeInfo && { promoCodeInfo }),
    ...(!!checkoutCompletionInfo && { checkoutCompletionInfo }),
    ...(!!stripeLink && { stripeLink }),
    ...(!!userItems && { userItems }),
  });
};
