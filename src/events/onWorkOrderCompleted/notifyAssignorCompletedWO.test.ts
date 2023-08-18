import { WorkOrderPushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User, type UserModelItem } from "@/models/User";
import { notifyAssignorCompletedWO } from "./notifyAssignorCompletedWO";
import type { WorkOrderModelItem } from "@/models/WorkOrder";

describe("notifyAssignorCompletedWO", () => {
  test("sends a push notification to the assignor when the assignor has an expoPushToken", async () => {
    const completedWO = { createdBy: { id: "USER#123" } } as WorkOrderModelItem;
    const assignorUser = { id: completedWO.createdBy.id, expoPushToken: "token" } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assignorUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorCompletedWO(completedWO);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: completedWO.createdBy.id });
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new WorkOrderPushNotification({
        pushEventName: "WorkOrderCompleted",
        recipientUser: assignorUser,
        workOrder: completedWO,
      }),
    ]);
  });

  test("does not query the DB for a User when completedWO is undefined", async () => {
    const getItemSpy = vi.spyOn(User, "getItem");
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorCompletedWO();

    expect(result).toBeUndefined();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assignorUser can not be found", async () => {
    const completedWO = { createdBy: { id: "USER#123" } } as WorkOrderModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(undefined);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorCompletedWO(completedWO);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: completedWO.createdBy.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assignorUser does not have an expoPushToken", async () => {
    const completedWO = { createdBy: { id: "USER#123" } } as WorkOrderModelItem;
    const assignorUser = { id: completedWO.createdBy.id } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assignorUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssignorCompletedWO(completedWO);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: completedWO.createdBy.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});
