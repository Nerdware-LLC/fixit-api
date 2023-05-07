import { ENV } from "@server/env";
import type { Location } from "@types";

export class PushNotification {
  to?: string;
  title: string;
  body: string;
  data: PushNotificationPayloadData;

  constructor({
    pushEventName,
    recipientUser: { id: userID, expoPushToken },
    title,
    body,
  }: {
    pushEventName: string;
    recipientUser: { id: string; expoPushToken?: string };
    title: string;
    body: string;
  }) {
    // push token may not be present for fns which batchGet them later on
    if (expoPushToken) this.to = expoPushToken;

    this.title = title;
    this.body = body;
    this.data = {
      _apiEnv: ENV.NODE_ENV,
      _recipientUser: userID,
      _pushEventName: pushEventName,
    };
  }
}

interface PushNotificationPayloadData {
  _apiEnv: typeof ENV.NODE_ENV;
  _pushEventName: string;
  _recipientUser: string;
  // Keys sub-classes may attach to payload data:
  workOrderID?: string;
  invoiceID?: string;
  location?: Location;
}
