import { gql } from "graphql-tag";

export const typeDefs = gql`
  type ChecklistItem {
    id: ID!
    description: String!
    isCompleted: Boolean!
  }

  input CreateChecklistItemInput {
    description: String!
    isCompleted: Boolean
  }

  input UpdateChecklistItemInput {
    id: ID
    description: String!
    isCompleted: Boolean
  }
`;
