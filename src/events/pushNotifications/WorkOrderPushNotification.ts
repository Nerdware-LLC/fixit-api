import { PushNotification } from "./_PushNotification";
import type { WorkOrderType } from "@models/WorkOrder/types";

export class WorkOrderPushNotification extends PushNotification {
  static PUSH_EVENTS = {
    WorkOrderAssigned: {
      title: "New Work Order",
      body: "A new Work Order is available."
    },
    WorkOrderUnassigned: {
      title: "Work Order Unassigned",
      body: "A customer has unassigned you from an existing Work Order."
    },
    WorkOrderUpdated: {
      title: "Work Order Update",
      body: "A customer has updated one of your assigned Work Orders."
    },
    WorkOrderCancelled: {
      title: "Work Order Cancelled",
      body: "A customer has cancelled one of your assigned Work Orders."
    },
    WorkOrderCompleted: {
      title: "Work Order Complete",
      body: "One of your Work Orders has been completed."
    }
  } as const;

  constructor({
    pushEventName,
    recipientUser,
    workOrder: { id: workOrderID, location }
  }: {
    pushEventName: WorkOrderPushNotificationEventName;
    recipientUser: { id: string; expoPushToken?: string };
    workOrder: WorkOrderType;
  }) {
    super({
      pushEventName,
      recipientUser,
      ...WorkOrderPushNotification.PUSH_EVENTS[pushEventName]
    });

    this.data.workOrderID = workOrderID;
    this.data.location = location;
  }
}

type WorkOrderPushNotificationEventName = keyof typeof WorkOrderPushNotification.PUSH_EVENTS;
