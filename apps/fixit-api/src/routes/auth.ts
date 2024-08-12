import express from "express";
import { AuthController } from "@/controllers/AuthController";

export const authRouter = express.Router();

authRouter.post("/register", AuthController.registerNewUser);

authRouter.post("/login", AuthController.login);

authRouter.post("/google-token", AuthController.googleTokenLogin);

authRouter.post("/password-reset-init", AuthController.pwResetInit);

authRouter.post("/password-reset", AuthController.passwordReset);

authRouter.post("/token", AuthController.refreshAuthToken);
