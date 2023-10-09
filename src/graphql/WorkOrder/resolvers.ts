import { eventEmitter } from "@/events/eventEmitter";
import { DeleteMutationResponse } from "@/graphql/_common";
import { verifyUserCanPerformThisUpdate, getFixitUser } from "@/graphql/_helpers";
import { USER_ID_REGEX } from "@/models/User/regex";
import { WorkOrder } from "@/models/WorkOrder";
import type { WorkOrderItem } from "@/models/WorkOrder";
import type { FixitApiAuthTokenPayload } from "@/utils";

export const resolvers: Partial<Resolvers> = {
  Query: {
    workOrder: async (parent, { workOrderID }, { user }) => {
      const [queriedWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });
      return await getWorkOrderCreatedByAndAssignedTo(queriedWO, user);
    },
    myWorkOrders: async (parent, args, { user }) => {
      return {
        createdByUser: await Promise.all(
          (
            await WorkOrder.query({
              where: {
                createdByUserID: user.id,
                id: { beginsWith: WorkOrder.SK_PREFIX },
              },
            })
          ).map(async (wo) => ({
            ...wo,
            createdBy: { ...user },
            assignedTo: !wo?.assignedTo?.id ? null : await getFixitUser(wo.assignedTo, user),
          }))
        ),
        assignedToUser: await Promise.all(
          (
            await WorkOrder.query({
              where: {
                assignedToUserID: user.id,
                id: { beginsWith: WorkOrder.SK_PREFIX },
              },
            })
          ).map(async (wo) => ({
            ...wo,
            createdBy: await getFixitUser(wo.createdBy, user),
            assignedTo: { ...user },
          }))
        ),
      };
    },
  },
  Mutation: {
    createWorkOrder: async (parent, { workOrder: woInput }, { user }) => {
      const { assignedTo = "UNASSIGNED", ...createWorkOrderInput } = woInput;

      const createdWO = await WorkOrder.createItem({
        createdByUserID: user.id,
        assignedToUserID: assignedTo,
        status: assignedTo === "UNASSIGNED" ? "UNASSIGNED" : "ASSIGNED",
        ...createWorkOrderInput,
      });

      eventEmitter.emitWorkOrderCreated(createdWO);

      return await getWorkOrderCreatedByAndAssignedTo(createdWO, user);
    },
    updateWorkOrder: async (parent, { workOrderID, workOrder: woInput }, { user }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      verifyUserCanPerformThisUpdate(existingWO, {
        idOfUserWhoCanPerformThisUpdate: existingWO.createdBy.id,
        authenticatedUserID: user.id,
        forbiddenStatuses: {
          CANCELLED: "This work order has been canceled and can not be updated.",
        },
      });

      /* Check if woInput args necessitate updating the STATUS:

        - If the existingWO.status is ASSIGNED and woInput.assignedToUserID is UNASSIGNED,
          then the status should be updated to UNASSIGNED.

        - If the existingWO.status is UNASSIGNED and woInput.assignedToUserID is a valid
          User/Contact ID, then the status should be updated to ASSIGNED.

        - Otherwise, the status should remain unchanged.
      */

      const upToDateStatus =
        existingWO.status === "ASSIGNED" && woInput?.assignedToUserID === "UNASSIGNED"
          ? "UNASSIGNED"
          : existingWO.status === "UNASSIGNED" &&
            typeof woInput?.assignedToUserID === "string" &&
            USER_ID_REGEX.test(woInput.assignedToUserID.replace(/CONTACT#/, ""))
          ? "ASSIGNED"
          : existingWO.status;

      const { location, ...woFieldsToUpdate } = woInput;

      const updatedWO = await WorkOrder.updateOne(existingWO, {
        ...woFieldsToUpdate,
        ...(!!location && { location }),
        status: upToDateStatus,
      });

      return await getWorkOrderCreatedByAndAssignedTo(updatedWO, user);
    },
    cancelWorkOrder: async (parent, { workOrderID }, { user }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      verifyUserCanPerformThisUpdate(existingWO, {
        idOfUserWhoCanPerformThisUpdate: existingWO.createdBy.id,
        authenticatedUserID: user.id,
        forbiddenStatuses: {
          CANCELLED: "This work order has already been cancelled.",
          COMPLETE: "Sorry, this work order has already been completed and cannot be canceled.",
        },
      });

      /* If status is UNASSIGNED, delete it and return a DeleteMutationResponse.
      Otherwise, update WO status to CANCELLED and return the updated WorkOrder.*/

      if (existingWO.status === "UNASSIGNED") {
        await WorkOrder.deleteItem({ createdByUserID: user.id, id: workOrderID });
        return new DeleteMutationResponse({ id: workOrderID, wasDeleted: true });
      } else {
        const canceledWO = await WorkOrder.updateOne(existingWO, { status: "CANCELLED" });
        return await getWorkOrderCreatedByAndAssignedTo(canceledWO, user);
      }
    },
    setWorkOrderStatusComplete: async (parent, { workOrderID }, { user }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      verifyUserCanPerformThisUpdate(existingWO, {
        idOfUserWhoCanPerformThisUpdate: existingWO?.assignedTo?.id ?? "",
        authenticatedUserID: user.id,
        forbiddenStatuses: {
          UNASSIGNED: "Sorry, only the work order's assignee may perform this update.",
          CANCELLED: "Sorry, this work order was cancelled and cannot be marked as complete.",
          COMPLETE: "This work order is already marked as complete.",
        },
      });

      const updatedWO = await WorkOrder.updateOne(existingWO, { status: "COMPLETE" });

      return await getWorkOrderCreatedByAndAssignedTo(updatedWO, user);
    },
  },
  CancelWorkOrderResponse: {
    __resolveType(parent) {
      return "createdBy" in parent
        ? "WorkOrder"
        : parent.id && "wasDeleted" in parent
        ? "DeleteMutationResponse"
        : null; // null --> GraphQLError is thrown
    },
  },
};

/**
 * This function gets the WorkOrder `createdBy` and `assignedTo` FixitUser fields.
 */
const getWorkOrderCreatedByAndAssignedTo = async (
  workOrder: WorkOrderItem,
  userAuthToken: FixitApiAuthTokenPayload
) => ({
  ...workOrder,
  createdBy: await getFixitUser(workOrder.createdBy, userAuthToken),
  assignedTo: !workOrder?.assignedTo?.id
    ? null
    : await getFixitUser(workOrder.assignedTo, userAuthToken),
});
