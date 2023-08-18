import { InvoicePushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User } from "@/models/User";
import type { InvoiceModelItem } from "@/models/Invoice";

/**
 * Notify assignee of deleted Invoice when `InvoiceDeleted` event is emitted.
 * @event InvoiceDeleted
 * @param {InvoiceModelItem} deletedInvoice - The deleted Invoice
 * @category events
 */
export const notifyAssigneeDeletedInvoice = async (deletedInvoice?: InvoiceModelItem) => {
  if (!deletedInvoice) return;

  const {
    assignedTo: { id: assignedToUserID },
  } = deletedInvoice;

  const assigneeUser = await User.getItem({ id: assignedToUserID });

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneeUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "InvoiceDeleted",
      recipientUser: assigneeUser,
      invoice: deletedInvoice,
    }),
  ]);
};
