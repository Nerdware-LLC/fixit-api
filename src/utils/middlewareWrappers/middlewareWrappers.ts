import type {
  AsyncMiddlewareFn,
  MiddlewareFn,
  UnionOfReqObjectTypes,
  APIRequestWithUserData, // <-- default "req" Object type
} from "./types";

/**
 * Re-usable catch wrapper for async middleware functions.
 * - The request object is type `APIRequestWithUserData` by default.
 * - For Stripe webhook requests, pass `StripeWebhookRequestObject` as a
 *   type parameter to this function.
 */
export const catchAsyncMW = <ReqT extends UnionOfReqObjectTypes = APIRequestWithUserData>(
  asyncMiddlewareFn: AsyncMiddlewareFn<ReqT>
): MiddlewareFn => {
  return (req, res, next) => {
    asyncMiddlewareFn(req as ReqT, res, next).catch(next);
  };
};

/**
 * Re-usable catch wrapper for non-async middleware functions.
 * - The request object is type `APIRequestWithUserData` by default.
 * - For Stripe webhook requests, pass `StripeWebhookRequestObject` as a
 *   type parameter to this function.
 */
export const catchMWwrapper = <ReqT extends UnionOfReqObjectTypes = APIRequestWithUserData>(
  middlewareFn: MiddlewareFn<ReqT>
): MiddlewareFn => {
  return (req, res, next) => {
    try {
      middlewareFn(req as ReqT, res, next);
    } catch (error) {
      next(error);
    }
  };
};
