export const typeDefs = `#graphql
  """
  Contact is a type which is simply a concrete implementation of the publicly
  accessible user fields defined in the PublicUserFields interface. The Contact
  type represents a user's contact, and is used to manage a user's contacts.
  """
  type Contact implements PublicUserFields {
    # Contact.id format: "CONTACT#{contactUserID}"
    "Contact ID internally identifies a user's contact"
    id: ID!
    "Public-facing handle identifies users to other users (e.g., '@joe')"
    handle: String!
    "Contact email address"
    email: Email!
    "Contact phone number"
    phone: String
    "Contact Profile object"
    profile: Profile!
    "(Immutable) Contact creation timestamp"
    createdAt: DateTime!
    "Timestamp of the most recent Contact object update"
    updatedAt: DateTime!
  }



  extend type Query {
    contact(contactID: ID!): Contact!
    myContacts: [Contact!]!
  }

  extend type Mutation {
    createContact(contactUserID: ID!): Contact!
    deleteContact(contactID: ID!): DeleteMutationResponse!
  }
`;

/* IDEA ContactStatus: NORMAL, BLOCKED

  NORMAL
    The NORMAL status would indicate that the contact relationship is active.

  BLOCKED
    The BLOCKED status would prevent two users from having any further interactions with one another.

    ### Implications for WorkOrders
      - The users would not be able to assign WorkOrders to one another.
      - Any existing WorkOrders between the users which have a non-terminal "status" (anything other
        than COMPLETE or CANCELLED) would incur the following changes:
        - "status" would be changed to UNASSIGNED.
        - "assignedTo" would be changed to null.

    ### Implications for Invoices
      - The users would not be able assign Invoices to one another.
      - Any existing Invoices between the users which have a non-terminal "status" (anything other
        than CLOSED) would require special handling:
        - Another enum-value could be added to the InvoiceStatus enum to handle this case, e.g.,
          CANCELLED/BLOCKED.

    ### Implications for Contacts
      - The user who initiated the BLOCKED status would be able to see the blocked Contact in their
        list of blocked Contacts, but the blocked Contact would not be able to see the blocker in
        any Contact list, and would not see the blocker in any search results.
*/
