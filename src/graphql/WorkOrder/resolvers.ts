import { eventEmitter } from "@/events/eventEmitter";
import { DeleteMutationResponse } from "@/graphql/_common";
import { verifyUserCanPerformThisUpdate, formatAsGqlFixitUser } from "@/graphql/_helpers";
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
      return await formatAsGqlWorkOrder(existingWO, user);
    },
      // Query for all WorkOrders created by the authenticated User
      const createdByUserQueryResults = await WorkOrder.query({
              where: {
                createdByUserID: user.id,
                id: { beginsWith: WorkOrder.SK_PREFIX },
              },
      });

      // Query for all WorkOrders assigned to the authenticated User
      const assignedToUserQueryResults = await WorkOrder.query({
        where: {
          assignedToUserID: user.id,
          id: { beginsWith: WorkOrder.SK_PREFIX },
        },
      });

      // Map each query's results into the GraphQL schema's WorkOrder shape // TODO maybe let resolvers do this?
      return {
        createdByUser: await Promise.all(
          createdByUserQueryResults.map(async (woCreatedByUser) => ({
            ...woCreatedByUser,
            createdBy: { ...user },
            assignedTo: !woCreatedByUser?.assignedToUserID
              ? null
              : await formatAsGqlFixitUser({ id: woCreatedByUser.assignedToUserID }, user),
          }))
        ),
        assignedToUser: await Promise.all(
          assignedToUserQueryResults.map(async (woAssignedToUser) => ({
            ...woAssignedToUser,
            createdBy: await formatAsGqlFixitUser({ id: woAssignedToUser.createdByUserID }, user),
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

      return await formatAsGqlWorkOrder(createdWO, user);
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

      return await formatAsGqlWorkOrder(updatedWO, user);
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
        return await formatAsGqlWorkOrder(canceledWO, user);
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

      return await formatAsGqlWorkOrder(updatedWO, user);
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
 * This function converts `WorkOrder` objects from their internal database shape/format into the
 * GraphQL schema's `WorkOrder` shape/format.
 */
const formatAsGqlWorkOrder = async (
  workOrder: WorkOrderItem,
  userAuthToken: FixitApiAuthTokenPayload
) => ({
  ...workOrder,
  createdBy: await formatAsGqlFixitUser({ id: workOrder.createdByUserID }, userAuthToken),
  assignedTo: !workOrder?.assignedToUserID
    ? null
    : await formatAsGqlFixitUser({ id: workOrder.assignedToUserID }, userAuthToken),
});
