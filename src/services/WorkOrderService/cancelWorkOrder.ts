import { eventEmitter } from "@/events/eventEmitter.js";
import { WorkOrder, type WorkOrderItem } from "@/models/WorkOrder";
import { AuthService } from "@/services/AuthService";
import { UserInputError } from "@/utils/httpErrors.js";

export const cancelWorkOrder = async ({
  workOrderID,
  authenticatedUserID,
}: {
  workOrderID: string;
  authenticatedUserID: string;
}): Promise<{ deleted: boolean; workOrder: WorkOrderItem }> => {
  const [existingWO] = await WorkOrder.query({
    where: { id: workOrderID },
    limit: 1,
  });

  if (!existingWO)
    throw new UserInputError("A work order with the provided ID could not be found.");

  AuthService.verifyUserIsAuthorized.toPerformThisUpdate(existingWO, {
    idOfUserWhoCanPerformThisUpdate: existingWO.createdByUserID,
    authenticatedUserID,
    forbiddenStatuses: {
      CANCELLED: "The requested work order has already been cancelled.",
      COMPLETE: "The requested work order has already been completed and cannot be cancelled.",
    },
  });

  let deleted = false;
  let workOrder = existingWO;

  /* If status is UNASSIGNED, delete it and return a DeleteMutationResponse.
  Otherwise, update WO status to CANCELLED and return the updated WorkOrder.*/

  if (existingWO.status === "UNASSIGNED") {
    await WorkOrder.deleteItem({ createdByUserID: authenticatedUserID, id: workOrderID });
    deleted = true;
  } else {
    const canceledWO = await WorkOrder.updateItem(
      { id: existingWO.id, createdByUserID: existingWO.createdByUserID },
      {
        update: {
          status: "CANCELLED",
        },
      }
    );

    eventEmitter.emitWorkOrderCancelled(canceledWO);

    workOrder = canceledWO;
  }

  return {
    deleted,
    workOrder,
  };
};
