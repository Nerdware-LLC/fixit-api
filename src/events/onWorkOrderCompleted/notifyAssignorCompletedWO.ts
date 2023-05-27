import { WorkOrderPushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models";
import type { InternalDbWorkOrder } from "@types";

export const notifyAssignorCompletedWO = async (completedWO: InternalDbWorkOrder) => {
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
