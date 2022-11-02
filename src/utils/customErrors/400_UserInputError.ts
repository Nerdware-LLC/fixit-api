import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class UserInputError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  constructor(message = "Invalid user input") {
    super(message);
    this.name = "UserInputError";
    this.status = 400;
    this.statusCode = this.status;
  }
}

export class GqlUserInputError extends GraphQLError {
  name: string;

  constructor(message = "Invalid user input") {
    super(message, {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT
      },
      originalError: new UserInputError(message)
    });
    this.name = "GqlUserInputError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlUserInputError);
  }
}
