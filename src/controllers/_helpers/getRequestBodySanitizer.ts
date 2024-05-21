import {
  isString,
  isSafeInteger,
  isFunction,
  isPlainObject,
  isArray,
  isBoolean,
  getErrorMessage,
} from "@nerdware/ts-type-safety-utils";
import { UserInputError } from "@/utils/httpErrors.js";
import type {
  RestApiPOSTendpoint,
  RestApiRequestBodyByPath,
  RestApiResponseByPath,
  RestApiParametersByPath,
} from "@/types/open-api.js";
import type { Request } from "express";
import type { Simplify, JsonPrimitive } from "type-fest";

/**
 * This function provides controllers with schema-based sanitizization and validation of
 * user-provided `req.body` values.
 *
 * @param reqBodySchema - The schema object that defines the expected structure and validation rules for the request body.
 * @returns A function that sanitizes and validates the request body based on the provided schema.
 * @throws UserInputError if any validation fails.
 *
 * @example
 * import { getRequestBodySanitizer } from "@/controllers/helpers.js";
 *
 * const sanitizeRegisterUserArgs = getRequestBodySanitizer({
 *   name: { type: "string", required: true, sanitize: (value) => value.trim() },
 *   age: { type: "number", required: true, validate: (value) => value >= 18 },
 *   email: { type: "string", required: false, sanitize: (value) => sanitizeUtil.email(value) },
 * });
 *
 * app.post("/api/register-user", (req, res, next) => {
 *   // Sanitize and validate the request body fields:
 *   const { name, age, email } = sanitizeRegisterUserArgs(req);
 *
 *   // ... Continue with sanitized and validated req.body fields ...
 * });
 */
export const getRequestBodySanitizer = <Path extends RestApiPOSTendpoint>({
  requestBodySchema,
  validateRequestBody,
}: GetRequestBodySanitizerParams<Path>): RequestBodySanitizerFn<Path> => {
  // Internal types:
  type _FieldSanitizer = <V extends SupportedValueType>(value: V) => V;
  type _FieldValidator = <V extends SupportedValueType>(value: V) => boolean;
  type _InternalSchema = Record<
    keyof typeof requestBodySchema,
    {
      type: TypeStringLiteral;
      required: boolean;
      nullable: boolean;
      sanitize?: _FieldSanitizer;
      validate?: _FieldValidator;
      isValidType: (arg: unknown) => boolean;
    }
  >;

  // Object to store the field configs with the type-validator function:
  const reqBodySchemaWithTypeValidator = {} as _InternalSchema;

  // Validate each field config, and add a type-validator function based on the "type"
  for (const key in requestBodySchema) {
    const { type: fieldType, sanitize, validate, ...fieldConfig } = requestBodySchema[key];
    // Obtain the type-validator from the `TYPE_VALIDATORS` dict:
    const isValidType = TYPE_VALIDATORS?.[fieldType];
    // If isValidType is undefined, then fieldType is not valid, throw an error
    if (!isValidType) throw new Error(`Invalid "type" for field "${key}": "${fieldType}"`);
    // Ensure a `sanitize` function was provided if field type is string/object/array
    if (!sanitize && ["string", "object", "array"].includes(fieldType))
      throw new Error(`Field "${key}" is missing  a "sanitize" function`);
    // Update the field configs with defaults and the internal type-validator function:
    reqBodySchemaWithTypeValidator[key] = {
      type: fieldType,
      ...(sanitize && { sanitize: sanitize as unknown as _FieldSanitizer }),
      ...(validate && { validate: validate as unknown as _FieldValidator }),
      ...fieldConfig,
      isValidType,
    };
  }

  return (req) => {
    // Ensure the request body is valid
    if (!Object.hasOwn(req, "body") || !isPlainObject(req.body))
      throw new UserInputError("Invalid request body");

    const reqBodyFields = {} as RestApiRequestBodyByPath[Path];

    try {
      for (const key in requestBodySchema) {
        // Destructure the field config
        const { required, isValidType, sanitize, validate } = reqBodySchemaWithTypeValidator[key];

        // Get `nullable`, default to the opposite of `required`:
        const { nullable = !required } = reqBodySchemaWithTypeValidator[key];

        // Check is the field is defined in req.body
        if (!Object.hasOwn(req.body, key) || req.body[key] === undefined) {
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
          // If the field has a `sanitize` function, call it with the field value
          if (sanitize) fieldValue = sanitize(fieldValue);
          // If the field has a `validate` function, call it with the field value
          if (validate && validate(fieldValue) === false)
            throw new UserInputError(`Invalid value for field: "${key}"`);
        }

        // The field is valid - add to reqBodyFields
        reqBodyFields[key] = fieldValue;
      }

      // Validate the entire request body if a validateReqBody function was provided
      if (isFunction(validateRequestBody) && validateRequestBody(reqBodyFields) === false) {
        throw new UserInputError("Invalid request body");
      }
    } catch (error) {
      // Re-throw as UserInputError to ensure 400 status code is attached
      throw new UserInputError(getErrorMessage(error));
    }

    // Return req.body fields with sanitized and validated values
    return reqBodyFields;
  };
};

/** Dictionary of type validators for request body fields. @internal */
const TYPE_VALIDATORS: Record<TypeStringLiteral, (arg: unknown) => boolean> = {
  string: isString,
  number: isSafeInteger,
  boolean: isBoolean,
  object: isPlainObject,
  array: isArray,
};

///////////////////////////////////////////////////////////////////////////////
// getRequestBodySanitizer: Params & ReturnType

/** Params for {@link getRequestBodySanitizer}. */
export type GetRequestBodySanitizerParams<Path extends RestApiPOSTendpoint> = {
  /**
   * A map of `req.body` fields to {@link FieldConfig} objects defining field-level
   * sanitization and validation for each respective field.
   */
  requestBodySchema: RestApiEndpointRequestBodySchema<Path>;
  /**
   * A validation function for `req.body` as a whole which is called with the entire `req.body`
   * object after all field-level validation and sanitization has occured. Use this to implement
   * multi-field validation logic. If the function returns `false`, an error will be thrown with
   * a generic _"invalid request body"_ error message. You can also throw an error from this fn
   * to provide your own error message. If the function neither throws nor returns `false`, the
   * value will be considered valid.
   */
  validateRequestBody?: RequestBodyValidatorFn<Path> | undefined;
};

/** A function which validates an entire `req.body` object. */
export type RequestBodyValidatorFn<Path extends RestApiPOSTendpoint> = (
  reqBody: RestApiRequestBodyByPath[Path]
) => boolean | void;

/** The function returned from {@link getRequestBodySanitizer}. */
type RequestBodySanitizerFn<Path extends RestApiPOSTendpoint> = (
  req: Request<
    RestApiParametersByPath<Path, "path">,
    RestApiResponseByPath[Path],
    RestApiRequestBodyByPath[Path],
    RestApiParametersByPath<Path, "query">,
    Record<string, unknown>
  >
) => RestApiRequestBodyByPath[Path];

///////////////////////////////////////////////////////////////////////////////
// Request Body Schema

/**
 * A map of a REST API POST endpoint's `req.body` fields to {@link FieldConfig}
 * objects defining field-level sanitization and validation for each respective
 * field. This generic ensures that the schema provided for a given endpoint
 * matches the type defined for that endpoint's request body.
 */
export type RestApiEndpointRequestBodySchema<Path extends RestApiPOSTendpoint> = {
  [Key in keyof RestApiRequestBodyByPath[Path]]-?: FieldConfig<RestApiRequestBodyByPath[Path][Key]>;
};

///////////////////////////////////////////////////////////////////////////////
// Request Body Field Config

/** Config object for field-level sanitization and validation for fields in `req.body`. */
export type FieldConfig<V extends SupportedValueType> = Simplify<{
  /** A type string literal which represents the non-null/undefined value-type of an individual field. */
  type: GetTypeStringLiteralFromValue<V>;
  /** If `true`, an error will be thrown if the field is not present. */
  required: undefined extends V ? false : true;
  /** If `true`, an error will not be thrown if the field's value is `null`. */
  nullable: null extends V ? true : false;
  /**
   * A function to strip client-provided values of undesirable characters/patterns.
   * This function is required for "string", "object", and "array" types.
   * @param value - The client-provided value to sanitize (the type will have already been checked)
   * @returns The sanitized value.
   */
  sanitize?: FieldSanitizerFn<V>;
  /**
   * A function which validates the client-provided value for the field. If the function returns
   * `false`, an error will be thrown with a generic _"invalid value for x"_ error message. You
   * can also throw an error from this function to provide your own error message. If the function
   * neither throws nor returns `false`, the value will be considered valid.
   * @param value - The client-provided value to validate (the type will have already been checked)
   * @returns true or undefined if the client-provided value is valid for the field, false otherwise.
   */
  validate?: FieldValidatorFn<V>;
}>;

/**
 * This generic takes a {@link SupportedValueType} and returns the corresponding
 * {@link TypeStringLiteral} for the field config's `"type"` property.
 */
type GetTypeStringLiteralFromValue<V extends SupportedValueType> =
    V extends string ? "string"
  : V extends number ? "number"
  : V extends boolean ? "boolean"
  : V extends ReqBodyObjectValue ? "object"
  : V extends ReqBodyArrayValue ? "array"
  : never; // prettier-ignore

/** A field-value sanitizer function for a {@link FieldConfig}. */
export type FieldSanitizerFn<V extends SupportedValueType> = (
  value: NonNullable<V>
) => NonNullable<V>;

/** A field-value validator function for a {@link FieldConfig}. */
export type FieldValidatorFn<V extends SupportedValueType> = (
  value: NonNullable<V>
) => boolean | void;

///////////////////////////////////////////////////////////////////////////////
// Type String Literals and Supported Value Types

/** Union of type string literals for the `"type"` property in schema field configs. */
type TypeStringLiteral = keyof StringLiteralToTypeMap;
/** Union of supported value types. */
type SupportedValueType = StringLiteralToTypeMap[TypeStringLiteral] | null | undefined;

/** A map of type string literals to the TS types they represent. */
type StringLiteralToTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  object: ReqBodyObjectValue;
  array: ReqBodyArrayValue;
};

/** Object fields in `req.body` (for schema `type: "object"`). */
type ReqBodyObjectValue = Record<string, ReqBodyNestedValue>;
/** Array fields in `req.body` (for schema `type: "array"`). */
type ReqBodyArrayValue = Array<ReqBodyNestedValue>;
/** Nested value types for object and array fields in `req.body`. */
type ReqBodyNestedValue = JsonPrimitive | Record<string, unknown> | Array<unknown>;
