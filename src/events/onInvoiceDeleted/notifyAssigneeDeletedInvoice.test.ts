import { InvoicePushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User, type UserModelItem } from "@/models/User";
import { notifyAssigneeDeletedInvoice } from "./notifyAssigneeDeletedInvoice";
import type { InvoiceModelItem } from "@/models/Invoice";

vi.mock("@aws-sdk/client-lambda"); // <repo_root>/__mocks__/@aws-sdk/client-lambda.ts

describe("notifyAssigneeDeletedInvoice", () => {
  test("sends a push notification to the assignee when the assignee has an expoPushToken", async () => {
    const deletedInv = { assignedTo: { id: "USER#123" } } as InvoiceModelItem;
    const assigneeUser = { id: deletedInv.assignedTo.id, expoPushToken: "token" } as UserModelItem;
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);

    const result = await notifyAssigneeDeletedInvoice(deletedInv);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: deletedInv.assignedTo.id });
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
    const deletedInvoice = { assignedTo: { id: "USER#123" } } as InvoiceModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(undefined);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeDeletedInvoice(deletedInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: deletedInvoice.assignedTo.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser does not have an expoPushToken", async () => {
    const deletedInvoice = { assignedTo: { id: "USER#123" } } as InvoiceModelItem;
    const assigneeUser = { id: deletedInvoice.assignedTo.id } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeDeletedInvoice(deletedInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: deletedInvoice.assignedTo.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});
