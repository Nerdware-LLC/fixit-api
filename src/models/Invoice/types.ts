import type { InvoiceStatus } from "@types";

export type InternalDbInvoice = {
  createdByUserID: string; //  mapped from "pk" table attribute
  createdBy: {
    id: string;
  };
  id: string; //               mapped from "sk" table attribute
  assignedToUserID: string; // mapped from "data" table attribute
  assignedTo: {
    id: string;
  };
  amount: number;
  status: InvoiceStatus;
  stripePaymentIntentID?: string;
  workOrderID?: string;
  createdAt: Date;
  updatedAt: Date;
};
