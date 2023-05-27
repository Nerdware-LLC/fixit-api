import type { CustomRequestProperties } from "@types";
import type { RequestHandler, Request } from "express";
import type { SetReturnType } from "type-fest";

/**
 * Re-usable catch wrapper for async middleware functions.
 */
export const mwAsyncCatchWrapper = (
  asyncMiddlewareFn: SetReturnType<RequestHandler, Promise<void>>
): RequestHandler => {
  return (req, res, next) => {
    asyncMiddlewareFn(req, res, next).catch(next);
  };
};

/**
 * Re-usable catch wrapper for non-async middleware functions.
 */
export const mwCatchWrapper = (middlewareFn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    try {
      middlewareFn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
