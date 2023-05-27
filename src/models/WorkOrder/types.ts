import type {
  Location,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderCategory,
  ChecklistItem,
} from "@types";

export type InternalDbWorkOrder = {
  createdByUserID: string; //   mapped from "pk" table attribute
  createdBy: {
    id: string;
  };
  id: string; //                mapped from "sk" table attribute
  assignedToUserID?: string; // mapped from "data" table attribute
  assignedTo?: {
    id: string;
  } | null;
  location: Location;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  category?: WorkOrderCategory;
  description?: string;
  checklist?: Array<ChecklistItem>;
  entryContact?: string;
  entryContactPhone?: string;
  dueDate?: Date; //           was `Date | number`
  scheduledDateTime?: Date; // was `Date | number`
  contractorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
};
