import gql from "graphql-tag";

// TODO create updateWO_Checklist mutation typedef
// TODO create updateWO_ContractorNotes mutation typedef

export const mutationTypeDefs = gql`
  extend type Mutation {
    createWorkOrder(workOrder: CreateWorkOrderInput!): WorkOrder!
    updateWorkOrder(workOrderID: ID!, workOrder: UpdateWorkOrderInput!): WorkOrder!
    cancelWorkOrder(workOrderID: ID!): CancelWorkOrderResponse!
    setWorkOrderStatusComplete(workOrderID: ID!): WorkOrder!
  }

  ####################################################################
  ### createWorkOrder

  input CreateWorkOrderInput {
    assignedToUserID: ID
    priority: WorkOrderPriority # Not req'd in input bc there's a default value.
    location: CreateWorkOrderLocationInput!
    category: WorkOrderCategory
    description: String!
    checklist: [CreateChecklistItemInput]
    dueDate: DateTime
    entryContact: String
    entryContactPhone: String
    scheduledDateTime: DateTime
  }

  input CreateWorkOrderLocationInput {
    country: String
    region: String!
    city: String!
    streetLine1: String!
    streetLine2: String
  }

  input CreateChecklistItemInput {
    description: String!
  }

  ####################################################################
  ### updateWorkOrder

  # Only changed fields should be included
  input UpdateWorkOrderInput {
    assignedToUserID: ID
    priority: WorkOrderPriority
    location: UpdateWorkOrderLocationInput
    category: WorkOrderCategory
    description: String
    checklist: [UpdateChecklistItemInput]
    dueDate: DateTime
    entryContact: String
    entryContactPhone: String
    scheduledDateTime: DateTime
  }

  input UpdateWorkOrderLocationInput {
    country: String
    region: String
    city: String
    streetLine1: String
    streetLine2: String
  }

  input UpdateChecklistItemInput {
    id: ID
    description: String!
    isCompleted: Boolean
  }

  ####################################################################
  ### cancelWorkOrder

  union CancelWorkOrderResponse = WorkOrder | DeleteMutationResponse
`;
