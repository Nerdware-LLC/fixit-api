import { InvoicePushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User, type UserItem } from "@/models/User";
import { notifyAssigneeNewInvoice } from "./notifyAssigneeNewInvoice";
import type { InvoiceItem } from "@/models/Invoice";

describe("notifyAssigneeNewInvoice", () => {
  test("sends a push notification to the assignee when the assignee has an expoPushToken", async () => {
    const newInvoice = { assignedToUserID: "USER#123" } as InvoiceItem;
    const assigneeUser = { id: newInvoice.assignedToUserID, expoPushToken: "token" } as UserItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeNewInvoice(newInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: newInvoice.assignedTo.id });
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new InvoicePushNotification({
        pushEventName: "NewInvoice",
        recipientUser: assigneeUser,
        invoice: newInvoice,
      }),
    ]);
  });

  test("does not query the DB for a User when newInvoice is undefined", async () => {
    const getItemSpy = vi.spyOn(User, "getItem");
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeNewInvoice();

    expect(result).toBeUndefined();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser can not be found", async () => {
    const newInvoice = { assignedToUserID: "USER#123" } as InvoiceItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(undefined);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeNewInvoice(newInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: newInvoice.assignedTo.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser does not have an expoPushToken", async () => {
    const newInvoice = { assignedToUserID: "USER#123" } as InvoiceItem;
    const assigneeUser = { id: newInvoice.assignedToUserID } as UserItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeNewInvoice(newInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: newInvoice.assignedTo.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});
