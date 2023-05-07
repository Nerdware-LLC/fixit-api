import express from "express";
import {
  getUserFromAuthHeaderToken,
  validateHasReturnURL,
  createAccountLink,
  createDashboardLink,
} from "@middleware";

export const connectRouter = express.Router();

// req.baseUrl = "/api/connect"

// TODO do we need to check the user's connect account capabilities (charges_enabled, payouts_enabled) ... ?

connectRouter.use(getUserFromAuthHeaderToken);

connectRouter.post("/account-link", validateHasReturnURL, createAccountLink);
connectRouter.get("/dashboard-link", createDashboardLink);
