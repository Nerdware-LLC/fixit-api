import { gql } from "graphql-tag";

export const typeDefs = gql`
  "Custom DateTime scalar with handling for Date objects and datetime strings"
  scalar DateTime
`;
