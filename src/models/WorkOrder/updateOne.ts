import merge from "lodash.merge";
import { eventEmitter } from "@events/eventEmitter";
import type { Model } from "@lib/dynamoDB";
import type { WorkOrderType } from "./types";

export const updateOne = async function (
  this: InstanceType<typeof Model>,
  existingWO: WorkOrderType,
  newWorkOrderFields: Partial<WorkOrderType>
) {
  const updateWorkOrderResult = await this.updateItem(
    {
      createdByUserID: existingWO.createdByUserID,
      id: existingWO.id
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

  return updatedWO as WorkOrderType;
};
