import { isString } from "@nerdware/ts-type-safety-utils";
import { logger } from "@/utils/logger.js";
import type { RestApiRequestHandler } from "@/middleware/helpers.js";
import type { Request } from "express";

/**
 * This middleware is used in non-prod envs to log GraphQL and REST requests
 * received by the server. If `req.body` contains `operationName`, a request
 * is logged as a GraphQL request, otherwise it's logged as a REST request.
 */
export const logReqReceived: RestApiRequestHandler = (req, res, next) => {
  if (req.originalUrl === "/api") {
    // Only log GQL /api requests if req.body.operationName exists
    if (isString(req.body?.operationName)) {
      logger.gql(getReqLogMsg(req, `OPERATION ${req.body.operationName}`));
    }
  } else {
    logger.server(getReqLogMsg(req, `PATH ${req.originalUrl}`));
  }

  next();
};

const getReqLogMsg = (req: Request, reqInfoStr: string) => {
  return `request received: ${reqInfoStr.padEnd(36, " ")} FROM ${req.ip}`;
};
