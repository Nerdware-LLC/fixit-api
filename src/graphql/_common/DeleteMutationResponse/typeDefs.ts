import gql from "graphql-tag";

export const typeDefs = gql`
  type DeleteMutationResponse {
    id: ID!
    wasDeleted: Boolean!
  }
`;
