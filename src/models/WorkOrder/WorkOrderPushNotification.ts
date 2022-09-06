import type { WorkOrderType, Location } from "./types";

export class WorkOrderPushNotification {
  static PUSH_EVENTS: Record<string, { title: string; body: string }> = {
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
  };

  to?: string;
  title: string;
  body: string;
  data: {
    _recipientUser: string;
    _eventName: WorkOrderPushNotificationEventName;
    workOrderID: string;
    location: Location;
  };

  constructor({
    pushEventName,
    recipientUser: { id: userID, expoPushToken },
    workOrder: { id: workOrderID, location }
  }: {
    pushEventName: WorkOrderPushNotificationEventName;
    recipientUser: { id: string; expoPushToken?: string };
    workOrder: WorkOrderType;
  }) {
    // push token may not be present for fns which batchGet them later on
    if (expoPushToken) this.to = expoPushToken;

    const { title, body } = WorkOrderPushNotification.PUSH_EVENTS[pushEventName];

    this.title = title;
    this.body = body;
    this.data = {
      _recipientUser: userID,
      _eventName: pushEventName,
      workOrderID,
      location
    };
  }
}

type WorkOrderPushNotificationEventName = keyof typeof WorkOrderPushNotification.PUSH_EVENTS;
