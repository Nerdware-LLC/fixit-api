import { hasKey, hasKeys, sanitize, isValid } from "@utils";
import type { RequestBodyFieldsSchema, RequestBodyValidatorFn } from "@middleware/helpers";

/**
 * A {@link RequestBodyFieldsSchema} that configures sanitzation and
 * validation for request body parameters used in auth routes.
 */
export const LOGIN_REQ_BODY_FIELDS_SCHEMA: RequestBodyFieldsSchema = {
  email: {
    required: true,
    type: "string",
    sanitize: sanitize.email,
    validate: isValid.email,
  },
  password: {
    required: false,
    type: "string",
    sanitize: sanitize.password,
    validate: isValid.password,
  },
  googleID: {
    required: false,
    type: "string",
    sanitize: sanitize.id,
    validate: isValid.id,
  },
  googleAccessToken: {
    required: false,
    type: "string",
    sanitize: sanitize.token,
    validate: isValid.token,
  },
} as const;

/**
 * A {@link RequestBodyValidatorFn} that asserts that the request body
 * contains either a password or a Google OAuth ID and access token.
 */
export const requirePasswordOrGoogleOAuth: RequestBodyValidatorFn = (reqBody) => {
  if (!hasKey(reqBody, "password") && !hasKeys(reqBody, ["googleID", "googleAccessToken"])) {
    throw new Error("Invalid registration credentials");
  }
};
