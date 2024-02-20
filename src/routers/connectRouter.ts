import { sanitizeURL, isValidURL } from "@nerdware/ts-string-helpers";
import express from "express";
import { getUserFromAuthHeaderToken, createAccountLink, createDashboardLink } from "@/middleware";
import { sanitizeAndValidateRequestBody } from "@/middleware/helpers";

/**
 * This router handles all `/api/connect` request paths:
 * - `/api/connect/account-link`
 * - `/api/connect/dashboard-link`
 */
export const connectRouter = express.Router();

connectRouter.use(getUserFromAuthHeaderToken);

connectRouter.post(
  "/account-link",
  sanitizeAndValidateRequestBody({
    requestBodySchema: {
      returnURL: {
        required: true,
        type: "string",
        sanitize: sanitizeURL,
        validate: isValidURL,
      },
    },
  }),
  createAccountLink
);

connectRouter.get("/dashboard-link", createDashboardLink);
