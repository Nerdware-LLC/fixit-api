export const typeDefs = `#graphql
  """
  PublicUserFields is an interface which defines publicly-accessible User fields.
  """
  interface PublicUserFields {
    "User or Contact ID"
    id: ID!
    "Public-facing handle identifies users to other users (e.g., '@joe')"
    handle: String!
    "User email address"
    email: Email!
    "User phone number"
    phone: String
    "User Profile object"
    profile: Profile!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;
