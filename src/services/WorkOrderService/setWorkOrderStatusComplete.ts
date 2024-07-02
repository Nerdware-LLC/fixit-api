import { eventEmitter } from "@/events/eventEmitter.js";
import { WorkOrder } from "@/models/WorkOrder";
import { AuthService } from "@/services/AuthService";
import { UserInputError } from "@/utils/httpErrors.js";

export const setWorkOrderStatusComplete = async ({
  workOrderID,
  authenticatedUserID,
}: {
  workOrderID: string;
  authenticatedUserID: string;
}) => {
  const [existingWO] = await WorkOrder.query({
    where: { id: workOrderID },
    limit: 1,
  });

  if (!existingWO)
    throw new UserInputError("A work order with the provided ID could not be found.");

  AuthService.verifyUserIsAuthorized.toPerformThisUpdate(existingWO, {
    idOfUserWhoCanPerformThisUpdate: existingWO.assignedToUserID,
    authenticatedUserID,
    forbiddenStatuses: {
      UNASSIGNED: "Only the work order's assignee may perform this update.",
      CANCELLED: "The requested work order has been cancelled and cannot be marked complete.",
      COMPLETE: "The requested work order has already been marked complete.",
    },
  });

  const updatedWO = await WorkOrder.updateItem(
    { id: existingWO.id, createdByUserID: existingWO.createdByUserID },
    {
      update: {
        status: "COMPLETE",
      },
    }
  );

  eventEmitter.emitWorkOrderCompleted(updatedWO);

  return updatedWO;
};
