import { WorkOrderPushNotification } from "@/events/pushNotifications/index.js";
import { lambdaClient } from "@/lib/lambdaClient/index.js";
import { User } from "@/models/User/User.js";
import type { WorkOrderItem } from "@/models/WorkOrder/WorkOrder.js";

/**
 * Notify assignor of completed WorkOrder when `WorkOrderCompleted` event is emitted.
 * @event WorkOrderCompleted
 * @param {WorkOrderItem} completedWO - The completed WorkOrder
 * @category events
 */
export const notifyAssignorCompletedWO = async (completedWO?: WorkOrderItem) => {
  if (!completedWO) return;

  const assignorUser = await User.getItem({ id: completedWO.createdByUserID });

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
