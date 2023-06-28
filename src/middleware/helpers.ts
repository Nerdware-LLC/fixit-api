import { UserInputError } from "@utils";
import type { CustomRequestProperties } from "@types";
import type { RequestHandler } from "express";
import type { SetReturnType, EmptyObject } from "type-fest";

type CustomRequestAndBodyProperties<TBodyValues = unknown> = CustomRequestProperties & {
  body?: Record<string, TBodyValues>;
};

/**
 * Generic catch wrapper for async middleware functions.
 * - Optional type param: `ReqBody`, passed to `RequestHandler` type-param of the same name.
 */
export const mwAsyncCatchWrapper = <
  TCustomRequestProperties extends CustomRequestAndBodyProperties<any> = CustomRequestAndBodyProperties
>(
  asyncMiddlewareFn: SetReturnType<
    RequestHandler<EmptyObject, Record<string, unknown>, TCustomRequestProperties["body"]> &
      TCustomRequestProperties,
    Promise<void>
  >
): RequestHandler => {
  return (req, res, next) => {
    asyncMiddlewareFn(req, res, next).catch(next);
  };
};

/**
 * Generic catch wrapper for non-async middleware functions.
 * - Optional type param: `ReqBody`, passed to `RequestHandler` type-param of the same name.
 */
export const mwCatchWrapper = <ReqBody extends Record<string, any> = Record<string, unknown>>(
  middlewareFn: RequestHandler<EmptyObject, Record<string, unknown>, ReqBody>
): RequestHandler<EmptyObject, Record<string, unknown>, ReqBody> => {
  return (req, res, next) => {
    try {
      middlewareFn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * This function provides a common super-structure for all input-validation
 * middleware functions which simply calls the provided `validatorFn`, and
 * throws a `UserInputError` if the validator returns `false`.
 *
 * @param validatorFn - A function which takes the request body as its sole
 * argument, and returns a boolean indicating whether the request body is valid.
 *
 * @returns An Express middleware function which validates `req.body`.
 */
export const getRequestBodyValidatorMW = (
  validatorFn: (body: Record<string, any>) => boolean
): RequestHandler => {
  return (req, res, next) => {
    const isReqBodyValid = validatorFn(req.body);
    if (!isReqBodyValid) next(new UserInputError("Invalid request"));
    next();
  };
};
