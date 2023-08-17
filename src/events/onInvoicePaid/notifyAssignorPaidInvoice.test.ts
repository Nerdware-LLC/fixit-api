import { InvoicePushNotification } from "@events/pushNotifications";
import { lambdaClient } from "@lib/lambdaClient";
import { User, type UserModelItem } from "@models/User";
import { notifyAssignorPaidInvoice } from "./notifyAssignorPaidInvoice";
import type { InvoiceModelItem } from "@models/Invoice";

vi.mock("@aws-sdk/client-lambda"); // <repo_root>/__mocks__/@aws-sdk/client-lambda.ts

describe("notifyAssignorPaidInvoice", () => {
  test("sends a push notification to the assignor when the assignor has an expoPushToken", async () => {
    const paidInvoice = { createdBy: { id: "USER#123" } } as InvoiceModelItem;
    const assignorUser = { id: paidInvoice.createdBy.id, expoPushToken: "token" } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assignorUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorPaidInvoice(paidInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: paidInvoice.createdBy.id });
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new InvoicePushNotification({
        pushEventName: "InvoicePaid",
        recipientUser: assignorUser,
        invoice: paidInvoice,
      }),
    ]);
  });

  test("does not query the DB for a User when newInvoice is undefined", async () => {
    const getItemSpy = vi.spyOn(User, "getItem");
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorPaidInvoice();

    expect(result).toBeUndefined();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assignorUser can not be found", async () => {
    const paidInvoice = { createdBy: { id: "USER#123" } } as InvoiceModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(undefined);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorPaidInvoice(paidInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: paidInvoice.createdBy.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assignorUser does not have an expoPushToken", async () => {
    const paidInvoice = { createdBy: { id: "USER#123" } } as InvoiceModelItem;
    const assignorUser = { id: paidInvoice.createdBy.id } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assignorUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorPaidInvoice(paidInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: paidInvoice.createdBy.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});
