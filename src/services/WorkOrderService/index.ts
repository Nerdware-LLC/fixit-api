import { cancelWorkOrder } from "./cancelWorkOrder.js";
import { createWorkOrder } from "./createWorkOrder.js";
import { findWorkOrderByID } from "./findWorkOrderByID.js";
import { queryUsersWorkOrders } from "./queryUsersWorkOrders.js";
import { setWorkOrderStatusComplete } from "./setWorkOrderStatusComplete.js";
import { updateWorkOrder } from "./updateWorkOrder.js";

/**
 * #### WorkOrderService
 *
 * This object contains methods which implement business logic for WorkOrder operations.
 */
export const WorkOrderService = {
  cancelWorkOrder,
  createWorkOrder,
  findWorkOrderByID,
  queryUsersWorkOrders,
  setWorkOrderStatusComplete,
  updateWorkOrder,
} as const;
