import { WorkOrderPushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models/User";
import type { WorkOrderModelItem } from "@models/WorkOrder";

/**
 * Notify assignee of cancelled WorkOrder when `WorkOrderCancelled` event is emitted.
 * @event WorkOrderCancelled
 * @param {WorkOrderModelItem} cancelledWO - The cancelled WorkOrder
 * @category events
 */
export const notifyAssigneeCancelledWO = async (cancelledWO?: WorkOrderModelItem) => {
  if (!cancelledWO) return;

  // If new WorkOrder was UNASSIGNED, return.
  if (!cancelledWO?.assignedTo?.id) return;

  const assigneeUser = await User.getItem({ id: cancelledWO.assignedTo.id });

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneeUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new WorkOrderPushNotification({
      pushEventName: "WorkOrderCancelled",
      recipientUser: assigneeUser,
      workOrder: cancelledWO,
    }),
  ]);
};
