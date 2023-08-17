import { InvoicePushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User, type UserModelItem } from "@models/User";
import { notifyAssigneeNewInvoice } from "./notifyAssigneeNewInvoice";
import type { InvoiceModelItem } from "@models/Invoice";

vi.mock("@aws-sdk/client-lambda"); // <repo_root>/__mocks__/@aws-sdk/client-lambda.ts

describe("notifyAssigneeNewInvoice", () => {
  test("sends a push notification to the assignee when the assignee has an expoPushToken", async () => {
    const newInvoice = { assignedTo: { id: "USER#123" } } as InvoiceModelItem;
    const assigneeUser = { id: newInvoice.assignedTo.id, expoPushToken: "token" } as UserModelItem;
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
    const newInvoice = { assignedTo: { id: "USER#123" } } as InvoiceModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(undefined);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeNewInvoice(newInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: newInvoice.assignedTo.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser does not have an expoPushToken", async () => {
    const newInvoice = { assignedTo: { id: "USER#123" } } as InvoiceModelItem;
    const assigneeUser = { id: newInvoice.assignedTo.id } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeNewInvoice(newInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: newInvoice.assignedTo.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});
