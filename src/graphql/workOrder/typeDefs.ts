import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type WorkOrder {
    id: ID!
    createdBy: FixitUser! # FIXME need model-method / resolver for this, unless we leave it at ID
    assignedTo: FixitUser # FIXME need model-method / resolver for this, unless we leave it at ID
    status: WorkOrderStatus!
    priority: WorkOrderPriority!
    location: WorkOrderLocation!
    category: WorkOrderCategory
    description: String!
    checklist: [ChecklistItem]
    dueDate: DateTime
    entryContact: String
    entryContactPhone: String
    scheduledDateTime: DateTime
    contractorNotes: String
    createdAt: DateTime!
    invoice: Invoice # FIXME need model-method / resolver for this
  }

  enum WorkOrderStatus {
    UNASSIGNED
    ASSIGNED
    CANCELLED
    COMPLETE
  }

  enum WorkOrderPriority {
    LOW
    NORMAL
    HIGH
  }

  enum WorkOrderCategory {
    DRYWALL
    ELECTRICAL
    FLOORING
    GENERAL
    HVAC
    LANDSCAPING
    MASONRY
    PAINTING
    PAVING
    PEST
    PLUMBING
    ROOFING
    TRASH
    TURNOVER
    WINDOWS
  }

  interface WorkOrderLocation {
    country: String
    region: String
    city: String
    streetLine1: String
    streetLine2: String
  }

  type ChecklistItem {
    id: ID!
    description: String!
    isCompleted: Boolean!
  }

  type MyWorkOrdersQueryReturnType {
    createdByUser: [WorkOrder]!
    assignedToUser: [WorkOrder]!
  }

  extend type Query {
    workOrder(workOrderID: ID!): WorkOrder!
    myWorkOrders: MyWorkOrdersQueryReturnType!
  }
`;
