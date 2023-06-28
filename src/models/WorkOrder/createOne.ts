import { eventEmitter } from "@events";
import { WorkOrder, type WorkOrderModelInput } from "./WorkOrder";
import type { SetOptional } from "type-fest";

/**
 * WorkOrder.createOne function (not arrow, bc `this` must be WorkOrder model)
 */
export const createOne = async function (
  this: typeof WorkOrder,
  {
    assignedToUserID = "UNASSIGNED", // <-- Default placeholder, since "data" is an index-pk
    ...workOrderInputs
  }: SetOptional<WorkOrderModelInput, "assignedToUserID" | "status">
) {
  /* Create WorkOrder via model.create, which unlike item.save will not
  overwrite an existing item. newWorkOrder is re-assigned to the return
  value to capture "createdAt" and "updatedAt" generated fields.     */
  const newWorkOrder = await this.createItem({
    assignedToUserID,
    status: assignedToUserID === "UNASSIGNED" ? "UNASSIGNED" : "ASSIGNED", // <-- Default status
    ...workOrderInputs,
  });

  eventEmitter.emitWorkOrderCreated(newWorkOrder);

  return newWorkOrder;
};
