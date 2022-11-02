import gql from "graphql-tag";

export const deleteMutationResponse = {
  typeDefs: gql`
    type DeleteMutationResponse {
      id: ID!
      wasDeleted: Boolean!
    }
  `
};
