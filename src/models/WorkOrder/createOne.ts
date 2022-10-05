import { eventEmitter } from "@events";
import type { Model } from "@lib/dynamoDB";
import { WorkOrder } from "./WorkOrder";
import type { WorkOrderType } from "./types";

// function, not arrow, bc we need to use "this." syntax to call Dynamoose methods
export const createOne = async function (
  this: InstanceType<typeof Model>,
  {
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
  }: Omit<WorkOrderType, "assignedToUserID" | "status" | "priority"> & {
    assignedToUserID: string; //                            <-- optional in base type
    priority?: typeof WorkOrder.PRIORITIES[number]; // <-- required in base type
  }
) {
  /* Create WorkOrder via model.create, which unlike item.save will not
  overwrite an existing item. newWorkOrder is re-assigned to the return
  value to capture "createdAt" and "updatedAt" generated fields.     */
  const newWorkOrder = await this.createItem({
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

  return newWorkOrder as WorkOrderType;
};
