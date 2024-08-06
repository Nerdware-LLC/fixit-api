import { isString } from "@nerdware/ts-type-safety-utils";
import { logger } from "@/utils/logger.js";
import type { Request, RequestHandler } from "express";

/**
 * This middleware logs GraphQL and REST requests.
 *
 * - If `req.body` contains `operationName`, a request is logged using the
 *   `"GQL"` logger namespace. Otherwise it's logged using the `"SERVER"`
 *   logger namespace.
 *
 * - Requests to `/api/admin/healthcheck` are not logged.
 */
export const logReqReceived: RequestHandler<
  Record<string, string>,
  unknown,
  Record<string, unknown> | undefined
> = (req, res, next) => {
  if (req.originalUrl === "/api") {
    // Only log GQL /api requests if req.body.operationName exists
    if (isString(req.body?.operationName))
      logger.gql(getReqLogMsg(req, `OPERATION ${req.body.operationName}`));
  } else if (req.originalUrl !== "/api/admin/healthcheck") {
    logger.server(getReqLogMsg(req, `PATH ${req.originalUrl}`));
  }

  next();
};

const getReqLogMsg = (req: Request, reqInfoStr: string) => {
  return `request received: ${reqInfoStr.padEnd(36, " ")} FROM ${req.ip ?? "-UNKNOWN-"}`;
};
