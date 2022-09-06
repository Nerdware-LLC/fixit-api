import express from "express";
import {
  getUserFromAuthHeaderToken,
  createAccountLink,
  createDashboardLink
} from "@middleware";

export const connectRouter = express.Router();

// req.baseUrl = "/connect"

// TODO do we need to check the contractors connect account capabilities (charges_enabled, payouts_enabled) ... ?

connectRouter.use(getUserFromAuthHeaderToken);

connectRouter.get("/account-link", createAccountLink);
connectRouter.get("/dashboard-link", createDashboardLink);
