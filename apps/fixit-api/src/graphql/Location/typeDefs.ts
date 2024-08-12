export const typeDefs = `#graphql
  type Location {
    streetLine1: String!
    streetLine2: String
    city: String!
    region: String!
    country: String!
  }

  input CreateLocationInput {
    streetLine1: String!
    streetLine2: String
    city: String!
    region: String!
    country: String
  }

  input UpdateLocationInput {
    streetLine1: String!
    streetLine2: String
    city: String!
    region: String!
    country: String
  }
`;
