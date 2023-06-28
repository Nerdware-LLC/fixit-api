import { mwCatchWrapper } from "@middleware/helpers";
import { logger, NotFoundError } from "@utils";

/**
 * This middleware function captures all 404 errors and throws a NotFoundError.
 */
export const handle404 = mwCatchWrapper(({ originalUrl }, res, next) => {
  logger.error(`handle404 MW called, req.originalUrl = ${originalUrl}`);

  if (!VALID_PATHS.includes(originalUrl))
    throw new NotFoundError(`Unable to find the requested resource at URL "${originalUrl}"`);

  next();
});

const VALID_PATHS = [
  "/api/admin/csp-violation",
  "/api/admin/healthcheck",
  "/api",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/token",
  "/api/subscriptions/submit-payment",
  "/api/subscriptions/customer-portal",
  "/api/connect/account-link",
  "/api/connect/dashboard-link",
  "/api/webhooks/stripe",
];
