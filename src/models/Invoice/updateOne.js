import merge from "lodash.merge";
import { eventEmitter } from "@events/eventEmitter";

export const updateOne = async function (existingInvoice, newInvoiceFields) {
  const updateInvoiceResult = await this.updateItem(
    {
      createdByUserID: existingInvoice.createdByUserID,
      id: existingInvoice.id
    },
    newInvoiceFields
  );

  const updatedInvoice = merge(existingInvoice, updateInvoiceResult);

  const emitEventFn =
    newInvoiceFields?.status === "CLOSED"
      ? eventEmitter.emitInvoicePaid
      : eventEmitter.emitInvoiceUpdated;

  emitEventFn(updatedInvoice);

  return updatedInvoice;
};
