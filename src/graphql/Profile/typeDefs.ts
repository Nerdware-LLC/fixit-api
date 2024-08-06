export const typeDefs = `#graphql
  type Profile {
    displayName: String!
    givenName: String
    familyName: String
    businessName: String
    photoUrl: String
  }

  extend type Query {
    myProfile: Profile!
    profile(profileID: ID!): Profile!
  }

  input ProfileInput {
    displayName: String
    givenName: String
    familyName: String
    businessName: String
    photoUrl: String
  }

  extend type Mutation {
    updateProfile(profile: ProfileInput!): Profile!
  }
`;
