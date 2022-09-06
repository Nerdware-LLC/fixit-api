import { lambdaClient } from "@lib/lambdaClient";
import { User, InvoicePushNotification } from "@models";

export const notifyAssigneeNewInvoice = async (newInvoice) => {
  const { assignedToUserID } = newInvoice;

  const { expoPushToken: assigneePushToken } = await User.getUserByID(assignedToUserID);

  // If assignee does not currently have a registered pushToken, return.
  if (!assigneePushToken) return;

  await lambdaClient.invokeEvent("PushNotificationService", [
    new InvoicePushNotification({
      pushEventName: "NewInvoice",
      recipientUser: { id: assignedToUserID, expoPushToken: assigneePushToken },
      invoice: newInvoice
    })
  ]);
};
