import gql from "graphql-tag";

export const typeDefs = gql`
  type Invoice {
    id: ID!
    createdBy: FixitUser! # FIXME need model-method / resolver for this, unless we leave it at ID
    assignedTo: FixitUser! # FIXME need model-method / resolver for this, unless we leave it at ID
    amount: Int!
    status: InvoiceStatus!
    stripePaymentIntentID: String
    workOrder: WorkOrder # FIXME need model-method / resolver for this, unless we leave it at ID
    createdAt: DateTime!
  }

  enum InvoiceStatus {
    OPEN
    CLOSED
    DISPUTED
  }

  extend type Query {
    invoice(invoiceID: ID!): Invoice!
    myInvoices: [Invoice!]!
  }

  input InvoiceInput {
    assignedToUserID: ID!
    amount: Int!
    workOrderID: ID
  }

  extend type Mutation {
    createInvoice(invoice: InvoiceInput!): Invoice!
    updateInvoiceAmount(invoiceID: ID!, amount: Int!): Invoice!
    payInvoice(invoiceID: ID!): Invoice!
    deleteInvoice(invoiceID: ID!): DeleteMutationResponse!
  }
`;
