import { User } from "@models/User";
import { lambdaClient } from "@lib/lambdaClient";
import { WorkOrderPushNotification } from "@events/pushNotifications";

export const notifyAssignorCompletedWO = async (completedWO) => {
  const { createdByUserID } = completedWO;

  const { expoPushToken: assignorPushToken } = await User.getUserByID(createdByUserID);

  // If assignor does not currently have a registered pushToken, return.
  if (!assignorPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new WorkOrderPushNotification({
      pushEventName: "WorkOrderCompleted",
      recipientUser: { id: createdByUserID, expoPushToken: assignorPushToken },
      workOrder: completedWO
    })
  ]);
};
