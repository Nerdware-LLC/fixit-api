import { InvoicePushNotification } from "@/events/pushNotifications/index.js";
import { lambdaClient } from "@/lib/lambdaClient/index.js";
import { User } from "@/models/User/User.js";
import type { InvoiceItem } from "@/models/Invoice/Invoice.js";

/**
 * Notify assignee of updated Invoice when `InvoiceUpdated` event is emitted.
 * @event InvoiceUpdated
 * @param {InvoiceItem} updatedInvoice - The updated Invoice
 * @category events
 */
export const notifyAssigneeUpdatedInvoice = async (updatedInvoice?: InvoiceItem) => {
  if (!updatedInvoice) return;

  const { assignedToUserID } = updatedInvoice;

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
