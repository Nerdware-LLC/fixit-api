import { eventEmitter } from "@events";

// function, not arrow, bc we need to use "this." syntax to call Dynamoose methods
export const createOne = async function ({
  createdByUserID,
  assignedToUserID = "UNASSIGNED", // <-- Default placeholder, since "data" Attr is required
  priority,
  location,
  category,
  description,
  checklist,
  dueDate,
  entryContact,
  entryContactPhone,
  scheduledDateTime,
  contractorNotes
}) {
  /* Create WorkOrder via model.create, which unlike item.save will not
  overwrite an existing item. newWorkOrder is re-assigned to the return
  value to capture "createdAt" and "updatedAt" generated fields.     */
  const newWorkOrder = await this.create({
    createdByUserID,
    assignedToUserID,
    status: assignedToUserID === "UNASSIGNED" ? "UNASSIGNED" : "ASSIGNED",
    priority,
    location,
    category,
    description,
    checklist,
    dueDate,
    entryContact,
    entryContactPhone,
    scheduledDateTime,
    contractorNotes
  });

  eventEmitter.emitWorkOrderCreated(newWorkOrder);

  return newWorkOrder;
};
