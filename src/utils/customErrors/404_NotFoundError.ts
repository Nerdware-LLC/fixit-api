import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class NotFoundError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  public static readonly STATUS_CODE = 404;
  public static readonly DEFAULT_MSG = "Unable to find the requested resource";

  constructor(message?: unknown) {
    const messageStr: string =
      typeof message === "string" && message.length > 0 ? message : NotFoundError.DEFAULT_MSG;

    super(messageStr);
    this.name = "NotFoundError";
    this.status = NotFoundError.STATUS_CODE;
    this.statusCode = this.status;
  }
}
