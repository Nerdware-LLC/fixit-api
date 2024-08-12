import { ENV } from "@/server/env";
import type { UserItem } from "@/models/User";
import type { Primitive } from "type-fest";

/**
 * Represents a push notification.
 * @category Events
 * @subcategory PushNotification
 */
export class PushNotification {
  /** The recipient's Expo push token. */
  to?: PushNotificationRecipient["expoPushToken"];
  /** The title of the push notification. */
  title: string;
  /** The body/content of the push notification. */
  body: string;
  /** Additional data associated with the push notification. */
  data: {
    _apiEnv: typeof ENV.NODE_ENV;
    _pushEventName: string;
    _recipientUser: PushNotificationRecipient["id"];
    [key: string]: NonNullable<unknown>;
  };

  /**
   * Creates a new instance of PushNotification.
   * @param pushEventName - The name of the push event.
   * @param recipientUser - An object containing the recipient's User ID and Expo push token.
   * @param title - The title of the push notification.
   * @param body - The body/content of the push notification.
   */
  constructor({
    pushEventName,
    recipientUser: { id: userID, expoPushToken },
    title,
    body,
  }: {
    pushEventName: string;
    recipientUser: PushNotificationRecipient;
    title: string;
    body: string;
  }) {
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

/**
 * User-fields which define the {@link PushNotification} recipient.
 */
export type PushNotificationRecipient = Pick<UserItem, "id" | "expoPushToken"> & {
  [key: string]: Primitive | object;
};
