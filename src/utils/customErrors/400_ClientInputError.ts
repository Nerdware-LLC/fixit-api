import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class ClientInputError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  constructor(message = "Invalid client input") {
    super(message);
    this.name = "ClientInputError";
    this.status = 400;
    this.statusCode = this.status;
  }
}
