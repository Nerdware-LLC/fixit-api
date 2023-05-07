import { eventEmitter } from "@events";
import type { Model } from "@lib/dynamoDB";
import type { InvoiceType } from "@types";

// function, not arrow, bc we need "this" to be the Invoice model
export const createOne = async function (
  this: InstanceType<typeof Model>,
  { createdByUserID, assignedToUserID, amount }: CreateInvoiceInput
) {
  const newInvoice = await this.createItem({
    createdByUserID,
    assignedToUserID,
    amount,
    status: "OPEN",
  });

  eventEmitter.emitInvoiceCreated(newInvoice);

  return newInvoice;
};

type CreateInvoiceInput = Readonly<
  Pick<InvoiceType, "createdByUserID" | "assignedToUserID" | "amount">
>;
