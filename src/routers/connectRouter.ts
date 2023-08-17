import express from "express";
import { getUserFromAuthHeaderToken, createAccountLink, createDashboardLink } from "@middleware";
import { getRequestBodyValidatorMW } from "@middleware/helpers";
import { hasKey } from "@utils/typeSafety";

/**
 * This router handles all `/api/connect` request paths:
 * - `/api/connect/account-link`
 * - `/api/connect/dashboard-link`
 */
export const connectRouter = express.Router();

connectRouter.use(getUserFromAuthHeaderToken);

connectRouter.post(
  "/account-link",
  getRequestBodyValidatorMW((reqBody) => hasKey(reqBody, "returnURL")),
  createAccountLink
);

connectRouter.get("/dashboard-link", createDashboardLink);
