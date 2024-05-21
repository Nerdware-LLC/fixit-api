import { NotFoundError } from "@/utils/httpErrors.js";
import { logger } from "@/utils/logger.js";
import type { RequestHandler } from "express";

/**
 * This middleware function captures all 404 errors and throws a NotFoundError.
 */
export const handle404: RequestHandler = ({ originalUrl }) => {
  logger.error(`Request received for non-existent path, req.originalUrl: "${originalUrl}"`);
  throw new NotFoundError(`Unable to find the requested resource at "${originalUrl}"`);
};
