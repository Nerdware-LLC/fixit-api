import { gql } from "graphql-tag";

export const typeDefs = gql`
  """
  Contact is a type which is simply a concrete implementation of the publicly
  accessible User fields defined in the FixitUser interface. The Contact type is
  meant to ensure that private User fields are not available to anyone other than
  the User who owns the data.
  """
  type Contact implements FixitUser {
    "User ID internally identifies individual User accounts"
    id: ID!
    "Public-facing handle identifies users to other users (e.g., '@joe')"
    handle: String!
    "Contact email address"
    email: Email!
    "Contact phone number"
    phone: String!
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
