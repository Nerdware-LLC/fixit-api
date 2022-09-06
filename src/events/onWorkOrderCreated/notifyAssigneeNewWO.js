import { lambdaClient } from "@lib/lambdaClient";
import { User, WorkOrderPushNotification } from "@models";

export const notifyAssigneeNewWO = async (newWO) => {
  const { assignedToUserID } = newWO;

  // If new WorkOrder is UNASSIGNED, return.
  if (!assignedToUserID) return;

  const { expoPushToken: assigneePushToken } = await User.getUserByID(assignedToUserID);

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneePushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new WorkOrderPushNotification({
      pushEventName: "WorkOrderAssigned",
      recipientUser: { id: assignedToUserID, expoPushToken: assigneePushToken },
      workOrder: newWO
    })
  ]);
};
