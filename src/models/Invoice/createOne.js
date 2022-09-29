import { eventEmitter } from "@events";

// function, not arrow, bc we need to use "this." syntax to call Dynamoose methods
export const createOne = async function ({
  createdByUserID,
  assignedToUserID,
  amount,
  workOrderID
}) {
  const newInvoice = await this.createItem({
    createdByUserID,
    assignedToUserID,
    amount,
    workOrderID,
    status: "OPEN"
  });

  eventEmitter.emitInvoiceCreated(newInvoice);

  return newInvoice;
};
