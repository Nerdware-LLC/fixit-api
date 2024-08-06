import { eventEmitter } from "@/events/eventEmitter.js";
import { Location } from "@/models/Location";
import { userModelHelpers } from "@/models/User/helpers.js";
import { WorkOrder } from "@/models/WorkOrder";
import { AuthService } from "@/services/AuthService";
import { UserInputError } from "@/utils/httpErrors.js";
import type { UpdateWorkOrderInput } from "@/types/graphql.js";

export const updateWorkOrder = async ({
  workOrderID,
  update,
  authenticatedUserID,
}: {
  workOrderID: string;
  update: UpdateWorkOrderInput;
  authenticatedUserID: string;
}) => {
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
      CANCELLED: "The requested work order has been cancelled and cannot be updated.",
    },
  });

  /* Check if woInput args necessitate updating the STATUS:
    - If the existingWO.status is ASSIGNED and woInput.assignedToUserID is UNASSIGNED,
      then the status should be updated to UNASSIGNED.
    - If the existingWO.status is UNASSIGNED and woInput.assignedToUserID is a valid
      User/Contact ID, then the status should be updated to ASSIGNED.
    - Otherwise, the status should remain unchanged. */
  const upToDateStatus =
    existingWO.status === "ASSIGNED" && update.assignedToUserID === "UNASSIGNED"
      ? "UNASSIGNED"
      : existingWO.status === "UNASSIGNED" &&
          userModelHelpers.id.isValid(update.assignedToUserID?.replace(/CONTACT#/, ""))
        ? "ASSIGNED"
        : existingWO.status;

  /* Extract `location`, and if provided, provide it to Location.fromParams.
  Note that `fromParams` will throw if required fields are not present. Since
  Location's are stored as compound-string attributes, they can not be partially
  updated, i.e., if it's desirable to only change `streetLine1`, it can not be
  updated without all the other Location fields being provided as well. */
  const { location, ...woFieldsToUpdate } = update;

  const updatedWO = await WorkOrder.updateItem(
    { id: existingWO.id, createdByUserID: existingWO.createdByUserID },
    {
      update: {
        ...woFieldsToUpdate,
        ...(!!location && { location: Location.fromParams(location) }),
        status: upToDateStatus,
      },
    }
  );

  eventEmitter.emitWorkOrderUpdated(updatedWO, existingWO);

  return updatedWO;
};
