export class DDBSingleTableError extends Error {
  constructor(message = "Unknown error") {
    super(message);
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
  constructor(message?: string) {
    super(message);
    this.name = "SchemaValidationError";
  }
}

export class ItemInputError extends DDBSingleTableError {
  constructor(message?: string) {
    super(message);
    this.name = "ItemInputError";
  }
}
