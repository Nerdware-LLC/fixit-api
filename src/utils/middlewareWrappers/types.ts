import type { Request, Response, NextFunction } from "express";
import type Stripe from "stripe";
import type { UserType, AuthenticatedUser, WorkOrderType, InvoiceType, ContactType } from "@models";
import type { FixitApiAuthTokenPayload } from "@utils/AuthToken";

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
  _user?: UserType | FixitApiAuthTokenPayload;
  _userQueryItems?: {
    workOrders?: Array<WorkOrderDbTypeToApiResponseType>;
    invoices?: Array<InvoiceDbTypeToApiResponseType>;
    contacts?: Array<ContactType>;
  };
}

export type WorkOrderDbTypeToApiResponseType = Omit<
  WorkOrderType,
  "createdByUserID" | "assignedToUserID"
> & {
  createdBy: { id: string; [K: string]: any };
  assignedTo?: { id: string; [K: string]: any };
};

export type InvoiceDbTypeToApiResponseType = Omit<
  InvoiceType,
  "createdByUserID" | "assignedToUserID"
> & {
  createdBy: { id: string; [K: string]: any };
  assignedTo: { id: string; [K: string]: any };
};

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
