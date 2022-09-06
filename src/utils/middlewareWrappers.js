/**
 * Re-usable catch wrapper for async middleware fns.
 */
export const catchAsyncMW = (asyncMiddlewareFn) => {
  return (req, res, next) => {
    asyncMiddlewareFn(req, res, next).catch(next);
  };
};

/**
 * Re-usable catch wrapper for non-async middleware fns.
 */
export const catchMWwrapper = (middlewareFn) => {
  return (req, res, next) => {
    try {
      middlewareFn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
