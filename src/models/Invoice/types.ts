export interface InvoiceType {
  createdByUserID: string; //   mapped from "pk" table attribute
  id: string; //                mapped from "sk" table attribute
  assignedToUserID?: string; // mapped from "data" table attribute
  amount: number;
  status: InvoiceStatus;
  stripePaymentIntentID?: string;
  workOrderID?: string;
}

export enum InvoiceStatus {
  OPEN,
  CLOSED,
  DISPUTED
}
