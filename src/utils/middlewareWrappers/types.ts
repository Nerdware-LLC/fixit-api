import type { Request, Response, NextFunction } from "express";
import type Stripe from "stripe";
import type { UserType, AuthenticatedUser, WorkOrderType, InvoiceType, ContactType } from "@models";

// Middleware Function Types

export type MiddlewareFn<ReqT extends UnionOfReqObjectTypes = APIRequestWithUserData> = (
  req: ReqT,
  res: Response,
  next: NextFunction
) => void;

export type AsyncMiddlewareFn<ReqT extends UnionOfReqObjectTypes = APIRequestWithUserData> = (
  req: ReqT,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Middleware "req" Object Types

export interface APIRequestWithUserData extends Request {
  _user?: UserType;
  _userQueryItems?: {
    workOrders?: Array<WorkOrderType>;
    invoices?: Array<InvoiceType>;
    contacts?: Array<ContactType>;
  };
}

// APIRequestWithAuthenticatedUserData sets "_user" to required.
export type APIRequestWithAuthenticatedUserData = Expand<
  Omit<APIRequestWithUserData, "_user"> & {
    _user: AuthenticatedUser;
  }
>;

export interface StripeWebhookRequestObject extends Request {
  event: Stripe.Event;
}

// Union of middleware "req" Object types

export type UnionOfReqObjectTypes =
  | APIRequestWithUserData
  | APIRequestWithAuthenticatedUserData
  | StripeWebhookRequestObject;
