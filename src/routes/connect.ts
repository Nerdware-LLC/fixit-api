import express from "express";
import { ConnectController } from "@/controllers/ConnectController";

export const connectRouter = express.Router();

connectRouter.post("/account-link", ConnectController.createAccountLink);

connectRouter.get("/dashboard-link", ConnectController.createDashboardLink);
