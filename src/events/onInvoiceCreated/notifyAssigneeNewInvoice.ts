import { InvoicePushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models/User";
import type { InvoiceModelItem } from "@models/Invoice";

/**
 * Notify assignee of new Invoice when `NewInvoice` event is emitted.
 * @event NewInvoice
 * @param {InvoiceModelItem} newInvoice - The new Invoice
 * @category events
 */
export const notifyAssigneeNewInvoice = async (newInvoice?: InvoiceModelItem) => {
  if (!newInvoice) return;

  const {
    assignedTo: { id: assignedToUserID },
  } = newInvoice;

  const assigneeUser = await User.getItem({ id: assignedToUserID });

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneeUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "NewInvoice",
      recipientUser: assigneeUser,
      invoice: newInvoice,
    }),
  ]);
};
