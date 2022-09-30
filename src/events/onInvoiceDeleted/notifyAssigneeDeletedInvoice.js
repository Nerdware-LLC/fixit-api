import { User } from "@models/User";
import { lambdaClient } from "@lib/lambdaClient";
import { InvoicePushNotification } from "@events/pushNotifications";

export const notifyAssigneeDeletedInvoice = async (deletedInvoice) => {
  const { assignedToUserID } = deletedInvoice;

  const { expoPushToken: assigneePushToken } = await User.getUserByID(assignedToUserID);

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneePushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "InvoiceDeleted",
      recipientUser: { id: assignedToUserID, expoPushToken: assigneePushToken },
      invoice: deletedInvoice
    })
  ]);
};
