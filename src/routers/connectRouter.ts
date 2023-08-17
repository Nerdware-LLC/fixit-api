import express from "express";
import { getUserFromAuthHeaderToken, createAccountLink, createDashboardLink } from "@middleware";
import { sanitizeAndValidateRequestBody } from "@middleware/helpers";
import { sanitize, isValid } from "@utils";

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
        sanitize: sanitize.url,
        validate: isValid.url,
      },
    },
  }),
  createAccountLink
);

connectRouter.get("/dashboard-link", createDashboardLink);
