import { InvoicePushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User } from "@/models/User";
import type { InvoiceModelItem } from "@/models/Invoice";

/**
 * Notify assignee of updated Invoice when `InvoiceUpdated` event is emitted.
 * @event InvoiceUpdated
 * @param {InvoiceModelItem} updatedInvoice - The updated Invoice
 * @category events
 */
export const notifyAssigneeUpdatedInvoice = async (updatedInvoice?: InvoiceModelItem) => {
  if (!updatedInvoice) return;

  const {
    assignedTo: { id: assignedToUserID },
  } = updatedInvoice;

  const assigneeUser = await User.getItem({ id: assignedToUserID });

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneeUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "InvoiceUpdated",
      recipientUser: assigneeUser,
      invoice: updatedInvoice,
    }),
  ]);
};
