import { User, type InvoiceType } from "@models";
import { lambdaClient } from "@lib/lambdaClient";
import { InvoicePushNotification } from "@events/pushNotifications";

export const notifyAssignorPaidInvoice = async (paidInvoice: InvoiceType) => {
  const { createdByUserID } = paidInvoice;

  const assignorUser = await User.getUserByID(createdByUserID);

  // If assignor does not currently have a registered pushToken, return.
  if (!assignorUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "InvoicePaid",
      recipientUser: {
        id: createdByUserID,
        expoPushToken: assignorUser.expoPushToken
      },
      invoice: paidInvoice
    })
  ]);
};
