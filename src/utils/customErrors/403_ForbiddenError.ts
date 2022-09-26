import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class ForbiddenError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
    this.status = 403;
    this.statusCode = this.status;
  }
}
