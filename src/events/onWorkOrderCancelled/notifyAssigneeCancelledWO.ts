import { WorkOrderPushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models";
import type { WorkOrderType } from "@types";

export const notifyAssigneeCancelledWO = async (cancelledWO: WorkOrderType) => {
  const { assignedToUserID } = cancelledWO;

  // If new WorkOrder was UNASSIGNED, return.
  if (!assignedToUserID) return;

  const assigneeUser = await User.getUserByID(assignedToUserID);

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneeUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new WorkOrderPushNotification({
      pushEventName: "WorkOrderCancelled",
      recipientUser: {
        id: assignedToUserID,
        expoPushToken: assigneeUser.expoPushToken,
      },
      workOrder: cancelledWO,
    }),
  ]);
};
