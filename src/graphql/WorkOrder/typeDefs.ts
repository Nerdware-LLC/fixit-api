import gql from "graphql-tag";

export const typeDefs = gql`
  # TODO implement renaming of WorkOrder field "contractorNotes" to "recipientNotes"

  "A WorkOrder is a request one User submits to another for work to be performed at a location"
  type WorkOrder {
    "(Immutable) WorkOrder ID, in the format of 'WO#{createdBy.id}#{unixTimestamp(createdAt)}'"
    id: ID!
    "(Immutable) The FixitUser who created/sent the WorkOrder"
    createdBy: FixitUser!
    "The FixitUser to whom the WorkOrder was assigned, AKA the WorkOrder's recipient"
    assignedTo: FixitUser
    "The WorkOrder status"
    status: WorkOrderStatus!
    "The WorkOrder priority"
    priority: WorkOrderPriority!
    "The location of the job site for the WorkOrder"
    location: Location!
    "The category of work to be performed as part of the WorkOrder"
    category: WorkOrderCategory
    "A general description of the work to be performed as part of the WorkOrder"
    description: String
    "The WorkOrder checklist, an array of ChecklistItem objects"
    checklist: [ChecklistItem]
    "Timestamp of the WorkOrder's due date"
    dueDate: DateTime
    "The name of the WorkOrder's entry contact, if any"
    entryContact: String
    "The phone number of the WorkOrder's entry contact, if any"
    entryContactPhone: String
    "Timestamp of the WorkOrder's scheduled completion"
    scheduledDateTime: DateTime
    "Notes from the WorkOrder's recipient (this field will be renamed in the future)"
    contractorNotes: String
    "(Immutable) WorkOrder creation timestamp"
    createdAt: DateTime!
    "Timestamp of the most recent WorkOrder update"
    updatedAt: DateTime!
  }

  enum WorkOrderStatus {
    UNASSIGNED
    ASSIGNED
    IN_PROGRESS
    DEFERRED
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

  ####################################################################
  ### QUERIES

  extend type Query {
    workOrder(workOrderID: ID!): WorkOrder!
    myWorkOrders: MyWorkOrdersQueryReturnType!
  }

  # QUERY RETURN TYPES

  type MyWorkOrdersQueryReturnType {
    createdByUser: [WorkOrder!]!
    assignedToUser: [WorkOrder!]!
  }

  ####################################################################
  ### MUTATIONS

  # TODO create updateWO_Checklist mutation typedef
  # TODO create updateWO_ContractorNotes mutation typedef

  extend type Mutation {
    createWorkOrder(workOrder: CreateWorkOrderInput!): WorkOrder!
    updateWorkOrder(workOrderID: ID!, workOrder: UpdateWorkOrderInput!): WorkOrder!
    cancelWorkOrder(workOrderID: ID!): CancelWorkOrderResponse!
    setWorkOrderStatusComplete(workOrderID: ID!): WorkOrder!
  }

  # MUTATION INPUT TYPES

  input CreateWorkOrderInput {
    assignedTo: ID
    priority: WorkOrderPriority
    location: CreateLocationInput!
    category: WorkOrderCategory
    description: String
    checklist: [CreateChecklistItemInput]
    dueDate: DateTime
    entryContact: String
    entryContactPhone: String
    scheduledDateTime: DateTime
  }

  input UpdateWorkOrderInput {
    assignedToUserID: ID
    priority: WorkOrderPriority
    location: UpdateLocationInput
    category: WorkOrderCategory
    description: String
    checklist: [UpdateChecklistItemInput]
    dueDate: DateTime
    entryContact: String
    entryContactPhone: String
    scheduledDateTime: DateTime
  }

  # MUTATION RESPONSE TYPES

  union CancelWorkOrderResponse = WorkOrder | DeleteMutationResponse

  ####################################################################
`;
