import { ApolloServerErrorCode } from "@apollo/server/errors";
import { getErrorMessage } from "@nerdware/ts-type-safety-utils";
import { logger } from "@/utils/logger.js";
import type { GraphQLErrorCustomExtensions } from "@/types/graphql.js";
import type { Class, OmitIndexSignature } from "type-fest";

type HttpErrorConfig = {
  errorName: string;
  defaultErrorMsg: string;
  gqlErrorExtensions: Required<GraphQLErrorCustomExtensions>;
};

/**
 * Map of HTTP error status codes used by this app to config properties
 * used to create Error subclasses for each one.
 */
export const HTTP_ERROR_CONFIGS: {
  readonly 400: HttpErrorConfig;
  readonly 401: HttpErrorConfig;
  readonly 402: HttpErrorConfig;
  readonly 403: HttpErrorConfig;
  readonly 404: HttpErrorConfig;
  readonly 500: HttpErrorConfig;
  readonly [statusCode: number]: HttpErrorConfig;
} = {
  400: {
    errorName: "UserInputError",
    defaultErrorMsg: "Invalid user input",
    gqlErrorExtensions: {
      code: ApolloServerErrorCode.BAD_USER_INPUT,
      http: { status: 400 },
    },
  },
  401: {
    errorName: "AuthError",
    defaultErrorMsg: "Authentication required",
    gqlErrorExtensions: {
      code: "AUTHENTICATION_REQUIRED",
      http: { status: 401 },
    },
  },
  402: {
    errorName: "PaymentRequiredError",
    defaultErrorMsg: "Payment required",
    gqlErrorExtensions: {
      code: "PAYMENT_REQUIRED",
      http: { status: 402 },
    },
  },
  403: {
    errorName: "ForbiddenError",
    defaultErrorMsg: "Forbidden",
    gqlErrorExtensions: {
      code: "FORBIDDEN",
      http: { status: 403 },
    },
  },
  404: {
    errorName: "NotFoundError",
    defaultErrorMsg: "Unable to find the requested resource",
    gqlErrorExtensions: {
      code: "RESOURCE_NOT_FOUND",
      http: { status: 404 },
    },
  },
  500: {
    errorName: "InternalServerError",
    defaultErrorMsg: "An unexpected error occurred",
    gqlErrorExtensions: {
      code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
      http: { status: 500 },
    },
  },
};

/**
 * Factory function for "HttpError" classes which extend {@link Error}.
 *
 * @param errorName - The `name` value given to errors created with the returned class.
 * @param statusCode - The HTTP status code.
 * @returns An HttpError class which extends Error that can be used to create Error instances.
 */
const createHttpErrorClass = (statusCode: keyof OmitIndexSignature<typeof HTTP_ERROR_CONFIGS>) => {
  // Get the status code's relevant configs
  const { errorName, defaultErrorMsg } = HTTP_ERROR_CONFIGS[statusCode];

  const NewClass = class HttpError extends Error implements HttpError {
    override readonly name: string = errorName;
    readonly statusCode: number = statusCode;

    constructor(message?: unknown) {
      super(getErrorMessage(message) || defaultErrorMsg);
      Error.captureStackTrace(this, HttpError);
      if (statusCode >= 500) logger.error(this);
    }
  };

  return NewClass satisfies Class<Error, [message?: unknown]>;
};

/** Base type for custom errors with HTTP status codes. */
export type HttpError = Error & {
  readonly name: string;
  readonly statusCode: number;
};

// ----------------------------------------------------------------------------
// Throwable HTTP error classes:

export const UserInputError = createHttpErrorClass(400);
export const AuthError = createHttpErrorClass(401);
export const PaymentRequiredError = createHttpErrorClass(402);
export const ForbiddenError = createHttpErrorClass(403);
export const NotFoundError = createHttpErrorClass(404);
export const InternalServerError = createHttpErrorClass(500);
