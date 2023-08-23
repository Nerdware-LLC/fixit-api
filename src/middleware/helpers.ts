import { hasKey, isType, UserInputError, getErrorMessage } from "@/utils";
import type { FixitRESTRequestFlowProperties } from "@/types";
import type { RequestHandler, Request } from "express";
import type { SetReturnType, SetRequired, EmptyObject, JsonPrimitive } from "type-fest";

type CustomRequestAndBodyProperties<TBodyValues = unknown> = FixitRESTRequestFlowProperties & {
  body?: Record<string, TBodyValues>;
};

/**
 * Generic catch wrapper for async middleware functions.
 * - Optional type param: `ReqBody`, passed to `RequestHandler` type-param of the same name.
 */
export const mwAsyncCatchWrapper = <
  TCustomRequestProperties extends CustomRequestAndBodyProperties<any> = CustomRequestAndBodyProperties
>(
  asyncMiddlewareFn: SetReturnType<
    RequestHandler<EmptyObject, Record<string, unknown>, TCustomRequestProperties["body"]> &
      TCustomRequestProperties,
    Promise<void>
  >
): RequestHandler => {
  return (req, res, next) => {
    asyncMiddlewareFn(req, res, next).catch(next);
  };
};

/**
 * Generic catch wrapper for non-async middleware functions.
 * - Optional type param: `ReqBody`, passed to `RequestHandler` type-param of the same name.
 */
export const mwCatchWrapper = <ReqBody extends Record<string, any> = Record<string, unknown>>(
  middlewareFn: RequestHandler<EmptyObject, Record<string, unknown>, ReqBody>
): RequestHandler<EmptyObject, Record<string, unknown>, ReqBody> => {
  return (req, res, next) => {
    try {
      middlewareFn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * This function provides middleware for validating and sanitizing request body parameters.
 *
 * @param reqBodySchema - The schema object that defines the expected structure and validation rules for the request body.
 * @returns A middleware function that can be used in an Express route.
 * @throws UserInputError if any validation fails.
 *
 * @example
 * import { sanitizeAndValidateRequestBody } from "@/middleware/helpers";
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
  // Validate each field config, and replace "type" with a type-validator function.
  const reqBodySchemaWithTypeValidator = Object.fromEntries(
    Object.entries(requestBodySchema).map(
      ([key, { type: fieldType, sanitize, ...fieldConfig }]) => {
        // Obtain the type-validator from the `isType` util
        const isValidType = isType?.[fieldType];
        // If isValidType is undefined, then fieldType is not valid, throw an error
        if (!isValidType) throw new Error(`Invalid "type" for field "${key}": "${fieldType}"`);
        // If fieldType is string/object/array, ensure a sanitize function is provided
        if (["string", "object", "array"].includes(fieldType) && !isType.function(sanitize))
          throw new Error(`Field "${key}" is missing a "sanitize" function`);
        // Return the field config with the type-validator function
        return [key, { ...fieldConfig, sanitize, isValidType }];
      }
    )
  );

  return (req: Request<{}, {}, Record<string, unknown>>, res, next) => {
    // Ensure the request body is valid
    if (!hasKey(req, "body") || !isType.object(req.body))
      throw new UserInputError("Invalid request body");

    const reqBodyFields = {} as { [Key in keyof Schema]: unknown };

    try {
      for (const key in requestBodySchema) {
        const { required, isValidType, sanitize, validate } = reqBodySchemaWithTypeValidator[key];

        // Check if field is required
        if (required === true) {
          // If required, throw error if field is undefined.
          if (!hasKey(req.body, key) || req.body[key] === undefined)
            throw new UserInputError(`Missing required field: "${key}"`);
          // If optional, continue if field is undefined.
        } else if (!hasKey(req.body, key) || req.body[key] === undefined) {
          continue;
        }

        // The field is present - check if field value is the correct type
        if (!isValidType(req.body[key]))
          throw new UserInputError(`Invalid value for field: "${key}"`);

        // The field value is the correct type - now sanitize and validate
        const fieldValue = sanitize ? sanitize(req.body[key] as any) : req.body[key];
        if (isType.function(validate) && validate(fieldValue) === false)
          throw new UserInputError(`Invalid value for field: "${key}"`);

        // The field is valid - add to reqBodyFields
        reqBodyFields[key] = fieldValue;
      }

      // Validate the entire request body if a validateReqBody function was provided
      if (isType.function(validateRequestBody) && validateRequestBody(reqBodyFields) === false) {
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
    | RequestBodyFieldConfig<"boolean">
    | RequestBodyFieldConfig<"null">;
}

/** Config object for field-level sanitization and validation for fields in `req.body`. */
export interface RequestBodyFieldConfig<T extends JsonTypeStringLiteral> {
  /** The type of an individual field; currently types are limited to valid JSON value types. */
  type: T;
  /** If `true`, an error will be thrown if the field is not present. */
  required: boolean;
  /**
   * A function to strip client-provided values of undesirable characters/patterns.
   * This function is required for "string", "object", and "array" types.
   * @param value - The client-provided value to sanitize (the type will have already been checked)
   * @returns The sanitized value.
   */
  sanitize?: T extends "string" | "object" | "array"
    ? (value: StringLiteralToType<T>) => StringLiteralToType<T>
    : never;
  /**
   * A function which validates the client-provided value for the field. If the function returns
   * `false`, an error will be thrown with a generic _"invalid value for x"_ error message. You
   * can also throw an error from this function to provide your own error message. If the function
   * neither throws nor returns `false`, the value will be considered valid.
   * @param value - The client-provided value to validate (the type will have already been checked)
   * @returns true or undefined if the client-provided value is valid for the field, false otherwise.
   */
  validate?: <V = StringLiteralToType<T>>(value: V) => boolean | void;
}

/** Union of JSON-type string literals. */
type JsonTypeStringLiteral = "string" | "number" | "boolean" | "null" | "object" | "array";

/** Generic util which converts a {@link JsonTypeStringLiteral} to its corresponding type. */
type StringLiteralToType<T extends JsonTypeStringLiteral> = T extends "string"
  ? string
  : T extends "number"
  ? number
  : T extends "boolean"
  ? boolean
  : T extends "null"
  ? null
  : T extends "object"
  ? Record<string, JsonPrimitive | Record<string, unknown> | Array<unknown>>
  : T extends "array"
  ? Array<JsonPrimitive | Record<string, unknown> | Array<unknown>>
  : never;
