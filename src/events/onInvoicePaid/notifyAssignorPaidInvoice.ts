import { User, type InvoiceType } from "@models";
import { lambdaClient } from "@lib/lambdaClient";
import { InvoicePushNotification } from "@events/pushNotifications";

export const notifyAssignorPaidInvoice = async (paidInvoice: InvoiceType) => {
  const { createdByUserID } = paidInvoice;

  const { expoPushToken: assignorPushToken } = await User.getUserByID(createdByUserID);

  // If assignee does not currently have a registered pushToken, return.
  if (!assignorPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "InvoicePaid",
      recipientUser: { id: createdByUserID, expoPushToken: assignorPushToken },
      invoice: paidInvoice
    })
  ]);
};
