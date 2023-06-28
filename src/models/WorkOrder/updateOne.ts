import merge from "lodash.merge";
import { eventEmitter } from "@events/eventEmitter";
import { WorkOrder, type WorkOrderModelItem, type WorkOrderModelInput } from "@models/WorkOrder";
import type { PartialDeep } from "type-fest";

export const updateOne = async function (
  this: typeof WorkOrder,
  existingWO: WorkOrderModelItem,
  newWorkOrderFields: PartialDeep<WorkOrderModelInput>
) {
  const updateWorkOrderResult = await this.updateItem(
    {
      createdByUserID: existingWO.createdBy.id,
      id: existingWO.id,
    },
    newWorkOrderFields
  );

  const updatedWO = merge(existingWO, updateWorkOrderResult);

  const emitEventFn =
    newWorkOrderFields?.status === "CANCELLED"
      ? eventEmitter.emitWorkOrderCancelled
      : newWorkOrderFields?.status === "COMPLETE"
      ? eventEmitter.emitWorkOrderCompleted
      : eventEmitter.emitWorkOrderUpdated;

  emitEventFn(updatedWO, existingWO);

  return updatedWO;
};
