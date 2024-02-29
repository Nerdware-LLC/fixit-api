import {
  hasKey,
  isString,
  isSafeInteger,
  isFunction,
  isPlainObject,
  isArray,
  isBoolean,
  getErrorMessage,
} from "@nerdware/ts-type-safety-utils";
import { UserInputError } from "@/utils/httpErrors.js";
import type { RestApiLocals } from "@/types/express.js";
import type { AllRestApiResponses } from "@/types/open-api.js";
import type { RequestHandler } from "express";
import type { JsonPrimitive, SetRequired, SetReturnType } from "type-fest";

/**
 * Generic catch wrapper for async middleware functions.
 */
export const mwAsyncCatchWrapper = <
  ReqBody extends Record<string, unknown> = Record<string, unknown>,
>(
  asyncMiddlewareFn: SetReturnType<RestApiRequestHandler<ReqBody>, Promise<void>>
): RestApiRequestHandler<ReqBody> => {
  return (req, res, next) => {
    asyncMiddlewareFn(req, res, next).catch(next);
  };
};

/**
 * Generic catch wrapper for non-async middleware functions.
 */
export const mwCatchWrapper = <ReqBody extends Record<string, unknown> = Record<string, unknown>>(
  middlewareFn: RestApiRequestHandler<ReqBody>
): RestApiRequestHandler<ReqBody> => {
  return (req, res, next) => {
    try {
      middlewareFn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * This type wraps the Express `RequestHandler` type with app global defaults.
 * Provide the `ReqBody` type param to specify a `req.body` object type.
 *
 * **Note:** The `P` and `ReqQuery` type params are set to `never` since this app currently
 *   does not use route or query params.
 */
export type RestApiRequestHandler<
  ReqBody extends Record<string, unknown> = Record<string, unknown>,
> = RequestHandler<
  never, // route params (req.params)
  AllRestApiResponses,
  ReqBody,
  never, // query params (req.query)
  RestApiLocals
>;

/**
 * This function provides middleware for validating and sanitizing request body parameters.
 *
 * @param reqBodySchema - The schema object that defines the expected structure and validation rules for the request body.
 * @returns A middleware function that can be used in an Express route.
 * @throws UserInputError if any validation fails.
 *
 * @example
 * import { sanitizeAndValidateRequestBody } from "@/middleware/helpers.js";
 *
 * const requestBodySchema = {
 *   name: { type: "string", required: true, sanitize: (value) => value.trim() },
 *   age: { type: "number", required: true, validate: (value) => value >= 18 },
 *   email: { type: "string", required: false, sanitize: (value) => sanitizeUtil.email(value) },
 * };
 *
 * app.post("/api/user", sanitizeAndValidateRequestBody({ requestBodySchema }), (req, res) => {
 *   // Process the validated and sanitized request body
 * });
 */
export const sanitizeAndValidateRequestBody = <Schema extends RequestBodyFieldsSchema>({
  requestBodySchema,
  validateRequestBody,
}: SanitizeAndValidateReqBodyParams<Schema>): RequestHandler => {
  // Validate each field config, add a type-validator function based on the "type"
  const reqBodySchemaWithTypeValidator = Object.fromEntries(
    Object.entries(requestBodySchema).map(
      ([key, { type: fieldType, nullable, sanitize, ...fieldConfig }]) => {
        // Obtain the type-validator from the `TYPE_VALIDATORS` dict:
        const isValidType = TYPE_VALIDATORS?.[fieldType];
        // If isValidType is undefined, then fieldType is not valid, throw an error
        if (!isValidType) throw new Error(`Invalid "type" for field "${key}": "${fieldType}"`);
        // If fieldType is string/object/array, ensure a sanitize function is provided
        if (["string", "object", "array"].includes(fieldType) && !isFunction(sanitize))
          throw new Error(`Field "${key}" is missing a "sanitize" function`);
        // Return the field config with the type-validator function
        return [key, { ...fieldConfig, type: fieldType, nullable, sanitize, isValidType }];
      }
    )
  ) as unknown as {
    [Key in keyof Schema]: Schema[Key] & { isValidType: (arg: unknown) => boolean };
  };

  return (req, res, next) => {
    // Ensure the request body is valid
    if (!hasKey(req, "body") || !isPlainObject(req.body)) {
      throw new UserInputError("Invalid request body");
    }

    const reqBodyFields = {} as { [Key in keyof Schema]: unknown };

    try {
      for (const key in requestBodySchema) {
        // Destructure the field config
        const { required, nullable, isValidType, sanitize, validate } =
          reqBodySchemaWithTypeValidator[key];

        // Check is the field is defined in req.body
        if (!hasKey(req.body, key) || req.body[key] === undefined) {
          // If not defined, throw error if field is required, else continue
          if (required === true) throw new UserInputError(`Missing required field: "${key}"`);
          else continue;
        }

        // The field is defined, get from req.body using `let` so `sanitize` can overwrite it
        let fieldValue = req.body[key];

        // Check if fieldValue is null
        if (fieldValue === null) {
          // If fieldValue is null, and the field is not nullable, throw error
          if (nullable !== true) throw new UserInputError(`Invalid value for field: "${key}"`);
        } else {
          // If fieldValue is not null, sanitize and validate the value
          if (!isValidType(fieldValue))
            throw new UserInputError(`Invalid value for field: "${key}"`);

          if (isFunction(sanitize)) fieldValue = sanitize(fieldValue as any);

          if (isFunction(validate) && (validate as (v: unknown) => boolean)(fieldValue) === false) {
            throw new UserInputError(`Invalid value for field: "${key}"`);
          }
        }

        // The field is valid - add to reqBodyFields
        reqBodyFields[key] = fieldValue;
      }

      // Validate the entire request body if a validateReqBody function was provided
      if (isFunction(validateRequestBody) && validateRequestBody(reqBodyFields) === false) {
        throw new UserInputError("Invalid request body");
      }

      // Update req.body with sanitized and validated values
      req.body = reqBodyFields;
      next();
    } catch (error) {
      // Re-throw as UserInputError to ensure 400 status code is attached
      next(new UserInputError(getErrorMessage(error)));
    }
  };
};

/** Dictionary of type validators for request body fields. @internal */
const TYPE_VALIDATORS = {
  string: isString,
  number: isSafeInteger,
  boolean: isBoolean,
  object: isPlainObject,
  array: isArray,
} as const satisfies Record<JsonTypeStringLiteral, (arg: unknown) => boolean>;

/** Params for {@link sanitizeAndValidateReqBody}. */
export type SanitizeAndValidateReqBodyParams<Schema extends RequestBodyFieldsSchema> = {
  /**
   * A map of `req.body` fields to {@link RequestBodyFieldConfig} objects defining field-level
   * sanitization and validation for each respective field.
   */
  requestBodySchema: Schema;
  /**
   * A validation function for `req.body` as a whole which is called with the entire `req.body`
   * object after all field-level validation and sanitization has occured. Use this to implement
   * multi-field validation logic. If the function returns `false`, an error will be thrown with
   * a generic _"invalid request body"_ error message. You can also throw an error from this fn
   * to provide your own error message. If the function neither throws nor returns `false`, the
   * value will be considered valid.
   */
  validateRequestBody?: RequestBodyValidatorFn;
};

export type RequestBodyValidatorFn = (reqBody: Record<string, unknown>) => boolean | void;

/**
 * A map of `req.body` fields to {@link RequestBodyFieldConfig} objects defining field-level
 * sanitization and validation for each respective field.
 */
export interface RequestBodyFieldsSchema {
  readonly [key: string]:
    | SetRequired<RequestBodyFieldConfig<"string">, "sanitize">
    | SetRequired<RequestBodyFieldConfig<"object">, "sanitize">
    | SetRequired<RequestBodyFieldConfig<"array">, "sanitize">
    | RequestBodyFieldConfig<"number">
    | RequestBodyFieldConfig<"boolean">;
}

/** Config object for field-level sanitization and validation for fields in `req.body`. */
export interface RequestBodyFieldConfig<T extends JsonTypeStringLiteral> {
  /** The type of an individual field; currently types are limited to valid JSON value types. */
  type: T;
  /** If `true`, an error will be thrown if the field is not present. */
  required: boolean;
  /** If `true`, an error will not be thrown if the field's value is `null`. */
  nullable?: boolean;
  /**
   * A function to strip client-provided values of undesirable characters/patterns.
   * This function is required for "string", "object", and "array" types.
   * @param value - The client-provided value to sanitize (the type will have already been checked)
   * @returns The sanitized value.
   */
  sanitize?: T extends "string" | "object" | "array" ? RequestBodyFieldSanitizerFn<T> : never;
  /**
   * A function which validates the client-provided value for the field. If the function returns
   * `false`, an error will be thrown with a generic _"invalid value for x"_ error message. You
   * can also throw an error from this function to provide your own error message. If the function
   * neither throws nor returns `false`, the value will be considered valid.
   * @param value - The client-provided value to validate (the type will have already been checked)
   * @returns true or undefined if the client-provided value is valid for the field, false otherwise.
   */
  validate?: RequestBodyFieldValidatorFn<T>;
}

/** A sanitizer function for a {@link RequestBodyFieldConfig}. */
export type RequestBodyFieldSanitizerFn<T extends "string" | "object" | "array"> = (
  value: StringLiteralToType<T>
) => StringLiteralToType<T>;

/** A validator function for a {@link RequestBodyFieldConfig}. */
export type RequestBodyFieldValidatorFn<T extends JsonTypeStringLiteral> = (
  value: StringLiteralToType<T>
) => boolean | void;

/** Generic util which converts a {@link JsonTypeStringLiteral} to its corresponding type. */
type StringLiteralToType<T extends JsonTypeStringLiteral> = T extends "string"
  ? string
  : T extends "number"
    ? number
    : T extends "boolean"
      ? boolean
      : T extends "object"
        ? Record<string, JsonPrimitive | Record<string, unknown> | Array<unknown>>
        : T extends "array"
          ? Array<JsonPrimitive | Record<string, unknown> | Array<unknown>>
          : never;

/** Union of JSON-type string literals for implemented types. */
type JsonTypeStringLiteral = "string" | "number" | "boolean" | "object" | "array";
