import { gql } from "graphql-tag";

export const typeDefs = gql`
  """
  Generic response-type for mutations which simply returns a "wasSuccessful" boolean.
  This is only ever used as a "last-resort" response-type for mutations which meet all
  of the following criteria:
    1. The mutation does not perform any database CRUD operations.
    2. The mutation does not perform any CRUD operations on data maintained by the client-side cache.
    3. No other response-type is appropriate for the mutation.

  Typically the only mutations for which this reponse-type is appropriate are those which
  perform some sort of "side-effect" (e.g. sending an email, sending a text message, etc.).
  """
  type GenericSuccessResponse {
    wasSuccessful: Boolean!
  }
`;
