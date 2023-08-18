import type { GenericSuccessResponse as GenericSuccessResponseType } from "@/types";

export class GenericSuccessResponse implements GenericSuccessResponseType {
  wasSuccessful: boolean;

  constructor({ wasSuccessful }: { wasSuccessful: boolean }) {
    this.wasSuccessful = wasSuccessful;
  }
}
