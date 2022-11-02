import gql from "graphql-tag";

export const typeDefs = gql`
  type Profile {
    id: ID!
    displayName: String
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
    givenName: String
    familyName: String
    businessName: String
    photoUrl: String
  }

  extend type Mutation {
    updateProfile(profile: ProfileInput!): Profile!
  }
`;
