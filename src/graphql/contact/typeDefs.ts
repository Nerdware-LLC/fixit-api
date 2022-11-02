import gql from "graphql-tag";

export const typeDefs = gql`
  type Contact implements FixitUser {
    id: ID!
    email: Email!
    phone: String!
    profile: Profile!
    createdAt: DateTime!
  }

  extend type Query {
    contact(contactID: ID!): Contact!
    myContacts: [Contact]!
  }

  extend type Mutation {
    createContact(contactEmail: Email!): Contact!
    deleteContact(contactEmail: Email!): DeleteMutationResponse!
  }
`;
