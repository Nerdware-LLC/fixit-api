import { gql } from "graphql-tag";

export const typeDefs = gql`
  """
  FixitUser is an interface which defines publicly-accessible User fields. This
  interface has two concrete implementations: Contact, which is simply a concrete
  implementation of the same publicly-available fields, and User, which adds private
  fields which are not accessible to other users.
  """
  interface FixitUser {
    "User ID internally identifies individual User accounts"
    id: ID!
    "Public-facing handle identifies users to other users (e.g., '@joe')"
    handle: String!
    "Email address of either a User or Contact"
    email: Email!
    "Phone number of either a User or Contact"
    phone: String!
    "Profile object of either a User or Contact"
    profile: Profile!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;
