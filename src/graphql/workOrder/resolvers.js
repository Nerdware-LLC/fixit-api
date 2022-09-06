import { UserInputError, ForbiddenError } from "apollo-server-express";
import { WorkOrder } from "@models/WorkOrder";

// TODO create updateWO_Checklist mutation resolver
// TODO create updateWO_ContractorNotes mutation resolver

export const resolvers = {
  Query: {
    workOrder: async (parent, { workOrderID }) => {
      return await WorkOrder.getWorkOrderByID(workOrderID);
    },
    myWorkOrders: async (parent, args, { user }) => {
      return {
        createdByUser: await WorkOrder.queryUsersWorkOrders(user.id),
        assignedToUser: await WorkOrder.queryWorkOrdersAssignedToUser(user.id)
      };
    }
  },
  Mutation: {
    createWorkOrder: async (parent, { workOrder: woInput }, { user }) => {
      return await WorkOrder.createOne({
        createdByUserID: user.id,
        ...woInput
      });
    },
    updateWorkOrder: async (parent, { workOrderID, workOrder: woInput }, { user }) => {
      const existingWO = await WorkOrder.getWorkOrderByID(workOrderID);

      if (!existingWO) throw new UserInputError("Work Order not found.");
      if (existingWO.createdByUserID !== user.id) throw new ForbiddenError("Access denied.");
      if (["COMPLETE", "CANCELLED"].includes(existingWO.status))
        throw new ForbiddenError(`Cannot modify ${existingWO.status} work orders.`);

      return await WorkOrder.updateOne(existingWO, woInput);
    },
    cancelWorkOrder: async (parent, { workOrderID }, { user }) => {
      const existingWO = await WorkOrder.getWorkOrderByID(workOrderID);

      if (!existingWO) throw new UserInputError("Work Order not found.");
      if (existingWO.createdByUserID !== user.id) throw new ForbiddenError("Access denied.");

      // Ensure status isn't COMPLETE/CANCELLED
      if (["COMPLETE", "CANCELLED"].includes(existingWO.status)) {
        throw new ForbiddenError(`Cannot modify ${existingWO.status} work orders.`);
        // If status is UNASSIGNED, delete it
      } else if (existingWO.status === "UNASSIGNED") {
        await WorkOrder.delete({ createdByUserID: user.id, id: workOrderID });
        // Return type: DeleteMutationResponse (of union "CancelWorkOrderResponse")
        return { id: workOrderID };
        // If status is ASSIGNED, update WO status to CANCELLED
      } else if (existingWO.status === "ASSIGNED") {
        // Return type: WorkOrder (of union "CancelWorkOrderResponse")
        return await WorkOrder.updateOne(existingWO, { status: "CANCELLED" });
      }
    },
    setWorkOrderStatusComplete: async (parent, { workOrderID }, { user }) => {
      const existingWO = await WorkOrder.getWorkOrderByID(workOrderID);

      if (!existingWO) throw new UserInputError("Work Order not found.");
      if (existingWO.assignedToUserID !== user.id) throw new ForbiddenError("Access denied.");
      if (existingWO.status !== "ASSIGNED")
        throw new UserInputError(`Cannot set ${existingWO.status} work orders to COMPLETE.`);

      return await WorkOrder.updateOne(existingWO, { status: "COMPLETE" });
    }
  },
  CancelWorkOrderResponse: {
    __resolveType({ createdByUserID, id }) {
      // Only WorkOrder has fields other than "id" like "createdByUserID" (null: GraphQLError is thrown)
      return createdByUserID ? "WorkOrder" : id ? "DeleteMutationResponse" : null;
    }
  }
};
