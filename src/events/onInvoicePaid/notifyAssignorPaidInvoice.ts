import { InvoicePushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models/User";
import type { InvoiceModelItem } from "@models/Invoice";

/**
 * Notify assignor of paid Invoice when `InvoicePaid` event is emitted.
 * @event InvoicePaid
 * @param {InvoiceModelItem} paidInvoice - The paid Invoice
 * @category events
 */
export const notifyAssignorPaidInvoice = async (paidInvoice?: InvoiceModelItem) => {
  if (!paidInvoice) return;

  const {
    createdBy: { id: createdByUserID },
  } = paidInvoice;

  const assignorUser = await User.getItem({ id: createdByUserID });

  // If assignor does not currently have a registered pushToken, return.
  if (!assignorUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "InvoicePaid",
      recipientUser: assignorUser,
      invoice: paidInvoice,
    }),
  ]);
};
