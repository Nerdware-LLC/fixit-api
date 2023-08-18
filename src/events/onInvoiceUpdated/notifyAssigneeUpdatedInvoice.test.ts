import { InvoicePushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User, type UserModelItem } from "@/models/User";
import { notifyAssigneeUpdatedInvoice } from "./notifyAssigneeUpdatedInvoice";
import type { InvoiceModelItem } from "@/models/Invoice";

vi.mock("@aws-sdk/client-lambda"); // <repo_root>/__mocks__/@aws-sdk/client-lambda.ts

describe("notifyAssigneeUpdatedInvoice", () => {
  test("sends a push notification to the assignee when the assignee has an expoPushToken", async () => {
    const updatedInv = { assignedTo: { id: "USER#123" } } as InvoiceModelItem;
    const assigneeUser = { id: updatedInv.assignedTo.id, expoPushToken: "token" } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedInvoice(updatedInv);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: updatedInv.assignedTo.id });
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new InvoicePushNotification({
        pushEventName: "InvoiceUpdated",
        recipientUser: assigneeUser,
        invoice: updatedInv,
      }),
    ]);
  });

  test("does not query the DB for a User when updatedInvoice is undefined", async () => {
    const getItemSpy = vi.spyOn(User, "getItem");
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedInvoice();

    expect(result).toBeUndefined();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser can not be found", async () => {
    const updatedInvoice = { assignedTo: { id: "USER#123" } } as InvoiceModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(undefined);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedInvoice(updatedInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: updatedInvoice.assignedTo.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser does not have an expoPushToken", async () => {
    const updatedInvoice = { assignedTo: { id: "USER#123" } } as InvoiceModelItem;
    const assigneeUser = { id: updatedInvoice.assignedTo.id } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedInvoice(updatedInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: updatedInvoice.assignedTo.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});
