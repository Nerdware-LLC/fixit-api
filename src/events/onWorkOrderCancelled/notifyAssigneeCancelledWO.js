import { lambdaClient } from "@lib/lambdaClient";
import { User, WorkOrderPushNotification } from "@models";

export const notifyAssigneeCancelledWO = async (cancelledWO) => {
  const { assignedToUserID } = cancelledWO;

  // If new WorkOrder was UNASSIGNED, return.
  if (!assignedToUserID) return;

  const { expoPushToken: assigneePushToken } = await User.getUserByID(assignedToUserID);

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneePushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new WorkOrderPushNotification({
      pushEventName: "WorkOrderCancelled",
      recipientUser: { id: assignedToUserID, expoPushToken: assigneePushToken },
      workOrder: cancelledWO
    })
  ]);
};