import express from "express";
import { AdminController } from "@/controllers/AdminController";

export const adminRouter = express.Router();

adminRouter.get("/healthcheck", AdminController.healthcheck);

adminRouter.post("/csp-violation", AdminController.cspViolation);
