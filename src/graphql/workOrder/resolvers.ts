import { WorkOrder } from "@models/WorkOrder";
import { User, USER_ID_REGEX } from "@models/User";
import { GqlUserInputError, GqlForbiddenError } from "@utils/customErrors";
import type { Resolvers } from "@/types/graphql";

// TODO create updateWO_Checklist mutation resolver
// TODO create updateWO_ContractorNotes mutation resolver

export const resolvers: Partial<Resolvers> = {
  Query: {
    workOrder: async (parent, { workOrderID }) => {
      return await WorkOrder.queryWorkOrderByID(workOrderID);
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
      } as any); // FIXME the codegen generic `InputMaybe` requires null-ability, not just `string | undefined` (so `string | null | undefined`)
    },
    updateWorkOrder: async (parent, { workOrderID, workOrder: woInput }, { user }) => {
      const existingWO = await WorkOrder.queryWorkOrderByID(workOrderID);

      if (!existingWO) throw new GqlUserInputError("Work Order not found.");
      if (existingWO.createdByUserID !== user.id) throw new GqlForbiddenError("Access denied.");
      if (["COMPLETE", "CANCELLED"].includes(existingWO.status))
        throw new GqlForbiddenError(`Cannot modify ${existingWO.status} work orders.`);

      // Check if WO went from ASSIGNED to UNASSIGNED, or vice versa.
      if (existingWO.status === "ASSIGNED" && woInput?.assignedToUserID === "UNASSIGNED") {
        Object.defineProperty(woInput, "status", { value: "UNASSIGNED" });
      } else if (
        existingWO.status === "UNASSIGNED" &&
        typeof woInput?.assignedToUserID === "string" &&
        USER_ID_REGEX.test(existingWO?.assignedToUserID ?? "")
      ) {
        Object.defineProperty(woInput, "status", { value: "ASSIGNED" });
      }

      return await WorkOrder.updateOne(existingWO, woInput as any); // FIXME the codegen generic `InputMaybe` requires null-ability, not just `string | undefined` (so `string | null | undefined`)
    },
    cancelWorkOrder: async (parent, { workOrderID }, { user }) => {
      const existingWO = await WorkOrder.queryWorkOrderByID(workOrderID);

      if (!existingWO) throw new GqlUserInputError("Work Order not found.");
      if (existingWO.createdByUserID !== user.id) throw new GqlForbiddenError("Access denied.");

      // Ensure status isn't COMPLETE/CANCELLED
      if (["COMPLETE", "CANCELLED"].includes(existingWO.status)) {
        throw new GqlForbiddenError(`Cannot modify ${existingWO.status} work orders.`);
        // If status is UNASSIGNED, delete it
      } else if (existingWO.status === "UNASSIGNED") {
        await WorkOrder.deleteItem({ createdByUserID: user.id, id: workOrderID });
        // Return type: DeleteMutationResponse (of union "CancelWorkOrderResponse")
        return { id: workOrderID, wasDeleted: true };
        // If status is ASSIGNED, update WO status to CANCELLED
      } else if (existingWO.status === "ASSIGNED") {
        // Return type: WorkOrder (of union "CancelWorkOrderResponse")
        return (await WorkOrder.updateOne(existingWO, { status: "CANCELLED" })) as any; // FIXME
      }
    },
    setWorkOrderStatusComplete: async (parent, { workOrderID }, { user }) => {
      const existingWO = await WorkOrder.queryWorkOrderByID(workOrderID);

      if (!existingWO) throw new GqlUserInputError("Work Order not found.");
      if (existingWO.assignedToUserID !== user.id) throw new GqlForbiddenError("Access denied.");
      if (existingWO.status !== "ASSIGNED")
        throw new GqlUserInputError(`Cannot set ${existingWO.status} work orders to COMPLETE.`);

      return await WorkOrder.updateOne(existingWO, { status: "COMPLETE" });
    }
  },
  WorkOrder: {
    createdBy: async (parent, args, { user }) => {
      return parent.createdByUserID === user.id
        ? { __typename: "User", ...user }
        : ({
            __typename: "Contact",
            ...(await User.getUserByID(parent.createdByUserID))
          } as any); // FIXME
    },
    assignedTo: async (parent, args, { user }) => {
      return parent.assignedToUserID === null || !parent.assignedToUserID
        ? null
        : parent.assignedToUserID === user.id
        ? { __typename: "User", ...user }
        : ({
            __typename: "Contact",
            ...(await User.getUserByID(parent.assignedToUserID))
          } as any); // FIXME
    }
  },
  CancelWorkOrderResponse: {
    __resolveType({ createdByUserID, id }: { createdByUserID?: string; id?: string }) {
      // Only WorkOrder has fields other than "id" like "createdByUserID" (null: GraphQLError is thrown)
      return createdByUserID ? "WorkOrder" : id ? "DeleteMutationResponse" : null;
    }
  }
};
