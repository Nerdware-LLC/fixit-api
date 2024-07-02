import { eventEmitter } from "@/events/eventEmitter.js";
import { Invoice } from "@/models/Invoice";
import type { InvoiceInput } from "@/types/graphql.js";

/**
 * ### InvoiceService - createInvoice
 */
export const createInvoice = async (invInput: { createdByUserID: string } & InvoiceInput) => {
  const createdInvoice = await Invoice.createItem({
    createdByUserID: invInput.createdByUserID,
    assignedToUserID: invInput.assignedTo,
    amount: invInput.amount,
    status: "OPEN",
    ...(!!invInput.workOrderID && {
      workOrderID: invInput.workOrderID,
    }),
  });

  eventEmitter.emitInvoiceCreated(createdInvoice);

  return createdInvoice;
};
