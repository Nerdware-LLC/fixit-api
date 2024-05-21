import express from "express";
import { SubscriptionsController as SubsController } from "@/controllers/SubscriptionsController";

export const subscriptionsRouter = express.Router();

subscriptionsRouter.post("/check-promo-code", SubsController.checkPromoCode);

subscriptionsRouter.post("/submit-payment", SubsController.submitPayment);

subscriptionsRouter.post("/customer-portal", SubsController.createCustomerBillingPortalLink);
