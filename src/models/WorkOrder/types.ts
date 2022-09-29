import { WorkOrder } from "./WorkOrder";

// TODO download codegen types; resolve WorkOrder Class/Type naming conflict (currently WorkOrderType for workaround)
export type WorkOrder = {
  createdByUserID: string; //   mapped from "pk" table attribute
  id: string; //                mapped from "sk" table attribute
  assignedToUserID?: string; // mapped from "data" table attribute
  status: typeof WorkOrder.STATUSES[number];
  priority: typeof WorkOrder.PRIORITIES[number];
  location: Location;
  category?: typeof WorkOrder.CATEGORIES[number];
  description: string;
  checklist?: WorkOrderChecklist;
  entryContact?: string;
  entryContactPhone?: string;
  dueDate: Date | number;
  scheduledDateTime: Date | number;
  contractorNotes?: string;
};

// Location moved to @types/env.d.ts

export type WorkOrderChecklistItem = {
  id: string;
  description: string;
  isCompleted: boolean;
};

export type WorkOrderChecklist = Array<WorkOrderChecklistItem>;
