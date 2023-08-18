import { WorkOrderPushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User, type UserModelItem } from "@/models/User";
import { notifyAssigneeCancelledWO } from "./notifyAssigneeCancelledWO";
import type { WorkOrderModelItem } from "@/models/WorkOrder";

describe("notifyAssigneeCancelledWO", () => {
  test("sends a push notification to the assignee when the assignee has an expoPushToken", async () => {
    const cancelledWO = { assignedTo: { id: "USER#123" } } as WorkOrderModelItem;
    const assigneeUser = { id: "USER#123", expoPushToken: "token" } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeCancelledWO(cancelledWO);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: "USER#123" });
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new WorkOrderPushNotification({
        pushEventName: "WorkOrderCancelled",
        recipientUser: assigneeUser,
        workOrder: cancelledWO,
      }),
    ]);
  });

  test("does not query the DB for a User when cancelledWO is undefined", async () => {
    const getItemSpy = vi.spyOn(User, "getItem");
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeCancelledWO();

    expect(result).toBeUndefined();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser can not be found", async () => {
    const cancelledWO = { assignedTo: { id: "USER#123" } } as WorkOrderModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(undefined);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeCancelledWO(cancelledWO);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: "USER#123" });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser does not have an expoPushToken", async () => {
    const cancelledWO = { assignedTo: { id: "USER#123" } } as WorkOrderModelItem;
    const assigneeUser = { id: "USER#123" } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeCancelledWO(cancelledWO);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: "USER#123" });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});
