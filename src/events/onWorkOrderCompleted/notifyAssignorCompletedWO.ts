import { WorkOrderPushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models";
import type { WorkOrderModelItem } from "@models/WorkOrder";

export const notifyAssignorCompletedWO = async (completedWO: WorkOrderModelItem) => {
  const { createdBy } = completedWO;

  const assignorUser = await User.getItem({
    id: createdBy.id,
    sk: User.getFormattedSK(createdBy.id),
  });

  // If assignor does not currently have a registered pushToken, return.
  if (!assignorUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new WorkOrderPushNotification({
      pushEventName: "WorkOrderCompleted",
      recipientUser: {
        id: createdBy.id,
        expoPushToken: assignorUser.expoPushToken,
      },
      workOrder: completedWO,
    }),
  ]);
};
