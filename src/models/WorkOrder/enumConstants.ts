import type { WorkOrderStatus, WorkOrderCategory, WorkOrderPriority } from "@/types";

export const WORK_ORDER_ENUM_CONSTANTS: {
  readonly PRIORITIES: ReadonlyArray<WorkOrderPriority>;
  readonly STATUSES: ReadonlyArray<WorkOrderStatus>;
  readonly CATEGORIES: ReadonlyArray<WorkOrderCategory>;
} = {
  PRIORITIES: [
    "LOW",
    "NORMAL", // <-- default
    "HIGH",
  ] as const,

  STATUSES: [
    "UNASSIGNED", //  <-- WO has not been assigned to anyone
    "ASSIGNED", //    <-- WO has merely been assigned to someone
    "IN_PROGRESS", // <-- Assignee has started work on WO
    "DEFERRED", //    <-- Assignee has deferred work on WO (can't be completed yet for some reason)
    "CANCELLED", //   <-- Assignor can not delete ASSIGNED/COMPLETE WOs, only mark them as "CANCELLED" (deleted from db after 90 days if not updated nor attached to an Invoice)
    "COMPLETE", //    <-- Assignee notifies Assignor that WO is "COMPLETE" (may be reverted to "ASSIGNED" by either party)
  ] as const,

  CATEGORIES: [
    "DRYWALL",
    "ELECTRICAL",
    "FLOORING",
    "GENERAL",
    "HVAC",
    "LANDSCAPING",
    "MASONRY",
    "PAINTING",
    "PAVING",
    "PEST",
    "PLUMBING",
    "ROOFING",
    "TRASH",
    "TURNOVER",
    "WINDOWS",
  ] as const,
} as const;
