export const typeDefs = `#graphql
  type Invoice {
    "(Immutable) Invoice ID, in the format of 'INV#{createdBy.id}#{UUID}'"
    id: ID!
    "(Immutable) The User who created/sent the Invoice"
    createdBy: User!
    "(Immutable) The User to whom the Invoice was assigned, AKA the Invoice's recipient"
    assignedTo: User!
    "The Invoice amount, represented as an integer which reflects USD centage (i.e., an 'amount' of 1 = $0.01 USD)"
    amount: Int!
    "The Invoice status; this field is controlled by the API and can not be directly edited by Users"
    status: InvoiceStatus!
    "The ID of the most recent successful paymentIntent applied to the Invoice, if any"
    stripePaymentIntentID: String
    "A WorkOrder attached to the Invoice which was created by the 'assignedTo' User"
    workOrder: WorkOrder
    "(Immutable) Invoice creation timestamp"
    createdAt: DateTime!
    "Timestamp of the most recent Invoice update"
    updatedAt: DateTime!
  }

  enum InvoiceStatus {
    OPEN
    CLOSED
    DISPUTED
  }

  ####################################################################
  ### QUERIES

  extend type Query {
    invoice(invoiceID: ID!): Invoice!
    myInvoices: MyInvoicesQueryResponse!
  }

  # QUERY RETURN TYPES

  type MyInvoicesQueryResponse {
    createdByUser: [Invoice!]!
    assignedToUser: [Invoice!]!
  }

  ####################################################################
  ### MUTATIONS

  extend type Mutation {
    createInvoice(invoice: InvoiceInput!): Invoice!
    updateInvoiceAmount(invoiceID: ID!, amount: Int!): Invoice!
    payInvoice(invoiceID: ID!): Invoice!
    deleteInvoice(invoiceID: ID!): DeleteMutationResponse!
  }

  # MUTATION INPUT TYPES

  input InvoiceInput {
    "The ID of the User to whom the Invoice will be assigned"
    assignedTo: ID!
    amount: Int!
    workOrderID: ID
  }

  ####################################################################
`;
