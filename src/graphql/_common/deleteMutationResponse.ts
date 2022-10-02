import { gql } from "apollo-server-express";

export const deleteMutationResponse = {
  typeDefs: gql`
    type DeleteMutationResponse {
      id: ID!
    }
  `
};
