import { mwCatchWrapper } from "@middleware/helpers";
import { logger, NotFoundError } from "@utils";

/**
 * This middleware function captures all 404 errors and throws a NotFoundError.
 */
export const handle404 = mwCatchWrapper(({ originalUrl }) => {
  logger.error(`Request received for non-existent path, req.originalUrl: "${originalUrl}"`);
  throw new NotFoundError(`Unable to find the requested resource at "${originalUrl}"`);
});
