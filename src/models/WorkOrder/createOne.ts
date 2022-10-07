import moment from "moment";
import { eventEmitter } from "@events";
import type { Model } from "@lib/dynamoDB";
import { WorkOrder } from "./WorkOrder";
import type { WorkOrderType } from "./types";

// function, not arrow, bc we need "this" to be the WorkOrder model
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
    scheduledDateTime
  }: CreateWorkOrderInput
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
    dueDate,
    entryContact,
    entryContactPhone,
    scheduledDateTime,
    ...(checklist && {
      checklist: checklist.map((checklistItem) => ({
        ...checklistItem,
        id: `WO#${createdByUserID}#${moment().unix()}`,
        isCompleted: false
      }))
    })
  });

  eventEmitter.emitWorkOrderCreated(newWorkOrder);

  return newWorkOrder as WorkOrderType;
};

type CreateWorkOrderInput = Readonly<
  Omit<
    WorkOrderType,
    "id" | "status" | "priority" | "checklist" | "contractorNotes" | "updatedAt" | "createdAt"
  > & {
    priority?: typeof WorkOrder.PRIORITIES[number]; // <-- required in base type
    checklist?: ReadonlyArray<{ description: string }>;
  }
>;
