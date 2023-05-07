import { InvoicePushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models";
import type { InvoiceType } from "@types";

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
        expoPushToken: assignorUser.expoPushToken,
      },
      invoice: paidInvoice,
    }),
  ]);
};
