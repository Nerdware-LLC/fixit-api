import type { Request, Response, NextFunction } from "express";
import type Stripe from "stripe";
import type { UserType, WorkOrderType, InvoiceType, ContactType } from "@models";

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
  _userQueryItems?: {
    workOrders?: Array<WorkOrderType>;
    invoices?: Array<InvoiceType>;
    contacts?: Array<ContactType>;
  };
}

export interface StripeWebhookRequestObject extends Request {
  event: Stripe.Event;
}
