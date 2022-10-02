import { eventEmitter } from "@events/eventEmitter";
import type { Model } from "@lib/dynamoDB";
import type { InvoiceType } from "./types";

export const deleteOne = async function (
  this: InstanceType<typeof Model>,
  existingInvoice: InvoiceType
) {
  await this.deleteItem({
    createdByUserID: existingInvoice.createdByUserID,
    id: existingInvoice.id
  });

  eventEmitter.emitInvoiceDeleted(existingInvoice);

  // Return: DeleteMutationResponse
  return { id: existingInvoice.id } as Pick<InvoiceType, "id">;
};
