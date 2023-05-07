import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError, type GraphQLErrorOptions } from "graphql";
import merge from "lodash.merge";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class UserInputError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  public static readonly STATUS_CODE = 400;

  constructor(message = "Invalid user input") {
    super(message);
    this.name = "UserInputError";
    this.status = UserInputError.STATUS_CODE;
    this.statusCode = this.status;
  }
}

/**
 * GQL User Input Error (400)
 *
 * Where possible, add the property names of invalid fields to
 * `opts.extensions.invalidArgs` (type `string[]`).
 *
 * On the front end, an Apollo Link error-handler checks for this key to display
 * more helpful info to the user.
 */
export class GqlUserInputError extends GraphQLError {
  name: string;

  public static readonly STATUS_CODE = UserInputError.STATUS_CODE;

  constructor(message = "Invalid user input", opts: Gql400ErrorOptsWithInvalidArgsKey = {}) {
    super(
      message,
      merge(
        {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
          originalError: new UserInputError(message),
        },
        opts
      )
    );

    this.name = "GqlUserInputError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlUserInputError);
  }
}

interface Gql400ErrorOptsWithInvalidArgsKey extends GraphQLErrorOptions {
  extensions?: GraphQLErrorOptions["extensions"] & { invalidArgs?: Array<string> };
}
