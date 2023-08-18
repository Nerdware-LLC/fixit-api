import { WorkOrderPushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User, type UserModelItem } from "@/models/User";
import { notifyAssigneeUpdatedWO } from "./notifyAssigneeUpdatedWO";
import type { WorkOrderModelItem } from "@/models/WorkOrder";

describe("notifyAssigneeUpdatedWO", () => {
  test("does not create/send any PushNotifications when there are no assignees", async () => {
    const woState = { id: "WO#123", assignedTo: null } as WorkOrderModelItem;
    const batchGetItemsSpy = vi.spyOn(User, "batchGetItems");
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedWO(woState, woState);

    expect(result).toBeUndefined();
    expect(batchGetItemsSpy).not.toHaveBeenCalled();
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test(`sends a "WO-Unassigned" PN to a User unassigned from a WO if they have a valid push token`, async () => {
    const prevAssignee = { id: "USER#111", expoPushToken: "token" } as UserModelItem;
    const prevWOstate = { id: "WO#123", assignedTo: { id: prevAssignee.id } } as WorkOrderModelItem;
    const newWOstate = { ...prevWOstate, assignedTo: null };
    const batchGetItemsSpy = vi.spyOn(User, "batchGetItems").mockResolvedValueOnce([prevAssignee]);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedWO(newWOstate, prevWOstate);

    expect(result).toBeUndefined();
    expect(batchGetItemsSpy).toHaveBeenCalledTimes(1);
    expect(invokeEventSpy).toHaveBeenCalledTimes(1);
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new WorkOrderPushNotification({
        pushEventName: "WorkOrderUnassigned",
        recipientUser: prevAssignee,
        workOrder: prevWOstate,
      }),
    ]);
  });

  test(`does not send a "WO-Unassigned" PN to a User unassigned from a WO if they don't have a valid push token`, async () => {
    const prevAssignee = { id: "USER#111", expoPushToken: null } as UserModelItem;
    const prevWOstate = { id: "WO#123", assignedTo: { id: prevAssignee.id } } as WorkOrderModelItem;
    const newWOstate = { ...prevWOstate, assignedTo: null };
    const batchGetItemsSpy = vi.spyOn(User, "batchGetItems").mockResolvedValueOnce([prevAssignee]);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedWO(newWOstate, prevWOstate);

    expect(result).toBeUndefined();
    expect(batchGetItemsSpy).toHaveBeenCalledTimes(1);
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test(`sends a "WO-Assigned" PN to a User newly assigned to a WO if they have a valid push token`, async () => {
    const prevWOstate = { id: "WO#123", assignedTo: null } as WorkOrderModelItem;
    const newAssignee = { id: "USER#111", expoPushToken: "token" } as UserModelItem;
    const newWOstate = { ...prevWOstate, assignedTo: { id: newAssignee.id } };
    const batchGetItemsSpy = vi.spyOn(User, "batchGetItems").mockResolvedValueOnce([newAssignee]);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedWO(newWOstate, prevWOstate);

    expect(result).toBeUndefined();
    expect(batchGetItemsSpy).toHaveBeenCalledTimes(1);
    expect(invokeEventSpy).toHaveBeenCalledTimes(1);
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new WorkOrderPushNotification({
        pushEventName: "WorkOrderAssigned",
        recipientUser: newAssignee,
        workOrder: newWOstate,
      }),
    ]);
  });

  test(`does not send a "WO-Assigned" PN to a User newly assigned to a WO if they don't have a valid push token`, async () => {
    const prevWOstate = { id: "WO#123", assignedTo: null } as WorkOrderModelItem;
    const newAssignee = { id: "USER#111", expoPushToken: null } as UserModelItem;
    const newWOstate = { ...prevWOstate, assignedTo: { id: newAssignee.id } };
    const batchGetItemsSpy = vi.spyOn(User, "batchGetItems").mockResolvedValueOnce([newAssignee]);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedWO(newWOstate, prevWOstate);

    expect(result).toBeUndefined();
    expect(batchGetItemsSpy).toHaveBeenCalledTimes(1);
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test(`sends a "WO-Updated" PN to the assignee with a valid push token when the WO the assignee remains the same`, async () => {
    const assignee = { id: "USER#111", expoPushToken: "token" } as UserModelItem;
    const woState = { id: "WO#123", assignedTo: { id: assignee.id } } as WorkOrderModelItem;
    const batchGetItemsSpy = vi.spyOn(User, "batchGetItems").mockResolvedValueOnce([assignee]);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedWO(woState, woState);

    expect(result).toBeUndefined();
    expect(batchGetItemsSpy).toHaveBeenCalledTimes(1);
    expect(invokeEventSpy).toHaveBeenCalledTimes(1);
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new WorkOrderPushNotification({
        pushEventName: "WorkOrderUpdated",
        recipientUser: assignee,
        workOrder: woState,
      }),
    ]);
  });

  test(`does not send a "WO-Updated" PN to the assignee without a valid push token when the WO the assignee remains the same`, async () => {
    const assignee = { id: "USER#111", expoPushToken: null } as UserModelItem;
    const woState = { id: "WO#123", assignedTo: { id: assignee.id } } as WorkOrderModelItem;
    const batchGetItemsSpy = vi.spyOn(User, "batchGetItems").mockResolvedValueOnce([assignee]);
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedWO(woState, woState);

    expect(result).toBeUndefined();
    expect(batchGetItemsSpy).toHaveBeenCalledTimes(1);
    expect(invokeEventSpy).not.toHaveBeenCalled();
  });

  test(`sends PNs to both the unassigned and newly-assigned Users when the WO is re-assigned and they both have valid push tokens`, async () => {
    const prevAssignee = { id: "USER#111", expoPushToken: "token1" } as UserModelItem;
    const newAssignee = { id: "USER#222", expoPushToken: "token2" } as UserModelItem;
    const prevWOstate = { id: "WO#123", assignedTo: { id: prevAssignee.id } } as WorkOrderModelItem;
    const newWOstate = { id: "WO#123", assignedTo: { id: newAssignee.id } } as WorkOrderModelItem;
    const batchGetItemsSpy = vi.spyOn(User, "batchGetItems").mockResolvedValueOnce([prevAssignee, newAssignee]); // prettier-ignore
    const invokeEventSpy = vi.spyOn(lambdaClient, "invokeEvent");

    const result = await notifyAssigneeUpdatedWO(newWOstate, prevWOstate);

    expect(result).toBeUndefined();
    expect(batchGetItemsSpy).toHaveBeenCalledTimes(1);
    expect(invokeEventSpy).toHaveBeenCalledWith("PushNotificationService", [
      new WorkOrderPushNotification({
        pushEventName: "WorkOrderUnassigned",
        recipientUser: prevAssignee,
        workOrder: prevWOstate,
      }),
      new WorkOrderPushNotification({
        pushEventName: "WorkOrderAssigned",
        recipientUser: newAssignee,
        workOrder: newWOstate,
      }),
    ]);
  });
});
