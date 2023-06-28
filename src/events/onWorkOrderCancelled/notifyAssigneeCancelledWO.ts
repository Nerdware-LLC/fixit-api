import { WorkOrderPushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models";
import type { WorkOrderModelItem } from "@models/WorkOrder";

export const notifyAssigneeCancelledWO = async (cancelledWO: WorkOrderModelItem) => {
  const { assignedTo } = cancelledWO;

  // If new WorkOrder was UNASSIGNED, return.
  if (!assignedTo) return;

  const assigneeUser = await User.getItem({
    id: assignedTo.id,
    sk: User.getFormattedSK(assignedTo.id),
  });

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneeUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new WorkOrderPushNotification({
      pushEventName: "WorkOrderCancelled",
      recipientUser: {
        id: assignedTo.id,
        expoPushToken: assigneeUser.expoPushToken,
      },
      workOrder: cancelledWO,
    }),
  ]);
};
