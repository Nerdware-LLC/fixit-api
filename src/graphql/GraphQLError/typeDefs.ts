export const typeDefs = `#graphql
  """
  GraphQLError custom extensions for client responses.
  See https://www.apollographql.com/docs/apollo-server/data/errors/#custom-errors
  """
  type GraphQLErrorCustomExtensions {
    code: GraphQLErrorCode!
    http: GraphQLErrorCustomHttpExtension
  }

  "GraphQLError 'extensions.code' values for client error responses"
  enum GraphQLErrorCode {
    """
    The GraphQLError 'extensions.code' value for 400-status errors.
    > This code is an ApolloServer builtin — see [ApolloServerErrorCode][apollo-error-codes].
    [apollo-error-codes]: https://github.com/apollographql/apollo-server/blob/268687db591fed8293eeded1546ae2f8e6f2b6a7/packages/server/src/errors/index.ts
    """
    BAD_USER_INPUT
    "The GraphQLError 'extensions.code' value for 401-status errors."
    AUTHENTICATION_REQUIRED
    "The GraphQLError 'extensions.code' value for 402-status errors."
    PAYMENT_REQUIRED
    "The GraphQLError 'extensions.code' value for 403-status errors."
    FORBIDDEN
    "The GraphQLError 'extensions.code' value for 404-status errors."
    RESOURCE_NOT_FOUND
    """
    The GraphQLError 'extensions.code' value for 500-status errors.
    > This code is an ApolloServer builtin — see [ApolloServerErrorCode][apollo-error-codes].
    [apollo-error-codes]: https://github.com/apollographql/apollo-server/blob/268687db591fed8293eeded1546ae2f8e6f2b6a7/packages/server/src/errors/index.ts
    """
    INTERNAL_SERVER_ERROR
  }

  """
  GraphQLError custom 'http' extension for providing client error responses
  with traditional HTTP error status codes ('extensions.http.status').
  """
  type GraphQLErrorCustomHttpExtension {
    """
    The HTTP status code for the error:
    - 400 'Bad User Input'
    - 401 'Authentication Required'
    - 402 'Payment Required'
    - 403 'Forbidden'
    - 404 'Resource Not Found'
    - 500 'Internal Server Error'
    """
    status: Int!
  }
`;
