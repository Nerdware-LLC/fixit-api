import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class NotFoundError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  public static readonly STATUS_CODE = 404;

  constructor(message = "Unable to find the requested resource") {
    super(message);
    this.name = "NotFoundError";
    this.status = NotFoundError.STATUS_CODE;
    this.statusCode = this.status;
  }
}
