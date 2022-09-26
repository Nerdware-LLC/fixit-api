import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class NotFoundError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  constructor(message = "Unable to find the requested resource") {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
    this.statusCode = this.status;
  }
}
