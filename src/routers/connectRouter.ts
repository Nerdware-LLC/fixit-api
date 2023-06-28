import express from "express";
import { getUserFromAuthHeaderToken, createAccountLink, createDashboardLink } from "@middleware";
import { getRequestBodyValidatorMW } from "@middleware/helpers";
import { hasKey } from "@utils/typeSafety";

/**
 * This router handles all requests to the "/api/connect" path.
 *
 * - `req.baseUrl` = "/api/connect"
 *
 * Descendant paths:
 * - `/api/connect/account-link`
 * - `/api/connect/dashboard-link`
 */
export const connectRouter = express.Router();

// TODO Do we need to check the user's connect account capabilities (charges_enabled, payouts_enabled) ... ?

connectRouter.use(getUserFromAuthHeaderToken);

connectRouter.post(
  "/account-link",
  getRequestBodyValidatorMW((reqBody) => hasKey(reqBody, "returnURL")),
  createAccountLink
);

connectRouter.get("/dashboard-link", createDashboardLink);
