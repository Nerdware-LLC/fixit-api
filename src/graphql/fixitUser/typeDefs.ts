import gql from "graphql-tag";

export const typeDefs = gql`
  interface FixitUser {
    id: ID!
    email: Email!
    phone: String!
    profile: Profile!
    createdAt: DateTime!
  }
`;
