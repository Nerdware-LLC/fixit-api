import { InvoicePushNotification } from "@/events/pushNotifications/InvoicePushNotification.js";
import { lambdaClient } from "@/lib/lambdaClient/lambdaClient.js";
import { User, type UserItem } from "@/models/User";
import { notifyAssigneeDeletedInvoice } from "./notifyAssigneeDeletedInvoice.js";
import type { InvoiceItem } from "@/models/Invoice";

describe("notifyAssigneeDeletedInvoice", () => {
  test("sends a push notification to the assignee when the assignee has an expoPushToken", async () => {
    const deletedInv = { assignedToUserID: "USER#123" } as InvoiceItem;
    const assigneeUser = { id: deletedInv.assignedToUserID, expoPushToken: "token" } as UserItem;
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);

    const result = await notifyAssigneeDeletedInvoice(deletedInv);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: deletedInv.assignedToUserID });
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new InvoicePushNotification({
        pushEventName: "InvoiceDeleted",
        recipientUser: assigneeUser,
        invoice: deletedInv,
      }),
    ]);
  });

  test("does not query the DB for a User when deletedInvoice is undefined", async () => {
    const getItemSpy = vi.spyOn(User, "getItem");
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeDeletedInvoice();

    expect(result).toBeUndefined();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser can not be found", async () => {
    const deletedInvoice = { assignedToUserID: "USER#123" } as InvoiceItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(undefined);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeDeletedInvoice(deletedInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: deletedInvoice.assignedToUserID });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser does not have an expoPushToken", async () => {
    const deletedInvoice = { assignedToUserID: "USER#123" } as InvoiceItem;
    const assigneeUser = { id: deletedInvoice.assignedToUserID } as UserItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeDeletedInvoice(deletedInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: deletedInvoice.assignedToUserID });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});
