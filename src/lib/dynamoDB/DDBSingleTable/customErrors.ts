export class DDBSingleTableError extends Error {
  constructor(message = "An unknown error occurred") {
    super(`[DDBSingleTable ERROR] ${message}`);
    this.name = "DynamoDBError";

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DDBSingleTableError.prototype);

    // eslint-disable-next-line node/no-process-env
    if (!/^prod/i.test(process.env.NODE_ENV)) {
      Error.captureStackTrace(this, DDBSingleTableError);
    }
  }
}

export class SchemaValidationError extends DDBSingleTableError {
  constructor(message = "Unknown error") {
    super(`Invalid Schema: ${message}`);
    this.name = "SchemaValidationError";
  }
}

export class ItemInputError extends DDBSingleTableError {
  constructor(message = "Unknown error") {
    super(`Invalid Item Input: ${message}`);
    this.name = "ItemInputError";
  }
}
