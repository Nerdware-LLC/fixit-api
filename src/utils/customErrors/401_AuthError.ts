import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class AuthError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthError";
    this.status = 401;
    this.statusCode = this.status;
  }
}
