import merge from "lodash.merge";
import { eventEmitter } from "@events/eventEmitter";

export const updateOne = async function (existingWO, newWorkOrderFields) {
  const updateWorkOrderResult = await this.update(
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

  return updatedWO;
};
