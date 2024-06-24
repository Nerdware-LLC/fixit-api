import { eventEmitter } from "@/events/eventEmitter.js";
import { Location } from "@/models/Location";
import { WorkOrder } from "@/models/WorkOrder";
import type { CreateWorkOrderInput } from "@/types/graphql.js";

/**
 * ### WorkOrderService: createWorkOrder
 */
export const createWorkOrder = async (
  woInput: { createdByUserID: string } & CreateWorkOrderInput
) => {
  const { createdByUserID, assignedTo = "UNASSIGNED", location, ...createWorkOrderInput } = woInput;

  const newWO = await WorkOrder.createItem({
    createdByUserID,
    assignedToUserID: assignedTo,
    status: assignedTo === "UNASSIGNED" ? "UNASSIGNED" : "ASSIGNED",
    location: Location.fromParams(location),
    ...createWorkOrderInput,
  });

  eventEmitter.emitWorkOrderCreated(newWO);

  return newWO;
};
