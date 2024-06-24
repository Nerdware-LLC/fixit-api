import { DeleteMutationResponse } from "@/graphql/_responses/index.js";
import { workOrderModelHelpers } from "@/models/WorkOrder/helpers.js";
import { UserService } from "@/services/UserService";
import { WorkOrderService } from "@/services/WorkOrderService";
import { createWorkOrderZodSchema, updateWorkOrderZodSchema } from "./helpers.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Resolvers = {
  Query: {
    workOrder: async (_parent, { workOrderID }) => {
      // Sanitize workOrderID
      workOrderID = workOrderModelHelpers.id.sanitizeAndValidate(workOrderID);

      return await WorkOrderService.findWorkOrderByID({ workOrderID });
    },
    myWorkOrders: async (_parent, _args, { user }) => {
      return await WorkOrderService.queryUsersWorkOrders({ authenticatedUser: user });
    },
  },
  Mutation: {
    createWorkOrder: async (_parent, { workOrder: createWorkOrderInput }, { user }) => {
      // Sanitize and validate the provided createWorkOrderInput
      createWorkOrderInput = createWorkOrderZodSchema.parse(createWorkOrderInput);

      return await WorkOrderService.createWorkOrder({
        createdByUserID: user.id,
        ...createWorkOrderInput,
      });
    },
    updateWorkOrder: async (_parent, { workOrderID, workOrder: woInput }, { user }) => {
      // Sanitize workOrderID
      workOrderID = workOrderModelHelpers.id.sanitizeAndValidate(workOrderID);
      // Sanitize and validate the provided woInput
      woInput = updateWorkOrderZodSchema.parse(woInput);

      return await WorkOrderService.updateWorkOrder({
        workOrderID,
        update: woInput,
        authenticatedUserID: user.id,
      });
    },
    cancelWorkOrder: async (_parent, { workOrderID }, { user }) => {
      // Sanitize workOrderID
      workOrderID = workOrderModelHelpers.id.sanitizeAndValidate(workOrderID);

      const { deleted, workOrder } = await WorkOrderService.cancelWorkOrder({
        workOrderID,
        authenticatedUserID: user.id,
      });

      return deleted ? new DeleteMutationResponse({ success: true, id: workOrder.id }) : workOrder;
    },
    setWorkOrderStatusComplete: async (_parent, { workOrderID }, { user }) => {
      // Sanitize workOrderID
      workOrderID = workOrderModelHelpers.id.sanitizeAndValidate(workOrderID);

      return await WorkOrderService.setWorkOrderStatusComplete({
        workOrderID,
        authenticatedUserID: user.id,
      });
    },
  },
  WorkOrder: {
    createdBy: async (workOrder, _args, { user }) => {
      return workOrder.createdByUserID === user.id
        ? user
        : await UserService.getUserByHandleOrID({ id: workOrder.createdByUserID });
    },
    assignedTo: async (workOrder, _args, { user }) => {
      return !workOrder?.assignedToUserID
        ? null
        : workOrder.assignedToUserID === user.id
          ? user
          : await UserService.getUserByHandleOrID({ id: workOrder.assignedToUserID });
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
