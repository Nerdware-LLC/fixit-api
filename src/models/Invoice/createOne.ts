import { eventEmitter } from "@events";
import type { Model } from "@lib/dynamoDB";
import type { InvoiceType } from "./types";

// function, not arrow, bc we need to use "this." syntax to call Dynamoose methods
export const createOne = async function (
  this: InstanceType<typeof Model>,
  { createdByUserID, assignedToUserID, amount, workOrderID }: NewInvoice
) {
  const newInvoice: NewInvoice = await this.createItem({
    createdByUserID,
    assignedToUserID,
    amount,
    workOrderID,
    status: "OPEN"
  });

  eventEmitter.emitInvoiceCreated(newInvoice);

  return newInvoice;
};

type NewInvoice = Expand<
  InvoiceType &
    Required<Pick<InvoiceType, "createdByUserID" | "assignedToUserID" | "amount" | "workOrderID">>
>;
