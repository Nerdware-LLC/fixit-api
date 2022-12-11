import { User, type InvoiceType } from "@models";
import { lambdaClient } from "@lib/lambdaClient";
import { InvoicePushNotification } from "@events/pushNotifications";

export const notifyAssigneeUpdatedInvoice = async (updatedInvoice: InvoiceType) => {
  const { assignedToUserID } = updatedInvoice;

  const assigneeUser = await User.getUserByID(assignedToUserID);

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneeUser?.expoPushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "InvoiceUpdated",
      recipientUser: {
        id: assignedToUserID,
        expoPushToken: assigneeUser.expoPushToken
      },
      invoice: updatedInvoice
    })
  ]);
};
