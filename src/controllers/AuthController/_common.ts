import {
  sanitizeEmail,
  isValidEmail,
  sanitizePassword,
  isValidPassword,
  sanitizeJWT,
  isValidJWT,
} from "@nerdware/ts-string-helpers";
import { hasKey } from "@nerdware/ts-type-safety-utils";
import { UserInputError } from "@/utils/httpErrors.js";
import type {
  RestApiEndpointRequestBodySchema,
  RequestBodyValidatorFn,
} from "@/controllers/_helpers";

/**
 * A {@link RestApiEndpointRequestBodySchema} for login credentials.
 */
export const LOGIN_CREDENTIALS_REQ_BODY_SCHEMA: RestApiEndpointRequestBodySchema<
  "/auth/login" | "/auth/register"
> = {
  email: {
    type: "string",
    required: true,
    nullable: false,
    sanitize: sanitizeEmail,
    validate: isValidEmail,
  },
  password: {
    type: "string",
    required: false,
    nullable: false,
    sanitize: sanitizePassword,
    validate: isValidPassword,
  },
  googleIDToken: {
    type: "string",
    required: false,
    nullable: false,
    sanitize: sanitizeJWT,
    validate: isValidJWT,
  },
  expoPushToken: {
    type: "string",
    required: false,
    nullable: false,
    sanitize: sanitizeJWT,
    validate: isValidJWT,
  },
};

/**
 * A {@link RequestBodyValidatorFn} that throws an error if the `req.body`
 * includes neither a `password` nor `googleIDToken`.
 */
export const requirePasswordOrGoogleIDToken: RequestBodyValidatorFn<
  "/auth/login" | "/auth/register"
> = (reqBody) => {
  if (!hasKey(reqBody, "password") && !hasKey(reqBody, "googleIDToken")) {
    throw new UserInputError("Invalid login credentials");
  }
};
