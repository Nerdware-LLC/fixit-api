import { eventEmitter } from "@events/eventEmitter";
import type { Model } from "@lib/dynamoDB";
import type { InvoiceType } from "./types";

export const deleteOne = async function (
  this: InstanceType<typeof Model>,
  existingInvoice: InvoiceType
) {
  const deletedInvoice = await this.deleteItem({
    createdByUserID: existingInvoice.createdByUserID,
    id: existingInvoice.id
  });

  eventEmitter.emitInvoiceDeleted(deletedInvoice);

  return deletedInvoice;
};
