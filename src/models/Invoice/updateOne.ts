import merge from "lodash.merge";
import { eventEmitter } from "@events/eventEmitter";
import type { Model } from "@lib/dynamoDB";
import type { InvoiceType } from "@types";

export const updateOne = async function (
  this: InstanceType<typeof Model>,
  existingInvoice: InvoiceType,
  newInvoiceFields: Partial<InvoiceType>
) {
  const updateInvoiceResult = await this.updateItem(
    {
      createdByUserID: existingInvoice.createdByUserID,
      id: existingInvoice.id,
    },
    newInvoiceFields
  );

  const updatedInvoice = merge(existingInvoice, updateInvoiceResult);

  const emitEventFn =
    newInvoiceFields?.status === "CLOSED"
      ? eventEmitter.emitInvoicePaid
      : eventEmitter.emitInvoiceUpdated;

  emitEventFn(updatedInvoice);

  return updatedInvoice as InvoiceType;
};
