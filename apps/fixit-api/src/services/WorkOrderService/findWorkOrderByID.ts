import { WorkOrder } from "@/models/WorkOrder";
import { UserInputError } from "@/utils/httpErrors.js";

/**
 * ### WorkOrderService: findWorkOrderByID
 */
export const findWorkOrderByID = async ({ workOrderID }: { workOrderID: string }) => {
  const [workOrder] = await WorkOrder.query({
    where: { id: workOrderID },
    limit: 1,
  });

  if (!workOrder)
    throw new UserInputError("A wwork order with the provided ID could not be found.");

  return workOrder;
};
