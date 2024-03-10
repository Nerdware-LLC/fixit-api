import type { GenericSuccessResponse as GenericSuccessResponseType } from "@/types/graphql.js";

export class GenericSuccessResponse implements GenericSuccessResponseType {
  wasSuccessful: boolean;

  constructor({ wasSuccessful }: { wasSuccessful: boolean }) {
    this.wasSuccessful = wasSuccessful;
  }
}
