import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError, type GraphQLErrorOptions } from "graphql";
import merge from "lodash.merge";
import { getErrorMessage } from "@/utils/typeSafety";
import type { Class } from "type-fest";

/**
 * Map of HTTP error status codes used by this app to config properties used
 * to create Error subclasses for each one.
 * - `errName` — The "name" given to associated Error objects. This is prefixed by "Gql" for GraphQLErrors.
 * - `defaultErrMsg` — Default error "message".
 * - `gqlErrCode` — The `extensions.code` value to use for GraphQLErrors.
 */
const HTTP_ERR_STATUS_CODE_CONFIGS = {
  400: {
    errName: "UserInputError",
    defaultErrMsg: "Invalid user input",
    gqlErrCode: ApolloServerErrorCode.BAD_USER_INPUT,
  },
  401: {
    errName: "AuthError",
    defaultErrMsg: "Authentication required",
    gqlErrCode: "AUTHENTICATION_REQUIRED",
  },
  402: {
    errName: "PaymentRequiredError",
    defaultErrMsg: "Payment required",
    gqlErrCode: "PAYMENT_REQUIRED",
  },
  403: {
    errName: "ForbiddenError",
    defaultErrMsg: "Forbidden",
    gqlErrCode: "FORBIDDEN",
  },
  404: {
    errName: "NotFoundError",
    defaultErrMsg: "Unable to find the requested resource",
    gqlErrCode: "RESOURCE_NOT_FOUND",
  },
  500: {
    errName: "InternalServerError",
    defaultErrMsg: "An unexpected error occurred",
    gqlErrCode: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
  },
} as const satisfies Record<number, { errName: string; defaultErrMsg: string; gqlErrCode: string }>;

/**
 * Factory function for classes which extend Error, or GraphQLError if `gqlErrorCode`
 * is provided.
 *
 * @param errorName - The `name` value given to errors created with the returned class.
 * @param statusCode - The HTTP status code.
 * @param gqlErrorCode - The GraphQL error code.
 * @returns A class which extends Error that can be used to create Error instances.
 */
const createHttpErrorClass = <IsGqlError extends boolean = false>(
  statusCode: keyof typeof HTTP_ERR_STATUS_CODE_CONFIGS,
  { gql: isGqlError }: { gql?: IsGqlError } = {}
) => {
  // Get the status code's relevant configs
  const { errName, defaultErrMsg, gqlErrCode } = HTTP_ERR_STATUS_CODE_CONFIGS[statusCode];

  const NewClass =
    isGqlError === true
      ? class NewGraphqlHttpErrorClass extends GraphQLError implements HttpErrorInterface {
          readonly name: string = `Gql${errName}`; // <-- errName is prefixed with "Gql"
          readonly statusCode: number = statusCode;
          readonly gqlErrorCode: string = gqlErrCode;

          constructor(message?: unknown, gqlErrorOpts?: GraphQLErrorOptions) {
            super(
              getErrorMessage(message) || defaultErrMsg,
              merge(
                {
                  extensions: {
                    code: gqlErrCode,
                    http: {
                      status: statusCode,
                    },
                  },
                },
                gqlErrorOpts || {}
              )
            );
            // Get stack trace starting where Error was created, omitting the error constructor.
            Error.captureStackTrace(this, NewGraphqlHttpErrorClass);
          }
        }
      : class NewHttpErrorClass extends Error implements HttpErrorInterface {
          readonly name: string = errName;
          readonly statusCode: number = statusCode;

          constructor(message?: unknown) {
            super(getErrorMessage(message) || defaultErrMsg);
            Error.captureStackTrace(this, NewHttpErrorClass);
          }
        };

  return NewClass as unknown as IsGqlError extends true
    ? Class<GraphQLError, [message?: unknown, gqlErrorOpts?: GraphQLErrorOptions]>
    : Class<Error, [message?: unknown]>;
};

/** Interface for custom errors with HTTP status codes. */
export interface HttpErrorInterface extends Error {
  readonly name: string;
  readonly statusCode: number;
}

// -----------------------------------------------------------------------------
// Throwable HTTP error classes:

export const UserInputError = createHttpErrorClass(400);
export const GqlUserInputError = createHttpErrorClass(400, {
  gql: true,
});

export const AuthError = createHttpErrorClass(401);
export const GqlAuthError = createHttpErrorClass(401, {
  gql: true,
});

export const PaymentRequiredError = createHttpErrorClass(402);
export const GqlPaymentRequiredError = createHttpErrorClass(402, {
  gql: true,
});

export const ForbiddenError = createHttpErrorClass(403);
export const GqlForbiddenError = createHttpErrorClass(403, {
  gql: true,
});

export const NotFoundError = createHttpErrorClass(404);

export const InternalServerError = createHttpErrorClass(500);
export const GqlInternalServerError = createHttpErrorClass(500, {
  gql: true,
});
