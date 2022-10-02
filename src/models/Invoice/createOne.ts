import { eventEmitter } from "@events";
import type { Model } from "@lib/dynamoDB";
import type { InvoiceType } from "./types";

// function, not arrow, bc we need to use "this." syntax to call Dynamoose methods
export const createOne = async function (
  this: InstanceType<typeof Model>,
  {
    createdByUserID,
    assignedToUserID,
    amount,
    workOrderID
  }: NonNullable<
    Pick<InvoiceType, "createdByUserID" | "assignedToUserID" | "amount" | "workOrderID">
  >
) {
  const newInvoice = await this.createItem({
    createdByUserID,
    assignedToUserID,
    amount,
    workOrderID,
    status: "OPEN"
  });

  eventEmitter.emitInvoiceCreated(newInvoice);

  return newInvoice as InvoiceType;
};
