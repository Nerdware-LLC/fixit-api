import { WorkOrderStatus, WorkOrderPriority, WorkOrderCategory } from "./types";

const getEnumStringValues = (enumValue: string | number) => typeof enumValue === "string";

export class WorkOrderEnums {
  static STATUSES = Object.values(WorkOrderStatus).filter(getEnumStringValues);

  static PRIORITIES = Object.values(WorkOrderPriority).filter(getEnumStringValues);

  static CATEGORIES = Object.values(WorkOrderCategory).filter(getEnumStringValues);
}
