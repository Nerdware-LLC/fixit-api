// TODO download codegen types; resolve WorkOrder Class/Type naming conflict (currently WorkOrderType for workaround)
export type WorkOrderType = {
  createdByUserID: string; //   mapped from "pk" table attribute
  id: string; //                mapped from "sk" table attribute
  assignedToUserID?: string; // mapped from "data" table attribute
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  location: Location;
  category?: WorkOrderCategory;
  description: string;
  checklist?: WorkOrderChecklist;
  entryContact?: string;
  entryContactPhone?: string;
  dueDate: Date | number;
  scheduledDateTime: Date | number;
  contractorNotes?: string;
};

export enum WorkOrderStatus {
  UNASSIGNED, // <-- WO has not been assigned to anyone
  ASSIGNED, //   <-- WO has merely been assigned to someone
  CANCELLED, //  <-- Assignor can not delete ASSIGNED/COMPLETE WOs, only mark them as "CANCELLED" (deleted from db after 90 days if not updated nor attached to an Invoice)
  COMPLETE //    <-- Assignee notifies Assignor that WO is "COMPLETE" (may be reverted to "ASSIGNED" by either party)
}

export enum WorkOrderPriority {
  LOW,
  NORMAL,
  HIGH
}

export enum WorkOrderCategory {
  Drywall,
  Electrical,
  Flooring,
  General,
  HVAC,
  Landscaping,
  Masonry,
  Painting,
  Paving,
  Pest,
  Plumbing,
  Roofing,
  Trash,
  Turnover,
  Windows
}

export type Location = {
  country?: string; // optional, defaults to "USA"
  region: string;
  city: string;
  streetLine1: string;
  streetLine2?: string; // optional, undefined by default
};

export type WorkOrderChecklistItem = {
  id: string;
  description: string;
  isCompleted: boolean;
};

export type WorkOrderChecklist = Array<WorkOrderChecklistItem>;
