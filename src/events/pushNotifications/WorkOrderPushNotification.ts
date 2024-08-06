import { PushNotification, type PushNotificationRecipient } from "./PushNotification.js";
import type { WorkOrderItem } from "@/models/WorkOrder";

/**
 * This class represents a push notification for a WorkOrder event.
 * @extends PushNotification
 * @category Events
 * @subcategory PushNotification
 */
export class WorkOrderPushNotification extends PushNotification {
  static PUSH_EVENTS = {
    WorkOrderAssigned: {
      title: "New Work Order",
      body: "A new Work Order is available.",
    },
    WorkOrderUnassigned: {
      title: "Work Order Unassigned",
      body: "A customer has unassigned you from an existing Work Order.",
    },
    WorkOrderUpdated: {
      title: "Work Order Update",
      body: "A customer has updated one of your assigned Work Orders.",
    },
    WorkOrderCancelled: {
      title: "Work Order Cancelled",
      body: "A customer has cancelled one of your assigned Work Orders.",
    },
    WorkOrderCompleted: {
      title: "Work Order Complete",
      body: "One of your Work Orders has been completed.",
    },
  } as const;

  constructor({
    pushEventName,
    recipientUser,
    workOrder: { id: workOrderID, location },
  }: {
    pushEventName: WorkOrderPushNotificationEventName;
    recipientUser: PushNotificationRecipient;
    workOrder: WorkOrderItem;
  }) {
    super({
      pushEventName,
      recipientUser,
      ...WorkOrderPushNotification.PUSH_EVENTS[pushEventName],
    });

    this.data.workOrderID = workOrderID;
    this.data.location = location;
  }
}

/**
 * Union of all possible push event names for WorkOrderPushNotification.
 */
type WorkOrderPushNotificationEventName = keyof typeof WorkOrderPushNotification.PUSH_EVENTS;
