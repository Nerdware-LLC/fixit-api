import { logger } from "@utils";
import type { RequestHandler } from "express";

/**
 * This middleware is used in non-prod envs to log GraphQL and REST requests
 * received by the server. If `req.body` contains `operationName`, a request
 * is logged as a GraphQL request, otherwise it's logged as a REST request.
 */
export const logReqReceived: RequestHandler<
  unknown,
  unknown,
  { operationName?: string } | undefined
> = ({ originalUrl, body }, res, next) => {
  if (originalUrl === "/api") {
    // Only log GQL /api requests if req.body.operationName exists
    if (!!body && !!body?.operationName) {
      logger.gql(`request received, OPERATION: ${body.operationName}`);
    }
  } else {
    logger.server(`request received, PATH: ${originalUrl}`);
  }

  next();
};
