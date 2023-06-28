import { InvoicePushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models";
import type { InvoiceModelItem } from "@models/Invoice";

export const notifyAssigneeDeletedInvoice = async (deletedInvoice: InvoiceModelItem) => {
  const {
    assignedTo: { id: assignedToUserID },
  } = deletedInvoice;

  const assigneeUser = await User.getItem({
    id: assignedToUserID,
    sk: User.getFormattedSK(assignedToUserID),
  });

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneeUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "InvoiceDeleted",
      recipientUser: {
        id: assignedToUserID,
        expoPushToken: assigneeUser.expoPushToken,
      },
      invoice: deletedInvoice,
    }),
  ]);
};
