import gql from "graphql-tag";

export const typeDefs = gql`
  type PhoneContact {
    isUser: Boolean!
    id: String!
    name: String
    phone: String
    email: Email
    givenName: String
    familyName: String
    businessName: String
    photoUrl: String
  }

  input RawPhoneContactInput {
    id: String!
    name: String
    phone: String
    email: String
    photoUrl: String
  }

  extend type Query {
    searchUsers(rawPhoneContacts: [RawPhoneContactInput!]!): [PhoneContact]
  }
`;
