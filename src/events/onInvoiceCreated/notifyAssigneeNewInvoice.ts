import { InvoicePushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User } from "@models";
import type { InvoiceType } from "@types";

export const notifyAssigneeNewInvoice = async (newInvoice: InvoiceType) => {
  const { assignedToUserID } = newInvoice;

  const assigneeUser = await User.getUserByID(assignedToUserID);

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneeUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "NewInvoice",
      recipientUser: {
        id: assignedToUserID,
        expoPushToken: assigneeUser.expoPushToken,
      },
      invoice: newInvoice,
    }),
  ]);
};
