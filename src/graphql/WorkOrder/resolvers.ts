import { eventEmitter } from "@/events/eventEmitter";
import { DeleteMutationResponse } from "@/graphql/_common";
import { verifyUserCanPerformThisUpdate, formatAsGqlFixitUser } from "@/graphql/_helpers";
import { USER_ID_REGEX } from "@/models/User/regex";
import { WorkOrder } from "@/models/WorkOrder";
import { GqlUserInputError } from "@/utils";
import type { WorkOrderItem } from "@/models/WorkOrder";
import type { Resolvers } from "@/types";
import type { FixitApiAuthTokenPayload } from "@/utils";

export const resolvers: Partial<Resolvers> = {
  Query: {
    workOrder: async (_parent, { workOrderID }, { user }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      if (!existingWO) {
        throw new GqlUserInputError("A work order with the provided ID could not be found.");
      }

      return await formatAsGqlWorkOrder(existingWO, user);
    },
    myWorkOrders: async (_parent, _args, { user }) => {
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
    createWorkOrder: async (_parent, { workOrder: woInput }, { user }) => {
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
    updateWorkOrder: async (_parent, { workOrderID, workOrder: woInput }, { user }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      verifyUserCanPerformThisUpdate(existingWO, {
        idOfUserWhoCanPerformThisUpdate: existingWO.createdByUserID,
        authenticatedUserID: user.id,
        forbiddenStatuses: {
          CANCELLED: "The requested work order has been cancelled and cannot be updated.",
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

      // TODO Test - is this necessary? (maybe, 'location' is a required field, but why do it like this?)
      const { location, ...woFieldsToUpdate } = woInput;

      const updatedWO = await WorkOrder.updateItem(
        { id: existingWO.id, createdByUserID: existingWO.createdByUserID },
        {
          update: {
            ...woFieldsToUpdate,
            ...(!!location && { location }),
            status: upToDateStatus,
          },
        }
      );

      eventEmitter.emitWorkOrderUpdated(updatedWO, existingWO);

      return await formatAsGqlWorkOrder(updatedWO, user);
    },
    cancelWorkOrder: async (_parent, { workOrderID }, { user }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      verifyUserCanPerformThisUpdate(existingWO, {
        idOfUserWhoCanPerformThisUpdate: existingWO.createdByUserID,
        authenticatedUserID: user.id,
        forbiddenStatuses: {
          CANCELLED: "The requested work order has already been cancelled.",
          COMPLETE: "The requested work order has already been completed and cannot be cancelled.",
        },
      });

      /* If status is UNASSIGNED, delete it and return a DeleteMutationResponse.
      Otherwise, update WO status to CANCELLED and return the updated WorkOrder.*/

      if (existingWO.status === "UNASSIGNED") {
        await WorkOrder.deleteItem({ createdByUserID: user.id, id: workOrderID });
        return new DeleteMutationResponse({ id: workOrderID, wasDeleted: true });
      } else {
        const canceledWO = await WorkOrder.updateItem(
          { id: existingWO.id, createdByUserID: existingWO.createdByUserID },
          {
            update: {
              status: "CANCELLED",
            },
          }
        );

        eventEmitter.emitWorkOrderCancelled(canceledWO);

        return await formatAsGqlWorkOrder(canceledWO, user);
      }
    },
    setWorkOrderStatusComplete: async (_parent, { workOrderID }, { user }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      verifyUserCanPerformThisUpdate(existingWO, {
        idOfUserWhoCanPerformThisUpdate: existingWO?.assignedToUserID ?? "",
        authenticatedUserID: user.id,
        forbiddenStatuses: {
          UNASSIGNED: "Only the work order's assignee may perform this update.",
          CANCELLED: "The requested work order has been cancelled and cannot be marked complete.",
          COMPLETE: "The requested work order has already been marked complete.",
        },
      });

      const updatedWO = await WorkOrder.updateItem(
        { id: existingWO.id, createdByUserID: existingWO.createdByUserID },
        {
          update: {
            status: "COMPLETE",
          },
        }
      );

      eventEmitter.emitWorkOrderCompleted(updatedWO);

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
