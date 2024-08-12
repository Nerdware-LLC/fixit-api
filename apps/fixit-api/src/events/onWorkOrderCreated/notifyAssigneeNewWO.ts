import { WorkOrderPushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User } from "@/models/User";
import type { WorkOrderItem } from "@/models/WorkOrder";

/**
 * Notify assignee of new WorkOrder when `WorkOrderAssigned` event is emitted.
 * @event WorkOrderAssigned
 * @param {WorkOrderItem} newWO - The new WorkOrder
 * @category events
 */
export const notifyAssigneeNewWO = async (newWO?: WorkOrderItem) => {
  if (!newWO) return;

  // If new WorkOrder is UNASSIGNED, return.
  if (!newWO.assignedToUserID) return;

  const assigneeUser = await User.getItem({ id: newWO.assignedToUserID });

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneeUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new WorkOrderPushNotification({
      pushEventName: "WorkOrderAssigned",
      recipientUser: assigneeUser,
      workOrder: newWO,
    }),
  ]);
};
