import { catchMWwrapper, logger, NotFoundError } from "@utils";

// Capture All 404 errors
export const handle404 = catchMWwrapper(({ originalUrl }, res, next) => {
  logger.error(`handle404 MW called, req.originalUrl = ${originalUrl}`);

  if (!VALID_PATHS.includes(originalUrl))
    throw new NotFoundError(`Unable to find the requested resource at URL "${originalUrl}"`);

  next();
});

const VALID_PATHS = [
  "/admin/csp-violation",
  "/admin/healthcheck",
  "/api",
  "/auth/login",
  "/auth/register",
  "/auth/token",
  "/subscriptions/submit-payment",
  "/subscriptions/customer-portal",
  "/connect/account-link",
  "/connect/dashboard-link",
  "/webhooks/account",
  "/webhooks/customer"
];
