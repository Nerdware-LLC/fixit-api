import { eventEmitter } from "@events";
import type { WorkOrderModel } from "./WorkOrder";
import type { WorkOrderType } from "./types";

// function, not arrow, bc we need to use "this." syntax to call Dynamoose methods
export const createOne = async function (
  this: InstanceType<typeof WorkOrderModel>,
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
    priority?: typeof WorkOrderModel.PRIORITIES[number]; // <-- required in base type
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
  } as any); // FIXME <-- rm this `as any` once aliasedItemTypeFromSchema has been fixed (currently every property set to type `undefined`, some problem w Matching/NonMatching)

  eventEmitter.emitWorkOrderCreated(newWorkOrder);

  return newWorkOrder;
};
