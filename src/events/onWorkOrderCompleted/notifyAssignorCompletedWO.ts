import { WorkOrderPushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User } from "@/models/User";
import type { WorkOrderModelItem } from "@/models/WorkOrder";

/**
 * Notify assignor of completed WorkOrder when `WorkOrderCompleted` event is emitted.
 * @event WorkOrderCompleted
 * @param {WorkOrderModelItem} completedWO - The completed WorkOrder
 * @category events
 */
export const notifyAssignorCompletedWO = async (completedWO?: WorkOrderModelItem) => {
  if (!completedWO) return;

  const assignorUser = await User.getItem({ id: completedWO.createdBy.id });

  // If assignor does not currently have a registered pushToken, return.
  if (!assignorUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new WorkOrderPushNotification({
      pushEventName: "WorkOrderCompleted",
      recipientUser: assignorUser,
      workOrder: completedWO,
    }),
  ]);
};
