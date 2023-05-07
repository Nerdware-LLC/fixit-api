import { WorkOrderPushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models";
import type { WorkOrderType } from "@types";

export const notifyAssignorCompletedWO = async (completedWO: WorkOrderType) => {
  const { createdByUserID } = completedWO;

  const assignorUser = await User.getUserByID(createdByUserID);

  // If assignor does not currently have a registered pushToken, return.
  if (!assignorUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new WorkOrderPushNotification({
      pushEventName: "WorkOrderCompleted",
      recipientUser: {
        id: createdByUserID,
        expoPushToken: assignorUser.expoPushToken,
      },
      workOrder: completedWO,
    }),
  ]);
};
