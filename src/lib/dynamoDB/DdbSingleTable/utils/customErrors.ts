import { ENV } from "@server/env";
import { safeJsonStringify } from "@utils/typeSafety";

/**
 * The base `error` class for `DdbSingleTable`.
 */
export class DdbSingleTableError extends Error {
  constructor(message = "Unknown error") {
    super(message);
    this.name = "DdbSingleTableError";

    // Explicitly set the prototype
    Object.setPrototypeOf(this, DdbSingleTableError.prototype);

    if (!ENV.IS_PROD) Error.captureStackTrace(this, DdbSingleTableError);
  }
}

/**
 * This error is thrown by schema-validation functions when a `TableKeysSchema`
 * or `ModelSchema` is invalid.
 */
export class SchemaValidationError extends DdbSingleTableError {
  constructor(message?: string) {
    super(message);
    this.name = "SchemaValidationError";
  }
}

/**
 * This error is thrown by Model `IOHookAction` functions when run-time input
 * data is invalid.
 */
export class ItemInputError extends DdbSingleTableError {
  constructor(message?: string) {
    super(message);
    this.name = "ItemInputError";
  }
}

/**
 * This error is thrown by expression-generator utils when a run-time arg is invalid
 * (e.g., more than two K-V pairs for a `KeyConditionExpression`).
 */
export class InvalidExpressionError extends DdbSingleTableError {
  constructor(
    arg:
      | string
      | {
          /** The name of the expression being generated. */
          expressionName:
            | "ConditionExpression"
            | "KeyConditionExpression"
            | "UpdateExpression"
            | "FilterExpression"
            | "ProjectionExpression";
          /** A short explanation as to why the `invalidValue` is invalid. */
          problem: string;
          /** The invalid value. */
          invalidValue: unknown;
          /** A short description/name of the invalid value. */
          invalidValueDescription: string;
        }
  ) {
    const message =
      typeof arg === "string"
        ? arg
        : `Invalid ${arg.invalidValueDescription} (generating ${arg.expressionName}): \n` +
          `${arg.problem}: ${safeJsonStringify(arg.invalidValue, null, 2)}`;

    super(message);
    this.name = "InvalidExpressionError";
  }
}
