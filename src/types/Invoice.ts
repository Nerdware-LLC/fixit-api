import { Invoice } from "@models/Invoice";

export interface InvoiceType {
  createdByUserID: string; //   mapped from "pk" table attribute
  id: string; //                mapped from "sk" table attribute
  assignedToUserID: string; // mapped from "data" table attribute
  amount: number;
  status: (typeof Invoice.STATUSES)[number];
  stripePaymentIntentID?: string;
  workOrderID?: string;
  createdAt: Date;
  updatedAt: Date;
}
