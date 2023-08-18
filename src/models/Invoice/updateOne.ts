import merge from "lodash.merge";
import { eventEmitter } from "@/events/eventEmitter";
import { Invoice, type InvoiceModelItem } from "@/models/Invoice";

export const updateOne = async function (
  this: typeof Invoice,
  existingInvoice: InvoiceModelItem,
  newInvoiceFields: Partial<InvoiceModelItem>
) {
  const updateInvoiceResult = await this.updateItem(
    {
      createdByUserID: existingInvoice.createdBy.id,
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

  return updatedInvoice;
};
