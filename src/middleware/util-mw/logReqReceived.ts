import type { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger";

export const logReqReceived = (req: Request, res: Response, next: NextFunction) => {
  const { body, originalUrl } = req;

  // The operationName check ensures console-cluttering introspection queries aren't logged here
  if (
    originalUrl === "/api" &&
    body &&
    Object.prototype.hasOwnProperty.call(body, "operationName")
  ) {
    logger.gql(`request received (${new Date().toLocaleString()}) OPERATION ${body.operationName}`);
  } else {
    logger.server(`request received (${new Date().toLocaleString()}) PATH: ${originalUrl}`);
  }

  next();
};
