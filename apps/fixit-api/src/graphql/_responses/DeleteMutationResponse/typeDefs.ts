export const typeDefs = `#graphql
  "A mutation response type for delete operations."
  type DeleteMutationResponse implements MutationResponse {
    success: Boolean!
    code: String
    message: String
    "The ID of the deleted entity."
    id: ID!
  }
`;
