import { isString } from "@nerdware/ts-type-safety-utils";
import { eventEmitter } from "@/events/eventEmitter.js";
import { DeleteMutationResponse } from "@/graphql/_common/index.js";
import {
  verifyUserIsAuthorizedToPerformThisUpdate,
  formatAsGqlFixitUser,
} from "@/graphql/_helpers/index.js";
import { Location } from "@/models/Location/Location.js";
import { USER_ID_REGEX } from "@/models/User/regex.js";
import { WorkOrder, type WorkOrderItem } from "@/models/WorkOrder/WorkOrder.js";
import { GqlUserInputError } from "@/utils/httpErrors.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Partial<Resolvers> = {
  Query: {
    workOrder: async (_parent, { workOrderID }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      assertWorkOrderWasFound(existingWO);

      return existingWO;
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
      const { assignedTo = "UNASSIGNED", location, ...createWorkOrderInput } = woInput;

      const createdWO = await WorkOrder.createItem({
        createdByUserID: user.id,
        assignedToUserID: assignedTo,
        status: assignedTo === "UNASSIGNED" ? "UNASSIGNED" : "ASSIGNED",
        location: Location.fromParams(location),
        ...createWorkOrderInput,
      });

      eventEmitter.emitWorkOrderCreated(createdWO);

      return createdWO;
    },
    updateWorkOrder: async (_parent, { workOrderID, workOrder: woInput }, { user }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      verifyUserIsAuthorizedToPerformThisUpdate(existingWO, {
        itemNotFoundErrorMessage: WORK_ORDER_NOT_FOUND_ERROR_MSG,
        idOfUserWhoCanPerformThisUpdate: existingWO?.createdByUserID,
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
        - Otherwise, the status should remain unchanged. */
      const upToDateStatus =
        existingWO.status === "ASSIGNED" && woInput?.assignedToUserID === "UNASSIGNED"
          ? "UNASSIGNED"
          : existingWO.status === "UNASSIGNED" &&
              isString(woInput?.assignedToUserID) &&
              USER_ID_REGEX.test(woInput.assignedToUserID.replace(/CONTACT#/, ""))
            ? "ASSIGNED"
            : existingWO.status;

      /* Extract `location`, and if provided, provide it to Location.fromParams.
      Note that `fromParams` will throw if required fields are not present. Since
      Location's are stored as compound-string attributes, they can not be partially
      updated, i.e., if it's desirable to only change `streetLine1`, it can not be
      updated without all the other Location fields being provided as well. */
      const { location, ...woFieldsToUpdate } = woInput;

      const updatedWO = await WorkOrder.updateItem(
        { id: existingWO.id, createdByUserID: existingWO.createdByUserID },
        {
          update: {
            ...woFieldsToUpdate,
            ...(!!location && { location: Location.fromParams(location) }),
            status: upToDateStatus,
          },
        }
      );

      eventEmitter.emitWorkOrderUpdated(updatedWO, existingWO);

      return updatedWO;
    },
    cancelWorkOrder: async (_parent, { workOrderID }, { user }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      verifyUserIsAuthorizedToPerformThisUpdate(existingWO, {
        itemNotFoundErrorMessage: WORK_ORDER_NOT_FOUND_ERROR_MSG,
        idOfUserWhoCanPerformThisUpdate: existingWO?.createdByUserID,
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

        return canceledWO;
      }
    },
    setWorkOrderStatusComplete: async (_parent, { workOrderID }, { user }) => {
      const [existingWO] = await WorkOrder.query({
        where: { id: workOrderID },
        limit: 1,
      });

      verifyUserIsAuthorizedToPerformThisUpdate(existingWO, {
        itemNotFoundErrorMessage: WORK_ORDER_NOT_FOUND_ERROR_MSG,
        idOfUserWhoCanPerformThisUpdate: existingWO?.assignedToUserID,
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

      return updatedWO;
    },
  },
  WorkOrder: {
    createdBy: async (workOrder, _args, { user }) => {
      return await formatAsGqlFixitUser({ id: workOrder.createdByUserID }, user);
    },
    assignedTo: async (workOrder, _args, { user }) => {
      return workOrder?.assignedToUserID
        ? await formatAsGqlFixitUser({ id: workOrder.assignedToUserID }, user)
        : null;
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

const WORK_ORDER_NOT_FOUND_ERROR_MSG = "A work order with the provided ID could not be found.";

/**
 * Asserts that a WorkOrder was found in the database.
 */
export function assertWorkOrderWasFound<W extends WorkOrderItem>(
  workOrder: W | undefined
): asserts workOrder is NonNullable<W> {
  if (!workOrder) {
    throw new GqlUserInputError(WORK_ORDER_NOT_FOUND_ERROR_MSG);
  }
}
