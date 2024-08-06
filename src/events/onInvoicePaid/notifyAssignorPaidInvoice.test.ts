import { InvoicePushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User, type UserItem } from "@/models/User";
import { notifyAssignorPaidInvoice } from "./notifyAssignorPaidInvoice.js";
import type { InvoiceItem } from "@/models/Invoice";

describe("notifyAssignorPaidInvoice", () => {
  test("sends a push notification to the assignor when the assignor has an expoPushToken", async () => {
    const paidInvoice = { createdByUserID: "USER#123" } as InvoiceItem;
    const assignorUser = { id: paidInvoice.createdByUserID, expoPushToken: "token" } as UserItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assignorUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorPaidInvoice(paidInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: paidInvoice.createdByUserID });
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
    const paidInvoice = { createdByUserID: "USER#123" } as InvoiceItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(undefined);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorPaidInvoice(paidInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: paidInvoice.createdByUserID });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assignorUser does not have an expoPushToken", async () => {
    const paidInvoice = { createdByUserID: "USER#123" } as InvoiceItem;
    const assignorUser = { id: paidInvoice.createdByUserID } as UserItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assignorUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorPaidInvoice(paidInvoice);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: paidInvoice.createdByUserID });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});
