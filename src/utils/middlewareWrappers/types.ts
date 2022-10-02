import type { Request, Response, NextFunction } from "express";
import type Stripe from "stripe";
import type { UserType } from "@models/User/types";

// Middleware Function Types

export type MiddlewareFn<
  ReqT extends APIRequestWithUserData | StripeWebhookRequestObject = APIRequestWithUserData
> = (req: ReqT, res: Response, next: NextFunction) => void;

export type AsyncMiddlewareFn<
  ReqT extends APIRequestWithUserData | StripeWebhookRequestObject = APIRequestWithUserData
> = (req: ReqT, res: Response, next: NextFunction) => Promise<void>;

// Middleware "req" Object Types

export interface APIRequestWithUserData extends Request {
  _user?: UserType;
}

export interface StripeWebhookRequestObject extends Request {
  event: Stripe.Event;
}
