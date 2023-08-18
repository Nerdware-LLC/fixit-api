import { WorkOrderPushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User, type UserModelItem } from "@/models/User";
import { notifyAssigneeNewWO } from "./notifyAssigneeNewWO";
import type { WorkOrderModelItem } from "@/models/WorkOrder";

describe("notifyAssigneeNewWO", () => {
  test("sends a push notification to the assignee when the assignee has an expoPushToken", async () => {
    const newWO = { assignedTo: { id: "USER#123" } } as WorkOrderWithAssignee;
    const assigneeUser = { id: newWO.assignedTo.id, expoPushToken: "token" } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeNewWO(newWO);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: newWO.assignedTo.id });
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new WorkOrderPushNotification({
        pushEventName: "WorkOrderAssigned",
        recipientUser: assigneeUser,
        workOrder: newWO,
      }),
    ]);
  });

  test("does not query the DB for a User when newWO is undefined", async () => {
    const getItemSpy = vi.spyOn(User, "getItem");
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeNewWO();

    expect(result).toBeUndefined();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser can not be found", async () => {
    const newWO = { assignedTo: { id: "USER#123" } } as WorkOrderWithAssignee;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(undefined);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeNewWO(newWO);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: newWO.assignedTo.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test("does not invoke an event if the assigneeUser does not have an expoPushToken", async () => {
    const newWO = { assignedTo: { id: "USER#123" } } as WorkOrderWithAssignee;
    const assigneeUser = { id: newWO.assignedTo.id } as UserModelItem;
    const getItemSpy = vi.spyOn(User, "getItem").mockResolvedValueOnce(assigneeUser);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeNewWO(newWO);

    expect(result).toBeUndefined();
    expect(getItemSpy).toHaveBeenCalledWith({ id: newWO.assignedTo.id });
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });
});

type WorkOrderWithAssignee = WorkOrderModelItem & { assignedTo: { id: string } };
