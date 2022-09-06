import { eventEmitter } from "@events/eventEmitter";

export const deleteOne = async function (existingInvoice) {
  await this.delete({
    createdByUserID: existingInvoice.createdByUserID,
    id: existingInvoice.id
  });

  eventEmitter.emitInvoiceDeleted(existingInvoice);

  // Return: DeleteMutationResponse
  return { id: existingInvoice.id };
};
