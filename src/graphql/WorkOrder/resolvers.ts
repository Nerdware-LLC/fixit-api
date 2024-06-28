import { hasKey } from "@nerdware/ts-type-safety-utils";
import { DeleteMutationResponse } from "@/graphql/_responses/index.js";
import { User } from "@/models/User";
import { WORK_ORDER_STATUSES as WO_STATUSES } from "@/models/WorkOrder/enumConstants.js";
import { workOrderModelHelpers } from "@/models/WorkOrder/helpers.js";
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
    createdBy: async ({ createdByUserID }, _args, { user }) => {
      if (createdByUserID === user.id) return user;

      const createdByUser = await User.getItem({ id: createdByUserID });

      return createdByUser!;
    },
    assignedTo: async ({ assignedToUserID }, _args, { user }) => {
      if (!assignedToUserID || assignedToUserID === WO_STATUSES.UNASSIGNED) return null;
      if (assignedToUserID === user.id) return user;

      const assignedToUser = await User.getItem({ id: assignedToUserID });

      return assignedToUser!;
    },
  },
  CancelWorkOrderResponse: {
    __resolveType(parent) {
      return hasKey(parent, "createdBy") || hasKey(parent, "location")
        ? "WorkOrder"
        : parent.id && hasKey(parent, "success")
          ? "DeleteMutationResponse"
          : null; // null --> GraphQLError is thrown
    },
  },
};
