import { InvoicePushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models";
import type { InvoiceModelItem } from "@models/Invoice";

export const notifyAssignorPaidInvoice = async (paidInvoice: InvoiceModelItem) => {
  const {
    createdBy: { id: createdByUserID },
  } = paidInvoice;

  const assignorUser = await User.getItem({
    id: createdByUserID,
    sk: User.getFormattedSK(createdByUserID),
  });

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
