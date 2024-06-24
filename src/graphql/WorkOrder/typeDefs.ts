export const typeDefs = `#graphql
  "A WorkOrder is a request one User submits to another for work to be performed at a location"
  type WorkOrder {
    "(Immutable) WorkOrder ID, in the format of 'WO#{createdBy.id}#{UUID}'"
    id: ID!
    "(Immutable) The User who created/sent the WorkOrder"
    createdBy: User!
    "The User to whom the WorkOrder was assigned, AKA the WorkOrder's recipient"
    assignedTo: User
    "The WorkOrder status"
    status: WorkOrderStatus!
    "The WorkOrder priority"
    priority: WorkOrderPriority!
    "The location of the job site for the WorkOrder"
    location: Location!
    # IDEA Consider changing 'category' to a tag-style system to allow multiple category tags on a WorkOrder.
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
    # IDEA Consider renaming field WorkOrder.contractorNotes to WorkOrder.recipientNotes.
    "Notes from the WorkOrder's recipient (this field will be renamed in the future)"
    contractorNotes: String
    "(Immutable) WorkOrder creation timestamp"
    createdAt: DateTime!
    "Timestamp of the most recent WorkOrder update"
    updatedAt: DateTime!
  }

  "The current status of a WorkOrder"
  enum WorkOrderStatus {
    "The WorkOrder has not yet been assigned to a recipient"
    UNASSIGNED
    "The WorkOrder has been assigned to a recipient but has not yet been started"
    ASSIGNED
    "The WorkOrder is in progress"
    IN_PROGRESS
    "The WorkOrder has been deferred to a later date"
    DEFERRED
    "The WorkOrder has been cancelled"
    CANCELLED
    "The WorkOrder has been completed"
    COMPLETE
  }

  "The general priority of a WorkOrder"
  enum WorkOrderPriority {
    "The WorkOrder is of low priority"
    LOW
    "The WorkOrder is of normal priority"
    NORMAL
    "The WorkOrder is of high priority"
    HIGH
  }

  "The category of work to be performed as part of a WorkOrder"
  enum WorkOrderCategory {
    "The WorkOrder involves drywall"
    DRYWALL
    "The WorkOrder involves electrical"
    ELECTRICAL
    "The WorkOrder involves flooring"
    FLOORING
    "The WorkOrder involves general maintenance"
    GENERAL
    "The WorkOrder involves HVAC"
    HVAC
    "The WorkOrder involves landscaping"
    LANDSCAPING
    "The WorkOrder involves masonry"
    MASONRY
    "The WorkOrder involves painting"
    PAINTING
    "The WorkOrder involves paving"
    PAVING
    "The WorkOrder involves pest control"
    PEST
    "The WorkOrder involves plumbing"
    PLUMBING
    "The WorkOrder involves roofing"
    ROOFING
    "The WorkOrder involves trash removal"
    TRASH
    "The WorkOrder involves turnover, i.e., general 'make-ready' tasks for a new tenant or owner"
    TURNOVER
    "The WorkOrder involves windows"
    WINDOWS
  }

  ####################################################################
  ### QUERIES

  extend type Query {
    workOrder(workOrderID: ID!): WorkOrder!
    myWorkOrders: MyWorkOrdersQueryResponse!
  }

  # QUERY RETURN TYPES

  type MyWorkOrdersQueryResponse {
    createdByUser: [WorkOrder!]!
    assignedToUser: [WorkOrder!]!
  }

  ####################################################################
  ### MUTATIONS

  extend type Mutation {
    createWorkOrder(workOrder: CreateWorkOrderInput!): WorkOrder!
    updateWorkOrder(workOrderID: ID!, workOrder: UpdateWorkOrderInput!): WorkOrder!
    cancelWorkOrder(workOrderID: ID!): CancelWorkOrderResponse!
    setWorkOrderStatusComplete(workOrderID: ID!): WorkOrder!
  }

  # MUTATION INPUT TYPES

  "Input for creating a new WorkOrder"
  input CreateWorkOrderInput {
    assignedTo: ID
    priority: WorkOrderPriority
    location: CreateLocationInput!
    category: WorkOrderCategory
    description: String
    checklist: [CreateChecklistItemInput!]
    dueDate: DateTime
    entryContact: String
    entryContactPhone: String
    scheduledDateTime: DateTime
  }

  "Input for updating an existing WorkOrder"
  input UpdateWorkOrderInput {
    assignedToUserID: ID
    priority: WorkOrderPriority
    location: UpdateLocationInput
    category: WorkOrderCategory
    description: String
    checklist: [UpdateChecklistItemInput!]
    dueDate: DateTime
    entryContact: String
    entryContactPhone: String
    scheduledDateTime: DateTime
  }

  # MUTATION RESPONSE TYPES

  "Mutation response for setting a WorkOrder's status to CANCELLED"
  union CancelWorkOrderResponse = WorkOrder | DeleteMutationResponse

  ####################################################################
`;
