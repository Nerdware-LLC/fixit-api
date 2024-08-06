export const typeDefs = `#graphql
  """
  User is an implementation of the PublicUserFields interface which represents an individual User.
  """
  type User implements PublicUserFields {
    "(Immutable) User ID internally identifies individual User accounts"
    id: ID!
    "(Immutable) Public-facing handle identifies users to other users (e.g., '@joe')"
    handle: String!
    "User's own email address"
    email: Email!
    "User's own phone number"
    phone: String
    "User's own Profile object"
    profile: Profile!
    "(Immutable) Account creation timestamp"
    createdAt: DateTime!
    "Timestamp of the most recent account update"
    updatedAt: DateTime!
  }

  extend type Query {
    """
    This query returns the public fields of a User whose handle exactly matches the
    provided \`handle\` argument. To search for one or more Users whose handle begins
    with or fuzzy-matches a provided string, use \`searchForUsersByHandle\`.
    """
    getUserByHandle(handle: String!): User
    """
    This query returns a paginated list of Users whose handle begins with the provided
    \`handle\` argument, which can be incomplete but must at least contain two characters:
    the beginning "@", and one character that's either alphanumeric or an underscore.

    Note that this query is intended to be used in conjunction with a pagination utility
    like [Apollo's \`fetchMore\` function](https://www.apollographql.com/docs/react/pagination/core-api#the-fetchmore-function).

    ### ROADMAP:

    - Matching Algorithm Change: In the future, the Contact selection method used in this
      query will either be replaced by a fuzzy-matching system based on the Levenshtein-Demerau
      model, or a cloud-based search service like ElasticSearch. This change will eliminate
      the \`offset\` restrictions in regard to the value of \`handle\` in follow-up queries.
    - Response Structure: The response may be converted into an object with keys \`data\` and
      \`nextOffset\`. The \`data\` key will contain the array of matching Users, and \`nextOffset\`
      will be the value of the \`offset\` argument to be used in a follow-up query.
    """
    searchForUsersByHandle(
      "The handle search string (minimum 2 characters)"
      handle: String!
      "The maximum number of Users to return (default 10, min 10, max 50)"
      limit: Int = 10
      """
      The number of searchable Users to skip before returning results (default 0, min 0).
      **This argument should only be used if all of the following conditions are true:**

        1. A previous call to this query returned the maximum number of results (i.e., \`limit\`).
        2. The User who made the previous call wants to retrieve more results.
        3. The \`handle\` argument in the previous call is a valid substring of the \`handle\`
           argument in the subsequent call (e.g., "@foo" followed by "@fooz"). While not enforced,
           querying "@fooz" followed by "@foo" with an offset may result in matchable users being
           excluded from the results.
      """
      offset: Int = 0
    ): [User!]!
  }
`;
