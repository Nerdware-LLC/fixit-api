import gql from "graphql-tag";

export const typeDefs = gql`
  type PhoneContact {
    isUser: Boolean!
    id: String!
    handle: String
    phone: String
    email: Email
    profile: Profile!
  }

  input RawPhoneContactInput {
    id: String!
    name: String
    phone: String
    email: String
    photoUrl: String
  }

  extend type Query {
    "This query is not yet available in prod/staging - will throw 400 error outside of dev."
    searchUsersForPhoneContacts(rawPhoneContacts: [RawPhoneContactInput!]!): [PhoneContact]
  }
`;
